import { createClient } from '@supabase/supabase-js'
// ⚡ Conexão com o banco de dados MotoFast (Supabase)
const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co"
const SUPABASE_KEY = "sb_publishable_MMbUB_k9rDmEJU1j9wAKig_ZpoOTwVW"

// Força TODAS as consultas ao banco a nunca usar cache do navegador — sem isso,
// o navegador pode guardar uma resposta antiga (inclusive um erro temporário,
// como aconteceu em 27/08/2026 com a ambiguidade de relacionamento) e continuar
// servindo ela por um tempo, mesmo depois do problema já ter sido corrigido no
// banco de dados. Com "cache: 'no-store'", toda consulta busca dado fresco na
// hora, sempre — sem precisar de ninguém limpar cache manualmente nunca mais.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, { ...options, cache: 'no-store' });
    },
  },
})
