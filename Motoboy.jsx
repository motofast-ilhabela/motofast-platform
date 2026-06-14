import { useState, useEffect, useRef } from "react";

// ─── DADOS DO MOTOBOY (viriam do login) ──────────────────────────────────────
const MOTOBOY = {
  id: 1,
  nomeCompleto: "Carlos Eduardo Silva",
  tel: "(12) 99801-2233",
  pix: "11999012233",
  bairroBase: "Perequê",
};

const PG = {
  pix:      { label:"Pix",      icon:"💠", cor:"#34d399" },
  dinheiro: { label:"Dinheiro", icon:"💵", cor:"#fbbf24" },
  cartao:   { label:"Cartão",   icon:"💳", cor:"#60a5fa" },
};

// Histórico de entregas do motoboy
const HIST_INIT = [
  {id:1,clienteNome:"João da Silva",empresaNome:"Açaí da Hora",bairro:"Perequê",pagamento:"pix",taxa:5,status:"Entregue",data:"2026-06-09",hora:"19:32",semana:3,mes:6,repasePago:false},
  {id:2,clienteNome:"Maria Santos",empresaNome:"Pizzaria Dom João",bairro:"Vila",pagamento:"dinheiro",taxa:6,status:"Entregue",data:"2026-06-09",hora:"20:15",semana:3,mes:6,repasePago:false},
  {id:3,clienteNome:"Ana Costa",empresaNome:"Açaí da Hora",bairro:"Centro",pagamento:"pix",taxa:7,status:"Entregue",data:"2026-06-08",hora:"18:45",semana:3,mes:6,repasePago:false},
  {id:4,clienteNome:"Pedro Almeida",empresaNome:"Farmácia Central",bairro:"Barra Velha",pagamento:"cartao",taxa:9,status:"Entregue",data:"2026-06-08",hora:"20:00",semana:3,mes:6,repasePago:false},
  {id:5,clienteNome:"Lucas Ferreira",empresaNome:"Supermercado Norte",bairro:"Sul",pagamento:"pix",taxa:11,status:"Cancelada",data:"2026-06-07",hora:"19:10",semana:3,mes:6,repasePago:false},
  {id:6,clienteNome:"Fernanda Rocha",empresaNome:"Açaí da Hora",bairro:"Perequê",pagamento:"pix",taxa:5,status:"Entregue",data:"2026-06-07",hora:"21:00",semana:3,mes:6,repasePago:false},
  {id:7,clienteNome:"João da Silva",empresaNome:"Pizzaria Dom João",bairro:"Vila",pagamento:"pix",taxa:6,status:"Entregue",data:"2026-06-05",hora:"19:00",semana:2,mes:6,repasePago:true},
  {id:8,clienteNome:"Ana Costa",empresaNome:"Açaí da Hora",bairro:"Perequê",pagamento:"dinheiro",taxa:5,status:"Entregue",data:"2026-06-04",hora:"20:30",semana:2,mes:6,repasePago:true},
  {id:9,clienteNome:"Maria Santos",empresaNome:"Farmácia Central",bairro:"Centro",pagamento:"pix",taxa:7,status:"Entregue",data:"2026-06-03",hora:"17:00",semana:2,mes:6,repasePago:true},
  {id:10,clienteNome:"Pedro Almeida",empresaNome:"Supermercado Norte",bairro:"Barra Velha",pagamento:"pix",taxa:9,status:"Entregue",data:"2026-05-28",hora:"19:45",semana:4,mes:5,repasePago:true},
  {id:11,clienteNome:"Lucas Ferreira",empresaNome:"Açaí da Hora",bairro:"Sul",pagamento:"cartao",taxa:12,status:"Entregue",data:"2026-05-27",hora:"20:00",semana:4,mes:5,repasePago:true},
  {id:12,clienteNome:"Fernanda Rocha",empresaNome:"Pizzaria Dom João",bairro:"Armação",pagamento:"pix",taxa:11,status:"Entregue",data:"2026-05-26",hora:"21:15",semana:4,mes:5,repasePago:true},
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"18px 22px",...style}}>{children}</div>;
}
function Btn({ children, onClick, cor="verde", small, full, disabled }) {
  const cores = {verde:{bg:"#10b981",c:"#fff"},perigo:{bg:"#ef4444",c:"#fff"},cinza:{bg:"#1f2937",c:"#d1d5db"},amarelo:{bg:"#f59e0b",c:"#000"},azul:{bg:"#3b82f6",c:"#fff"}};
  const c = cores[cor]||cores.verde;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:c.bg,color:c.c,border:"none",borderRadius:8,padding:small?"6px 14px":"10px 18px",fontSize:small?12:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,width:full?"100%":"auto"}}>
      {children}
    </button>
  );
}
function Tag({ label, cor="#34d399" }) {
  return <span style={{background:cor+"22",color:cor,padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:700,border:`1px solid ${cor}44`}}>{label}</span>;
}
function Overlay({ children, maxW=480, borderColor="#1f2937" }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
      <div style={{background:"#111827",border:`2px solid ${borderColor}`,borderRadius:16,width:"100%",maxWidth:maxW,maxHeight:"94vh",overflow:"auto",padding:24}}>
        {children}
      </div>
    </div>
  );
}

// ─── SONS DISPONÍVEIS ────────────────────────────────────────────────────────
const SONS = {
  bipe_triplo: {
    label:"Bipe Triplo", emoji:"📳", descricao:"3 bipes rápidos e agudos",
    tocarCtx:(ctx)=>{
      [0,0.2,0.4].forEach(d=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.frequency.value=1000;o.type="square";
        g.gain.setValueAtTime(1.0,ctx.currentTime+d);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+d+0.18);
        o.start(ctx.currentTime+d);o.stop(ctx.currentTime+d+0.18);
      });
    }
  },
  sirene: {
    label:"Sirene", emoji:"🚨", descricao:"Sirene crescente e forte",
    tocarCtx:(ctx)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);o.type="sawtooth";
      o.frequency.setValueAtTime(400,ctx.currentTime);
      o.frequency.linearRampToValueAtTime(1200,ctx.currentTime+0.4);
      o.frequency.linearRampToValueAtTime(400,ctx.currentTime+0.8);
      g.gain.setValueAtTime(1.0,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.9);
      o.start(ctx.currentTime);o.stop(ctx.currentTime+0.9);
    }
  },
  campainha: {
    label:"Campainha", emoji:"🔔", descricao:"Campainha longa e clara",
    tocarCtx:(ctx)=>{
      [660,880,660].forEach((f,i)=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.frequency.value=f;o.type="sine";
        g.gain.setValueAtTime(1.0,ctx.currentTime+i*0.25);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.25+0.22);
        o.start(ctx.currentTime+i*0.25);o.stop(ctx.currentTime+i*0.25+0.22);
      });
    }
  },
  alerta_forte: {
    label:"Alerta Forte", emoji:"⚡", descricao:"Tom alto e contínuo — mais chamativo",
    tocarCtx:(ctx)=>{
      [0,0.15,0.30,0.45].forEach(d=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.frequency.value=1400;o.type="square";
        g.gain.setValueAtTime(1.0,ctx.currentTime+d);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+d+0.12);
        o.start(ctx.currentTime+d);o.stop(ctx.currentTime+d+0.12);
      });
    }
  },
  two_tone: {
    label:"Dois Tons", emoji:"🎵", descricao:"Alternância entre dois tons — estilo ambulância",
    tocarCtx:(ctx)=>{
      [700,900,700,900].forEach((f,i)=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.frequency.value=f;o.type="square";
        g.gain.setValueAtTime(0.9,ctx.currentTime+i*0.2);
        g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.2+0.18);
        o.start(ctx.currentTime+i*0.2);o.stop(ctx.currentTime+i*0.2+0.18);
      });
    }
  },
};

const TEMPO_PEDIDO = 30;       // segundos por rodada
const INTERVALO_SOM = 5;       // toca a cada 5 segundos dentro da rodada
const MAX_TENTATIVAS = 10;     // 10 rodadas × 30s = 5 minutos
const SUPORTE_TEL = "5512999999999"; // troque pelo seu WhatsApp
const SUPORTE_HORARIO = "Seg a Sáb, 8h às 22h";

// ─── SOM DE NOTIFICAÇÃO ───────────────────────────────────────────────────────
let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume();
  }
  return _audioCtx;
}

function tocarSomEscolhido(tipoSom) {
  try {
    const ctx = getAudioCtx();
    SONS[tipoSom]?.tocarCtx(ctx);
  } catch(e) { console.log("Som bloqueado:", e); }
}

// ─── PEDIDO DISPONÍVEL (modal que aparece com som) ────────────────────────────
function ModalPedidoDisponivel({ pedido, tipoSom, onAceitar, onRecusar }) {
  const [tick, setTick] = useState(0);
  const [pulsando, setPulsando] = useState(true);

  useEffect(()=>{
    const t = setInterval(()=>setTick(x=>x+1), 1000);
    return ()=>clearInterval(t);
  },[]);

  // Toca imediatamente e depois a cada 5 segundos — 6 toques nos 30s
  useEffect(()=>{
    let count = 0;
    const maxToques = Math.floor(TEMPO_PEDIDO / INTERVALO_SOM); // 6 toques

    function tocar() {
      if (count >= maxToques) return;
      tocarSomEscolhido(tipoSom);
      count++;
    }

    tocar(); // toca na hora (toque 1)

    const t2 = setTimeout(()=>tocar(), 5000);   // toque 2
    const t3 = setTimeout(()=>tocar(), 10000);  // toque 3
    const t4 = setTimeout(()=>tocar(), 15000);  // toque 4
    const t5 = setTimeout(()=>tocar(), 20000);  // toque 5
    const t6 = setTimeout(()=>tocar(), 25000);  // toque 6

    return ()=>{ clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  },[]);

  // Pisca borda
  useEffect(()=>{
    const t = setInterval(()=>setPulsando(x=>!x), 500);
    return ()=>clearInterval(t);
  },[]);

  const decorrido = Math.floor((Date.now()-pedido.criadoEm)/1000);
  const restantes = Math.max(0, TEMPO_PEDIDO - decorrido);
  const pct = (restantes/TEMPO_PEDIDO)*100;
  const corTimer = pct>50?"#34d399":pct>25?"#fbbf24":"#ef4444";

  function abrirMaps() {
    const end = encodeURIComponent(`${pedido.rua}, ${pedido.num}, ${pedido.bairro}, Ilhabela, SP`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${end}&travelmode=driving`,"_blank");
  }

  return (
    <Overlay maxW={460} borderColor={pulsando?"#34d399":"#1a5c3a"}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:52,marginBottom:8}}>🏍️</div>
        <div style={{color:"#34d399",fontWeight:900,fontSize:24}}>Novo Pedido!</div>
        <div style={{color:"#6b7280",fontSize:13,marginTop:4}}>Aceite rápido — primeiro a aceitar fica com a entrega</div>
      </div>

      {/* Timer 30s */}
      <div style={{marginBottom:16}}>
        <div style={{background:"#1f2937",borderRadius:6,height:10,overflow:"hidden",marginBottom:6}}>
          <div style={{background:corTimer,height:10,width:`${pct}%`,transition:"width 1s linear",borderRadius:6}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:corTimer,fontWeight:700,fontSize:14}}>⏱ {restantes}s para expirar</span>
          <span style={{color:"#4b5563",fontSize:11}}>🔔 som a cada 5s</span>
        </div>
      </div>

      {/* Valor em destaque */}
      <div style={{background:"#0f172a",borderRadius:12,padding:"16px",marginBottom:14}}>
        <div style={{textAlign:"center",marginBottom:14,paddingBottom:14,borderBottom:"1px solid #1f2937"}}>
          <div style={{color:"#6b7280",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Você vai receber</div>
          <div style={{color:"#34d399",fontWeight:900,fontSize:48,lineHeight:1}}>R${pedido.taxa}</div>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>📍 Endereço de entrega</div>
          <div style={{color:"#f9fafb",fontWeight:700,fontSize:16}}>{pedido.rua}, {pedido.num}</div>
          <div style={{color:"#34d399",fontSize:14,marginTop:2}}>{pedido.bairro} — Ilhabela/SP</div>
          {pedido.ref && <div style={{color:"#fbbf24",fontSize:13,marginTop:4}}>📌 {pedido.ref}</div>}
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{background:"#111827",borderRadius:8,padding:"8px 12px",flex:1}}>
            <div style={{color:"#6b7280",fontSize:10,marginBottom:2}}>Estabelecimento</div>
            <div style={{color:"#f9fafb",fontWeight:600,fontSize:13}}>{pedido.empresaNome}</div>
          </div>
          <div style={{background:"#111827",borderRadius:8,padding:"8px 12px",flex:1}}>
            <div style={{color:"#6b7280",fontSize:10,marginBottom:2}}>Pagamento</div>
            <div style={{color:PG[pedido.pagamento]?.cor,fontWeight:700,fontSize:13}}>{PG[pedido.pagamento]?.icon} {PG[pedido.pagamento]?.label}</div>
          </div>
        </div>
        {pedido.pagamento==="dinheiro" && <div style={{background:"#3d2a00",border:"1px solid #fbbf24",borderRadius:8,padding:"8px 12px",marginTop:10}}><div style={{color:"#fbbf24",fontSize:12,fontWeight:700}}>💵 Cobrar na entrega e retornar com o dinheiro</div></div>}
        {pedido.pagamento==="cartao" && <div style={{background:"#1a2f4a",border:"1px solid #60a5fa",borderRadius:8,padding:"8px 12px",marginTop:10}}><div style={{color:"#60a5fa",fontSize:12,fontWeight:700}}>💳 Pegar a maquininha no estabelecimento</div></div>}
        {pedido.pagamento==="pix" && <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:8,padding:"8px 12px",marginTop:10}}><div style={{color:"#34d399",fontSize:12,fontWeight:700}}>💠 Pix já pago — só entregar</div></div>}
      </div>

      <button onClick={abrirMaps} style={{width:"100%",padding:"10px",borderRadius:8,background:"#1a3a5c",border:"1px solid #3b82f6",color:"#60a5fa",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:12}}>
        🗺️ Ver rota no Google Maps
      </button>

      <div style={{display:"flex",gap:10}}>
        <button onClick={onRecusar} style={{flex:1,padding:"14px",borderRadius:10,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:15,cursor:"pointer"}}>
          ❌ Recusar
        </button>
        <button onClick={onAceitar} style={{flex:2,padding:"14px",borderRadius:10,background:"#10b981",border:"none",color:"#fff",fontWeight:900,fontSize:20,cursor:"pointer"}}>
          ✅ ACEITAR
        </button>
      </div>
    </Overlay>
  );
}

// ─── CORRIDA EM ANDAMENTO ─────────────────────────────────────────────────────
function CorridaAtiva({ corrida, onEntregar, onCancelar }) {
  const [pedidosEntregues, setPedidosEntregues] = useState([]);
  const [saiuEstab, setSaiuEstab] = useState({});
  const [modalCancelar, setModalCancelar] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [motivoCustom, setMotivoCustom] = useState("");

  function sairEstabelecimento(pedidoId) {
    setSaiuEstab(prev=>({...prev,[pedidoId]:true}));
  }

  function marcarEntregue(pedidoId) {
    const novos = [...pedidosEntregues, pedidoId];
    setPedidosEntregues(novos);
    const todos = corrida.pedidos.map(p=>p.id);
    if (todos.every(id=>novos.includes(id))) {
      setTimeout(()=>onEntregar(), 800);
    }
  }

  function abrirGPSEstab(p) {
    const end = encodeURIComponent(`${p.empresaEndereco||p.empresaNome}, Ilhabela, SP`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${end}&travelmode=driving`,"_blank");
  }
  function abrirGPSCliente(p) {
    const end = encodeURIComponent(`${p.rua}, ${p.num}, ${p.bairro}, Ilhabela, SP`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${end}&travelmode=driving`,"_blank");
  }

  return (
    <div>
      <div style={{marginBottom:14}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>🏍️ Corrida em Andamento</div>
        <div style={{color:"#6b7280",fontSize:13}}>{corrida.pedidos.length} pedido{corrida.pedidos.length!==1?"s":""} · {pedidosEntregues.length}/{corrida.pedidos.length} entregues</div>
      </div>

      {/* Barra de progresso */}
      <div style={{background:"#1f2937",borderRadius:6,height:8,marginBottom:16}}>
        <div style={{background:"#34d399",borderRadius:6,height:8,width:`${(pedidosEntregues.length/corrida.pedidos.length)*100}%`,transition:"width 0.5s"}}/>
      </div>

      {corrida.pedidos.map((p,i)=>{
        const entregue = pedidosEntregues.includes(p.id);
        const saiu = saiuEstab[p.id];
        const pg = PG[p.pagamento]||{icon:"•",cor:"#9ca3af",label:p.pagamento};
        return (
          <Card key={p.id} style={{marginBottom:12,border:`1px solid ${entregue?"#34d399":saiu?"#fbbf24":"#3b82f6"}`,background:entregue?"#0a1f14":"#111827"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  {entregue ? <Tag label="✅ Entregue" cor="#34d399"/>
                    : saiu ? <Tag label="🏍️ A caminho do cliente" cor="#fbbf24"/>
                    : <Tag label={`📦 Pedido #${i+1} — Buscar no estabelecimento`} cor="#60a5fa"/>}
                </div>
                <div style={{color:"#f9fafb",fontWeight:700,fontSize:16}}>{p.clienteNome}</div>
                {p.clienteTel && saiu && (
                  <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                    <span style={{color:"#9ca3af",fontSize:12}}>📞 {p.clienteTel}</span>
                    <a href={`https://wa.me/55${p.clienteTel.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                      style={{background:"#0d3d2e",color:"#34d399",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,textDecoration:"none"}}>💬 WhatsApp</a>
                    <a href={`tel:${p.clienteTel.replace(/\D/g,"")}`}
                      style={{background:"#1a2f4a",color:"#60a5fa",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,textDecoration:"none"}}>📱 Ligar</a>
                  </div>
                )}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:pg.cor,fontSize:13,fontWeight:700}}>{pg.icon} {pg.label}</div>
                <div style={{color:"#34d399",fontWeight:900,fontSize:22}}>R${p.taxa}</div>
              </div>
            </div>

            {/* FASE 1 — Buscar no estabelecimento (antes de clicar "saí") */}
            {!entregue && !saiu && (
              <div>
                <div style={{background:"#1a2f4a",border:"1px solid #3b82f6",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{color:"#60a5fa",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>🏪 Ir buscar no estabelecimento</div>
                  <div style={{color:"#f9fafb",fontWeight:700,fontSize:15}}>{p.empresaNome}</div>
                  <div style={{color:"#9ca3af",fontSize:13,marginTop:2}}>{p.empresaEndereco||"Perequê, Ilhabela/SP"}</div>
                  <button onClick={()=>abrirGPSEstab(p)} style={{marginTop:8,width:"100%",padding:"9px",borderRadius:8,background:"#1e3a5f",border:"1px solid #3b82f6",color:"#60a5fa",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                    🗺️ Abrir rota para o estabelecimento
                  </button>
                </div>

                {p.pagamento==="dinheiro" && <div style={{background:"#3d2a00",borderRadius:8,padding:"8px 12px",marginBottom:10}}><div style={{color:"#fbbf24",fontSize:12,fontWeight:700}}>💵 Cobrar na entrega e retornar com o dinheiro</div></div>}
                {p.pagamento==="cartao" && <div style={{background:"#1a2f4a",borderRadius:8,padding:"8px 12px",marginBottom:10}}><div style={{color:"#60a5fa",fontSize:12,fontWeight:700}}>💳 Pegar a maquininha no estabelecimento</div></div>}

                {/* BOTÃO OBRIGATÓRIO */}
                <button onClick={()=>sairEstabelecimento(p.id, p)} style={{width:"100%",padding:"14px",borderRadius:10,background:"#f59e0b",border:"none",color:"#000",fontWeight:900,fontSize:16,cursor:"pointer"}}>
                  🏍️ Saí do estabelecimento — iniciar entrega
                </button>
                <div style={{color:"#4b5563",fontSize:11,textAlign:"center",marginTop:6}}>
                  ⚠️ Clique obrigatório ao sair — avisa o cliente automaticamente
                </div>
              </div>
            )}

            {/* FASE 2 — A caminho do cliente (depois de clicar "saí") */}
            {!entregue && saiu && (
              <div>
                <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{color:"#34d399",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>🏠 Entregar ao cliente</div>
                  <div style={{color:"#f9fafb",fontWeight:700,fontSize:15}}>{p.rua}, {p.num}</div>
                  <div style={{color:"#34d399",fontSize:13,marginTop:2}}>{p.bairro} — Ilhabela/SP</div>
                  {p.ref && <div style={{color:"#fbbf24",fontSize:12,marginTop:3}}>📌 Ref: {p.ref}</div>}
                  {p.obs && <div style={{color:"#9ca3af",fontSize:12,marginTop:3}}>💬 {p.obs}</div>}
                  <button onClick={()=>abrirGPSCliente(p)} style={{marginTop:8,width:"100%",padding:"9px",borderRadius:8,background:"#0a2a1e",border:"1px solid #34d399",color:"#34d399",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                    🗺️ Abrir rota para o cliente
                  </button>
                </div>

                <div style={{background:"#0f172a",borderRadius:8,padding:"8px 12px",marginBottom:10}}>
                  <div style={{color:"#34d399",fontSize:12,fontWeight:700}}>✅ Cliente foi avisado automaticamente que o pedido está a caminho!</div>
                </div>

                <button onClick={()=>marcarEntregue(p.id)} style={{width:"100%",padding:"14px",borderRadius:10,background:"#10b981",border:"none",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer"}}>
                  ✅ Confirmar entrega
                </button>
              </div>
            )}

            {entregue && (
              <div style={{textAlign:"center",padding:"10px",background:"#0d3d2e",borderRadius:8}}>
                <span style={{color:"#34d399",fontWeight:700,fontSize:13}}>✅ Entregue com sucesso!</span>
              </div>
            )}
          </Card>
        );
      })}

      {/* Botão problema na entrega */}
      <div style={{marginTop:10}}>
        <button onClick={()=>setModalCancelar(true)} style={{width:"100%",padding:"12px",borderRadius:10,background:"#1f2937",border:"1px solid #ef444466",color:"#f87171",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          ⚠️ Problema na entrega
        </button>
      </div>

      {/* Modal cancelamento com motivo obrigatório */}
      {modalCancelar && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#111827",border:"2px solid #ef4444",borderRadius:16,width:"100%",maxWidth:420,padding:24}}>
            <div style={{color:"#f87171",fontWeight:900,fontSize:18,marginBottom:6}}>⚠️ Problema na entrega</div>
            <div style={{color:"#9ca3af",fontSize:13,marginBottom:16}}>Selecione o motivo. O empresário e a plataforma serão notificados imediatamente.</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {[
                {id:"pneu",    icon:"🔴", label:"Pneu furado"},
                {id:"gasolina",icon:"⛽", label:"Acabou a gasolina"},
                {id:"acidente",icon:"🤕", label:"Acidente / queda"},
                {id:"saude",   icon:"🏥", label:"Problema de saúde"},
                {id:"outro",   icon:"📝", label:"Outro motivo"},
              ].map(m=>(
                <button key={m.id} onClick={()=>setMotivoCancelamento(m.id)} style={{
                  padding:"12px 16px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,textAlign:"left",
                  background:motivoCancelamento===m.id?"#3d1010":"#0f172a",
                  border:motivoCancelamento===m.id?"2px solid #ef4444":"2px solid #1f2937",
                  color:motivoCancelamento===m.id?"#f87171":"#d1d5db",
                }}>{m.icon} {m.label}</button>
              ))}
            </div>
            {motivoCancelamento==="outro" && (
              <div style={{marginBottom:14}}>
                <textarea value={motivoCustom} onChange={e=>setMotivoCustom(e.target.value)}
                  placeholder="Descreva o problema..." rows={3}
                  style={{background:"#0f172a",border:"1px solid #ef4444",borderRadius:8,color:"#f9fafb",padding:"10px 12px",width:"100%",fontSize:13,outline:"none",resize:"none",boxSizing:"border-box"}}/>
              </div>
            )}
            <div style={{background:"#3d1010",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
              <div style={{color:"#f87171",fontSize:12,fontWeight:700}}>⚠️ Ao confirmar você ficará offline automaticamente e o empresário será notificado.</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{
                const motivo = motivoCancelamento==="outro" ? motivoCustom : {pneu:"Pneu furado",gasolina:"Acabou a gasolina",acidente:"Acidente / queda",saude:"Problema de saúde"}[motivoCancelamento];
                if (!motivo) return;
                onCancelar(motivo);
                setModalCancelar(false);
              }}
                disabled={!motivoCancelamento||(motivoCancelamento==="outro"&&!motivoCustom.trim())}
                style={{flex:2,padding:"13px",borderRadius:10,background:"#ef4444",border:"none",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",
                  opacity:(!motivoCancelamento||(motivoCancelamento==="outro"&&!motivoCustom.trim()))?0.4:1}}>
                Confirmar cancelamento
              </button>
              <button onClick={()=>{setModalCancelar(false);setMotivoCancelamento("");setMotivoCustom("");}}
                style={{flex:1,padding:"13px",borderRadius:10,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GANHOS ───────────────────────────────────────────────────────────────────
function Ganhos({ historico }) {
  const [verTudo, setVerTudo] = useState(false);

  const entregues = historico.filter(e=>e.status==="Entregue");

  // Semana atual (não pago ainda)
  const semanaAtual = entregues.filter(e=>e.mes===6&&e.semana===3&&!e.repasePago);
  const saldoSemana = semanaAtual.reduce((s,e)=>s+e.taxa,0).toFixed(2);

  // Total histórico (tudo que já recebeu)
  const totalHistorico = entregues.reduce((s,e)=>s+e.taxa,0).toFixed(2);
  const totalEntregas  = entregues.length;

  // Este mês
  const mesMes = entregues.filter(e=>e.mes===6);
  const ganhosMes = mesMes.reduce((s,e)=>s+e.taxa,0).toFixed(2);

  // Ranking do mês (posição simulada)
  const ranking = 1;

  const lista = verTudo ? entregues.slice().reverse() : semanaAtual.slice().reverse();

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>💰 Meus Ganhos</div>
        <div style={{color:"#6b7280",fontSize:13}}>Repasse toda terça-feira</div>
      </div>

      {/* Cards de ganhos */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"16px 18px",flex:1,minWidth:130}}>
          <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>A receber esta semana</div>
          <div style={{color:"#fbbf24",fontSize:28,fontWeight:900,lineHeight:1}}>R${saldoSemana}</div>
          <div style={{color:"#6b7280",fontSize:11,marginTop:4}}>{semanaAtual.length} entrega{semanaAtual.length!==1?"s":""} esta semana</div>
          <div style={{background:"#1f2937",borderRadius:4,height:4,marginTop:8}}>
            <div style={{background:"#fbbf24",borderRadius:4,height:4,width:"60%"}}/>
          </div>
          <div style={{color:"#4b5563",fontSize:10,marginTop:4}}>Pago toda terça-feira via PIX</div>
        </div>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"16px 18px",flex:1,minWidth:130}}>
          <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Ganhos este mês</div>
          <div style={{color:"#60a5fa",fontSize:24,fontWeight:800,lineHeight:1}}>R${ganhosMes}</div>
          <div style={{color:"#6b7280",fontSize:11,marginTop:4}}>{mesMes.length} entregas em junho</div>
        </div>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"16px 18px",flex:1,minWidth:130}}>
          <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Total histórico</div>
          <div style={{color:"#a78bfa",fontSize:24,fontWeight:800,lineHeight:1}}>R${totalHistorico}</div>
          <div style={{color:"#6b7280",fontSize:11,marginTop:4}}>{totalEntregas} entregas no total</div>
        </div>
      </div>

      {/* Ranking */}
      <div style={{background:"#1a1000",border:"1px solid #f59e0b",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:32}}>🏆</div>
        <div>
          <div style={{color:"#f59e0b",fontWeight:800,fontSize:14}}>#{ranking}º lugar no ranking de junho!</div>
          <div style={{color:"#9ca3af",fontSize:12,marginTop:2}}>Continue assim para ganhar o bônus do mês 🚀</div>
        </div>
      </div>

      {/* Extrato */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{color:"#9ca3af",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>
          {verTudo?"Histórico completo":"Extrato desta semana"}
        </div>
        <button onClick={()=>setVerTudo(x=>!x)} style={{background:"#1f2937",border:"1px solid #374151",borderRadius:6,color:"#9ca3af",padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>
          {verTudo?"Ver semana":"Ver tudo"}
        </button>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#0f172a",borderBottom:"1px solid #1f2937"}}>
              {["Data","Hora","Cliente","Estabelecimento","Bairro","Pgto","Valor","Status"].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(e=>{
              const pg = PG[e.pagamento]||{icon:"•",cor:"#9ca3af"};
              const entregue = e.status==="Entregue";
              return (
                <tr key={e.id} style={{borderBottom:"1px solid #1a2035"}}
                  onMouseOver={ev=>ev.currentTarget.style.background="#0f172a"}
                  onMouseOut={ev=>ev.currentTarget.style.background="transparent"}>
                  <td style={{padding:"8px 12px",color:"#9ca3af",fontSize:12,whiteSpace:"nowrap"}}>{e.data}</td>
                  <td style={{padding:"8px 12px",color:"#9ca3af",fontSize:12}}>{e.hora}</td>
                  <td style={{padding:"8px 12px",color:"#f9fafb",fontWeight:600}}>{e.clienteNome}</td>
                  <td style={{padding:"8px 12px",color:"#d1d5db",fontSize:12}}>{e.empresaNome}</td>
                  <td style={{padding:"8px 12px",color:"#34d399",fontSize:12}}>{e.bairro}</td>
                  <td style={{padding:"8px 12px"}}><span style={{color:pg.cor,fontWeight:700}}>{pg.icon}</span></td>
                  <td style={{padding:"8px 12px",color:"#fbbf24",fontWeight:700,fontSize:14}}>R${e.taxa}</td>
                  <td style={{padding:"8px 12px"}}>
                    <span style={{background:entregue?"#0d3d2e":"#3d1010",color:entregue?"#34d399":"#f87171",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>
                      {entregue?"✅":"❌"} {e.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length===0 && <div style={{textAlign:"center",padding:24,color:"#4b5563"}}>Nenhuma entrega ainda nesta semana.</div>}
      </Card>

      {!verTudo && semanaAtual.length>0 && (
        <div style={{marginTop:10,textAlign:"center"}}>
          <div style={{background:"#0f172a",borderRadius:8,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"#9ca3af",fontWeight:700}}>TOTAL A RECEBER TERÇA</span>
            <span style={{color:"#fbbf24",fontWeight:900,fontSize:22}}>R${saldoSemana}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP MOTOBOY ──────────────────────────────────────────────────────────────
export default function AppMotoboy() {
  const [somAtivado, setSomAtivado] = useState(false);
  const audioCtxRef = useRef(null);
  const [online, setOnline] = useState(true);
  const [aba, setAba] = useState("home");
  const [historico, setHistorico] = useState(HIST_INIT);
  const [pedidoDisponivel, setPedidoDisponivel] = useState(null);
  const [corridaAtiva, setCorridaAtiva] = useState(null);
  const [tipoSom, setTipoSom] = useState("alerta_forte");
  const tentativas = useRef(0);
  const pedidoRef = useRef(null);

  // Simula chegada de pedido após 4 segundos
  useEffect(()=>{
    if (!online || corridaAtiva || pedidoDisponivel) return;
    tentativas.current = 0;
    const t = setTimeout(()=>{
      const novoPedido = {
        id: Date.now(),
        empresaNome: "Açaí da Hora",
        clienteNome: "Maria Santos",
        clienteTel: "(12) 99802-2222",
        rua: "Rua do Sol", num: "120",
        bairro: "Vila", ref: "Prédio azul, apto 3B",
        pagamento: "pix", taxa: 8, obs: "",
        criadoEm: Date.now(),
      };
      pedidoRef.current = novoPedido;
      setPedidoDisponivel({...novoPedido});
      tocarSomEscolhido(tipoSom);
    }, 4000);
    return ()=>clearTimeout(t);
  },[online, corridaAtiva]);

  // Repete som a cada 30s se ninguém aceitou, por até 5 minutos (10 tentativas)
  useEffect(()=>{
    if (!pedidoDisponivel) return;
    const t = setTimeout(()=>{
      tentativas.current += 1;
      if (tentativas.current >= MAX_TENTATIVAS) {
        // 5 minutos sem aceite — cancela e avisa empresário
        setPedidoDisponivel(null);
        pedidoRef.current = null;
        // Aviso ao empresário é tratado na interface do empresário
      } else {
        // Nova rodada — recria o pedido com criadoEm atualizado pra resetar o timer visual
        setPedidoDisponivel(p=>p ? {...p, criadoEm:Date.now()} : null);
        tocarSomEscolhido(tipoSom);
      }
    }, TEMPO_PEDIDO * 1000);
    return ()=>clearTimeout(t);
  },[pedidoDisponivel]);

  function aceitar() {
    if (!pedidoDisponivel) return;
    setCorridaAtiva({
      id: Date.now(),
      pedidos: [{...pedidoDisponivel}],
    });
    setPedidoDisponivel(null);
    setAba("corrida");
  }

  function recusar() { setPedidoDisponivel(null); }

  function finalizarCorrida() {
    if (!corridaAtiva) return;
    const novos = corridaAtiva.pedidos.map(p=>({
      id:Date.now()+Math.random(),
      clienteNome:p.clienteNome, empresaNome:p.empresaNome,
      bairro:p.bairro, pagamento:p.pagamento, taxa:p.taxa,
      status:"Entregue", data:"Hoje", hora:"agora",
      semana:3, mes:6, repasePago:false,
    }));
    setHistorico(prev=>[...prev,...novos]);
    setCorridaAtiva(null);
    setAba("ganhos");
  }

  function cancelarCorrida(motivo) {
    setCorridaAtiva(null);
    setOnline(false); // fica offline automaticamente
    setAba("home");
    // No sistema real: notifica admin e empresário com o motivo
  }

  const saldoSemana = historico.filter(e=>e.status==="Entregue"&&e.mes===6&&e.semana===3&&!e.repasePago).reduce((s,e)=>s+e.taxa,0).toFixed(2);

  const ABAS = [
    {id:"home",   label:"🏠 Início"},
    {id:"corrida",label:"🏍️ Corrida", badge:corridaAtiva?1:0},
    {id:"ganhos", label:"💰 Ganhos"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb"}}>
      {/* Header */}
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",alignItems:"center",gap:0}}>
          <div style={{padding:"12px 16px 12px 0",borderRight:"1px solid #1f2937",marginRight:14,flexShrink:0}}>
            <div style={{color:"#34d399",fontWeight:900,fontSize:16,letterSpacing:-0.5}}>⚡ MotoFast</div>
            <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{MOTOBOY.nomeCompleto.split(" ")[0]}</div>
          </div>
          <nav style={{display:"flex",flex:1}}>
            {ABAS.map(a=>(
              <button key={a.id} onClick={()=>setAba(a.id)} style={{background:aba===a.id?"#0d3d2e":"transparent",color:aba===a.id?"#34d399":"#6b7280",border:"none",borderBottom:aba===a.id?"2px solid #34d399":"2px solid transparent",padding:"13px 12px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",position:"relative"}}>
                {a.label}
                {a.badge>0 && <span style={{background:"#ef4444",color:"#fff",borderRadius:"50%",fontSize:10,fontWeight:800,padding:"1px 5px",marginLeft:4}}>{a.badge}</span>}
              </button>
            ))}
          </nav>
          {/* Toggle online/offline */}
          <button onClick={()=>setOnline(x=>!x)} style={{flexShrink:0,margin:"0 0 0 8px",padding:"6px 14px",borderRadius:20,cursor:"pointer",fontWeight:700,fontSize:12,border:"none",background:online?"#0d3d2e":"#1f2937",color:online?"#34d399":"#6b7280",transition:"all 0.2s"}}>
            {online?"🟢 Online":"⚫ Offline"}
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{maxWidth:600,margin:"0 auto",padding:"20px 16px"}}>

        {/* HOME */}
        {aba==="home" && (
          <div>
            {/* Status card */}
            <Card style={{marginBottom:14,background:online?"#0d2a1e":"#1a1a1a",border:online?"1px solid #34d399":"1px solid #374151"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:online?"#34d399":"#6b7280",fontWeight:800,fontSize:18}}>
                    {online?"🟢 Você está Online":"⚫ Você está Offline"}
                  </div>
                  <div style={{color:"#6b7280",fontSize:13,marginTop:4}}>
                    {online?"Aguardando pedidos... fique de olho no som!":"Ative o modo online para receber pedidos"}
                  </div>
                </div>
                <button onClick={()=>setOnline(x=>!x)} style={{padding:"10px 18px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,border:"none",background:online?"#ef4444":"#10b981",color:"#fff"}}>
                  {online?"Sair":"Entrar"}
                </button>
              </div>
              {online && (
                <div style={{marginTop:12,background:"#111827",borderRadius:8,padding:"10px 14px"}}>
                  <div style={{color:"#9ca3af",fontSize:12}}>🔔 O som vai tocar quando chegar um pedido. Você terá <strong style={{color:"#fbbf24"}}>30 segundos</strong> para aceitar.</div>
                </div>
              )}
            </Card>

            {/* Saldo rápido */}
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 16px",flex:1,textAlign:"center"}}>
                <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>A receber terça</div>
                <div style={{color:"#fbbf24",fontWeight:900,fontSize:24}}>R${saldoSemana}</div>
              </div>
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 16px",flex:1,textAlign:"center"}}>
                <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Entregas hoje</div>
                <div style={{color:"#60a5fa",fontWeight:900,fontSize:24}}>
                  {historico.filter(e=>e.data==="2026-06-09"&&e.status==="Entregue").length}
                </div>
              </div>
              <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 16px",flex:1,textAlign:"center"}}>
                <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Ranking</div>
                <div style={{color:"#f59e0b",fontWeight:900,fontSize:24}}>🥇 1º</div>
              </div>
            </div>

            {/* Corrida ativa resumo */}
            {corridaAtiva && (
              <Card style={{marginBottom:14,border:"1px solid #34d399",background:"#0a1f14"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"#34d399",fontWeight:800,fontSize:15}}>🏍️ Corrida em andamento</div>
                    <div style={{color:"#6b7280",fontSize:13}}>{corridaAtiva.pedidos.length} pedido{corridaAtiva.pedidos.length!==1?"s":""}</div>
                  </div>
                  <Btn small cor="verde" onClick={()=>setAba("corrida")}>Ver corrida →</Btn>
                </div>
              </Card>
            )}

            {/* Ativar som — obrigatório por segurança do navegador */}
            {!somAtivado && (
              <Card style={{marginBottom:14,background:"#1a1000",border:"1px solid #f59e0b"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔔</div>
                  <div style={{color:"#fbbf24",fontWeight:800,fontSize:15,marginBottom:6}}>Ativar notificações sonoras</div>
                  <div style={{color:"#9ca3af",fontSize:13,marginBottom:12}}>Toque no botão abaixo para ativar o som dos pedidos. Obrigatório para receber alertas!</div>
                  <button onClick={()=>{
                    getAudioCtx(); // inicializa o AudioContext com interação do usuário
                    tocarSomEscolhido(tipoSom); // toca um som de teste
                    setSomAtivado(true);
                  }} style={{background:"#f59e0b",border:"none",borderRadius:10,color:"#000",fontWeight:900,fontSize:16,padding:"12px 24px",cursor:"pointer",width:"100%"}}>
                    🔔 Ativar Som dos Pedidos
                  </button>
                </div>
              </Card>
            )}

            {somAtivado && (
              <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>✅</span>
                <span style={{color:"#34d399",fontWeight:700,fontSize:13}}>Som ativado — você vai ouvir o alerta quando chegar um pedido!</span>
              </div>
            )}

            {/* Seletor de som */}
            <Card style={{background:"#0f172a",border:"1px solid #1f2937",marginBottom:14}}>
              <div style={{color:"#9ca3af",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>🔔 Som de Notificação</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {Object.entries(SONS).map(([key,som])=>(
                  <button key={key} onClick={()=>{setTipoSom(key);tocarSomEscolhido(key);}}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,
                      background:tipoSom===key?"#1e293b":"#111827",
                      border:tipoSom===key?"1px solid #34d399":"1px solid #1f2937",
                      color:tipoSom===key?"#34d399":"#9ca3af",textAlign:"left"}}>
                    <span>{som.emoji} {som.label}</span>
                    <span style={{fontSize:11,color:tipoSom===key?"#34d399":"#4b5563"}}>
                      {tipoSom===key?"✅ Selecionado — clique para ouvir":"Clique para ouvir"}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{color:"#4b5563",fontSize:11,marginTop:10}}>
                💡 O som escolhido tocará a cada 5 segundos quando chegar um pedido
              </div>
            </Card>

            {/* Dicas */}
            {online && !corridaAtiva && (
              <Card style={{background:"#0f172a",border:"1px solid #1f2937"}}>
                <div style={{color:"#9ca3af",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>📌 Lembretes</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {icon:"🔔",text:"Deixe o som do celular no máximo"},
                    {icon:"🗺️",text:"Ao aceitar, o Google Maps abre automático"},
                    {icon:"💵",text:"Dinheiro recebido? Retorne ao estabelecimento"},
                    {icon:"✅",text:"Clique em 'Entregue' após cada entrega"},
                    {icon:"🕐",text:`Suporte: ${SUPORTE_HORARIO}`},
                  ].map((d,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>{d.icon}</span>
                      <span style={{color:"#d1d5db",fontSize:13}}>{d.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* CORRIDA */}
        {aba==="corrida" && (
          corridaAtiva
            ? <CorridaAtiva corrida={corridaAtiva} onEntregar={finalizarCorrida} onCancelar={cancelarCorrida}/>
            : <Card style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:12}}>🏍️</div>
                <div style={{color:"#6b7280",fontSize:15}}>Nenhuma corrida ativa</div>
                <div style={{color:"#4b5563",fontSize:13,marginTop:6}}>Fique online para receber pedidos</div>
                <div style={{marginTop:16}}><Btn onClick={()=>setAba("home")}>Ir para Início</Btn></div>
              </Card>
        )}

        {/* GANHOS */}
        {aba==="ganhos" && <Ganhos historico={historico}/>}
      </div>

      {/* Botão suporte fixo */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:200}}>
        <a href={`https://wa.me/${SUPORTE_TEL}?text=Olá, preciso de suporte MotoFast`}
          target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:"#10b981",borderRadius:50,padding:"10px 16px",textDecoration:"none",boxShadow:"0 4px 20px rgba(16,185,129,0.4)"}}>
          <span style={{fontSize:20}}>💬</span>
          <span style={{color:"#fff",fontWeight:700,fontSize:13}}>Suporte</span>
        </a>
      </div>
      {pedidoDisponivel && online && !corridaAtiva && (
        <ModalPedidoDisponivel
          pedido={pedidoDisponivel}
          tipoSom={tipoSom}
          onAceitar={aceitar}
          onRecusar={recusar}
        />
      )}
    </div>
  );
}
