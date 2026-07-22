// Função de servidor — dispara notificação push real via OneSignal.
// A chave secreta (ONESIGNAL_REST_API_KEY) fica só aqui no servidor,
// nunca é enviada para o navegador do motoboy ou do empresário.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const { titulo, corpo } = req.body || {};
  if (!titulo || !corpo) {
    return res.status(400).json({ error: "titulo e corpo são obrigatórios" });
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
        included_segments: ["Subscribed Users"],
        headings: { en: titulo },
        contents: { en: corpo },
        url: "https://motofast-platform.vercel.app/motoboy",
        // Prioridade máxima no Android (FCM) — força a entrega mesmo
        // com o celular em modo de economia de energia (Doze Mode).
        // Sem isso o sistema pode atrasar ou segurar a notificação
        // até o app ser reaberto.
        priority: 10,
        // Garante que a notificação aparece na tela bloqueada.
        android_visibility: 1,
        // Força som e vibração padrão do sistema mesmo em segundo plano.
        android_sound: "default",
        ios_sound: "default",
      }),
    });
    const data = await response.json();
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
