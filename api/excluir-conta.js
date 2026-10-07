// RASCUNHO (06/10/2026, revisado) — vai em api/excluir-conta.js no site.
//
// Função de servidor — conclui a exclusão de conta pedida por um motoboy ou
// estabelecimento (exigência da Play Store pra apps com cadastro). Chamada
// pelo Admin, na aba "🗑️ Exclusões" (app nativo e, se quiser, no site).
//
// O pedido é registrado antes pelo app/site na tabela solicitacoes_exclusao.
// Aqui, com a SERVICE_ROLE_KEY (o Admin pelo navegador não tem permissão pra
// gravar nessas tabelas — mesmo motivo do bloquear-motoboy.js):
//   - RECUSA (409) se ainda houver corrida/pedido em andamento;
//   - ANONIMIZA os dados pessoais (não apaga a linha do motoboy/estabelecimento:
//     pedidos.motoboy_id/empresario_id dependem dela, e apagar a linha
//     zeraria o histórico);
//   - apaga a lista de clientes salvos do estabelecimento (dados de terceiros,
//     nenhuma tabela aponta pra "clientes");
//   - bloqueia o login e troca o e-mail (não apaga o usuário: motoboys.user_id
//     e empresarios.user_id apontam pra ele sem ON DELETE, então o banco
//     recusaria);
//   - NUNCA mexe em pedidos, valores, corridas ou fechamentos.
//
// Passos principais (anonimizar, apagar clientes, bloquear login): se falharem,
// a função para e devolve erro — o pedido continua "pendente" e o Admin tenta
// de novo, sem estrago (todos os passos podem ser repetidos).
// Passos secundários (turno fixo, prioridade, avaliações, marcar concluído):
// se falharem, NÃO desfazem o resto — viram um aviso em "avisos" na resposta.
//
// ANTES DE USAR EM CONTA DE VERDADE: testar SÓ com contas de teste
// descartáveis, criadas pra isso (ver LEIA-ME.md, passo 4).
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = "botdahora@gmail.com";

// DECISÃO PENDENTE (contador): pagamentos a autônomos podem exigir guardar
// nome e CPF do motoboy por alguns anos (em geral 5). true = mantém nome e CPF
// (não aparecem em tela nenhuma depois da exclusão); false = apaga também.
// Começa em true porque é o lado reversível: dá pra apagar depois, mas não
// dá pra recuperar se apagar antes da hora.
// ATENÇÃO: os textos do app (ExcluirConta.jsx), da página web
// (ExcluirContaWeb.jsx) e dos Termos (cláusula 9.4) têm a mesma constante /
// duas versões — mudar aqui obriga a mudar lá também, senão o texto mente.
const MANTER_NOME_CPF_MOTOBOY = true;

// Status que contam como "em andamento" — a exclusão é recusada enquanto
// existir algum pedido assim, pra nunca deixar uma entrega sem dono.
const EM_ANDAMENTO_MOTOBOY = ["aceito", "saiu_estabelecimento"];
const EM_ANDAMENTO_EMPRESARIO = ["aguardando", "aceito", "saiu_estabelecimento"];

// Colunas de data — se alguma delas não aceitar vazio (NOT NULL), recebe uma
// data neutra em vez de null.
const COLUNAS_DATA = ["nascimento"];

// Atualiza; se o banco recusar um null (coluna NOT NULL), troca aquele valor
// por um neutro ("" pra texto, data neutra, 0 pra número) e tenta de novo.
async function atualizarComFallback(supabaseAdmin, tabela, valores, filtro) {
  let tentativa = { ...valores };
  for (let i = 0; i < 6; i++) {
    let q = supabaseAdmin.from(tabela).update(tentativa);
    for (const [col, val] of Object.entries(filtro)) q = q.eq(col, val);
    const { error } = await q;
    if (!error) return { ok: true, valores: tentativa };
    const m = /column "([^"]+)"/.exec(error.message || "");
    if (error.code === "23502" && m && m[1] in tentativa) {
      const col = m[1];
      tentativa[col] = COLUNAS_DATA.includes(col) ? "1900-01-01"
        : (col === "latitude" || col === "longitude") ? 0 : "";
      continue;
    }
    return { ok: false, error };
  }
  return { ok: false, error: { message: "muitas tentativas de ajuste de colunas" } };
}

// Busca todos os ids de pedidos de um motoboy, em páginas de 1.000.
async function idsPedidosDoMotoboy(supabaseAdmin, motoboyId) {
  const ids = [];
  for (let p = 0; p < 200; p++) {
    const ini = p * 1000;
    const { data, error } = await supabaseAdmin.from("pedidos").select("id")
      .eq("motoboy_id", motoboyId).order("id", { ascending: true }).range(ini, ini + 999);
    if (error) return { ids, error };
    if (!data || data.length === 0) break;
    ids.push(...data.map(x => x.id));
    if (data.length < 1000) break;
  }
  return { ids, error: null };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Só o Admin pode concluir uma exclusão: confere o token de quem chamou.
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sem autorização" });
  const { data: quem, error: erroQuem } = await supabaseAdmin.auth.getUser(token);
  if (erroQuem || quem?.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Só o Admin pode concluir exclusões" });
  }

  const { solicitacaoId } = req.body || {};
  if (!solicitacaoId) return res.status(400).json({ error: "solicitacaoId é obrigatório" });

  try {
    const { data: sol, error: erroSol } = await supabaseAdmin.from("solicitacoes_exclusao")
      .select("*").eq("id", solicitacaoId).maybeSingle();
    if (erroSol) return res.status(400).json({ error: erroSol.message });
    if (!sol) return res.status(404).json({ error: "Pedido de exclusão não encontrado" });
    if (sol.status !== "pendente") return res.status(409).json({ error: `Pedido já está "${sol.status}"` });

    const agora = new Date().toISOString();
    const etapas = [];
    const avisos = [];

    if (sol.tipo === "motoboy") {
      // Confere que o perfil é mesmo desse usuário (nunca anonimizar outra pessoa).
      const { data: mb, error: erroMb } = await supabaseAdmin.from("motoboys").select("id")
        .eq("id", sol.perfil_id).eq("user_id", sol.user_id).maybeSingle();
      if (erroMb) return res.status(400).json({ error: "Erro ao conferir o perfil: " + erroMb.message });
      if (!mb) return res.status(400).json({ error: "Perfil de motoboy não confere com o usuário do pedido" });

      // Recusa se ainda houver corrida em andamento.
      const { count: emAndamento, error: erroAnd } = await supabaseAdmin.from("pedidos")
        .select("id", { count: "exact", head: true })
        .eq("motoboy_id", sol.perfil_id).in("status", EM_ANDAMENTO_MOTOBOY);
      if (erroAnd) return res.status(400).json({ error: "Erro ao conferir corridas em andamento: " + erroAnd.message });
      if (emAndamento > 0) {
        return res.status(409).json({ error: `O motoboy ainda tem ${emAndamento} entrega(s) em andamento (aceita ou a caminho). A exclusão só pode ser concluída depois que elas forem entregues ou canceladas.` });
      }

      const anon = {
        telefone: null, pix: null, rg: null, nascimento: null,
        nome_pai: null, nome_mae: null, endereco: null, bairro_base: null,
        latitude: null, longitude: null, ultima_localizacao: null,
        online: false, ativo: false,
      };
      if (!MANTER_NOME_CPF_MOTOBOY) { anon.nome_completo = "Motoboy excluído"; anon.cpf = null; }
      const r1 = await atualizarComFallback(supabaseAdmin, "motoboys", anon, { id: sol.perfil_id });
      if (!r1.ok) return res.status(400).json({ error: "Erro ao anonimizar motoboy: " + r1.error.message, etapas });
      etapas.push(MANTER_NOME_CPF_MOTOBOY ? "motoboy anonimizado (nome e CPF guardados)" : "motoboy anonimizado (inclusive nome e CPF)");

      // Secundários: erro vira aviso, não desfaz o resto.
      const { error: erroTf } = await supabaseAdmin.from("motoboys_turno_fixo")
        .update({ ativo: false, removido_em: agora })
        .eq("motoboy_id", sol.perfil_id).eq("ativo", true);
      if (erroTf) avisos.push("Turno fixo NÃO foi desativado: " + erroTf.message);
      else etapas.push("turno fixo desativado");

      const { error: erroPh } = await supabaseAdmin.from("prioridade_por_horario")
        .update({ ativo: false }).eq("motoboy_id", sol.perfil_id);
      if (erroPh) avisos.push("Prioridade por horário NÃO foi desativada: " + erroPh.message);
      else etapas.push("prioridade por horário desativada");

      // avaliacoes guarda uma CÓPIA do nome do motoboy, por pedido.
      const { ids, error: erroIds } = await idsPedidosDoMotoboy(supabaseAdmin, sol.perfil_id);
      if (erroIds) avisos.push(`Nome nas avaliações: só ${ids.length} pedido(s) puderam ser listados (${erroIds.message}).`);
      let falhasAval = 0;
      for (let i = 0; i < ids.length; i += 200) {
        const { error: erroAv } = await supabaseAdmin.from("avaliacoes")
          .update({ motoboy_nome: "Motoboy excluído" }).in("pedido_id", ids.slice(i, i + 200));
        if (erroAv) { falhasAval++; avisos.push(`Nome NÃO foi removido de parte das avaliações (lote ${i / 200 + 1}): ${erroAv.message}`); }
      }
      if (!falhasAval) etapas.push(`nome removido das avaliações (${ids.length} pedidos verificados)`);
    } else if (sol.tipo === "empresario") {
      const { data: emp, error: erroEmp } = await supabaseAdmin.from("empresarios").select("id")
        .eq("id", sol.perfil_id).eq("user_id", sol.user_id).maybeSingle();
      if (erroEmp) return res.status(400).json({ error: "Erro ao conferir o perfil: " + erroEmp.message });
      if (!emp) return res.status(400).json({ error: "Perfil de estabelecimento não confere com o usuário do pedido" });

      // Recusa se ainda houver pedido aguardando motoboy ou em rota.
      const { count: emAndamento, error: erroAnd } = await supabaseAdmin.from("pedidos")
        .select("id", { count: "exact", head: true })
        .eq("empresario_id", sol.perfil_id).in("status", EM_ANDAMENTO_EMPRESARIO);
      if (erroAnd) return res.status(400).json({ error: "Erro ao conferir pedidos em andamento: " + erroAnd.message });
      if (emAndamento > 0) {
        return res.status(409).json({ error: `O estabelecimento ainda tem ${emAndamento} pedido(s) em andamento (aguardando motoboy, aceito ou a caminho). A exclusão só pode ser concluída depois que eles forem entregues ou cancelados.` });
      }

      const anon = {
        nome_dono: null, tel_dono: null, nome_socio: null, tel_socio: null,
        telefone: null, endereco_estabelecimento: null, horario_funcionamento: null,
        bloqueado: true, motivo_bloqueio: "Conta excluída a pedido do titular", bloqueado_em: agora,
      };
      const r1 = await atualizarComFallback(supabaseAdmin, "empresarios", anon, { id: sol.perfil_id });
      if (!r1.ok) return res.status(400).json({ error: "Erro ao anonimizar estabelecimento: " + r1.error.message, etapas });
      etapas.push("estabelecimento anonimizado (nome, CNPJ e financeiro mantidos)");

      const { error: erroCli } = await supabaseAdmin.from("clientes").delete().eq("empresario_id", sol.perfil_id);
      if (erroCli) return res.status(400).json({ error: "Erro ao apagar clientes salvos: " + erroCli.message, etapas });
      etapas.push("clientes salvos apagados");
    } else {
      return res.status(400).json({ error: "Tipo de conta inválido" });
    }

    // Login: bloqueia (100 anos) e troca o e-mail, pra pessoa não entrar mais
    // e o e-mail antigo ficar livre pra um cadastro novo, se ela quiser voltar.
    const { error: erroAuth } = await supabaseAdmin.auth.admin.updateUserById(sol.user_id, {
      email: `excluido-${String(sol.user_id).slice(0, 8)}@excluido.invalid`,
      email_confirm: true,
      ban_duration: "876000h",
      user_metadata: {},
    });
    if (erroAuth) return res.status(400).json({ error: "Dados anonimizados, mas erro ao bloquear o login: " + erroAuth.message, etapas, avisos });
    etapas.push("login bloqueado e e-mail trocado");

    // Ajuste de 07/10/2026: além de marcar como concluída, apaga o e-mail
    // original e o texto livre do motivo — assim eles não ficam guardados
    // depois da exclusão. O resto da linha (id, user_id, tipo, perfil_id,
    // datas) fica como comprovante.
    const { error: erroFim } = await supabaseAdmin.from("solicitacoes_exclusao")
      .update({ status: "concluida", concluido_em: agora, email: null, motivo: null }).eq("id", sol.id);
    if (erroFim) avisos.push("A exclusão foi feita, mas o pedido NÃO foi marcado como concluído (" + erroFim.message + "). Tente de novo pra marcar.");
    else etapas.push("pedido marcado como concluído");

    console.log(`[excluir-conta] ${sol.tipo} ${sol.perfil_id}:`, etapas.join(" · "), avisos.length ? " | AVISOS: " + avisos.join(" · ") : "");
    return res.status(200).json({ success: true, etapas, avisos });
  } catch (err) {
    console.error("[excluir-conta] Erro inesperado:", err);
    return res.status(500).json({ error: err.message });
  }
}
