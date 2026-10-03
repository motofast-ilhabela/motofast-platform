import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { credenciaisDisponiveis, entrarComContaSalva } from './credenciais.js'

// Abre a lista de contas salvas do Android SÓ UMA VEZ por abertura do app
// (não a cada vez que a pessoa volta pra tela inicial) — se ela fechou a
// lista, é porque quer entrar digitando ou com outra conta.
let jaAbriuSozinho = false

// Chamado depois de qualquer login que deu certo: assim, quando a pessoa
// sair da conta (pra trocar de conta, por exemplo), a lista abre sozinha de
// novo na tela inicial.
export function liberarAberturaAutomatica() {
  jaAbriuSozinho = false
}

// Botão "🔑 Entrar com conta salva" (ver credenciais.js). Com abrirSozinho,
// abre a lista do sistema assim que a tela aparece (uma vez por abertura do
// app). Se não houver nenhuma conta salva, o Android não mostra nada — só
// aparece uma explicação curta embaixo do botão, sem atrapalhar quem ainda
// não salvou senha.
export default function EntrarComContaSalva({ abrirSozinho = false }) {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")
  const [semConta, setSemConta] = useState(false)

  async function abrir(manual = true) {
    setErro("")
    setCarregando(true)
    const r = await entrarComContaSalva()
    setCarregando(false)
    if (!r) { if (manual) setSemConta(true); return }
    if (r.erro) { setErro(r.erro); return }
    liberarAberturaAutomatica()
    navigate(r.rota, { replace: true })
  }

  useEffect(() => {
    if (!abrirSozinho || jaAbriuSozinho || !credenciaisDisponiveis()) return
    jaAbriuSozinho = true
    abrir(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrirSozinho])

  if (!credenciaisDisponiveis()) return null

  return (
    <div style={{marginBottom:16}}>
      {erro && (
        <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:10,color:"#f87171",fontSize:13,textAlign:"left"}}>
          {erro}
        </div>
      )}
      <button type="button" onClick={() => abrir(true)} disabled={carregando}
        style={{width:"100%",padding:"13px",borderRadius:10,background:"#12305a",border:"1px solid #60a5fa",color:"#93c5fd",fontWeight:800,fontSize:15,cursor:carregando?"not-allowed":"pointer",opacity:carregando?0.6:1}}>
        {carregando ? "Entrando..." : "🔑 Entrar com conta salva"}
      </button>
      {semConta && (
        <div style={{color:"#6b7280",fontSize:11,marginTop:6,textAlign:"center"}}>
          Nenhuma conta escolhida. Se ainda não salvou, entre digitando uma vez e toque em "Salvar" quando o celular perguntar.
        </div>
      )}
    </div>
  )
}
