// Função de servidor — rastreio público do pedido (link que o cliente recebe).
// Devolve SÓ o status do pedido e, quando o motoboy está a caminho, a posição
// dele no mapa. Nunca devolve telefone, nome, endereço ou qualquer outro dado.
// A chave secreta (SUPABASE_SERVICE_ROLE_KEY) fica só aqui no servidor.
import { createClient } from '@supabase/supabase-js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS_COM_LOCALIZACAO = ["aceito", "saiu_estabelecimento"];

export default async function handler(req, res) {
  // CORS — igual às outras funções, pra funcionar também no app nativo (Capacitor)
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
  if (!pedidoId || typeof pedidoId !== "string") {
    return res.status(400).json({ error: "pedidoId é obrigatório" });
  }
  if (!UUID_REGEX.test(pedidoId)) {
    return res.status(400).json({ error: "pedidoId inválido" });
  }

  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data: pedido, error } = await supabaseAdmin
      .from("pedidos")
      .select("status, motoboy_id")
      .eq("id", pedidoId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar pedido no rastreio:", error.message);
      return res.status(500).json({ error: "Não foi possível consultar o pedido" });
    }
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    let latitude = null;
    let longitude = null;

    if (pedido.motoboy_id && STATUS_COM_LOCALIZACAO.includes(pedido.status)) {
      const { data: moto, error: erroMoto } = await supabaseAdmin
        .from("motoboys")
        .select("latitude, longitude")
        .eq("id", pedido.motoboy_id)
        .maybeSingle();
      if (erroMoto) {
        console.error("Erro ao buscar localização no rastreio:", erroMoto.message);
      } else if (moto && moto.latitude && moto.longitude) {
        latitude = moto.latitude;
        longitude = moto.longitude;
      }
    }

    // Só estes três campos saem daqui — nada mais.
    return res.status(200).json({ ok: true, status: pedido.status, latitude, longitude });
  } catch (err) {
    console.error("Erro inesperado no rastreio:", err.message);
    return res.status(500).json({ error: "Erro inesperado ao consultar o rastreio" });
  }
}
