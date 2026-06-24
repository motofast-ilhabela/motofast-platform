import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Cadastro from './Cadastro.jsx'
import Admin from './Admin.jsx'
import Empresario from './Empresario.jsx'
import Motoboy from './Motoboy.jsx'
import Rastreio from './Rastreio.jsx'

// ─── TELA DE LOGIN DO ADMIN ───────────────────────────────────────────────────
function LoginAdmin() {
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
          <a href="/" style={{color:"#4b5563",fontSize:12,textDecoration:"none"}}>← Voltar para o início</a>
        </div>
      </div>
    </div>
  )
}

// ─── PROTEÇÃO DE ROTA DO ADMIN ────────────────────────────────────────────────
// Email autorizado como admin — só esse email tem acesso
const ADMIN_EMAIL = "botdahora@gmail.com"

function RotaAdmin() {
  const [estado, setEstado] = useState("verificando") // verificando | autorizado | negado

  useEffect(()=>{
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === ADMIN_EMAIL) {
        setEstado("autorizado")
      } else {
        setEstado("negado")
      }
    }
    verificar()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setEstado("autorizado")
      } else {
        setEstado("negado")
      }
    })
    return () => listener.subscription.unsubscribe()
  },[])

  if (estado === "verificando") {
    return (
      <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>⚡</div>
          <div style={{color:"#34d399",fontWeight:700,fontSize:18}}>Verificando acesso...</div>
        </div>
      </div>
    )
  }

  if (estado === "negado") return <LoginAdmin />
  return <Admin />
}

// ─── PROTEÇÃO DE ROTA DO EMPRESÁRIO ──────────────────────────────────────────
function RotaEmpresario() {
  const [estado, setEstado] = useState("verificando")

  useEffect(()=>{
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setEstado("negado"); return; }

      // Verifica se é um empresário aprovado
      const { data: emp } = await supabase
        .from("empresarios")
        .select("id, aprovado")
        .eq("user_id", user.id)
        .maybeSingle()

      if (emp && emp.aprovado) {
        setEstado("autorizado")
      } else if (emp && !emp.aprovado) {
        setEstado("pendente")
      } else {
        setEstado("negado")
      }
    }
    verificar()
  },[])

  if (estado === "verificando") {
    return (
      <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>⚡</div>
          <div style={{color:"#34d399",fontWeight:700,fontSize:18}}>Verificando acesso...</div>
        </div>
      </div>
    )
  }

  if (estado === "pendente") {
    return (
      <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif",padding:20}}>
        <div style={{background:"#111827",border:"1px solid #f59e0b",borderRadius:16,padding:32,maxWidth:400,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>⏳</div>
          <div style={{color:"#fbbf24",fontWeight:800,fontSize:20,marginBottom:10}}>Cadastro em análise</div>
          <div style={{color:"#9ca3af",fontSize:14,lineHeight:1.6}}>Seu cadastro está sendo analisado pela equipe MotoFast. Você receberá um email quando for aprovado.</div>
          <button onClick={async()=>{ await supabase.auth.signOut(); window.location.href="/"; }}
            style={{marginTop:20,padding:"10px 24px",borderRadius:8,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            🚪 Sair
          </button>
        </div>
      </div>
    )
  }

  if (estado === "negado") return <Navigate to="/" replace />
  return <Empresario />
}

// ─── PROTEÇÃO DE ROTA DO MOTOBOY ─────────────────────────────────────────────
function RotaMotoboy() {
  const [estado, setEstado] = useState("verificando")

  useEffect(()=>{
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setEstado("negado"); return; }

      // Verifica se é um motoboy aprovado
      const { data: mb } = await supabase
        .from("motoboys")
        .select("id, aprovado")
        .eq("user_id", user.id)
        .maybeSingle()

      if (mb && mb.aprovado) {
        setEstado("autorizado")
      } else if (mb && !mb.aprovado) {
        setEstado("pendente")
      } else {
        setEstado("negado")
      }
    }
    verificar()
  },[])

  if (estado === "verificando") {
    return (
      <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>⚡</div>
          <div style={{color:"#34d399",fontWeight:700,fontSize:18}}>Verificando acesso...</div>
        </div>
      </div>
    )
  }

  if (estado === "pendente") {
    return (
      <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif",padding:20}}>
        <div style={{background:"#111827",border:"1px solid #f59e0b",borderRadius:16,padding:32,maxWidth:400,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>⏳</div>
          <div style={{color:"#fbbf24",fontWeight:800,fontSize:20,marginBottom:10}}>Cadastro em análise</div>
          <div style={{color:"#9ca3af",fontSize:14,lineHeight:1.6}}>Seu cadastro está sendo analisado pela equipe MotoFast. Aguarde a aprovação para começar a receber pedidos.</div>
          <button onClick={async()=>{ await supabase.auth.signOut(); window.location.href="/"; }}
            style={{marginTop:20,padding:"10px 24px",borderRadius:8,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            🚪 Sair
          </button>
        </div>
      </div>
    )
  }

  if (estado === "negado") return <Navigate to="/" replace />
  return <Motoboy />
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela inicial — cadastro e login */}
        <Route path="/" element={<Cadastro />} />

        {/* Painel do empresário — protegido */}
        <Route path="/empresario" element={<RotaEmpresario />} />

        {/* Painel do motoboy — protegido */}
        <Route path="/motoboy" element={<RotaMotoboy />} />

        {/* Painel administrativo — protegido, só botdahora@gmail.com */}
        <Route path="/admin" element={<RotaAdmin />} />

        {/* Rastreio público — sem login */}
        <Route path="/rastreio" element={<Rastreio />} />

        {/* Qualquer outro link redireciona pra tela inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
