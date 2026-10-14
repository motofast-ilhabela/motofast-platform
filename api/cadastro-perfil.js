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

// Rótulos em português dos campos obrigatórios do motoboy (pra mensagem de erro)
const ROTULOS_MOTOBOY = {
  nome_completo: "nome completo",
  cpf: "CPF",
  rg: "RG",
  nascimento: "data de nascimento",
  nome_pai: "nome do pai",
  nome_mae: "nome da mãe",
  endereco: "endereço",
  bairro_base: "bairro",
  telefone: "telefone",
  pix: "chave PIX",
};

// Data de hoje no fuso de Brasília, como "AAAA-MM-DD"
function hojeSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

// Confere nascimento "AAAA-MM-DD": formato estrito, data real, ano >= 1900, não futura.
// Devolve { ok:true, idade } ou { ok:false, motivo }.
function conferirNascimento(valor) {
  if (typeof valor !== "string") return { ok: false, motivo: "obrigatoria" };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (!m) return { ok: false, motivo: "invalida" };
  const ano = +m[1], mes = +m[2], dia = +m[3];
  if (ano < 1900 || mes < 1 || mes > 12 || dia < 1) return { ok: false, motivo: "invalida" };
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    return { ok: false, motivo: "invalida" };
  }
  const hoje = hojeSaoPaulo().split("-").map(Number);
  const [hA, hM, hD] = hoje;
  if (ano > hA || (ano === hA && (mes > hM || (mes === hM && dia > hD)))) {
    return { ok: false, motivo: "futura" };
  }
  let idade = hA - ano;
  if (hM < mes || (hM === mes && hD < dia)) idade--;
  return { ok: true, idade };
}

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
    // 3.1) Regras extras do MOTOBOY: campos obrigatórios + maioridade (18 anos).
    // Se algo falhar, apaga o usuário recém-criado (pra não sobrar conta sem perfil)
    // e devolve 400 com a mensagem do motivo.
    if (tipo === "motoboy") {
      let recusa = null; // { mensagem, campo }

      const faltando = Object.keys(ROTULOS_MOTOBOY).filter(
        (c) => typeof registro[c] !== "string" || registro[c].trim() === ""
      );
      if (faltando.includes("nascimento")) {
        recusa = { mensagem: "A data de nascimento é obrigatória (DD/MM/AAAA).", campo: "nascimento" };
      } else if (faltando.length > 0) {
        recusa = {
          mensagem: "Preencha todos os campos obrigatórios. Faltando: " + faltando.map((c) => ROTULOS_MOTOBOY[c]).join(", ") + ".",
          campo: faltando[0],
        };
      } else {
        const nasc = conferirNascimento(registro.nascimento);
        if (!nasc.ok) {
          recusa = {
            mensagem: nasc.motivo === "futura"
              ? "A data de nascimento não pode ser no futuro."
              : "Data de nascimento inválida. Use o formato DD/MM/AAAA.",
            campo: "nascimento",
          };
        } else if (nasc.idade < 18) {
          recusa = { mensagem: "É necessário ter 18 anos ou mais para se cadastrar.", campo: "nascimento" };
        } else {
          registro.nascimento = registro.nascimento.trim();
        }
      }

      if (recusa) {
        const { error: erroDel } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (erroDel) console.error("Erro ao apagar usuário de cadastro recusado:", erroDel.message);
        console.log("Cadastro de motoboy recusado:", recusa.campo);
        return res.status(400).json({ error: recusa.mensagem, campo: recusa.campo, contaRemovida: !erroDel });
      }
    }

    Object.assign(registro, forcados);

    const { error: erroInsert } = await supabaseAdmin.from(tabela).insert(registro);
    if (erroInsert) {
      console.error("Erro ao salvar perfil (" + tipo + "):", erroInsert.message);
      let contaRemovida = false;
      if (tipo === "motoboy") {
        const { error: erroDel } = await supabaseAdmin.auth.admin.deleteUser(userId);
        contaRemovida = !erroDel;
      }
      return res.status(400).json({ error: "Não foi possível salvar o cadastro. Tente novamente.", contaRemovida });
    }

    console.log("Perfil criado:", tipo);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro inesperado no cadastro de perfil:", err.message);
    return res.status(500).json({ error: "Erro inesperado ao salvar o cadastro" });
  }
}
