// RASCUNHO (06/10/2026, revisado) — vai em ExcluirContaWeb.jsx na raiz do
// site, com a rota /excluir-conta no App.jsx. É o link que vai no Play Console
// ("URL de exclusão de conta"): a Play Store exige que a pessoa consiga pedir
// a exclusão também pela web, sem precisar do app instalado.
//
// Fluxo: explica o que é apagado e o que é mantido → a pessoa entra com
// e-mail e senha (pra confirmar que é dona da conta) → se tiver corrida ou
// pedido em andamento, avisa e para por aí → confirma digitando EXCLUIR →
// registra o pedido em solicitacoes_exclusao (origem "web") → sai.
// Quem conclui é o Admin, na aba "Exclusões" (ver api/excluir-conta.js, que
// também recusa se houver algo em andamento).
// Quem não consegue entrar (esqueceu a senha) tem o WhatsApp do suporte.
import { useState } from "react";
import { supabase } from "./supabaseClient.js";

const SUPORTE_TEL = "5512991213656";
const PRAZO_DIAS = 15;

// TEM QUE SER IGUAL à constante de mesmo nome no api/excluir-conta.js (e no
// ExcluirConta.jsx do app). Decide se nome e CPF do motoboy são guardados
// depois da exclusão (decisão do contador). O texto da página muda conforme
// ela — se ficarem diferentes, a página promete uma coisa e o servidor faz
// outra.
const MANTER_NOME_CPF_MOTOBOY = true;

const EM_ANDAMENTO_MOTOBOY = ["aceito", "saiu_estabelecimento"];
const EM_ANDAMENTO_EMPRESARIO = ["aguardando", "aceito", "saiu_estabelecimento"];

const caixa = {background:"#111827",border:"1px solid #1f2937",borderRadius:14,padding:20,marginBottom:14};
const campo = {width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"11px 14px",fontSize:14,outline:"none",marginBottom:10};

export default function ExcluirContaWeb() {
  const [etapa, setEtapa] = useState("login"); // login | confirmar | feito
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState(null); // {tipo, id}
  const [motivo, setMotivo] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro(""); setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) { setErro("E-mail ou senha incorretos."); setCarregando(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: mb } = await supabase.from("motoboys").select("id").eq("user_id", user.id).maybeSingle();
    const { data: emp } = mb ? { data: null } : await supabase.from("empresarios").select("id").eq("user_id", user.id).maybeSingle();
    if (!mb && !emp) {
      await supabase.auth.signOut();
      setErro("Não encontramos um cadastro de motoboy ou estabelecimento nesse e-mail. Fale com o suporte.");
      setCarregando(false); return;
    }

    // Corrida ou pedido em andamento: avisa antes de deixar pedir (o servidor
    // também recusa concluir nesse caso).
    const { count: emAndamento } = mb
      ? await supabase.from("pedidos").select("id", { count: "exact", head: true })
          .eq("motoboy_id", mb.id).in("status", EM_ANDAMENTO_MOTOBOY)
      : await supabase.from("pedidos").select("id", { count: "exact", head: true })
          .eq("empresario_id", emp.id).in("status", EM_ANDAMENTO_EMPRESARIO);
    if (emAndamento > 0) {
      await supabase.auth.signOut();
      setErro(mb
        ? "Você tem uma corrida em andamento. Termine as entregas ou cancele a corrida antes de pedir a exclusão da conta."
        : "Você tem pedidos em andamento (aguardando motoboy ou a caminho). Conclua ou cancele esses pedidos antes de pedir a exclusão da conta.");
      setCarregando(false); return;
    }

    const { data: pend } = await supabase.from("solicitacoes_exclusao").select("solicitado_em")
      .eq("user_id", user.id).eq("status", "pendente").limit(1);
    if (pend && pend.length > 0) {
      await supabase.auth.signOut();
      setErro(`Você já pediu a exclusão desta conta em ${new Date(pend[0].solicitado_em).toLocaleDateString("pt-BR")}. Ela será concluída em até ${PRAZO_DIAS} dias.`);
      setCarregando(false); return;
    }
    setPerfil(mb ? { tipo: "motoboy", id: mb.id } : { tipo: "empresario", id: emp.id });
    setEtapa("confirmar"); setCarregando(false);
  }

  async function confirmar() {
    if (confirmacao.trim().toUpperCase() !== "EXCLUIR") { setErro("Digite EXCLUIR pra confirmar."); return; }
    setErro(""); setCarregando(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("solicitacoes_exclusao").insert({
      user_id: user.id, tipo: perfil.tipo, perfil_id: perfil.id,
      email: user.email || null, motivo: motivo.trim() || null, origem: "web",
    });
    if (error) {
      console.log("Erro ao registrar pedido de exclusão:", error);
      setErro("Não foi possível registrar agora. Fale com o suporte pelo WhatsApp que a gente faz a exclusão pra você.");
      setCarregando(false); return;
    }
    if (perfil.tipo === "motoboy") {
      await supabase.from("motoboys").update({ online: false }).eq("id", perfil.id);
    }
    await supabase.auth.signOut();
    setEtapa("feito"); setCarregando(false);
  }

  const whats = `https://wa.me/${SUPORTE_TEL}?text=${encodeURIComponent("Olá! Quero excluir minha conta do MotoFast.")}`;

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",color:"#f9fafb",fontFamily:"'Inter','Segoe UI',sans-serif",padding:"32px 16px"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{color:"#34d399",fontWeight:900,fontSize:26,marginBottom:4}}>⚡ MotoFast</div>
        <h1 style={{fontSize:22,margin:"0 0 16px"}}>Excluir minha conta</h1>

        <div style={caixa}>
          <div style={{color:"#9ca3af",fontSize:14,lineHeight:1.6}}>
            Motoboys e estabelecimentos podem pedir a exclusão da conta a qualquer momento, por aqui ou pelo app.
            A exclusão é concluída em até {PRAZO_DIAS} dias e não pode ser desfeita.
            Com corrida ou pedido em andamento, é preciso concluir ou cancelar antes.
          </div>
          <div style={{color:"#f87171",fontSize:12,fontWeight:800,margin:"14px 0 4px"}}>O QUE É APAGADO</div>
          <ul style={{color:"#d1d5db",fontSize:14,margin:"0 0 0 18px",padding:0,lineHeight:1.6}}>
            {MANTER_NOME_CPF_MOTOBOY
              ? <li>Motoboy: telefone, chave PIX, RG, data de nascimento, nomes dos pais, endereço e última localização</li>
              : <li>Motoboy: nome completo, CPF, telefone, chave PIX, RG, data de nascimento, nomes dos pais, endereço e última localização</li>}
            <li>Estabelecimento: dados do responsável e do sócio, telefone, endereço, horário e a lista de clientes salvos</li>
            <li>O acesso: não é mais possível entrar com o e-mail da conta</li>
          </ul>
          <div style={{color:"#34d399",fontSize:12,fontWeight:800,margin:"14px 0 4px"}}>O QUE É MANTIDO</div>
          <ul style={{color:"#d1d5db",fontSize:14,margin:"0 0 0 18px",padding:0,lineHeight:1.6}}>
            {MANTER_NOME_CPF_MOTOBOY
              ? <li>Motoboy: nome completo e CPF, guardados pelo prazo exigido pela legislação fiscal e contábil (registro dos pagamentos recebidos), sem aparecer no app nem no site; e as entregas feitas, com datas e valores</li>
              : <li>Motoboy: as entregas feitas, com datas e valores, sem os seus dados pessoais, pelo prazo exigido pela legislação fiscal e contábil</li>}
            <li>Estabelecimento: nome e CNPJ, os pedidos já feitos (com os dados de entrega de cada um), valores e pagamentos; valores em aberto continuam devidos</li>
          </ul>
        </div>

        {etapa === "login" && (
          <form onSubmit={entrar} style={caixa}>
            <div style={{fontWeight:800,marginBottom:10}}>Entre na conta que você quer excluir</div>
            <input type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" style={campo}/>
            <input type="password" placeholder="Senha" value={senha} onChange={e=>setSenha(e.target.value)} autoComplete="current-password" style={campo}/>
            {erro && <div style={{color:"#f87171",fontSize:13,marginBottom:10}}>{erro}</div>}
            <button type="submit" disabled={carregando} style={{width:"100%",padding:12,borderRadius:10,background:"#10b981",border:"none",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",opacity:carregando?0.6:1}}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
            <div style={{color:"#6b7280",fontSize:13,marginTop:12}}>
              Não lembra a senha? <a href={whats} target="_blank" rel="noreferrer" style={{color:"#34d399",fontWeight:700}}>Peça a exclusão pelo WhatsApp</a>.
            </div>
          </form>
        )}

        {etapa === "confirmar" && (
          <div style={caixa}>
            <div style={{fontWeight:800,marginBottom:10}}>Confirmar exclusão</div>
            <div style={{color:"#9ca3af",fontSize:13,marginBottom:4}}>Motivo (opcional)</div>
            <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} rows={2} style={{...campo,resize:"vertical"}}/>
            <div style={{color:"#9ca3af",fontSize:13,marginBottom:4}}>Pra confirmar, digite <b style={{color:"#f87171"}}>EXCLUIR</b></div>
            <input value={confirmacao} onChange={e=>setConfirmacao(e.target.value)} style={campo}/>
            {erro && <div style={{color:"#f87171",fontSize:13,marginBottom:10}}>{erro} {erro.includes("suporte") && <a href={whats} target="_blank" rel="noreferrer" style={{color:"#34d399"}}>Abrir WhatsApp</a>}</div>}
            <button type="button" onClick={confirmar} disabled={carregando} style={{width:"100%",padding:12,borderRadius:10,background:"#b91c1c",border:"none",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",opacity:carregando?0.6:1}}>
              {carregando ? "Registrando..." : "Excluir minha conta"}
            </button>
          </div>
        )}

        {etapa === "feito" && (
          <div style={{...caixa,border:"1px solid #34d399"}}>
            <div style={{color:"#34d399",fontWeight:900,fontSize:17,marginBottom:6}}>Pedido registrado</div>
            <div style={{color:"#d1d5db",fontSize:14,lineHeight:1.6}}>Sua conta será excluída em até {PRAZO_DIAS} dias. Você já saiu da conta neste navegador.</div>
          </div>
        )}
      </div>
    </div>
  );
}
