import { createClient } from '@supabase/supabase-js'

// ⚡ Conexão com o banco de dados MotoFast (Supabase)
const SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co"
const SUPABASE_KEY = "sb_publishable_MMbUB_k9rDmEJU1j9wAKig_ZpoOTwVW"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
