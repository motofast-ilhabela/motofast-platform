// Função de servidor — dispara notificação push SÓ PRA UM motoboy específico,
// via OneSignal. Diferente de /api/notificar-motoboys.js (que manda pra todo
// mundo de uma vez, usado no sistema antigo de "quem pegar, pegou"), esse
// arquivo usa "include_aliases" com o external_id do motoboy, pra atingir
// apenas o destinatário exato — peça central do sistema de rodízio.
//
// IMPORTANTE: isso só funciona se o app do motoboy chamar
// OneSignal.login(motoboyId) ao entrar (associando o external_id dele ao ID
// real na tabela motoboys). Precisa confirmar isso no Motoboy.jsx antes de
// usar isso em produção.
export default async function handler(req, res) {
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
        include_aliases: { external_id: [String(motoboyId)] },
        target_channel: "push",
        headings: { en: titulo },
        contents: { en: corpo },
        url: "https://motofast-platform.vercel.app/motoboy",
        priority: 10,
        android_visibility: 1,
        android_sound: "default",
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
