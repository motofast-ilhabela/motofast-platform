import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "./supabaseClient.js";

// ─── ETAPAS DO RASTREIO ─────────────────────────────────────────────────────
const ETAPAS = [
  { id: 0, icon: "✅", label: "Pedido confirmado" },
  { id: 1, icon: "🏍️", label: "Motoboy a caminho" },
  { id: 2, icon: "🏠", label: "Entregue" },
];

function Etapa({ etapa, atual }) {
  const ativo = etapa.id <= atual;
  const pulsando = etapa.id === atual && atual < 2;
  return (
    <div style={{flex:1,textAlign:"center",position:"relative",zIndex:1}}>
      <div style={{
        width:46,height:46,borderRadius:"50%",margin:"0 auto 8px",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
        background:ativo?"#0d3d2e":"#1f2937",
        border:`2px solid ${ativo?"#34d399":"#374151"}`,
        animation:pulsando?"pulseRastreio 1.6s infinite":"none",
      }}>{etapa.icon}</div>
      <div style={{color:ativo?"#34d399":"#6b7280",fontSize:11,fontWeight:700,lineHeight:1.3,padding:"0 4px"}}>{etapa.label}</div>
    </div>
  );
}

// Estrelas de avaliação
function Estrelas({ valor, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{display:"flex",gap:8,justifyContent:"center",margin:"10px 0"}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n}
          onMouseEnter={()=>setHover(n)}
          onMouseLeave={()=>setHover(0)}
          onClick={()=>onChange(n)}
          style={{fontSize:36,cursor:"pointer",filter:(hover||valor)>=n?"none":"grayscale(1)",transition:"transform 0.1s",transform:(hover||valor)>=n?"scale(1.15)":"scale(1)"}}>
          ⭐
        </span>
      ))}
    </div>
  );
}

// ─── PÁGINA DE RASTREIO ──────────────────────────────────────────────────────
export default function Rastreio() {
  const [params] = useSearchParams();

  const pedidoId  = params.get("pedido")    || "";
  const cliente   = params.get("cliente")   || "";
  const empresa   = params.get("empresa")   || "";
  const empresaTel= params.get("empresaTel")|| "";
  const motoboy   = params.get("motoboy")   || "Nosso motoboy";
  const bairro    = params.get("bairro")    || "";
  const rua       = params.get("rua")       || "";
  const num       = params.get("num")       || "";
  const ref       = params.get("ref")       || "";

  const [etapa, setEtapa] = useState(1);

  // Avaliação
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
  const [notaMotoboy, setNotaMotoboy] = useState(0);
  const [notaMotofast, setNotaMotofast] = useState(0);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  // Busca status real do pedido no banco a cada 5s
  useEffect(()=>{
    if (!pedidoId) return;

    async function verificarStatus() {
      const { data } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id", pedidoId)
        .maybeSingle();

      if (!data) return;

      if (data.status === "entregue") setEtapa(2);
      else if (data.status === "saiu_estabelecimento" || data.status === "aceito") setEtapa(1);
      else if (data.status === "aguardando") setEtapa(0);
    }

    verificarStatus();
    const intervalo = setInterval(verificarStatus, 5000);
    return () => clearInterval(intervalo);
  },[pedidoId]);

  async function enviarAvaliacao() {
    if (notaMotoboy === 0 || notaMotofast === 0) return;
    setEnviandoAvaliacao(true);
    try {
      await supabase.from("avaliacoes").insert({
        pedido_id: pedidoId || null,
        empresa_nome: empresa || null,
        motoboy_nome: motoboy || null,
        nota_motoboy: notaMotoboy,
        nota_motofast: notaMotofast,
        criado_em: new Date().toISOString(),
      });
      setAvaliacaoEnviada(true);
    } catch(e) {
      console.error("Erro ao salvar avaliação:", e);
      setAvaliacaoEnviada(true); // mesmo com erro, não bloqueia o usuário
    }
    setEnviandoAvaliacao(false);
  }

  // Link inválido / sem dados
  if (!cliente && !bairro && !pedidoId) {
    return (
      <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Inter','Segoe UI',sans-serif"}}>
        <div style={{textAlign:"center",maxWidth:340}}>
          <div style={{fontSize:44,marginBottom:12}}>🔗</div>
          <div style={{color:"#f9fafb",fontWeight:800,fontSize:17,marginBottom:6}}>Link de rastreio inválido</div>
          <div style={{color:"#6b7280",fontSize:13,lineHeight:1.6}}>Verifique o link recebido ou entre em contato com o estabelecimento que fez seu pedido.</div>
        </div>
      </div>
    );
  }

  const enderecoLinha = [rua && `${rua}${num ? ", "+num : ""}`, bairro].filter(Boolean).join(" — ");
  const mapaQuery = encodeURIComponent(`${rua}${num?", "+num:""}, ${bairro}, Ilhabela, SP`);

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb",paddingBottom:30}}>
      <style>{`
        @keyframes pulseRastreio {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.45); }
          50% { box-shadow: 0 0 0 9px rgba(52,211,153,0); }
        }
      `}</style>

      {/* Header */}
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"16px 20px",textAlign:"center"}}>
        <div style={{color:"#34d399",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>⚡ MotoFast</div>
        <div style={{color:"#6b7280",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>Rastreio de Entrega</div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px"}}>

        {/* Saudação */}
        <div style={{marginBottom:18}}>
          <div style={{color:"#f9fafb",fontWeight:800,fontSize:20}}>{cliente ? `Olá, ${cliente}! 👋` : "Olá! 👋"}</div>
          <div style={{color:"#9ca3af",fontSize:14,marginTop:4,lineHeight:1.5}}>
            {etapa < 2
              ? <>Seu pedido{empresa && <> em <strong style={{color:"#34d399"}}>{empresa}</strong></>} está a caminho!</>
              : <>Seu pedido{empresa && <> em <strong style={{color:"#34d399"}}>{empresa}</strong></>} foi entregue. 🎉</>}
          </div>
        </div>

        {/* Timeline */}
        <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"22px 16px 18px",marginBottom:16,position:"relative"}}>
          <div style={{position:"absolute",top:35,left:"16.5%",right:"16.5%",height:2,background:"#1f2937"}}/>
          <div style={{position:"absolute",top:35,left:"16.5%",height:2,background:"#34d399",width:etapa>=2?"67%":etapa>=1?"33%":"0%",transition:"width 0.6s"}}/>
          <div style={{display:"flex",position:"relative"}}>
            {ETAPAS.map(et=><Etapa key={et.id} etapa={et} atual={etapa}/>)}
          </div>
        </div>

        {/* Motoboy a caminho */}
        {etapa < 2 && (
          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>🏍️</div>
            <div>
              <div style={{color:"#34d399",fontWeight:800,fontSize:15}}>{motoboy}</div>
              <div style={{color:"#9ca3af",fontSize:12,marginTop:1}}>está levando seu pedido até você. Chegando em breve!</div>
            </div>
          </div>
        )}

        {/* Entregue */}
        {etapa >= 2 && (
          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:12,padding:"22px 16px",textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:40,marginBottom:6}}>✅</div>
            <div style={{color:"#34d399",fontWeight:800,fontSize:16}}>Pedido entregue com sucesso!</div>
            <div style={{color:"#9ca3af",fontSize:13,marginTop:4}}>
              Obrigado por utilizar{empresa ? <> <strong style={{color:"#f9fafb"}}>{empresa}</strong></> : " nosso serviço"}. Volte sempre! 💚
            </div>
          </div>
        )}

        {/* Avaliação — aparece só após entrega */}
        {etapa >= 2 && !avaliacaoEnviada && (
          <div style={{background:"#111827",border:"1px solid #f59e0b",borderRadius:12,padding:"18px 16px",marginBottom:16}}>
            <div style={{color:"#fbbf24",fontWeight:800,fontSize:14,marginBottom:4,textAlign:"center"}}>⭐ Avalie sua experiência</div>
            <div style={{color:"#9ca3af",fontSize:12,textAlign:"center",marginBottom:14}}>Sua opinião é muito importante para nós!</div>

            <div style={{marginBottom:14}}>
              <div style={{color:"#d1d5db",fontSize:13,fontWeight:700,textAlign:"center",marginBottom:4}}>🏍️ Como foi a entrega?</div>
              <div style={{color:"#6b7280",fontSize:11,textAlign:"center",marginBottom:4}}>O motoboy foi pontual e educado?</div>
              <Estrelas valor={notaMotoboy} onChange={setNotaMotoboy}/>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{color:"#d1d5db",fontSize:13,fontWeight:700,textAlign:"center",marginBottom:4}}>⚡ O que achou do MotoFast?</div>
              <div style={{color:"#6b7280",fontSize:11,textAlign:"center",marginBottom:4}}>Recomendaria nosso serviço de entregas?</div>
              <Estrelas valor={notaMotofast} onChange={setNotaMotofast}/>
            </div>

            <button
              onClick={enviarAvaliacao}
              disabled={notaMotoboy===0||notaMotofast===0||enviandoAvaliacao}
              style={{width:"100%",padding:"12px",borderRadius:10,background:notaMotoboy>0&&notaMotofast>0?"#10b981":"#1f2937",border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:notaMotoboy>0&&notaMotofast>0?"pointer":"not-allowed",opacity:notaMotoboy>0&&notaMotofast>0?1:0.5}}>
              {enviandoAvaliacao?"Enviando...":"✅ Enviar avaliação"}
            </button>
          </div>
        )}

        {/* Avaliação enviada */}
        {etapa >= 2 && avaliacaoEnviada && (
          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:12,padding:"16px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:6}}>🙏</div>
            <div style={{color:"#34d399",fontWeight:700,fontSize:14}}>Obrigado pela avaliação!</div>
            <div style={{color:"#9ca3af",fontSize:12,marginTop:4}}>Seu feedback nos ajuda a melhorar cada vez mais.</div>
          </div>
        )}

        {/* Endereço + mapa */}
        {(rua || bairro) && (
          <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,overflow:"hidden",marginBottom:16}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid #1f2937"}}>
              <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>📍 Endereço de entrega</div>
              <div style={{color:"#f9fafb",fontSize:14,fontWeight:600}}>{enderecoLinha}</div>
              {ref && <div style={{color:"#fbbf24",fontSize:12,marginTop:3}}>📌 {ref}</div>}
            </div>
            <div style={{position:"relative",height:200,background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <iframe
                src={`https://maps.google.com/maps?q=${mapaQuery}&output=embed&hl=pt-BR&z=16&iwloc=&zoom=16`}
                width="100%" height="200" 
                style={{border:"none",display:"block",pointerEvents:"none"}} 
                title="mapa" loading="lazy"
                scrolling="no"
              />
              <div style={{position:"absolute",inset:0,background:"transparent",cursor:"default"}}/>
            </div>
          </div>
        )}

        {/* Falar com estabelecimento */}
        {empresaTel && (
          <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{color:"#9ca3af",fontSize:12,marginBottom:10}}>
              Dúvidas sobre seu pedido? Fale diretamente com {empresa || "o estabelecimento"}:
            </div>
            <a href={`https://wa.me/55${empresaTel.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"12px",borderRadius:8,background:"#0d3d2e",border:"1px solid #34d399",color:"#34d399",fontWeight:700,fontSize:14,textDecoration:"none",boxSizing:"border-box"}}>
              💬 Falar com {empresa || "o estabelecimento"}
            </a>
          </div>
        )}

        {/* Captação MotoFast */}
        <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"14px 16px",marginBottom:16,textAlign:"center"}}>
          <div style={{color:"#6b7280",fontSize:12,lineHeight:1.7}}>
            🏍️ <strong style={{color:"#9ca3af"}}>Quer trabalhar como entregador</strong> ou <strong style={{color:"#9ca3af"}}>cadastrar seu estabelecimento</strong>?{" "}
            <a href="https://motofastentregas.com.br" target="_blank" rel="noreferrer" style={{color:"#34d399",fontWeight:700,textDecoration:"none"}}>
              Acesse motofastentregas.com.br
            </a>
          </div>
        </div>

        <div style={{textAlign:"center",color:"#374151",fontSize:11}}>
          Rastreamento por ⚡ MotoFast
        </div>
      </div>
    </div>
  );
}
