import { Preferences } from '@capacitor/preferences'

// "Lembrar login" — adicionado em 03/10/2026 a pedido do Alessandro.
//
// Decisão de segurança: o app NUNCA guarda senha. Quem guarda é o gerenciador
// de senhas do aparelho (Gerenciador de Senhas do Google no Android, Chaveiro
// do iCloud no iPhone), que oferece "Salvar senha?" depois de um login certo e
// preenche sozinho da próxima vez — isso depende dos campos de login estarem
// marcados com autoComplete="username"/"current-password" e dentro de um
// <form> de verdade (ver LoginAdmin no App.jsx e TelaLogin no Cadastro.jsx).
//
// Aqui só fica a lista dos últimos e-mails que entraram com sucesso, por tipo
// de conta, pra mostrar como atalho "toque pra preencher" na tela de login.
// E-mail não é segredo; a senha continua só no gerenciador do aparelho.

const MAX_EMAILS = 5

function chave(tipo) {
  return `emails_recentes_${tipo}`
}

export async function lerEmailsRecentes(tipo) {
  try {
    const { value } = await Preferences.get({ key: chave(tipo) })
    const lista = value ? JSON.parse(value) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

export async function lembrarEmail(tipo, email) {
  const limpo = (email || '').trim().toLowerCase()
  if (!limpo) return
  try {
    const atuais = await lerEmailsRecentes(tipo)
    const nova = [limpo, ...atuais.filter(e => e !== limpo)].slice(0, MAX_EMAILS)
    await Preferences.set({ key: chave(tipo), value: JSON.stringify(nova) })
  } catch (e) {
    console.log('Erro ao lembrar e-mail de login (não bloqueia o login):', e)
  }
}

export async function esquecerEmail(tipo, email) {
  try {
    const atuais = await lerEmailsRecentes(tipo)
    await Preferences.set({ key: chave(tipo), value: JSON.stringify(atuais.filter(e => e !== email)) })
  } catch (e) {
    console.log('Erro ao esquecer e-mail de login:', e)
  }
}
