// Função de servidor — grava o perfil (empresário ou motoboy) logo depois do
// cadastro (signUp). Antes o navegador gravava direto no banco; agora o
// servidor confere tudo e força os campos sensíveis, ignorando o que vier do navegador.
// A chave secreta (SUPABASE_SERVICE_ROLE_KEY) fica só aqui no servidor.
import { createClient } from '@supabase/supabase-js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Usuário precisa ter sido criado há no máximo 10 minutos
const JANELA_MS = 10 * 60 * 1000;

// Únicos campos que o formulário pode mandar (lista fixa) -> coluna do banco
const CAMPOS_EMPRESARIO = {
  nome: "nome",
  cnpj: "cnpj",
  endereco_estabelecimento: "endereco_estabelecimento",
  bairro: "bairro",
  telefone: "telefone",
  horario_funcionamento: "horario_funcionamento",
  nome_dono: "nome_dono",
  tel_dono: "tel_dono",
  nome_socio: "nome_socio",
  tel_socio: "tel_socio",
};
const CAMPOS_MOTOBOY = {
  nome_completo: "nome_completo",
  cpf: "cpf",
  rg: "rg",
  nascimento: "nascimento",
  nome_pai: "nome_pai",
  nome_mae: "nome_mae",
  endereco: "endereco",
  bairro_base: "bairro_base",
  telefone: "telefone",
  pix: "pix",
};

// Campos sensíveis: SEMPRE com valor de cadastro novo, venha o que vier do navegador.
const FORCADOS_EMPRESARIO = { aprovado: false, rejeitado: false, bloqueado: false };
const FORCADOS_MOTOBOY = { aprovado: false, rejeitado: false, online: false, banido: false };

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

  const { tipo, userId, dados } = req.body || {};
  if (tipo !== "empresario" && tipo !== "motoboy") {
    return res.status(400).json({ error: "Tipo de cadastro inválido" });
  }
  if (!userId || typeof userId !== "string" || !UUID_REGEX.test(userId)) {
    return res.status(400).json({ error: "userId inválido" });
  }
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return res.status(400).json({ error: "Dados do cadastro são obrigatórios" });
  }

  const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente da Vercel");
    return res.status(500).json({ error: "Chave do Supabase não configurada no servidor" });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const tabela = tipo === "empresario" ? "empresarios" : "motoboys";
  const permitidos = tipo === "empresario" ? CAMPOS_EMPRESARIO : CAMPOS_MOTOBOY;
  const forcados = tipo === "empresario" ? FORCADOS_EMPRESARIO : FORCADOS_MOTOBOY;

  try {
    // 1) O usuário existe e foi criado agora há pouco?
    const { data: dadosUser, error: erroUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const usuario = dadosUser?.user;
    if (erroUser || !usuario) {
      return res.status(403).json({ error: "Cadastro não autorizado" });
    }
    const criadoEm = new Date(usuario.created_at).getTime();
    if (!criadoEm || Date.now() - criadoEm > JANELA_MS) {
      return res.status(403).json({ error: "Tempo para concluir o cadastro expirou. Fale com o suporte." });
    }

    // 2) Esse usuário ainda NÃO tem perfil em nenhuma das duas tabelas?
    const [{ data: jaEmp, error: erroEmp }, { data: jaMoto, error: erroMoto }] = await Promise.all([
      supabaseAdmin.from("empresarios").select("id").eq("user_id", userId).limit(1),
      supabaseAdmin.from("motoboys").select("id").eq("user_id", userId).limit(1),
    ]);
    if (erroEmp || erroMoto) {
      console.error("Erro ao conferir perfil existente:", (erroEmp || erroMoto).message);
      return res.status(500).json({ error: "Não foi possível conferir o cadastro" });
    }
    if ((jaEmp && jaEmp.length > 0) || (jaMoto && jaMoto.length > 0)) {
      return res.status(409).json({ error: "Este usuário já possui cadastro" });
    }

    // 3) Monta o registro: só campos da lista fixa (texto simples) + campos forçados
    const registro = { user_id: userId };
    for (const campo of Object.keys(permitidos)) {
      const valor = dados[campo];
      if (valor === undefined || valor === null) {
        registro[permitidos[campo]] = null;
      } else if (typeof valor === "string") {
        registro[permitidos[campo]] = valor.slice(0, 500);
      } else {
        registro[permitidos[campo]] = null;
      }
    }
    Object.assign(registro, forcados);

    const { error: erroInsert } = await supabaseAdmin.from(tabela).insert(registro);
    if (erroInsert) {
      console.error("Erro ao salvar perfil (" + tipo + "):", erroInsert.message);
      return res.status(400).json({ error: "Não foi possível salvar o cadastro" });
    }

    console.log("Perfil criado:", tipo);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro inesperado no cadastro de perfil:", err.message);
    return res.status(500).json({ error: "Erro inesperado ao salvar o cadastro" });
  }
}
