// Função de servidor — redefine a senha de um usuário (motoboy ou empresário) diretamente.
// A chave secreta (SUPABASE_SERVICE_ROLE_KEY) fica só aqui no servidor,
// nunca é enviada para o navegador de ninguém.
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { userId, novaSenha } = req.body || {};
  if (!userId || !novaSenha) {
    return res.status(400).json({ error: "userId e novaSenha são obrigatórios" });
  }
  if (novaSenha.length < 6) {
    return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres" });
  }

  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: novaSenha,
      email_confirm: true,
    });

    if (error) {
      console.error("Erro ao redefinir senha:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro inesperado ao redefinir senha:", err);
    return res.status(500).json({ error: err.message });
  }
}
