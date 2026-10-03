import { createClient } from '@supabase/supabase-js';

const CONTAS_MONITORAMENTO_IDS = [
  "c98107a7-1fd1-4429-9502-d8496501347d",
  "a8cc6740-ca4d-4bb1-9292-0b81ce8f18be",
];

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
  const { titulo, corpo, pedidoId } = req.body || {};
  if (!titulo || !corpo) {
    return res.status(400).json({ error: "titulo e corpo são obrigatórios" });
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

    // CORRIGIDO em 02/10/2026: antes esse endpoint mandava o push pra "Total
    // Subscriptions" — todo aparelho que já autorizou notificação alguma
    // vez no OneSignal, sem filtro nenhum. Isso fazia o alarme de corrida
    // nova tocar em motoboy offline, bloqueado, já ocupado em outra
    // entrega, e até em celular que já foi de um motoboy e depois deslogou.
    // Agora busca no banco quem realmente pode receber: online, ativo, não
    // banido, não bloqueado, e sem outra entrega em andamento (exceto as
    // contas de monitoramento, que podem acumular mais de uma).
    const { data: candidatosDB, error: erroCandidatos } = await supabaseAdmin
      .from("motoboys")
      .select("id")
      .eq("online", true)
      .eq("ativo", true)
      .eq("banido", false)
      .eq("bloqueado", false);
    if (erroCandidatos) {
      console.error("[notificar-motoboys] Erro ao buscar candidatos:", erroCandidatos);
      return res.status(400).json({ error: erroCandidatos.message });
    }
    const idsCandidatos = (candidatosDB || []).map(m => m.id);

    let idsElegiveis = idsCandidatos;
    if (idsCandidatos.length > 0) {
      const { data: ocupadosDB, error: erroOcupados } = await supabaseAdmin
        .from("pedidos")
        .select("motoboy_id")
        .in("motoboy_id", idsCandidatos)
        .in("status", ["aceito", "saiu_estabelecimento"]);
      if (erroOcupados) {
        console.error("[notificar-motoboys] Erro ao buscar ocupados:", erroOcupados);
        return res.status(400).json({ error: erroOcupados.message });
      }
      const idsOcupados = new Set((ocupadosDB || []).map(p => p.motoboy_id));
      idsElegiveis = idsCandidatos.filter(id =>
        !idsOcupados.has(id) || CONTAS_MONITORAMENTO_IDS.includes(id)
      );
    }

    if (idsElegiveis.length === 0) {
      console.log("[notificar-motoboys] Nenhum motoboy elegível agora — nada enviado.");
      return res.status(200).json({ success: true, recipients: 0, elegiveis: 0 });
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_external_user_ids: idsElegiveis.map(String),
        channel_for_external_user_ids: "push",
        target_channel: "push",
        headings: { en: titulo },
        contents: { en: corpo },
        url: "https://motofast-platform.vercel.app/motoboy",
        data: pedidoId ? { pedidoId: String(pedidoId) } : undefined,
        ttl: 600,
        priority: 10,
        android_visibility: 1,
        android_channel_id: "21ab798f-74a5-45ee-9f18-7958bc765933",
        ios_sound: "default",
      }),
    });
    const data = await response.json();

    console.log("[notificar-motoboys] Resposta completa do OneSignal:", JSON.stringify(data));
    console.log(`[notificar-motoboys] Elegíveis: ${idsElegiveis.length} · Destinatários alcançados (recipients): ${data.recipients ?? "não informado"}`);
    if (data.errors) {
      console.error("[notificar-motoboys] OneSignal retornou erros mesmo com status 200:", JSON.stringify(data.errors));
    }

    if (!response.ok) {
      console.error("Erro ao enviar notificação OneSignal:", data);
      return res.status(response.status).json({ error: data });
    }
    return res.status(200).json({ success: true, data, elegiveis: idsElegiveis.length });
  } catch (err) {
    console.error("Erro ao enviar push:", err);
    return res.status(500).json({ error: err.message });
  }
}
