// Função de servidor — bloqueia, desbloqueia, bane ou desbane um motoboy.
// Criada em 03/09/2026: o Admin.jsx atualizava "bloqueado"/"banido" direto
// pelo navegador (chave publishable, sujeita a RLS). Alessandro reportou que
// o bloqueio aparecia na tela por poucos segundos e depois "desfazia sozinho"
// — sinal de que a escrita no banco não estava sendo aceita silenciosamente
// (RLS bloqueando o UPDATE do Admin), enquanto a tela já tinha mudado de
// forma otimista. Essa função roda no servidor com a SERVICE_ROLE_KEY, que
// ignora RLS, garantindo que a escrita realmente acontece — e devolve a
// linha atualizada pro Admin só marcar como bloqueado na tela depois de
// confirmar que o banco realmente mudou.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id, acao, motivo } = req.body || {};
  if (!id || !acao) {
    return res.status(400).json({ error: "id e acao são obrigatórios" });
  }

  const ACOES_VALIDAS = ["bloquear", "desbloquear", "banir", "desbanir"];
  if (!ACOES_VALIDAS.includes(acao)) {
    return res.status(400).json({ error: "acao inválida" });
  }
  if (acao === "banir" && !motivo?.trim()) {
    return res.status(400).json({ error: "motivo é obrigatório para banir" });
  }

  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let update = {};
  if (acao === "bloquear") update = { bloqueado: true, online: false };
  if (acao === "desbloquear") update = { bloqueado: false };
  if (acao === "banir") update = { banido: true, bloqueado: true, online: false, motivo_banimento: motivo, data_banimento: new Date().toISOString() };
  if (acao === "desbanir") update = { banido: false, bloqueado: false, motivo_banimento: null, data_banimento: null };

  try {
    const { data, error } = await supabaseAdmin
      .from("motoboys")
      .update(update)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Erro ao atualizar motoboy:", error);
      return res.status(400).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Motoboy não encontrado" });
    }

    return res.status(200).json({ success: true, motoboy: data });
  } catch (err) {
    console.error("Erro inesperado ao bloquear/banir motoboy:", err);
    return res.status(500).json({ error: err.message });
  }
}
