import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

// ─── PÁGINA DE REDEFINIÇÃO DE SENHA ───────────────────────────────────────────
// Pra onde o link do e-mail de "Esqueci minha senha" leva. O Supabase, ao clicar
// no link do e-mail, já loga a pessoa temporariamente (sessão de recuperação) —
// aqui só pedimos a senha nova e chamamos updateUser() pra trocar de vez.
export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(null); // null=checando, true/false

  useEffect(()=>{
    // Confirma se existe uma sessão de recuperação válida (o Supabase cria isso
    // automaticamente quando a pessoa clica no link do e-mail). Se não tiver,
    // o link já expirou ou é inválido.
    supabase.auth.getSession().then(({data})=>{
      setSessaoValida(!!data?.session);
    });
  },[]);

  async function salvar() {
    setErro("");
    if (novaSenha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As duas senhas digitadas são diferentes. Confira e tente de novo.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);
    if (error) {
      setErro("Erro ao trocar a senha: " + error.message);
      return;
    }
    setSucesso(true);
    setTimeout(()=>{ window.location.href = "/"; }, 3000);
  }

  const estilos = {
    pagina: {minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Inter','Segoe UI',sans-serif"},
    card: {background:"#111827",border:"1px solid #1f2937",borderRadius:16,padding:"32px 28px",width:"100%",maxWidth:400},
    titulo: {color:"#34d399",fontWeight:900,fontSize:22,marginBottom:6,textAlign:"center"},
    sub: {color:"#6b7280",fontSize:13,marginBottom:24,textAlign:"center"},
    label: {color:"#9ca3af",fontSize:12,marginBottom:4,fontWeight:600},
    input: {background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"11px 14px",width:"100%",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:14},
    btn: {width:"100%",padding:"14px",borderRadius:10,background:"#10b981",border:"none",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"},
    erro: {background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:14,color:"#f87171",fontSize:13},
  };

  if (sessaoValida===null) {
    return (
      <div style={estilos.pagina}>
        <div style={{color:"#6b7280",fontSize:14}}>Carregando...</div>
      </div>
    );
  }

  if (sessaoValida===false) {
    return (
      <div style={estilos.pagina}>
        <div style={estilos.card}>
          <div style={{fontSize:48,textAlign:"center",marginBottom:12}}>⚠️</div>
          <div style={estilos.titulo}>Link expirado ou inválido</div>
          <div style={{color:"#9ca3af",fontSize:13,textAlign:"center",marginBottom:20}}>
            Esse link de redefinição de senha não é mais válido. Volta na tela de login e clica em "Esqueci minha senha" de novo pra receber um link novo.
          </div>
          <a href="/" style={{...estilos.btn,display:"block",textAlign:"center",textDecoration:"none",boxSizing:"border-box"}}>Voltar pro login</a>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div style={estilos.pagina}>
        <div style={estilos.card}>
          <div style={{fontSize:48,textAlign:"center",marginBottom:12}}>✅</div>
          <div style={estilos.titulo}>Senha alterada!</div>
          <div style={{color:"#9ca3af",fontSize:13,textAlign:"center"}}>
            Já pode entrar com a senha nova. Levando você pro login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.card}>
        <div style={{fontSize:40,textAlign:"center",marginBottom:10}}>⚡</div>
        <div style={estilos.titulo}>Escolher nova senha</div>
        <div style={estilos.sub}>Digite a senha nova pra sua conta MotoFast</div>

        {erro && <div style={estilos.erro}>{erro}</div>}

        <div style={estilos.label}>Nova senha</div>
        <input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)}
          placeholder="Mínimo 6 caracteres" style={estilos.input}/>

        <div style={estilos.label}>Confirmar nova senha</div>
        <input type="password" value={confirmarSenha} onChange={e=>setConfirmarSenha(e.target.value)}
          placeholder="Digite de novo" style={estilos.input}/>

        <button onClick={salvar} disabled={salvando} style={{...estilos.btn,opacity:salvando?0.6:1,cursor:salvando?"not-allowed":"pointer"}}>
          {salvando ? "Salvando..." : "💾 Salvar nova senha"}
        </button>
      </div>
    </div>
  );
}
