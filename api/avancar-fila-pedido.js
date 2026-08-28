// ─── SISTEMA DE RODÍZIO DE CORRIDAS ────────────────────────────────────────
// Arquivo NOVO e ISOLADO — não mexe em nenhuma tabela nem arquivo já existente.
// Chamado toda vez que precisa decidir "quem é o próximo motoboy a receber
// esse pedido". É chamado a primeira vez quando o pedido é publicado, e depois
// repetidamente pelo Upstash QStash, a cada 30 segundos, até alguém aceitar
// ou o tempo máximo (10 minutos) esgotar.
//
// REGRAS (definidas com o Alessandro em 27/08/2026):
// - 30 segundos por motoboy, até 10 minutos no total (~20 tentativas)
// - Só participa motoboy online, ativo (não bloqueado/banido) e LIVRE (sem
//   nenhuma corrida em andamento agora)
// - Prioridade pra quem tem menos corridas hoje (contador separado, na tabela
//   rodizio_contador — reseta à meia-noite, NUNCA mexe no histórico real)
// - Empate entre motoboys com mesma contagem → sorteio aleatório
// - Um motoboy nunca recebe o MESMO pedido duas vezes seguidas — só repete se
//   todo mundo online já foi tentado nesse pedido específico
// - As duas contas de monitoramento (Alessandro Andrade da Hora e Alencar
//   Andrade) NÃO entram nesse rodízio — elas são notificadas à parte, uma
//   única vez, no momento em que o pedido é publicado (não a cada 30s)

import { createClient } from '@supabase/supabase-js';
import { Client as QStashClient } from '@upstash/qstash';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "https://eynpjqhjkwwdpemsospy.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Aponta explicitamente pra região dos EUA (a mesma escolhida na conta do
// Upstash) — sem isso, o SDK tenta usar a região errada por padrão.
const qstash = new QStashClient({
  token: process.env.QSTASH_TOKEN,
  baseUrl: 'https://qstash-us-east-1.upstash.io',
});

const TEMPO_OFERTA_MS = 30 * 1000;        // 30 segundos por motoboy
const JANELA_TOTAL_MS = 10 * 60 * 1000;   // 10 minutos no total

// IDs das duas contas de monitoramento — ficam de fora do rodízio de justiça,
// recebem toda corrida separadamente.
const CONTAS_MONITORAMENTO = [
  { id: "c98107a7-1fd1-4429-9502-d8496501347d" }, // Alessandro Andrade da hora
  { id: "a8cc6740-ca4d-4bb1-9292-0b81ce8f18be" }, // Alencar Andrade
];

export default async function handler(req, res) {
  // Grava no banco que a função foi chamada, e guarda o resultado dessa
  // gravação numa variável — vamos devolver isso DIRETO na resposta da API,
  // pra ver o erro exato sem precisar de SQL nem dos logs da Vercel.
  const debugInfo = { logInsertOk: null, logInsertError: null };
  try {
    const { error: logErr } = await supabaseAdmin.from('debug_log').insert({
      mensagem: 'avancar-fila-pedido CHAMADO',
      dados: { method: req.method, body: req.body },
    });
    debugInfo.logInsertOk = !logErr;
    debugInfo.logInsertError = logErr ? logErr.message : null;
  } catch (e) {
    debugInfo.logInsertOk = false;
    debugInfo.logInsertError = e.message;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido', debugInfo });
  }

  const { pedido_id } = req.body;
  if (!pedido_id) {
    return res.status(400).json({ error: 'pedido_id é obrigatório' });
  }

  try {
    // 1) Confere se o pedido ainda está "aguardando" — se já foi aceito ou
    // cancelado, a corrente para aqui, sem fazer mais nada.
    const { data: pedido, error: erroPedido } = await supabaseAdmin
      .from('pedidos')
      .select('id, status, criado_em, bairro, cliente_nome, taxa_motoboy')
      .eq('id', pedido_id)
      .maybeSingle();

    if (erroPedido || !pedido) {
      await supabaseAdmin.from('debug_log').insert({
        mensagem: 'pedido não encontrado ou erro ao buscar',
        dados: { pedido_id, erroPedido },
      });
      return res.status(200).json({ ok: true, motivo: 'pedido não encontrado, encerrando' });
    }
    if (pedido.status !== 'aguardando') {
      return res.status(200).json({ ok: true, motivo: `pedido já está '${pedido.status}', encerrando rodízio`, debugInfo });
    }

    // 2) Confere se já estourou os 10 minutos totais — se sim, para de tentar
    // (o fluxo existente de "nenhum motoboy disponível" assume a partir daqui)
    const decorrido = Date.now() - new Date(pedido.criado_em).getTime();
    if (decorrido >= JANELA_TOTAL_MS) {
      return res.status(200).json({ ok: true, motivo: 'janela de 10 minutos esgotada, encerrando rodízio' });
    }

    // 3) Busca motoboys online, ativos (não bloqueados) e não banidos
    const { data: motoboysOnline, error: erroMotoboys } = await supabaseAdmin
      .from('motoboys')
      .select('id, nome_completo, bairro_base')
      .eq('online', true)
      .eq('ativo', true)
      .eq('banido', false);

    if (erroMotoboys || !motoboysOnline || motoboysOnline.length === 0) {
      return res.status(200).json({
        ok: true,
        motivo: 'nenhum motoboy online no momento',
        erroMotoboys: erroMotoboys ? erroMotoboys.message : null,
        quantidadeEncontrada: motoboysOnline ? motoboysOnline.length : null,
        debugInfo,
      });
    }

    // 4) Remove as contas de monitoramento da lista de elegíveis pro rodízio
    const idsMonitoramento = CONTAS_MONITORAMENTO.map(c => c.id);
    const elegiveis = motoboysOnline.filter(m => !idsMonitoramento.includes(m.id));

    // 5) Remove quem está OCUPADO agora (já tem pedido em 'aceito' ou
    // 'saiu_estabelecimento') — nunca oferece pra quem está no meio de uma entrega
    const { data: ocupadosDB } = await supabaseAdmin
      .from('pedidos')
      .select('motoboy_id')
      .in('status', ['aceito', 'saiu_estabelecimento'])
      .not('motoboy_id', 'is', null);
    const idsOcupados = new Set((ocupadosDB || []).map(p => p.motoboy_id));
    const livres = elegiveis.filter(m => !idsOcupados.has(m.id));

    if (livres.length === 0) {
      return res.status(200).json({ ok: true, motivo: 'todos os motoboys online já estão ocupados' });
    }

    // 6) Remove quem já foi oferecido ESSE pedido específico — se sobrar
    // ninguém, reinicia a lista (permite repetir, conforme combinado)
    const { data: jaOfertadosDB } = await supabaseAdmin
      .from('ofertas_pedido')
      .select('motoboy_id')
      .eq('pedido_id', pedido_id);
    const idsJaOfertados = new Set((jaOfertadosDB || []).map(o => o.motoboy_id));
    let candidatos = livres.filter(m => !idsJaOfertados.has(m.id));
    if (candidatos.length === 0) {
      candidatos = livres; // ciclo completo, reinicia permitindo repetir
    }

    // 6.5) Se é a PRIMEIRA vez que esse pedido passa por aqui (ninguém foi
    // ofertado ainda), avisa as duas contas de monitoramento — só uma vez,
    // não a cada 30s. Elas recebem sempre que estiverem online, mesmo não
    // participando do rodízio de justiça.
    const ehPrimeiraChamada = (jaOfertadosDB || []).length === 0;
    if (ehPrimeiraChamada) {
      const idsOnlineMonitor = new Set(motoboysOnline.map(m => m.id));
      const urlBaseMonitor = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
      for (const conta of CONTAS_MONITORAMENTO) {
        if (!idsOnlineMonitor.has(conta.id)) continue; // só notifica se estiver online
        try {
          await fetch(`${urlBaseMonitor}/api/notificar-motoboy-especifico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              motoboyId: conta.id,
              titulo: '🏍️ Novo Pedido MotoFast!',
              corpo: `Entrega em ${pedido.bairro} — R$${pedido.taxa_motoboy}.`,
            }),
          });
        } catch (e) {
          console.log('Erro ao notificar conta de monitoramento (não bloqueia o fluxo):', e);
        }
      }
    }

    // 7) Busca o contador de corridas de HOJE de cada candidato — se não tem
    // registro, ou se o registro é de outro dia, trata como 0
    const hojeISO = new Date().toISOString().slice(0, 10);
    const { data: contadoresDB } = await supabaseAdmin
      .from('rodizio_contador')
      .select('motoboy_id, corridas_hoje, data_referencia')
      .in('motoboy_id', candidatos.map(c => c.id));

    const mapaContadores = {};
    (contadoresDB || []).forEach(c => {
      const valido = c.data_referencia === hojeISO;
      mapaContadores[c.motoboy_id] = valido ? c.corridas_hoje : 0;
    });
    candidatos.forEach(c => {
      if (!(c.id in mapaContadores)) mapaContadores[c.id] = 0;
    });

    // 8) Acha o menor número de corridas entre os candidatos, filtra só quem
    // está nesse mínimo, e sorteia aleatoriamente entre os empatados
    const menorContagem = Math.min(...candidatos.map(c => mapaContadores[c.id]));
    const empatados = candidatos.filter(c => mapaContadores[c.id] === menorContagem);
    const escolhido = empatados[Math.floor(Math.random() * empatados.length)];

    // 9) Grava a oferta na tabela nova (isolada) — válida por 30 segundos
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + TEMPO_OFERTA_MS);
    await supabaseAdmin.from('ofertas_pedido').insert({
      pedido_id,
      motoboy_id: escolhido.id,
      oferecido_em: agora.toISOString(),
      expira_em: expiraEm.toISOString(),
      respondido: false,
    });

    // 10) Notifica só esse motoboy específico (via OneSignal, direcionado ao
    // external_id dele — precisa que o app do motoboy já esteja fazendo
    // OneSignal.login(motoboyId), que o Motoboy.jsx já faz hoje)
    try {
      await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/notificar-motoboy-especifico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motoboyId: escolhido.id,
          titulo: '🏍️ Novo Pedido MotoFast!',
          corpo: `Entrega em ${pedido.bairro} — R$${pedido.taxa_motoboy}. Você tem 30 segundos!`,
        }),
      });
    } catch (e) {
      console.log('Erro ao notificar motoboy específico (não bloqueia o fluxo):', e);
    }

    // 11) Agenda a PRÓXIMA verificação em 30 segundos via QStash — só se ainda
    // não vai estourar os 10 minutos totais nesse meio tempo
    if (decorrido + TEMPO_OFERTA_MS < JANELA_TOTAL_MS) {
      const urlBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
      await qstash.publish({
        url: `${urlBase}/api/avancar-fila-pedido`,
        body: JSON.stringify({ pedido_id }),
        headers: { 'Content-Type': 'application/json' },
        delay: 30, // segundos
      });
    }

    return res.status(200).json({
      ok: true,
      oferecido_para: escolhido.id,
      nome: escolhido.nome_completo,
      expira_em: expiraEm.toISOString(),
      debugInfo,
    });
  } catch (err) {
    console.error('Erro no avancar-fila-pedido:', err);
    try {
      await supabaseAdmin.from('debug_log').insert({
        mensagem: 'ERRO CAPTURADO no avancar-fila-pedido',
        dados: { pedido_id, erro: err.message, stack: err.stack },
      });
    } catch (e2) { /* nem isso deu certo, mas não trava a resposta */ }
    return res.status(500).json({ error: err.message });
  }
}
