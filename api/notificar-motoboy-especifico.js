// Função de servidor — dispara notificação push SÓ PRA UM motoboy específico,
// via OneSignal. Diferente de /api/notificar-motoboys.js (que manda pra todo
// mundo de uma vez, usado no sistema antigo de "quem pegar, pegou"), esse
// arquivo usa "include_external_user_ids" com o ID do motoboy, pra atingir
// apenas o destinatário exato — peça central do sistema de rodízio.
//
// CORRIGIDO em 15/09/2026: usava "include_aliases" (sistema mais novo de
// alias unificado do OneSignal), mas descobrimos que uma fatia real de
// motoboys em produção (3 de 7 testados, contas normais) dava erro
// "invalid_aliases" — o app deles deve registrar o dispositivo pelo sistema
// antigo de external_user_id, não pelo unificado. Trocado pra
// "include_external_user_ids", que é o que bate com esse registro.
//
// IMPORTANTE: isso só funciona se o app do motoboy chamar
// OneSignal.login(motoboyId) ao entrar (associando o external_id dele ao ID
// real na tabela motoboys). Precisa confirmar isso no Motoboy.jsx antes de
// usar isso em produção.
export default async function handler(req, res) {
  // CORS — adicionado em 07/09/2026 pra permitir chamadas vindas do app
  // nativo (Capacitor/WebView), que faz preflight OPTIONS antes do POST de
  // verdade. Sem isso, o navegador do app bloqueava a chamada com 405 antes
  // mesmo dela chegar aqui. Não muda nada do comportamento pro site.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const { motoboyId, titulo, corpo } = req.body || {};
  if (!motoboyId || !titulo || !corpo) {
    return res.status(400).json({ error: "motoboyId, titulo e corpo são obrigatórios" });
  }
  const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
  const APP_ID = "df32f4f0-4280-4127-9d84-ec8a0a05328c";
  if (!REST_API_KEY) {
    console.error("ONESIGNAL_REST_API_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do OneSignal não configurada no servidor" });
  }
  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        // Direciona só pro external_id desse motoboy específico — diferente
        // do "included_segments" usado no notificar-motoboys.js, que manda
        // pra todo mundo. Precisa que o app do motoboy tenha rodado
        // OneSignal.login(motoboyId) pra esse alias existir.
        include_external_user_ids: [String(motoboyId)],
        channel_for_external_user_ids: "push",
        target_channel: "push",
        headings: { en: titulo },
        contents: { en: corpo },
        url: "https://motofast-platform.vercel.app/motoboy",
        priority: 10,
        android_visibility: 1,
        android_channel_id: "21ab798f-74a5-45ee-9f18-7958bc765933",
        ios_sound: "default",
      }),
    });
    const data = await response.json();
    console.log("[notificar-motoboy-especifico] Resposta completa do OneSignal:", JSON.stringify(data));
    console.log(`[notificar-motoboy-especifico] Destinatários alcançados (recipients): ${data.recipients ?? "não informado"}`);
    if (data.errors) {
      console.error("[notificar-motoboy-especifico] OneSignal retornou erros mesmo com status 200:", JSON.stringify(data.errors));
    }
    if (!response.ok) {
      console.error("Erro ao enviar notificação OneSignal:", data);
      return res.status(response.status).json({ error: data });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Erro ao enviar push:", err);
    return res.status(500).json({ error: err.message });
  }
}
