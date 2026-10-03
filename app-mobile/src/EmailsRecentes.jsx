import { useState, useEffect } from 'react'
import { lerEmailsRecentes, esquecerEmail } from './loginLembrado.js'

// Atalhos "toque pra preencher" com os últimos e-mails que entraram com
// sucesso nesse tipo de conta (ver loginLembrado.js). Tocar preenche o e-mail
// e leva o foco pro campo de senha, onde o gerenciador de senhas do aparelho
// oferece a senha salva. O "×" tira o e-mail da lista (ex: celular
// compartilhado). Não aparece nada se a lista estiver vazia.
export default function EmailsRecentes({ tipo, onEscolher, cor = "#34d399" }) {
  const [emails, setEmails] = useState([])

  useEffect(() => {
    let ativo = true
    lerEmailsRecentes(tipo).then(lista => { if (ativo) setEmails(lista) })
    return () => { ativo = false }
  }, [tipo])

  if (emails.length === 0) return null

  return (
    <div style={{marginBottom:14}}>
      <div style={{color:"#6b7280",fontSize:11,fontWeight:700,marginBottom:6}}>Entrar de novo como:</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {emails.map(email => (
          <div key={email} style={{display:"flex",alignItems:"stretch",gap:6}}>
            <button type="button" onClick={() => onEscolher(email)}
              style={{flex:1,textAlign:"left",padding:"10px 12px",borderRadius:8,background:"#0f172a",border:`1px solid ${cor}66`,color:"#f9fafb",fontSize:13,fontWeight:600,cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              👤 {email}
            </button>
            <button type="button" aria-label={`Esquecer ${email}`}
              onClick={async () => { await esquecerEmail(tipo, email); setEmails(prev => prev.filter(e => e !== email)) }}
              style={{padding:"0 12px",borderRadius:8,background:"transparent",border:"1px solid #374151",color:"#6b7280",fontSize:16,cursor:"pointer"}}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
