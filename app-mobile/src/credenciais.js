import { Capacitor, registerPlugin } from '@capacitor/core'
import { supabase } from './supabaseClient.js'
import { lembrarEmail } from './loginLembrado.js'

// Email autorizado como admin — mesma regra da plataforma web. Mora aqui (e
// não no App.jsx) porque o login por conta salva também precisa saber pra
// qual tela mandar, e o App.jsx importa as telas (import circular).
export const ADMIN_EMAIL = "botdahora@gmail.com"

// Ponte pro CredenciaisPlugin (android/app/src/main/java/com/motofast/app/
// CredenciaisPlugin.java) — "lembrar login" pelo Gerenciador de Credenciais
// do Android, adicionado em 03/10/2026. O app nunca guarda senha: ela fica só
// no gerenciador de senhas do aparelho.
//
// Fora do app nativo (navegador/dev) as duas funções não fazem nada, e
// qualquer falha do plugin vira "sem credencial" — o login digitado continua
// funcionando sempre.
const Credenciais = registerPlugin('Credenciais')

export const credenciaisDisponiveis = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
const disponivel = credenciaisDisponiveis

// Abre a lista de contas salvas do sistema. Devolve { email, senha } se a
// pessoa tocou numa conta, ou null (nenhuma salva, fechou a lista, ou erro).
export async function pedirCredencialSalva() {
  if (!disponivel()) return null
  try {
    const r = await Credenciais.obterSenhaSalva()
    if (r && r.email && r.senha) return { email: r.email, senha: r.senha }
    if (r?.motivo) console.log('[credenciais] sem credencial:', r.motivo)
    return null
  } catch (e) {
    console.log('[credenciais] erro ao obter senha salva (segue com login digitado):', e)
    return null
  }
}

// Fluxo completo do "toca na conta e já entra": abre a lista de contas
// salvas, faz o login com a escolhida e descobre pra qual tela ela vai —
// mesma regra da RotaInicial do App.jsx (admin → /admin, motoboy → /motoboy,
// empresário → /empresario). Vale pra qualquer tipo de conta, não importa de
// qual tela de login a lista foi aberta.
// Devolve { rota } se entrou, { erro } se falhou, ou null se a pessoa não
// escolheu nenhuma conta (ou não tem nenhuma salva).
export async function entrarComContaSalva() {
  const cred = await pedirCredencialSalva()
  if (!cred) return null

  const { error } = await supabase.auth.signInWithPassword({ email: cred.email, password: cred.senha })
  if (error) {
    return { erro: error.message?.includes("Invalid login")
      ? "A senha salva dessa conta não funcionou (pode ter sido trocada). Entre digitando a senha nova — o app oferece salvar de novo."
      : "Erro ao entrar com a conta salva. Tente de novo." }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: "Erro ao entrar com a conta salva. Tente de novo." }

  if (user.email === ADMIN_EMAIL) {
    await lembrarEmail("admin", cred.email)
    return { rota: "/admin" }
  }
  const { data: mb } = await supabase.from("motoboys").select("id").eq("user_id", user.id).maybeSingle()
  if (mb) {
    await lembrarEmail("motoboy", cred.email)
    return { rota: "/motoboy" }
  }
  const { data: emp } = await supabase.from("empresarios").select("id").eq("user_id", user.id).maybeSingle()
  if (emp) {
    await lembrarEmail("empresario", cred.email)
    return { rota: "/empresario" }
  }

  await supabase.auth.signOut()
  return { erro: "Não encontramos o cadastro dessa conta. Fale com o suporte MotoFast." }
}

// Pede pro sistema mostrar "Salvar senha?" depois de um login certo digitado
// à mão. Nunca trava o login: qualquer resposta ou erro só é registrado.
export async function oferecerSalvarCredencial(email, senha) {
  if (!disponivel() || !email || !senha) return
  try {
    const r = await Credenciais.salvarSenha({ email, senha })
    if (!r?.salvo && r?.motivo) console.log('[credenciais] não salvou:', r.motivo)
  } catch (e) {
    console.log('[credenciais] erro ao oferecer salvar senha (login segue normal):', e)
  }
}
