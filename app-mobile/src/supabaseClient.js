import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'

// ⚡ Conexão com o banco de dados MotoFast (Supabase) — mesmo projeto usado pela
// plataforma web, só que este é um cliente independente, de código separado.
const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co"
const SUPABASE_KEY = "sb_publishable_MMbUB_k9rDmEJU1j9wAKig_ZpoOTwVW"

// Adapter de storage usando @capacitor/preferences em vez de localStorage: no
// app nativo, o WebView pode limpar localStorage com mais facilidade (troca de
// versão do app, low storage do sistema, etc.) — Preferences é o storage nativo
// recomendado pelo Capacitor pra persistir a sessão de login de forma confiável.
const capacitorStorageAdapter = {
  getItem: async (key) => {
    const { value } = await Preferences.get({ key })
    return value
  },
  setItem: async (key, value) => {
    await Preferences.set({ key, value })
  },
  removeItem: async (key) => {
    await Preferences.remove({ key })
  },
}

// Mesmo motivo da versão web: força toda consulta a nunca usar cache, pra nunca
// repetir o bug de 27/08/2026 (resposta antiga/errada servida do cache).
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: capacitorStorageAdapter,
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, { ...options, cache: 'no-store' })
    },
  },
})
