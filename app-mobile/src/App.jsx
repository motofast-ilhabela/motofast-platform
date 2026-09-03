import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Cadastro from './screens/Cadastro.jsx'
import Motoboy from './screens/Motoboy.jsx'

// ─── TELAS AINDA NÃO PORTADAS (placeholder até migrarmos cada uma) ───────────
function EmConstrucao({ nome }) {
  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif",padding:20}}>
      <div style={{textAlign:"center",color:"#9ca3af"}}>
        <div style={{fontSize:48,marginBottom:16}}>🚧</div>
        <div style={{color:"#34d399",fontWeight:800,fontSize:18}}>Tela "{nome}" ainda não portada</div>
        <div style={{fontSize:13,marginTop:8}}>Em construção no app nativo.</div>
      </div>
    </div>
  )
}

// Email autorizado como admin — mesma regra da plataforma web
const ADMIN_EMAIL = "botdahora@gmail.com"

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
  if (estado === "negado") return <Navigate to="/" replace />
  return <EmConstrucao nome="Admin" />
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
  return <EmConstrucao nome="Empresário" />
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
        <Route path="/" element={<Cadastro />} />
        <Route path="/empresario" element={<RotaEmpresario />} />
        <Route path="/motoboy" element={<RotaMotoboy />} />
        <Route path="/admin" element={<RotaAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
