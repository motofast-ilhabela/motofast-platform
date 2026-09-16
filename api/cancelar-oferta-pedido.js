// Função de servidor — avisa (via push que o app nativo intercepta e
// esconde da tela sozinho) que um pedido específico não está mais
// disponível, pra qualquer celular do app nativo que ainda estiver com o
// alarme de "corrida nova" tocando pra esse mesmo pedido parar na hora,
// mesmo com o app fechado ou a tela bloqueada.
//
// Usado pelo app nativo (app-mobile/src/screens/Motoboy.jsx) assim que um
// motoboy aceita uma corrida — sem isso, outro motoboy que ainda estivesse
// com o alarme tocando pra essa mesma corrida (tela bloqueada, sem abrir o
// app) só descobria que já tinha perdido a corrida ao desbloquear o
// celular manualmente.
//
// CORRIGIDO em 14/09/2026, antes de ir pra produção: a versão original
// mandava pra "Total Subscriptions" (todo mundo inscrito — motoboy,
// empresário, admin) com heading/contents preenchidos, ou seja, uma
// notificação visível de verdade pra todo mundo, toda vez que qualquer
// pedido fosse aceito. Agora: (1) busca no banco só quem estava realmente
// elegível pra aquele pedido específico (online, ativo, não banido, livre,
// exceto quem aceitou) e manda só pra esses via external_id; (2) manda sem
// heading/contents, com content_available, pra ser silencioso de verdade —
// o app processa o "data" em segundo plano e desliga o alarme sozinho, sem
// aparecer nada na tela de ninguém.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const { pedidoId } = req.body || {};
  if (!pedidoId) {
    return res.status(400).json({ error: "pedidoId é obrigatório" });
  }

  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  const APP_ID = "df32f4f0-4280-4127-9d84-ec8a0a05328c";
  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!REST_API_KEY) {
    console.error("ONESIGNAL_REST_API_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do OneSignal não configurada no servidor" });
  }
  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Busca o pedido pra saber quem aceitou (esse é excluído da lista — pra
    // ele não é "oferta cancelada", é a corrida dele de verdade agora).
    const { data: pedido, error: erroPedido } = await supabaseAdmin
      .from("pedidos")
      .select("id, motoboy_id")
      .eq("id", pedidoId)
      .maybeSingle();
    if (erroPedido) {
      console.error("[cancelar-oferta-pedido] Erro ao buscar pedido:", erroPedido);
      return res.status(400).json({ error: erroPedido.message });
    }
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Elegíveis: online, ativos, não banidos, e diferentes de quem aceitou.
    let query = supabaseAdmin
      .from("motoboys")
      .select("id")
      .eq("online", true)
      .eq("ativo", true)
      .eq("banido", false);
    if (pedido.motoboy_id) {
      query = query.neq("id", pedido.motoboy_id);
    }
    const { data: candidatosDB, error: erroCandidatos } = await query;
    if (erroCandidatos) {
      console.error("[cancelar-oferta-pedido] Erro ao buscar candidatos:", erroCandidatos);
      return res.status(400).json({ error: erroCandidatos.message });
    }
    const idsCandidatos = (candidatosDB || []).map(m => m.id);

    // Tira quem já está ocupado em outra corrida — não tinha como estar
    // vendo essa oferta mesmo.
    let idsElegiveis = idsCandidatos;
    if (idsCandidatos.length > 0) {
      const { data: ocupadosDB } = await supabaseAdmin
        .from("pedidos")
        .select("motoboy_id")
        .in("motoboy_id", idsCandidatos)
        .in("status", ["aceito", "saiu_estabelecimento"]);
      const idsOcupados = new Set((ocupadosDB || []).map(p => p.motoboy_id));
      idsElegiveis = idsCandidatos.filter(id => !idsOcupados.has(id));
    }

    if (idsElegiveis.length === 0) {
      console.log("[cancelar-oferta-pedido] Nenhum elegível pra avisar — nada enviado.");
      return res.status(200).json({ success: true, recipients: 0 });
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        // Só pros elegíveis desse pedido específico, nunca "todo mundo".
        include_external_user_ids: idsElegiveis.map(String),
        channel_for_external_user_ids: "push",
        target_channel: "push",
        // Vai com heading/contents preenchidos (não é mais silencioso) —
        // ajustado em 14/09/2026: o app nativo já intercepta e esconde
        // qualquer notificação antes de mostrar na tela, então não
        // precisava do content_available pra ter discrição, e esse formato
        // estava causando ~10s de atraso real na entrega (Android trata
        // "data messages" puras com mais restrição em segundo plano,
        // principalmente em aparelhos Samsung). Como o público já é
        // corretamente restrito aos elegíveis (não é mais "todo mundo"),
        // isso é seguro.
        headings: { en: "Corrida encerrada" },
        contents: { en: "Essa corrida já foi aceita por outro motoboy." },
        data: { tipo: "cancelar_oferta", pedidoId: String(pedidoId) },
        priority: 10,
      }),
    });
    const data = await response.json();

    console.log("[cancelar-oferta-pedido] Resposta completa do OneSignal:", JSON.stringify(data));
    console.log(`[cancelar-oferta-pedido] Elegíveis avisados: ${idsElegiveis.length}`);
    if (data.errors) {
      console.error("[cancelar-oferta-pedido] OneSignal retornou erros mesmo com status 200:", JSON.stringify(data.errors));
    }

    if (!response.ok) {
      console.error("Erro ao enviar notificação OneSignal:", data);
      return res.status(response.status).json({ error: data });
    }
    return res.status(200).json({ success: true, data, elegiveis: idsElegiveis.length });
  } catch (err) {
    console.error("Erro ao enviar push de cancelamento de oferta:", err);
    return res.status(500).json({ error: err.message });
  }
}
