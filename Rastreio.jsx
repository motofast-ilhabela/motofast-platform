import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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

// ─── PÁGINA DE RASTREIO ──────────────────────────────────────────────────────
export default function Rastreio() {
  const [params] = useSearchParams();

  const cliente = params.get("cliente") || "";
  const empresa = params.get("empresa") || "";
  const empresaTel = params.get("empresaTel") || "";
  const motoboy = params.get("motoboy") || "Nosso motoboy";
  const bairro  = params.get("bairro")  || "";
  const rua     = params.get("rua")     || "";
  const num     = params.get("num")     || "";
  const ref     = params.get("ref")     || "";

  const [etapa, setEtapa] = useState(1); // o link já é enviado quando o motoboy sai para entrega

  // Demonstração: avança para "Entregue" depois de um tempo
  useEffect(() => {
    if (etapa >= 2) return;
    const t = setTimeout(() => setEtapa(2), 35000);
    return () => clearTimeout(t);
  }, [etapa]);

  // Link inválido / sem dados
  if (!cliente && !bairro) {
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
              ? <>Seu pedido{empresa && <> na <strong style={{color:"#34d399"}}>{empresa}</strong></>} está a caminho!</>
              : <>Seu pedido{empresa && <> da <strong style={{color:"#34d399"}}>{empresa}</strong></>} foi entregue. 🎉</>}
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
              Obrigado por escolher{empresa ? <> a <strong style={{color:"#f9fafb"}}>{empresa}</strong></> : "a gente"}. Volte sempre! 💚
            </div>
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
            <iframe
              src={`https://maps.google.com/maps?q=${mapaQuery}&output=embed&hl=pt-BR`}
              width="100%" height="200" style={{border:"none",display:"block"}} title="mapa" loading="lazy"/>
          </div>
        )}

        {/* Aviso importante */}
        <div style={{background:"#1a1000",border:"1px solid #f59e0b",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
          <div style={{color:"#fbbf24",fontWeight:700,fontSize:13,marginBottom:6}}>⚠️ Importante</div>
          <div style={{color:"#d1d5db",fontSize:13,lineHeight:1.6,marginBottom:empresaTel?12:0}}>
            Esta mensagem serve <strong>apenas para você acompanhar sua entrega</strong>. Este número não realiza atendimento — não responda por aqui.
          </div>
          {empresaTel && (
            <a href={`https://wa.me/55${empresaTel.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"12px",borderRadius:8,background:"#0d3d2e",border:"1px solid #34d399",color:"#34d399",fontWeight:700,fontSize:14,textDecoration:"none",boxSizing:"border-box"}}>
              💬 Falar com {empresa || "o estabelecimento"}
            </a>
          )}
          {!empresaTel && (
            <div style={{color:"#d1d5db",fontSize:13,lineHeight:1.6}}>
              Para falar sobre o seu pedido — trocas, problemas ou dúvidas — entre em contato diretamente com{" "}
              {empresa ? <strong style={{color:"#f9fafb"}}>{empresa}</strong> : "o estabelecimento"}.
            </div>
          )}
        </div>

        <div style={{textAlign:"center",color:"#374151",fontSize:11}}>
          Rastreamento por ⚡ MotoFast
        </div>
      </div>
    </div>
  );
}
