// Função de servidor — devolve o e-mail da conta de cada cadastro pendente,
// pra aparecer no card da aba "Pendentes" do Admin. O e-mail fica guardado no
// login do Supabase (não nas tabelas), por isso precisa da chave de servidor.
// SÓ o Admin pode usar. A chave secreta fica só aqui, nunca no navegador.
import { createClient } from '@supabase/supabase-js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const { userIds } = req.body || {};
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "userIds é obrigatório" });
  }
  const ids = userIds.filter((u) => typeof u === "string" && UUID_REGEX.test(u)).slice(0, 100);
  if (ids.length === 0) {
    return res.status(400).json({ error: "Nenhum userId válido" });
  }

  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Só o Admin pode usar esta rota: confere o login de quem chamou.
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sem autorização" });
  const { data: quem, error: erroQuem } = await supabaseAdmin.auth.getUser(token);
  if (erroQuem || quem?.user?.email !== "botdahora@gmail.com") {
    return res.status(403).json({ error: "Só o Admin pode usar esta função" });
  }

  try {
    const emails = {};
    await Promise.all(
      ids.map(async (id) => {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
        if (!error && data?.user) emails[id] = data.user.email || null;
      })
    );
    return res.status(200).json({ ok: true, emails });
  } catch (err) {
    console.error("Erro inesperado ao buscar e-mails dos cadastros:", err.message);
    return res.status(500).json({ error: "Erro inesperado ao buscar e-mails" });
  }
}
