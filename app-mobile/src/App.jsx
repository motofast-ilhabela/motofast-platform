import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Cadastro from './screens/Cadastro.jsx'
import Motoboy from './screens/Motoboy.jsx'
import Empresario from './screens/Empresario.jsx'
import Admin from './screens/Admin.jsx'

// Email autorizado como admin — mesma regra da plataforma web
const ADMIN_EMAIL = "botdahora@gmail.com"

// ─── TELA DE LOGIN DO ADMIN ───────────────────────────────────────────────────
// Cópia adaptada do LoginAdmin de App.jsx da web: na web, o Admin NUNCA loga
// pela tela de Cadastro — tem essa tela própria, exclusiva, ligada direto à
// rota /admin. Só troquei o "← Voltar para o início" de <a href="/"> pra
// useNavigate (HashRouter). Sem essa tela, tentar logar como Admin pela tela
// de Cadastro dava erro "não encontramos seu cadastro" (ela só sabe checar
// as tabelas empresarios/motoboys, nunca o e-mail de admin).
function LoginAdmin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function entrar() {
    if (!email || !senha) { setErro("Preencha email e senha."); return; }
    setCarregando(true)
    setErro("")
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro("Email ou senha incorretos.")
    }
    setCarregando(false)
  }

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif",padding:20}}>
      <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:16,width:"100%",maxWidth:380,padding:32}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{color:"#34d399",fontWeight:900,fontSize:28,letterSpacing:-1}}>⚡ MotoFast</div>
          <div style={{color:"#6b7280",fontSize:13,marginTop:6}}>Painel Administrativo</div>
        </div>

        {erro && (
          <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:16,color:"#f87171",fontSize:13}}>
            {erro}
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div style={{color:"#9ca3af",fontSize:12,marginBottom:6,fontWeight:600}}>Email</div>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&entrar()}
            placeholder="seu@email.com"
            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"11px 14px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}
          />
        </div>

        <div style={{marginBottom:24}}>
          <div style={{color:"#9ca3af",fontSize:12,marginBottom:6,fontWeight:600}}>Senha</div>
          <input
            type="password"
            value={senha}
            onChange={e=>setSenha(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&entrar()}
            placeholder="••••••••"
            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"11px 14px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}
          />
        </div>

        <button
          onClick={entrar}
          disabled={carregando}
          style={{width:"100%",padding:"13px",borderRadius:10,background:"#10b981",border:"none",color:"#fff",fontWeight:800,fontSize:15,cursor:carregando?"not-allowed":"pointer",opacity:carregando?0.6:1}}
        >
          {carregando ? "Entrando..." : "🔐 Entrar no Admin"}
        </button>

        <div style={{textAlign:"center",marginTop:16}}>
          <span onClick={()=>navigate("/")} style={{color:"#4b5563",fontSize:12,textDecoration:"none",cursor:"pointer"}}>← Voltar para o início</span>
        </div>
      </div>
    </div>
  )
}

// ─── PROTEÇÃO DE ROTA DO ADMIN ────────────────────────────────────────────────
function RotaAdmin() {
  const [estado, setEstado] = useState("verificando") // verificando | autorizado | negado

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      setEstado(user && user.email === ADMIN_EMAIL ? "autorizado" : "negado")
    }
    verificar()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEstado(session?.user?.email === ADMIN_EMAIL ? "autorizado" : "negado")
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (estado === "verificando") return <Verificando />
  if (estado === "negado") return <LoginAdmin />
  return <Admin />
}

// ─── PROTEÇÃO DE ROTA DO EMPRESÁRIO ──────────────────────────────────────────
function RotaEmpresario() {
  const [estado, setEstado] = useState("verificando")

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setEstado("negado"); return }

      const { data: emp } = await supabase
        .from("empresarios")
        .select("id, aprovado")
        .eq("user_id", user.id)
        .maybeSingle()

      if (emp && emp.aprovado) setEstado("autorizado")
      else if (emp && !emp.aprovado) setEstado("pendente")
      else setEstado("negado")
    }
    verificar()
  }, [])

  if (estado === "verificando") return <Verificando />
  if (estado === "pendente") return <CadastroPendente mensagem="Seu cadastro está sendo analisado pela equipe MotoFast. Você receberá um email quando for aprovado." />
  if (estado === "negado") return <Navigate to="/" replace />
  return <Empresario />
}

// ─── PROTEÇÃO DE ROTA DO MOTOBOY ─────────────────────────────────────────────
function RotaMotoboy() {
  const [estado, setEstado] = useState("verificando")

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setEstado("negado"); return }

      const { data: mb } = await supabase
        .from("motoboys")
        .select("id, aprovado")
        .eq("user_id", user.id)
        .maybeSingle()

      if (mb && mb.aprovado) setEstado("autorizado")
      else if (mb && !mb.aprovado) setEstado("pendente")
      else setEstado("negado")
    }
    verificar()
  }, [])

  if (estado === "verificando") return <Verificando />
  if (estado === "pendente") return <CadastroPendente mensagem="Seu cadastro está sendo analisado pela equipe MotoFast. Aguarde a aprovação para começar a receber pedidos." />
  if (estado === "negado") return <Navigate to="/" replace />
  return <Motoboy />
}

// ─── ROTA INICIAL ("/") — RESTAURA SESSÃO JÁ LOGADA ──────────────────────────
// Adicionado pra corrigir bug crítico: no Android, o sistema mata o processo
// do app com frequência ao minimizar ou apagar a tela (gerenciamento de
// bateria) — quando o usuário volta, o WebView recarrega do zero e cai
// sempre na rota "/", nunca na tela em que estava. O token de login salvo no
// @capacitor/preferences continua intacto, mas a tela de Cadastro nunca
// verificava se já existia uma sessão válida antes de mostrar os botões
// "Sou Empresário/Motoboy" — por isso parecia estar deslogado, mesmo com a
// sessão ainda válida. Essa checagem não existe no site porque um navegador
// raramente recarrega uma aba em segundo plano do mesmo jeito.
function RotaInicial() {
  const navigate = useNavigate()
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    async function verificarSessaoExistente() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setPronto(true); return }

      if (user.email === ADMIN_EMAIL) { navigate("/admin", { replace: true }); return }

      const { data: mb } = await supabase.from("motoboys").select("id").eq("user_id", user.id).maybeSingle()
      if (mb) { navigate("/motoboy", { replace: true }); return }

      const { data: emp } = await supabase.from("empresarios").select("id").eq("user_id", user.id).maybeSingle()
      if (emp) { navigate("/empresario", { replace: true }); return }

      // Sessão existe mas não corresponde a nenhum cadastro conhecido —
      // mostra a tela de Cadastro normalmente.
      setPronto(true)
    }
    verificarSessaoExistente()
  }, [])

  if (!pronto) return <Verificando />
  return <Cadastro />
}

function Verificando() {
  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>⚡</div>
        <div style={{color:"#34d399",fontWeight:700,fontSize:18}}>Verificando acesso...</div>
      </div>
    </div>
  )
}

function CadastroPendente({ mensagem }) {
  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif",padding:20}}>
      <div style={{background:"#111827",border:"1px solid #f59e0b",borderRadius:16,padding:32,maxWidth:400,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>⏳</div>
        <div style={{color:"#fbbf24",fontWeight:800,fontSize:20,marginBottom:10}}>Cadastro em análise</div>
        <div style={{color:"#9ca3af",fontSize:14,lineHeight:1.6}}>{mensagem}</div>
        <button onClick={async () => { await supabase.auth.signOut() }}
          style={{marginTop:20,padding:"10px 24px",borderRadius:8,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:13,cursor:"pointer"}}>
          🚪 Sair
        </button>
      </div>
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
// HashRouter (não BrowserRouter) porque o app roda empacotado, sem servidor
// resolvendo caminhos de URL — o padrão recomendado do Capacitor pra SPA.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RotaInicial />} />
        <Route path="/empresario" element={<RotaEmpresario />} />
        <Route path="/motoboy" element={<RotaMotoboy />} />
        <Route path="/admin" element={<RotaAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
