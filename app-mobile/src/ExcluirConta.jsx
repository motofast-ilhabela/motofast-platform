import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

// "Excluir minha conta" — adicionado em 06/10/2026. Exigência da Play Store
// pra apps em que o usuário cria conta: precisa existir um caminho DENTRO do
// app pra pedir a exclusão da conta e dos dados.
//
// Como funciona (ver app-mobile/PUBLICACAO-PLAY-STORE.md, seção 4.1):
// - Aqui o app só REGISTRA o pedido na tabela nova solicitacoes_exclusao
//   (estritamente aditiva, sem REFERENCES — regra do CLAUDE.md), deixa o
//   motoboy offline e sai da conta.
// - A exclusão de verdade (anonimizar os dados pessoais, apagar os clientes
//   salvos do estabelecimento, bloquear o login) roda no servidor, em
//   /api/excluir-conta, disparada pelo Admin na aba "Exclusões". Pelo app o
//   Admin não tem permissão pra isso (mesmo motivo do bloquear-motoboy.js).
// - Pedidos, valores e histórico NUNCA são apagados: continuam existindo pros
//   estabelecimentos e pra contabilidade. O que acontece com nome e CPF do
//   motoboy depende de MANTER_NOME_CPF_MOTOBOY (logo abaixo).
//
// Enquanto a tabela solicitacoes_exclusao não existir no banco, o registro
// falha e a tela manda falar com o suporte — nunca sai da conta sem ter
// registrado o pedido.

const SUPORTE_TEL = "5512991213656"
const PRAZO_DIAS = 15

// TEM QUE SER IGUAL à constante de mesmo nome no api/excluir-conta.js do site
// (e na página web ExcluirContaWeb.jsx). Decide se nome e CPF do motoboy são
// guardados depois da exclusão (decisão do contador, pendente em 06/10/2026).
// O texto abaixo muda conforme ela — se as duas ficarem diferentes, o app
// promete uma coisa e o servidor faz outra.
const MANTER_NOME_CPF_MOTOBOY = true

const TEXTOS = {
  motoboy: MANTER_NOME_CPF_MOTOBOY ? {
    apaga: [
      "Telefone, chave PIX, RG, data de nascimento, nome do pai e da mãe, endereço e bairro base",
      "Sua última localização registrada",
      "Seu acesso: você não consegue mais entrar com esse e-mail",
    ],
    mantem: [
      "Seu nome completo e CPF, guardados pelo prazo exigido pela legislação fiscal e contábil (registro dos pagamentos que você recebeu). Eles deixam de aparecer no app e no site",
      "As entregas que você fez, com datas e valores — os estabelecimentos e a contabilidade precisam desses registros",
    ],
  } : {
    apaga: [
      "Nome completo e CPF",
      "Telefone, chave PIX, RG, data de nascimento, nome do pai e da mãe, endereço e bairro base",
      "Sua última localização registrada",
      "Seu acesso: você não consegue mais entrar com esse e-mail",
    ],
    mantem: [
      "As entregas que você fez, com datas e valores, sem os seus dados pessoais — os estabelecimentos e a contabilidade precisam desses registros",
    ],
  },
  empresario: {
    apaga: [
      "Nome e telefone do responsável e do sócio, telefone e endereço do estabelecimento, horário de funcionamento",
      "A sua lista de clientes salvos (nome, telefone e endereço)",
      "Seu acesso: você não consegue mais entrar com esse e-mail",
    ],
    mantem: [
      "Nome e CNPJ do estabelecimento, os pedidos já feitos (com os dados de entrega de cada um), valores e pagamentos — a contabilidade precisa desses registros",
      "Valores em aberto continuam devidos, mesmo depois da exclusão",
    ],
  },
}

function dataBR(iso) {
  try { return new Date(iso).toLocaleDateString("pt-BR") } catch { return "" }
}

// tipo: "motoboy" | "empresario"
// perfilId: id na tabela motoboys/empresarios
// bloqueio: texto explicando por que agora não dá (ex: corrida em andamento), ou null
// antesDeSair: função async opcional chamada depois de registrar e antes do
//   signOut (ex: motoboy grava online:false)
export default function ExcluirConta({ tipo, perfilId, bloqueio = null, antesDeSair }) {
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const [confirmacao, setConfirmacao] = useState("")
  const [motivo, setMotivo] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")
  const [pedidoExistente, setPedidoExistente] = useState(null)
  const t = TEXTOS[tipo] || TEXTOS.motoboy

  // Se já existe um pedido pendente dessa conta, mostra isso em vez de deixar
  // pedir de novo. Falha silenciosa: sem a tabela no banco, só não mostra.
  useEffect(() => {
    if (!aberto) return
    let ativo = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from("solicitacoes_exclusao")
          .select("id, status, solicitado_em")
          .eq("user_id", user.id).eq("status", "pendente")
          .order("solicitado_em", { ascending: false }).limit(1)
        if (ativo && data && data.length > 0) setPedidoExistente(data[0])
      } catch { /* sem a tabela ainda — segue normal */ }
    })()
    return () => { ativo = false }
  }, [aberto])

  async function confirmar() {
    if (confirmacao.trim().toUpperCase() !== "EXCLUIR") { setErro('Digite EXCLUIR pra confirmar.'); return }
    setErro("")
    setEnviando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setErro("Sua sessão expirou. Entre de novo e tente outra vez."); setEnviando(false); return }
      const { error } = await supabase.from("solicitacoes_exclusao").insert({
        user_id: user.id,
        tipo,
        perfil_id: perfilId || null,
        email: user.email || null,
        motivo: motivo.trim() || null,
        origem: "app",
      })
      if (error) {
        console.log("Erro ao registrar pedido de exclusão:", error)
        setErro("Não foi possível registrar o pedido agora. Fale com o suporte pelo WhatsApp que a gente faz a exclusão pra você.")
        setEnviando(false)
        return
      }
      if (antesDeSair) {
        try { await antesDeSair() } catch (e) { console.log("Erro antes de sair (segue):", e) }
      }
      await supabase.auth.signOut()
      alert(`Pedido de exclusão registrado. Sua conta será excluída em até ${PRAZO_DIAS} dias e você vai sair do app agora.`)
      navigate("/", { replace: true })
    } catch (e) {
      console.log("Erro inesperado no pedido de exclusão:", e)
      setErro("Não foi possível registrar o pedido agora. Fale com o suporte pelo WhatsApp.")
      setEnviando(false)
    }
  }

  return (
    <>
      <div style={{textAlign:"center",padding:"18px 0 8px"}}>
        <button type="button" onClick={()=>{ setAberto(true); setErro(""); setConfirmacao(""); }}
          style={{background:"none",border:"none",color:"#6b7280",fontSize:12,textDecoration:"underline",cursor:"pointer"}}>
          Excluir minha conta
        </button>
      </div>

      {aberto && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
          <div style={{background:"#111827",border:"2px solid #ef4444",borderRadius:16,width:"100%",maxWidth:440,padding:22,maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{color:"#f87171",fontWeight:900,fontSize:19,marginBottom:8}}>Excluir minha conta</div>

            {pedidoExistente ? (
              <div style={{color:"#d1d5db",fontSize:14,lineHeight:1.5}}>
                Você já pediu a exclusão desta conta em <b>{dataBR(pedidoExistente.solicitado_em)}</b>. Ela será concluída em até {PRAZO_DIAS} dias a partir do pedido.
              </div>
            ) : bloqueio ? (
              <div style={{color:"#fbbf24",fontSize:14,lineHeight:1.5}}>{bloqueio}</div>
            ) : (
              <>
                <div style={{color:"#9ca3af",fontSize:13,marginBottom:10,lineHeight:1.5}}>
                  A exclusão é concluída em até {PRAZO_DIAS} dias e não pode ser desfeita.
                </div>
                <div style={{color:"#f87171",fontSize:12,fontWeight:800,marginBottom:4}}>O QUE É APAGADO</div>
                <ul style={{color:"#d1d5db",fontSize:13,margin:"0 0 10px 18px",padding:0,lineHeight:1.5}}>
                  {t.apaga.map(x => <li key={x}>{x}</li>)}
                </ul>
                <div style={{color:"#34d399",fontSize:12,fontWeight:800,marginBottom:4}}>O QUE É MANTIDO</div>
                <ul style={{color:"#d1d5db",fontSize:13,margin:"0 0 12px 18px",padding:0,lineHeight:1.5}}>
                  {t.mantem.map(x => <li key={x}>{x}</li>)}
                </ul>

                <div style={{color:"#9ca3af",fontSize:12,marginBottom:4}}>Motivo (opcional)</div>
                <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={2}
                  style={{width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"8px 10px",fontSize:13,marginBottom:10,resize:"vertical"}}/>

                <div style={{color:"#9ca3af",fontSize:12,marginBottom:4}}>Pra confirmar, digite <b style={{color:"#f87171"}}>EXCLUIR</b></div>
                <input value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} autoCapitalize="characters"
                  style={{width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"10px 12px",fontSize:14,marginBottom:10}}/>

                {erro && (
                  <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"8px 12px",marginBottom:10,color:"#f87171",fontSize:13}}>
                    {erro}{" "}
                    {erro.includes("suporte") && (
                      <a href={`https://wa.me/${SUPORTE_TEL}?text=${encodeURIComponent("Olá! Quero excluir minha conta do MotoFast.")}`} target="_blank" rel="noreferrer" style={{color:"#34d399",fontWeight:700}}>Abrir WhatsApp</a>
                    )}
                  </div>
                )}

                <button type="button" onClick={confirmar} disabled={enviando}
                  style={{width:"100%",padding:"12px",borderRadius:10,background:"#b91c1c",border:"none",color:"#fff",fontWeight:800,fontSize:14,cursor:enviando?"not-allowed":"pointer",opacity:enviando?0.6:1,marginBottom:8}}>
                  {enviando ? "Registrando..." : "Excluir minha conta"}
                </button>
              </>
            )}

            <button type="button" onClick={()=>setAberto(false)}
              style={{width:"100%",padding:"11px",borderRadius:10,background:"#1f2937",border:"1px solid #374151",color:"#d1d5db",fontWeight:700,fontSize:14,cursor:"pointer",marginTop:6}}>
              {pedidoExistente || bloqueio ? "Fechar" : "Cancelar"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
