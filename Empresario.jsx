import { useState, useEffect } from "react";

// ─── DADOS DO ESTABELECIMENTO (viriam do login) ───────────────────────────────
const EMPRESA = {
  id: 2,
  nome: "Açaí da Hora",
  bairro: "Perequê",
  tel: "(12) 3894-3344",
  planoPagamento: "diario",
  planoGratis: true,
  dataFimGratis: "2026-07-10",
  taxas: {
    "Perequê":     {e:7,  m:5  },
    "Vila":        {e:11, m:8  },
    "Barra Velha": {e:12, m:9  },
    "Itaquanduba": {e:9,  m:7  },
    "Água Branca": {e:8,  m:6  },
    "Zabumba":     {e:9,  m:6  },
    "Sul":         {e:16, m:12 },
    "Centro":      {e:10, m:7  },
    "Armação":     {e:14, m:10 },
    "Curral":      {e:10, m:7  },
  }
};

const BAIRROS = Object.keys(EMPRESA.taxas);

const PG = {
  pix:      { label:"Pix",      icon:"💠", cor:"#34d399" },
  dinheiro: { label:"Dinheiro", icon:"💵", cor:"#fbbf24" },
  cartao:   { label:"Cartão",   icon:"💳", cor:"#60a5fa" },
};

// Clientes salvos deste estabelecimento
const CLIENTES_INIT = [
  {id:1, nome:"João da Silva",   tel:"(12) 99801-1111", endereco:{rua:"Rua das Flores",num:"45",bairro:"Perequê",ref:"Casa verde, portão de ferro"}},
  {id:2, nome:"Maria Santos",    tel:"(12) 99802-2222", endereco:{rua:"Rua do Sol",num:"120",bairro:"Vila",ref:"Prédio azul, apto 3B"}},
  {id:3, nome:"Pedro Almeida",   tel:"(12) 99803-3333", endereco:{rua:"Av. Beira Mar",num:"300",bairro:"Barra Velha",ref:"Em frente ao quiosque"}},
  {id:4, nome:"Ana Costa",       tel:"(12) 99804-4444", endereco:{rua:"Rua Central",num:"88",bairro:"Centro",ref:"Casa amarela"}},
  {id:5, nome:"Lucas Ferreira",  tel:"(12) 99805-5555", endereco:{rua:"Estrada da Ilha",num:"210",bairro:"Sul",ref:"Sítio depois da curva"}},
  {id:6, nome:"Fernanda Rocha",  tel:"(12) 99806-6666", endereco:{rua:"Rua Nova",num:"33",bairro:"Perequê",ref:"Em frente à padaria"}},
];

// Histórico de entregas deste estabelecimento
const HIST_INIT = [
  {id:1,clienteNome:"João da Silva",bairro:"Perequê",pagamento:"pix",taxa:7,status:"Entregue",motoboyNome:"Carlos Silva",data:"2026-06-09",hora:"19:32"},
  {id:2,clienteNome:"Maria Santos",bairro:"Vila",pagamento:"dinheiro",taxa:11,status:"Entregue",motoboyNome:"Marcos Souza",data:"2026-06-09",hora:"20:15"},
  {id:3,clienteNome:"Ana Costa",bairro:"Centro",pagamento:"pix",taxa:10,status:"Entregue",motoboyNome:"Carlos Silva",data:"2026-06-08",hora:"18:45"},
  {id:4,clienteNome:"Pedro Almeida",bairro:"Barra Velha",pagamento:"cartao",taxa:12,status:"Entregue",motoboyNome:"Diego Santos",data:"2026-06-08",hora:"20:00"},
  {id:5,clienteNome:"Lucas Ferreira",bairro:"Sul",pagamento:"pix",taxa:16,status:"Cancelada",motoboyNome:"—",data:"2026-06-07",hora:"19:10"},
  {id:6,clienteNome:"Fernanda Rocha",bairro:"Perequê",pagamento:"pix",taxa:7,status:"Entregue",motoboyNome:"Rafael Lima",data:"2026-06-07",hora:"21:00"},
];

const SUPORTE_TEL = "5512999999999";
const SUPORTE_HORARIO = "Seg-Sex 9h-22h • Sáb 9h-19h • Dom/feriados: fechado";

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"18px 22px",...style}}>{children}</div>;
}
function Btn({ children, onClick, cor="verde", small, full, disabled }) {
  const cores = {verde:{bg:"#10b981",c:"#fff"},perigo:{bg:"#ef4444",c:"#fff"},cinza:{bg:"#1f2937",c:"#d1d5db"},amarelo:{bg:"#f59e0b",c:"#000"},azul:{bg:"#3b82f6",c:"#fff"}};
  const c = cores[cor]||cores.verde;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:c.bg,color:c.c,border:"none",borderRadius:8,padding:small?"5px 12px":"10px 18px",fontSize:small?12:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,width:full?"100%":"auto"}}>
      {children}
    </button>
  );
}
function Inp({ label, value, onChange, placeholder="", hint }) {
  return (
    <div style={{marginBottom:10}}>
      {label && <div style={{color:"#9ca3af",fontSize:12,marginBottom:4,fontWeight:600}}>{label}</div>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"9px 12px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
      {hint && <div style={{color:"#4b5563",fontSize:11,marginTop:3}}>{hint}</div>}
    </div>
  );
}
function SelInput({ label, value, onChange, children }) {
  return (
    <div style={{marginBottom:10}}>
      {label && <div style={{color:"#9ca3af",fontSize:12,marginBottom:4,fontWeight:600}}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"9px 12px",width:"100%",fontSize:14}}>{children}</select>
    </div>
  );
}
function Tag({ label, cor="#34d399" }) {
  return <span style={{background:cor+"22",color:cor,padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:700,border:`1px solid ${cor}44`}}>{label}</span>;
}
function Overlay({ children, onClose, maxW=500, borderColor="#1f2937" }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
      <div style={{background:"#111827",border:`1px solid ${borderColor}`,borderRadius:16,width:"100%",maxWidth:maxW,maxHeight:"94vh",overflow:"auto",padding:24}}>
        {children}
      </div>
    </div>
  );
}
function OvHeader({ titulo, sub, onClose }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
      <div>
        <div style={{color:"#f9fafb",fontWeight:800,fontSize:18}}>{titulo}</div>
        {sub && <div style={{color:"#6b7280",fontSize:12,marginTop:2}}>{sub}</div>}
      </div>
      <Btn small cor="cinza" onClick={onClose}>✕ Fechar</Btn>
    </div>
  );
}
function Divider() { return <div style={{height:1,background:"#1f2937",margin:"12px 0"}}/>; }
function STitle({ children }) { return <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{children}</div>; }

// ─── SOLICITAR ENTREGA ────────────────────────────────────────────────────────
function SolicitarEntrega({ clientes, setClientes, onPublicar }) {
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [modoEndereco, setModoEndereco] = useState("salvo");
  const [novoEndereco, setNovoEndereco] = useState({rua:"",num:"",bairro:BAIRROS[0],ref:""});
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTel, setClienteTel] = useState("");
  const [pagamento, setPagamento] = useState("pix");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");

  // Busca cliente
  const resultados = buscaCliente.length>=2
    ? clientes.filter(c=>c.nome.toLowerCase().includes(buscaCliente.toLowerCase())||c.tel.includes(buscaCliente))
    : [];

  // Endereço e bairro efetivos
  const endEfetivo = (clienteSel && modoEndereco==="salvo") ? clienteSel.endereco : novoEndereco;
  const bairroFinal = endEfetivo.bairro || BAIRROS[0];
  const taxa = EMPRESA.taxas[bairroFinal];
  const nomeEfetivo = clienteSel ? clienteSel.nome : clienteNome;
  const telEfetivo  = clienteSel ? clienteSel.tel  : clienteTel;

  function detectarBairro(rua) {
    const l = rua.toLowerCase();
    for (const b of BAIRROS) if (l.includes(b.toLowerCase())) return b;
    return null;
  }

  function handleRua(v) {
    const b = detectarBairro(v);
    setNovoEndereco(prev=>({...prev, rua:v, bairro:b||prev.bairro}));
  }

  function publicar() {
    if (!nomeEfetivo || !endEfetivo.rua || !endEfetivo.num) {
      setErro("Preencha o nome do cliente e o endereço completo."); return;
    }
    // Salva cliente novo automaticamente
    if (!clienteSel) {
      const novo = {id:Date.now(), nome:clienteNome||buscaCliente, tel:clienteTel, endereco:novoEndereco};
      setClientes(p=>[...p, novo]);
    } else if (modoEndereco==="novo") {
      setClientes(p=>p.map(c=>c.id===clienteSel.id?{...c,endereco:novoEndereco}:c));
    }
    onPublicar({
      id:Date.now(),
      clienteNome:nomeEfetivo, clienteTel:telEfetivo,
      rua:endEfetivo.rua, num:endEfetivo.num,
      bairro:bairroFinal, ref:endEfetivo.ref,
      pagamento, taxa:taxa?.e||0, obs,
      status:"aguardando", criadoEm:Date.now(),
      motoboyNome:null, motoboyTel:null, corridaId:null,
    });
    // Reset
    setBuscaCliente(""); setClienteSel(null); setModoEndereco("salvo");
    setNovoEndereco({rua:"",num:"",bairro:BAIRROS[0],ref:""});
    setClienteNome(""); setClienteTel(""); setPagamento("pix"); setObs(""); setErro("");
  }

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>📦 Nova Entrega</div>
        <div style={{color:"#6b7280",fontSize:13}}>Busque o cliente ou cadastre um novo</div>
      </div>

      {erro && <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:12,color:"#f87171",fontSize:13}}>{erro}</div>}

      {/* Busca de cliente */}
      <Card style={{marginBottom:14}}>
        <STitle>👤 Cliente</STitle>
        <div style={{position:"relative"}}>
          <input value={buscaCliente}
            onChange={e=>{setBuscaCliente(e.target.value);setClienteSel(null);}}
            placeholder="Buscar por nome ou telefone..."
            style={{background:"#0f172a",border:`1px solid ${clienteSel?"#34d399":"#374151"}`,borderRadius:8,color:"#f9fafb",padding:"9px 12px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>

        {/* Resultados */}
        {resultados.length>0 && !clienteSel && (
          <div style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,marginTop:6,overflow:"hidden",maxHeight:200,overflowY:"auto"}}>
            {resultados.map(c=>(
              <div key={c.id} onClick={()=>{setClienteSel(c);setBuscaCliente(c.nome);setModoEndereco("salvo");}}
                style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #1f2937"}}
                onMouseOver={e=>e.currentTarget.style.background="#1f2937"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <div style={{color:"#f9fafb",fontWeight:600,fontSize:13}}>{c.nome}</div>
                <div style={{color:"#6b7280",fontSize:11}}>📞 {c.tel} · 📍 {c.endereco?.rua}, {c.endereco?.num} — {c.endereco?.bairro}</div>
              </div>
            ))}
          </div>
        )}

        {buscaCliente.length>=2 && resultados.length===0 && !clienteSel && (
          <div style={{background:"#1a2035",borderRadius:8,padding:"9px 14px",marginTop:6}}>
            <div style={{color:"#9ca3af",fontSize:12}}>Cliente não encontrado — preencha abaixo para cadastrar</div>
          </div>
        )}

        {/* Cliente selecionado */}
        {clienteSel && (
          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"12px 16px",marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:"#34d399",fontWeight:700,fontSize:14}}>✅ {clienteSel.nome}</div>
                <div style={{color:"#6b7280",fontSize:12,marginTop:1}}>📞 {clienteSel.tel}</div>
              </div>
              <button onClick={()=>{setClienteSel(null);setBuscaCliente("");}}
                style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
            </div>
            {/* Endereço salvo */}
            <div style={{background:"#111827",borderRadius:8,padding:"9px 12px",marginTop:10}}>
              <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:4}}>📍 Endereço cadastrado:</div>
              <div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{clienteSel.endereco?.rua}, {clienteSel.endereco?.num} — {clienteSel.endereco?.bairro}</div>
              {clienteSel.endereco?.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 {clienteSel.endereco.ref}</div>}
            </div>
            {/* Mesmo ou novo endereço */}
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>setModoEndereco("salvo")} style={{flex:1,padding:"9px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:modoEndereco==="salvo"?"#0d3d2e":"#0f172a",border:modoEndereco==="salvo"?"2px solid #34d399":"2px solid #1f2937",color:modoEndereco==="salvo"?"#34d399":"#6b7280"}}>
                ✅ Mesmo endereço
              </button>
              <button onClick={()=>setModoEndereco("novo")} style={{flex:1,padding:"9px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:modoEndereco==="novo"?"#1a2f4a":"#0f172a",border:modoEndereco==="novo"?"2px solid #60a5fa":"2px solid #1f2937",color:modoEndereco==="novo"?"#60a5fa":"#6b7280"}}>
                📍 Endereço diferente
              </button>
            </div>
          </div>
        )}

        {/* Cliente novo */}
        {!clienteSel && buscaCliente.length>=2 && (
          <div style={{background:"#0f172a",border:"1px solid #374151",borderRadius:10,padding:"14px",marginTop:10}}>
            <div style={{color:"#fbbf24",fontSize:12,fontWeight:700,marginBottom:10}}>📝 Novo cliente — será salvo automaticamente</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:2}}><Inp label="Nome completo *" value={clienteNome||buscaCliente} onChange={setClienteNome} placeholder="Nome do cliente"/></div>
              <div style={{flex:1}}><Inp label="Telefone" value={clienteTel} onChange={setClienteTel} placeholder="(12) 99999-0000"/></div>
            </div>
          </div>
        )}
      </Card>

      {/* Endereço de entrega */}
      {(modoEndereco==="novo" || !clienteSel) && buscaCliente.length>=2 && (
        <Card style={{marginBottom:14}}>
          <STitle>📍 Endereço de Entrega</STitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:3}}>
              <Inp label="Rua / Avenida *" value={novoEndereco.rua} onChange={handleRua} placeholder="Ex: Rua das Flores"/>
            </div>
            <div style={{flex:1}}>
              <Inp label="Número *" value={novoEndereco.num} onChange={v=>setNovoEndereco(p=>({...p,num:v}))} placeholder="123"/>
            </div>
          </div>
          <SelInput label="Bairro *" value={novoEndereco.bairro} onChange={v=>setNovoEndereco(p=>({...p,bairro:v}))}>
            {BAIRROS.map(b=><option key={b}>{b}</option>)}
          </SelInput>
          {/* Preview + taxa */}
          {novoEndereco.rua && novoEndereco.num && (
            <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginTop:4}}>
              <div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{novoEndereco.rua}, {novoEndereco.num} — {bairroFinal}</div>
              {novoEndereco.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 {novoEndereco.ref}</div>}
            </div>
          )}
        </Card>
      )}

      {/* Taxa automática */}
      {taxa && (buscaCliente.length>=2) && (
        <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"14px 18px",marginBottom:14}}>
          <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>💰 Taxa de entrega — {bairroFinal}</div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div>
              <div style={{color:"#6b7280",fontSize:11}}>Seu cliente paga</div>
              <div style={{color:"#34d399",fontWeight:900,fontSize:28}}>R${taxa.e}</div>
            </div>
            <div style={{color:"#1f2937",fontSize:24}}>→</div>
            <div style={{color:"#9ca3af",fontSize:12}}>Taxa já definida no seu cadastro. O cliente paga esse valor de frete.</div>
          </div>
        </div>
      )}

      {/* Pagamento */}
      {buscaCliente.length>=2 && (
        <Card style={{marginBottom:14}}>
          <STitle>💳 Forma de Pagamento do Cliente</STitle>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {Object.entries(PG).map(([k,p])=>(
              <button key={k} onClick={()=>setPagamento(k)} style={{flex:1,padding:"12px 6px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:pagamento===k?"#1e293b":"#0f172a",border:pagamento===k?`2px solid ${p.cor}`:"2px solid #1f2937",color:pagamento===k?p.cor:"#6b7280"}}>
                {p.icon}<br/>{p.label}
              </button>
            ))}
          </div>
          {pagamento==="dinheiro" && <div style={{background:"#3d2a00",border:"1px solid #fbbf24",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#fbbf24",fontWeight:700,fontSize:13}}>💵 Motoboy cobrará na entrega e retornará com o dinheiro</div>
          </div>}
          {pagamento==="cartao" && <div style={{background:"#1a2f4a",border:"1px solid #60a5fa",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#60a5fa",fontWeight:700,fontSize:13}}>💳 Disponibilize a maquininha para o motoboy levar</div>
          </div>}
          {pagamento==="pix" && <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#34d399",fontWeight:700,fontSize:13}}>💠 Pix já foi pago — motoboy só entrega</div>
          </div>}
        </Card>
      )}

      {/* Obs */}
      {buscaCliente.length>=2 && (
        <Inp label="Observações (opcional)" value={obs} onChange={setObs} placeholder="Ex: deixar na portaria, ligar ao chegar..."/>
      )}

      {/* Botão publicar */}
      {buscaCliente.length>=2 && (
        <div style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,padding:"12px 16px",marginBottom:14}}>
          <div style={{color:"#9ca3af",fontSize:12}}>
            🔔 O pedido será enviado para <strong style={{color:"#f9fafb"}}>todos os motoboys online</strong>. O primeiro que aceitar faz a entrega.
          </div>
        </div>
      )}

      <Btn onClick={publicar} full disabled={buscaCliente.length<2}>
        🚀 Publicar Pedido
      </Btn>
    </div>
  );
}

// ─── ADICIONAR PEDIDO À CORRIDA (mesmo motoboy, sem escolher) ────────────────
function ModalAddPedidoCorrida({ clientes, setClientes, motoboyNome, motoboyTel, vagaNum, onSalvar, onFechar }) {
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [modoEndereco, setModoEndereco] = useState("salvo");
  const [novoEndereco, setNovoEndereco] = useState({rua:"",num:"",bairro:BAIRROS[0],ref:""});
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTel, setClienteTel] = useState("");
  const [pagamento, setPagamento] = useState("pix");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");

  const resultados = buscaCliente.length>=2
    ? clientes.filter(c=>c.nome.toLowerCase().includes(buscaCliente.toLowerCase())||c.tel.includes(buscaCliente))
    : [];

  const endEfetivo = (clienteSel && modoEndereco==="salvo") ? clienteSel.endereco : novoEndereco;
  const bairroFinal = endEfetivo.bairro || BAIRROS[0];
  const taxa = EMPRESA.taxas[bairroFinal];
  const nomeEfetivo = clienteSel ? clienteSel.nome : clienteNome;
  const telEfetivo  = clienteSel ? clienteSel.tel  : clienteTel;

  function detectarBairro(rua) {
    const l = rua.toLowerCase();
    for (const b of BAIRROS) if (l.includes(b.toLowerCase())) return b;
    return null;
  }
  function handleRua(v) {
    const b = detectarBairro(v);
    setNovoEndereco(prev=>({...prev, rua:v, bairro:b||prev.bairro}));
  }

  function salvar() {
    if (!nomeEfetivo || !endEfetivo.rua || !endEfetivo.num) {
      setErro("Preencha o nome do cliente e o endereço completo."); return;
    }
    if (!clienteSel) {
      const novo = {id:Date.now(), nome:clienteNome||buscaCliente, tel:clienteTel, endereco:novoEndereco};
      setClientes(p=>[...p, novo]);
    } else if (modoEndereco==="novo") {
      setClientes(p=>p.map(c=>c.id===clienteSel.id?{...c,endereco:novoEndereco}:c));
    }
    onSalvar({
      id:Date.now(),
      clienteNome:nomeEfetivo, clienteTel:telEfetivo,
      rua:endEfetivo.rua, num:endEfetivo.num,
      bairro:bairroFinal, ref:endEfetivo.ref,
      pagamento, taxa:taxa?.e||0, obs,
      status:"em_rota", criadoEm:Date.now(),
      motoboyNome, motoboyTel,
    });
  }

  return (
    <Overlay onClose={onFechar} maxW={520} borderColor="#3b82f6">
      <OvHeader titulo="➕ Adicionar Pedido à Corrida" sub={`${vagaNum}º pedido · Mesmo motoboy: ${motoboyNome}`} onClose={onFechar}/>

      {erro && <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:12,color:"#f87171",fontSize:13}}>{erro}</div>}

      <div style={{background:"#1a2f4a",border:"1px solid #3b82f6",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
        <div style={{color:"#60a5fa",fontSize:12,fontWeight:700}}>🏍️ Esse pedido vai com {motoboyNome} — sem precisar chamar outro motoboy.</div>
      </div>

      {/* Cliente */}
      <Card style={{marginBottom:14}}>
        <STitle>👤 Cliente</STitle>
        <input value={buscaCliente}
          onChange={e=>{setBuscaCliente(e.target.value);setClienteSel(null);}}
          placeholder="Buscar por nome ou telefone..."
          style={{background:"#0f172a",border:`1px solid ${clienteSel?"#34d399":"#374151"}`,borderRadius:8,color:"#f9fafb",padding:"9px 12px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}/>

        {resultados.length>0 && !clienteSel && (
          <div style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,marginTop:6,overflow:"hidden",maxHeight:180,overflowY:"auto"}}>
            {resultados.map(c=>(
              <div key={c.id} onClick={()=>{setClienteSel(c);setBuscaCliente(c.nome);setModoEndereco("salvo");}}
                style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #1f2937"}}
                onMouseOver={e=>e.currentTarget.style.background="#1f2937"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <div style={{color:"#f9fafb",fontWeight:600,fontSize:13}}>{c.nome}</div>
                <div style={{color:"#6b7280",fontSize:11}}>📞 {c.tel} · 📍 {c.endereco?.rua}, {c.endereco?.num} — {c.endereco?.bairro}</div>
              </div>
            ))}
          </div>
        )}

        {buscaCliente.length>=2 && resultados.length===0 && !clienteSel && (
          <div style={{background:"#1a2035",borderRadius:8,padding:"9px 14px",marginTop:6}}>
            <div style={{color:"#9ca3af",fontSize:12}}>Cliente não encontrado — preencha abaixo para cadastrar</div>
          </div>
        )}

        {clienteSel && (
          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"12px 16px",marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:"#34d399",fontWeight:700,fontSize:14}}>✅ {clienteSel.nome}</div>
                <div style={{color:"#6b7280",fontSize:12,marginTop:1}}>📞 {clienteSel.tel}</div>
              </div>
              <button onClick={()=>{setClienteSel(null);setBuscaCliente("");}}
                style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
            </div>
            <div style={{background:"#111827",borderRadius:8,padding:"9px 12px",marginTop:10}}>
              <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:4}}>📍 Endereço cadastrado:</div>
              <div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{clienteSel.endereco?.rua}, {clienteSel.endereco?.num} — {clienteSel.endereco?.bairro}</div>
              {clienteSel.endereco?.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 {clienteSel.endereco.ref}</div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>setModoEndereco("salvo")} style={{flex:1,padding:"9px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:modoEndereco==="salvo"?"#0d3d2e":"#0f172a",border:modoEndereco==="salvo"?"2px solid #34d399":"2px solid #1f2937",color:modoEndereco==="salvo"?"#34d399":"#6b7280"}}>
                ✅ Mesmo endereço
              </button>
              <button onClick={()=>setModoEndereco("novo")} style={{flex:1,padding:"9px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:modoEndereco==="novo"?"#1a2f4a":"#0f172a",border:modoEndereco==="novo"?"2px solid #60a5fa":"2px solid #1f2937",color:modoEndereco==="novo"?"#60a5fa":"#6b7280"}}>
                📍 Endereço diferente
              </button>
            </div>
          </div>
        )}

        {!clienteSel && buscaCliente.length>=2 && (
          <div style={{background:"#0f172a",border:"1px solid #374151",borderRadius:10,padding:"14px",marginTop:10}}>
            <div style={{color:"#fbbf24",fontSize:12,fontWeight:700,marginBottom:10}}>📝 Novo cliente — será salvo automaticamente</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:2}}><Inp label="Nome completo *" value={clienteNome||buscaCliente} onChange={setClienteNome} placeholder="Nome do cliente"/></div>
              <div style={{flex:1}}><Inp label="Telefone" value={clienteTel} onChange={setClienteTel} placeholder="(12) 99999-0000"/></div>
            </div>
          </div>
        )}
      </Card>

      {/* Endereço */}
      {(modoEndereco==="novo" || !clienteSel) && buscaCliente.length>=2 && (
        <Card style={{marginBottom:14}}>
          <STitle>📍 Endereço de Entrega</STitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:3}}><Inp label="Rua / Avenida *" value={novoEndereco.rua} onChange={handleRua} placeholder="Ex: Rua das Flores"/></div>
            <div style={{flex:1}}><Inp label="Número *" value={novoEndereco.num} onChange={v=>setNovoEndereco(p=>({...p,num:v}))} placeholder="123"/></div>
          </div>
          <SelInput label="Bairro *" value={novoEndereco.bairro} onChange={v=>setNovoEndereco(p=>({...p,bairro:v}))}>
            {BAIRROS.map(b=><option key={b}>{b}</option>)}
          </SelInput>
          {novoEndereco.rua && novoEndereco.num && (
            <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginTop:4}}>
              <div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{novoEndereco.rua}, {novoEndereco.num} — {bairroFinal}</div>
              {novoEndereco.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 {novoEndereco.ref}</div>}
            </div>
          )}
        </Card>
      )}

      {/* Taxa */}
      {taxa && buscaCliente.length>=2 && (
        <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"14px 18px",marginBottom:14}}>
          <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>💰 Taxa de entrega — {bairroFinal}</div>
          <div style={{color:"#34d399",fontWeight:900,fontSize:28}}>R${taxa.e}</div>
        </div>
      )}

      {/* Pagamento */}
      {buscaCliente.length>=2 && (
        <Card style={{marginBottom:14}}>
          <STitle>💳 Forma de Pagamento</STitle>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {Object.entries(PG).map(([k,p])=>(
              <button key={k} onClick={()=>setPagamento(k)} style={{flex:1,padding:"12px 6px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:pagamento===k?"#1e293b":"#0f172a",border:pagamento===k?`2px solid ${p.cor}`:"2px solid #1f2937",color:pagamento===k?p.cor:"#6b7280"}}>
                {p.icon}<br/>{p.label}
              </button>
            ))}
          </div>
          {pagamento==="dinheiro" && <div style={{background:"#3d2a00",border:"1px solid #fbbf24",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#fbbf24",fontWeight:700,fontSize:13}}>💵 Motoboy cobrará na entrega e retornará com o dinheiro</div>
          </div>}
          {pagamento==="cartao" && <div style={{background:"#1a2f4a",border:"1px solid #60a5fa",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#60a5fa",fontWeight:700,fontSize:13}}>💳 Disponibilize a maquininha para o motoboy</div>
          </div>}
          {pagamento==="pix" && <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#34d399",fontWeight:700,fontSize:13}}>💠 Pix já foi pago — motoboy só entrega</div>
          </div>}
        </Card>
      )}

      {buscaCliente.length>=2 && (
        <Inp label="Observações (opcional)" value={obs} onChange={setObs} placeholder="Ex: deixar na portaria, ligar ao chegar..."/>
      )}

      <Btn onClick={salvar} full disabled={buscaCliente.length<2}>
        ➕ Adicionar à Corrida
      </Btn>
    </Overlay>
  );
}

// ─── PEDIDOS EM ANDAMENTO ─────────────────────────────────────────────────────
function PedidosAtivos({ pedidos, setPedidos, clientes, setClientes }) {
  const [tick, setTick] = useState(0);
  const [modalMapa, setModalMapa] = useState(null);
  const [modalAddCorrida, setModalAddCorrida] = useState(null); // {corridaId, motoboyNome, motoboyTel, vagaNum}

  useEffect(()=>{
    const t = setInterval(()=>setTick(x=>x+1), 1000);
    return ()=>clearInterval(t);
  },[]);

  // Simula motoboy aceitando após 5 segundos
  useEffect(()=>{
    setPedidos(prev=>prev.map(p=>{
      if (p.status==="aguardando") {
        const seg = Math.floor((Date.now()-p.criadoEm)/1000);
        if (seg>=5 && seg<6) return {...p, status:"em_rota", motoboyNome:"Carlos Silva", motoboyTel:"(12) 99801-2233", corridaId:p.id, aceitoEm:Date.now()};
      }
      return p;
    }));
  },[tick]);

  function cancelar(id) {
    setPedidos(prev=>prev.map(p=>p.id===id?{...p,status:"cancelado"}:p));
  }

  function adicionarPedidoCorrida(novoPedido) {
    setPedidos(prev=>[...prev, novoPedido]);
    setModalAddCorrida(null);
  }

  const ativos = pedidos.filter(p=>p.status==="aguardando"||p.status==="em_rota");
  const recentes = pedidos.filter(p=>p.status==="entregue"||p.status==="cancelado").slice(0,3);

  const aguardando = ativos.filter(p=>p.status==="aguardando");
  const emRotaPedidos = ativos.filter(p=>p.status==="em_rota");

  // Agrupa pedidos em rota pela corrida (mesmo motoboy/mesma saída)
  const corridasMap = {};
  emRotaPedidos.forEach(p=>{
    const cid = p.corridaId || p.id;
    if (!corridasMap[cid]) corridasMap[cid] = [];
    corridasMap[cid].push(p);
  });
  const corridas = Object.entries(corridasMap).map(([corridaId, lista])=>({
    corridaId,
    pedidos: lista.slice().sort((a,b)=>a.criadoEm-b.criadoEm),
  }));

  function formatTempo(ms) {
    const s = Math.floor(ms/1000);
    const m = Math.floor(s/60), r = s%60;
    return m>0?`${m}m ${r}s`:`${r}s`;
  }

  if (ativos.length===0 && recentes.length===0) {
    return (
      <Card style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:48,marginBottom:12}}>🏍️</div>
        <div style={{color:"#6b7280",fontSize:15}}>Nenhum pedido ativo no momento</div>
        <div style={{color:"#4b5563",fontSize:13,marginTop:6}}>Vá em "Nova Entrega" para solicitar um motoboy</div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{color:"#34d399",fontWeight:800,fontSize:20,marginBottom:14}}>🚦 Pedidos em Andamento</div>

      {/* Pedidos aguardando motoboy aceitar */}
      {aguardando.map(p=>{
        const decorrido = Date.now()-p.criadoEm;
        const pg = PG[p.pagamento]||{icon:"•",cor:"#9ca3af",label:p.pagamento};

        return (
          <Card key={p.id} style={{marginBottom:14,border:"1px solid #fbbf24"}}>
            {/* Status */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{background:"#3d2a00",color:"#fbbf24",padding:"3px 12px",borderRadius:20,fontSize:13,fontWeight:700}}>⏳ Aguardando motoboy...</span>
                </div>
                <div style={{color:"#f9fafb",fontWeight:700,fontSize:16}}>{p.clienteNome}</div>
                <div style={{color:"#6b7280",fontSize:12}}>📞 {p.clienteTel||"—"} · {formatTempo(decorrido)} atrás</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#6b7280",fontSize:11}}>Taxa de entrega</div>
                <div style={{color:"#34d399",fontWeight:900,fontSize:24}}>R${p.taxa}</div>
                <div style={{marginTop:4}}><Tag label={`${pg.icon} ${pg.label}`} cor={pg.cor}/></div>
              </div>
            </div>

            {/* Endereço */}
            <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginBottom:12}}>
              <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:4}}>📍 ENDEREÇO DE ENTREGA</div>
              <div style={{color:"#f9fafb",fontSize:14,fontWeight:600}}>{p.rua}, {p.num} — {p.bairro}</div>
              {p.ref && <div style={{color:"#fbbf24",fontSize:12,marginTop:3}}>📌 Ref: {p.ref}</div>}
              {p.obs && <div style={{color:"#9ca3af",fontSize:12,marginTop:3}}>💬 Obs: {p.obs}</div>}
            </div>

            {/* Instrução pagamento */}
            {p.pagamento==="dinheiro" && <div style={{background:"#3d2a00",borderRadius:8,padding:"8px 14px",marginBottom:12}}>
              <div style={{color:"#fbbf24",fontSize:12,fontWeight:700}}>💵 Disponibilize o troco. Motoboy retorna com o dinheiro.</div>
            </div>}
            {p.pagamento==="cartao" && <div style={{background:"#1a2f4a",borderRadius:8,padding:"8px 14px",marginBottom:12}}>
              <div style={{color:"#60a5fa",fontSize:12,fontWeight:700}}>💳 Entregue a maquininha ao motoboy antes de ele sair.</div>
            </div>}

            <Btn small cor="perigo" onClick={()=>cancelar(p.id)}>❌ Cancelar pedido</Btn>
          </Card>
        );
      })}

      {/* Corridas em rota — agrupa até 3 pedidos no mesmo motoboy */}
      {corridas.map(corrida=>{
        const primeiro = corrida.pedidos[0];
        const totalCorrida = corrida.pedidos.reduce((s,p)=>s+(p.taxa||0),0);

        return (
          <Card key={corrida.corridaId} style={{marginBottom:14,border:"1px solid #34d399"}}>
            {/* Status */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{background:"#0d3d2e",color:"#34d399",padding:"3px 12px",borderRadius:20,fontSize:13,fontWeight:700}}>🏍️ Motoboy a caminho!</span>
                <Tag label={`${corrida.pedidos.length}/3 pedido${corrida.pedidos.length!==1?"s":""} nesta corrida`} cor="#60a5fa"/>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#6b7280",fontSize:11}}>Total da corrida</div>
                <div style={{color:"#34d399",fontWeight:900,fontSize:24}}>R${totalCorrida}</div>
              </div>
            </div>

            {/* Motoboy (uma vez só por corrida) */}
            {primeiro.motoboyNome && (
              <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:8,padding:"10px 14px",marginBottom:12}}>
                <div style={{color:"#34d399",fontWeight:700,fontSize:13,marginBottom:4}}>🏍️ Motoboy: {primeiro.motoboyNome}</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <a href={`https://wa.me/55${primeiro.motoboyTel?.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                    style={{background:"#111827",color:"#34d399",padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                    💬 WhatsApp
                  </a>
                  <a href={`tel:${primeiro.motoboyTel?.replace(/\D/g,"")}`}
                    style={{background:"#111827",color:"#60a5fa",padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:700,textDecoration:"none"}}>
                    📱 Ligar
                  </a>
                  <button onClick={()=>setModalMapa(primeiro)}
                    style={{background:"#1a3a5c",color:"#60a5fa",border:"1px solid #3b82f6",padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    🗺️ Ver no Mapa
                  </button>
                </div>
              </div>
            )}

            {/* Pedidos desta corrida */}
            {corrida.pedidos.map((p,i)=>{
              const pg = PG[p.pagamento]||{icon:"•",cor:"#9ca3af",label:p.pagamento};
              return (
                <div key={p.id} style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                    <div>
                      <div style={{color:"#60a5fa",fontSize:11,fontWeight:700,marginBottom:3}}>PEDIDO #{i+1} — {p.clienteNome}</div>
                      <div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{p.rua}, {p.num} — {p.bairro}</div>
                      {p.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 Ref: {p.ref}</div>}
                      {p.obs && <div style={{color:"#9ca3af",fontSize:11,marginTop:2}}>💬 Obs: {p.obs}</div>}
                      {p.pagamento==="dinheiro" && <div style={{color:"#fbbf24",fontSize:11,marginTop:3,fontWeight:700}}>💵 Troco — motoboy retorna com o dinheiro</div>}
                      {p.pagamento==="cartao" && <div style={{color:"#60a5fa",fontSize:11,marginTop:3,fontWeight:700}}>💳 Maquininha já entregue ao motoboy</div>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:"#34d399",fontWeight:800,fontSize:18}}>R${p.taxa}</div>
                      <Tag label={`${pg.icon} ${pg.label}`} cor={pg.cor}/>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Adicionar pedido extra à mesma corrida (máx 3) ou aviso de limite */}
            {corrida.pedidos.length<3 ? (
              <Btn small cor="azul" full onClick={()=>setModalAddCorrida({
                corridaId: corrida.corridaId,
                motoboyNome: primeiro.motoboyNome,
                motoboyTel: primeiro.motoboyTel,
                vagaNum: corrida.pedidos.length+1,
              })}>
                ➕ Adicionar pedido a esta corrida (vaga {corrida.pedidos.length+1}/3)
              </Btn>
            ) : (
              <div style={{background:"#1a1000",border:"1px solid #f59e0b",borderRadius:8,padding:"10px 14px"}}>
                <div style={{color:"#fbbf24",fontSize:12,fontWeight:700}}>⚠️ Máximo de 3 pedidos atingido para esta corrida. Para um 4º pedido, use "Nova Entrega" (vai chamar outro motoboy).</div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Recentes */}
      {recentes.length>0 && (
        <div>
          <div style={{color:"#6b7280",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:20}}>Concluídos recentemente</div>
          {recentes.map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0f172a",borderRadius:8,padding:"10px 14px",marginBottom:6}}>
              <div>
                <span style={{color:"#f9fafb",fontWeight:600,fontSize:13}}>{p.clienteNome}</span>
                <span style={{color:"#6b7280",fontSize:12,marginLeft:8}}>· {p.bairro}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"#34d399",fontWeight:700}}>R${p.taxa}</span>
                <span style={{background:p.status==="entregue"?"#0d3d2e":"#3d1010",color:p.status==="entregue"?"#34d399":"#f87171",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>
                  {p.status==="entregue"?"✅ Entregue":"❌ Cancelado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal mapa */}
      {modalMapa && (
        <Overlay onClose={()=>setModalMapa(null)} maxW={620}>
          <OvHeader titulo="🗺️ Localização do Motoboy" sub={`Entregando para ${modalMapa.clienteNome}`} onClose={()=>setModalMapa(null)}/>
          <div style={{background:"#0f172a",borderRadius:10,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid #1f2937",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#9ca3af",fontSize:12}}>📍 Destino: {modalMapa.rua}, {modalMapa.num} — {modalMapa.bairro}</span>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${modalMapa.rua}, ${modalMapa.num}, ${modalMapa.bairro}, Ilhabela, SP`)}`}
                target="_blank" rel="noreferrer"
                style={{color:"#60a5fa",fontSize:12,fontWeight:700,textDecoration:"none"}}>Abrir no Maps ↗</a>
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${modalMapa.rua}, ${modalMapa.num}, ${modalMapa.bairro}, Ilhabela, SP`)}&output=embed&hl=pt-BR`}
              width="100%" height="300" style={{border:"none",display:"block"}} title="mapa" loading="lazy"/>
          </div>
          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:8,padding:"10px 14px"}}>
            <div style={{color:"#34d399",fontWeight:700,fontSize:13}}>🏍️ {modalMapa.motoboyNome} está a caminho</div>
            <div style={{color:"#6b7280",fontSize:12,marginTop:2}}>📞 {modalMapa.motoboyTel}</div>
          </div>
        </Overlay>
      )}

      {/* Modal adicionar pedido à corrida (mesmo motoboy, sem escolher outro) */}
      {modalAddCorrida && (
        <ModalAddPedidoCorrida
          clientes={clientes}
          setClientes={setClientes}
          motoboyNome={modalAddCorrida.motoboyNome}
          motoboyTel={modalAddCorrida.motoboyTel}
          vagaNum={modalAddCorrida.vagaNum}
          onSalvar={(novoPedido)=>adicionarPedidoCorrida({...novoPedido, corridaId:modalAddCorrida.corridaId})}
          onFechar={()=>setModalAddCorrida(null)}
        />
      )}
    </div>
  );
}

// ─── HISTÓRICO DO ESTABELECIMENTO ─────────────────────────────────────────────
function HistoricoEmp({ historico, pedidos }) {
  const [filtro, setFiltro] = useState("Todos");
  const todos = [...historico, ...pedidos.filter(p=>p.status==="entregue"||p.status==="cancelado").map(p=>({
    id:p.id, clienteNome:p.clienteNome, bairro:p.bairro, pagamento:p.pagamento,
    taxa:p.taxa, status:p.status==="entregue"?"Entregue":"Cancelada",
    motoboyNome:p.motoboyNome||"—", data:"Hoje", hora:"agora"
  }))];
  const lista = todos.filter(e=>filtro==="Todos"||e.status===filtro);
  const totalTaxas = todos.filter(e=>e.status==="Entregue").reduce((s,e)=>s+e.taxa,0);
  const semana = todos.filter(e=>e.status==="Entregue").slice(0,5).reduce((s,e)=>s+e.taxa,0);

  return (
    <div>
      <div style={{marginBottom:14}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>📋 Histórico de Entregas</div>
        <div style={{color:"#6b7280",fontSize:13}}>{lista.length} registros</div>
      </div>

      {/* Resumo financeiro */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 18px",flex:1,minWidth:130}}>
          <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>A pagar esta semana</div>
          <div style={{color:"#fbbf24",fontSize:22,fontWeight:800}}>R${semana}</div>
          <div style={{color:"#6b7280",fontSize:11,marginTop:3}}>taxas de entrega</div>
        </div>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 18px",flex:1,minWidth:130}}>
          <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Total histórico</div>
          <div style={{color:"#60a5fa",fontSize:22,fontWeight:800}}>R${totalTaxas}</div>
          <div style={{color:"#6b7280",fontSize:11,marginTop:3}}>em taxas de entrega</div>
        </div>
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 18px",flex:1,minWidth:130}}>
          <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Total entregas</div>
          <div style={{color:"#34d399",fontSize:22,fontWeight:800}}>{todos.filter(e=>e.status==="Entregue").length}</div>
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {["Todos","Entregue","Cancelada"].map(f=>(
          <button key={f} onClick={()=>setFiltro(f)} style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:filtro===f?"#0d3d2e":"#1f2937",border:filtro===f?"1px solid #34d399":"1px solid #374151",color:filtro===f?"#34d399":"#6b7280"}}>{f}</button>
        ))}
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#0f172a",borderBottom:"1px solid #1f2937"}}>
              {["Data","Hora","Cliente","Bairro","Pgto","Taxa","Motoboy","Status"].map(h=>(
                <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{h}</th>
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
                  <td style={{padding:"9px 12px",color:"#9ca3af",fontSize:12}}>{e.data}</td>
                  <td style={{padding:"9px 12px",color:"#9ca3af",fontSize:12}}>{e.hora}</td>
                  <td style={{padding:"9px 12px",color:"#f9fafb",fontWeight:600}}>{e.clienteNome}</td>
                  <td style={{padding:"9px 12px",color:"#34d399",fontSize:12}}>{e.bairro}</td>
                  <td style={{padding:"9px 12px"}}><span style={{color:pg.cor,fontWeight:700}}>{pg.icon}</span></td>
                  <td style={{padding:"9px 12px",color:"#fbbf24",fontWeight:700}}>R${e.taxa}</td>
                  <td style={{padding:"9px 12px",color:"#d1d5db",fontSize:12}}>{e.motoboyNome}</td>
                  <td style={{padding:"9px 12px"}}>
                    <span style={{background:entregue?"#0d3d2e":"#3d1010",color:entregue?"#34d399":"#f87171",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>
                      {entregue?"✅ Entregue":"❌ Cancelada"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length===0 && <div style={{textAlign:"center",padding:30,color:"#4b5563"}}>Nenhum registro.</div>}
      </Card>
    </div>
  );
}

// ─── CLIENTES SALVOS ──────────────────────────────────────────────────────────
function ClientesSalvos({ clientes, setClientes }) {
  const [busca, setBusca] = useState("");
  const [editId, setEditId] = useState(null);
  const [modalCad, setModalCad] = useState(false);
  const [form, setForm] = useState({nome:"",tel:"",endereco:{rua:"",num:"",bairro:BAIRROS[0],ref:""}});

  const filtrados = clientes.filter(c=>!busca||c.nome.toLowerCase().includes(busca.toLowerCase())||c.tel.includes(busca));
  const editCli = editId ? clientes.find(c=>c.id===editId) : null;

  function abrirEdicao(c) { setEditId(c.id); setForm({nome:c.nome,tel:c.tel,endereco:{...c.endereco}}); }
  function salvar() { setClientes(p=>p.map(c=>c.id===editId?{...c,...form}:c)); setEditId(null); }
  function excluir(id) { setClientes(p=>p.filter(c=>c.id!==id)); }

  const FORM_VAZIO = {nome:"",tel:"",endereco:{rua:"",num:"",bairro:BAIRROS[0],ref:""}};

  function abrirCadastro() { setForm(FORM_VAZIO); setModalCad(true); }
  function cadastrar() {
    if (!form.nome.trim() || !form.endereco.rua.trim() || !form.endereco.num.trim()) return;
    setClientes(p=>[...p, {id:Date.now(), ...form}]);
    setModalCad(false); setForm(FORM_VAZIO);
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>👤 Clientes Salvos</div>
          <div style={{color:"#6b7280",fontSize:13}}>{clientes.length} clientes · endereços salvos automaticamente</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Buscar..."
            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"8px 14px",fontSize:13,outline:"none",width:180}}/>
          <Btn onClick={abrirCadastro}>+ Novo Cliente</Btn>
        </div>
      </div>

      {filtrados.map(c=>(
        <Card key={c.id} style={{marginBottom:10,padding:"14px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:150}}>
              <div style={{color:"#f9fafb",fontWeight:700,fontSize:14}}>{c.nome}</div>
              <a href={`https://wa.me/55${c.tel?.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                style={{color:"#34d399",textDecoration:"none",fontSize:12}}>💬 {c.tel}</a>
            </div>
            <div style={{flex:2,minWidth:180}}>
              <div style={{color:"#d1d5db",fontSize:13}}>{c.endereco?.rua}, {c.endereco?.num} — <span style={{color:"#34d399"}}>{c.endereco?.bairro}</span></div>
              {c.endereco?.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 {c.endereco.ref}</div>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <Btn small cor="cinza" onClick={()=>abrirEdicao(c)}>✏️ Editar</Btn>
              <Btn small cor="perigo" onClick={()=>excluir(c.id)}>🗑️</Btn>
            </div>
          </div>
        </Card>
      ))}

      {filtrados.length===0 && <Card><div style={{color:"#4b5563",textAlign:"center",padding:20}}>Nenhum cliente encontrado.</div></Card>}

      {/* Modal cadastrar novo cliente */}
      {modalCad && (
        <Overlay onClose={()=>setModalCad(false)} maxW={440}>
          <OvHeader titulo="+ Cadastrar Novo Cliente" onClose={()=>setModalCad(false)}/>
          <Inp label="Nome completo *" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Ex: João da Silva"/>
          <Inp label="Telefone / WhatsApp" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))} placeholder="(12) 99999-0000"/>
          <Divider/>
          <STitle>Endereço</STitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:3}}><Inp label="Rua / Avenida *" value={form.endereco.rua} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,rua:v}}))}/></div>
            <div style={{flex:1}}><Inp label="Nº *" value={form.endereco.num} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,num:v}}))}/></div>
          </div>
          <Inp label="Bairro *" value={form.endereco.bairro} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,bairro:v}}))} placeholder="Ex: Perequê, Vila, Feiticeira, Siriúba..." hint="Digite o bairro do cliente"/>
          <Inp label="Ponto de referência" value={form.endereco.ref} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,ref:v}}))}
            placeholder="Ex: Casa azul, portão de ferro, próximo ao mercado..."
            hint="Ajuda o motoboy a encontrar mais rápido"/>
          {/* Preview */}
          {form.nome && form.endereco.rua && form.endereco.num && (
            <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginBottom:10}}>
              <div style={{color:"#9ca3af",fontSize:11,marginBottom:4}}>Como ficará salvo:</div>
              <div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{form.nome}</div>
              <div style={{color:"#d1d5db",fontSize:12,marginTop:2}}>{form.endereco.rua}, {form.endereco.num} — <span style={{color:"#34d399"}}>{form.endereco.bairro}</span></div>
              {form.endereco.ref && <div style={{color:"#fbbf24",fontSize:11,marginTop:2}}>📌 {form.endereco.ref}</div>}
            </div>
          )}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={cadastrar} full disabled={!form.nome.trim()||!form.endereco.rua.trim()||!form.endereco.num.trim()}>
              💾 Salvar Cliente
            </Btn>
            <Btn cor="cinza" onClick={()=>setModalCad(false)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}

      {editId && editCli && (
        <Overlay onClose={()=>setEditId(null)} maxW={440}>
          <OvHeader titulo="✏️ Editar Cliente" onClose={()=>setEditId(null)}/>
          <Inp label="Nome" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))}/>
          <Inp label="Telefone" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))}/>
          <Divider/>
          <STitle>Endereço</STitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:3}}><Inp label="Rua" value={form.endereco.rua} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,rua:v}}))}/></div>
            <div style={{flex:1}}><Inp label="Nº" value={form.endereco.num} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,num:v}}))}/></div>
          </div>
          <Inp label="Bairro" value={form.endereco.bairro} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,bairro:v}}))} placeholder="Ex: Perequê, Vila, Feiticeira..."/>
          <Inp label="Referência" value={form.endereco.ref} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,ref:v}}))} placeholder="Casa de cor, portão..."/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={salvar} full>Salvar</Btn>
            <Btn cor="cinza" onClick={()=>setEditId(null)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── APP EMPRESÁRIO ───────────────────────────────────────────────────────────
export default function AppEmpresario() {
  const [aba, setAba] = useState("nova");
  const [clientes, setClientes] = useState(CLIENTES_INIT);
  const [pedidos, setPedidos] = useState([]);
  const [historico] = useState(HIST_INIT);
  const [avisoSemMotoboy, setAvisoSemMotoboy] = useState(null);

  const pedidosAtivos = pedidos.filter(p=>p.status==="aguardando"||p.status==="em_rota").length;

  // Simula 5 minutos sem aceite → aviso ao empresário
  useEffect(()=>{
    const aguardando = pedidos.filter(p=>p.status==="aguardando");
    if (aguardando.length===0) return;
    const t = setTimeout(()=>{
      setAvisoSemMotoboy(aguardando[0]);
      setPedidos(prev=>prev.map(p=>p.status==="aguardando"?{...p,status:"cancelado"}:p));
    }, 15000); // 15s na demo (= 5min no real)
    return ()=>clearTimeout(t);
  },[pedidos]);

  function publicarPedido(pedido) {
    setPedidos(prev=>[...prev, pedido]);
    setAba("ativos");
  }

  const ABAS = [
    {id:"nova",     label:"📦 Nova Entrega"},
    {id:"ativos",   label:"🚦 Pedidos Ativos", badge:pedidosAtivos},
    {id:"historico",label:"📋 Histórico"},
    {id:"clientes", label:"👤 Clientes"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb"}}>
      {/* Header */}
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",flexWrap:"wrap"}}>
          <div style={{padding:"12px 20px 12px 0",borderRight:"1px solid #1f2937",marginRight:16,flexShrink:0}}>
            <div style={{color:"#34d399",fontWeight:900,fontSize:16,letterSpacing:-0.5}}>⚡ MotoFast</div>
            <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{EMPRESA.nome}</div>
          </div>
          <nav style={{display:"flex",flexWrap:"wrap",flex:1}}>
            {ABAS.map(a=>(
              <button key={a.id} onClick={()=>setAba(a.id)} style={{background:aba===a.id?"#0d3d2e":"transparent",color:aba===a.id?"#34d399":"#6b7280",border:"none",borderBottom:aba===a.id?"2px solid #34d399":"2px solid transparent",padding:"13px 12px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",position:"relative"}}>
                {a.label}
                {a.badge>0 && <span style={{background:"#ef4444",color:"#fff",borderRadius:"50%",fontSize:10,fontWeight:800,padding:"1px 5px",marginLeft:6}}>{a.badge}</span>}
              </button>
            ))}
          </nav>
          {/* Info plano */}
          <div style={{padding:"8px 0",flexShrink:0}}>
            {EMPRESA.planoGratis
              ? <Tag label={`🎁 Grátis até ${EMPRESA.dataFimGratis}`} cor="#a78bfa"/>
              : <Tag label="✅ Plano ativo" cor="#34d399"/>}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px"}}>
        {aba==="nova"      && <SolicitarEntrega clientes={clientes} setClientes={setClientes} onPublicar={publicarPedido}/>}
        {aba==="ativos"    && <PedidosAtivos pedidos={pedidos} setPedidos={setPedidos} clientes={clientes} setClientes={setClientes}/>}
        {aba==="historico" && <HistoricoEmp historico={historico} pedidos={pedidos}/>}
        {aba==="clientes"  && <ClientesSalvos clientes={clientes} setClientes={setClientes}/>}
      </div>

      {/* Botão suporte fixo */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:200}}>
        <a href={`https://wa.me/${SUPORTE_TEL}?text=Olá, sou empresário no MotoFast e preciso de suporte`}
          target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,background:"#10b981",borderRadius:50,padding:"10px 16px",textDecoration:"none",boxShadow:"0 4px 20px rgba(16,185,129,0.4)"}}>
          <span style={{fontSize:20}}>💬</span>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:13}}>Suporte</div>
            <div style={{color:"#d1fae5",fontSize:10}}>{SUPORTE_HORARIO}</div>
          </div>
        </a>
      </div>

      {avisoSemMotoboy && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#111827",border:"2px solid #ef4444",borderRadius:16,width:"100%",maxWidth:440,padding:28,textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:12}}>😔</div>
            <div style={{color:"#f87171",fontWeight:900,fontSize:22,marginBottom:10}}>
              Nenhum motoboy disponível
            </div>
            <div style={{color:"#9ca3af",fontSize:14,lineHeight:1.7,marginBottom:24}}>
              Infelizmente, nenhum motoboy aceitou a entrega para{" "}
              <strong style={{color:"#f9fafb"}}>{avisoSemMotoboy.clienteNome}</strong>{" "}
              em <strong style={{color:"#f9fafb"}}>{avisoSemMotoboy.bairro}</strong>{" "}
              nos últimos 5 minutos.
              <br/><br/>
              <strong style={{color:"#fbbf24"}}>Aguarde 1 minutinho e tente solicitar novamente.</strong>
              {" "}Os motoboys serão notificados assim que você reenviar o pedido. Continue tentando — alguém vai aceitar!
            </div>
            <button
              onClick={()=>{
                // Reenvia o pedido direto, sem precisar preencher nada
                const pedidoReenviado = {...avisoSemMotoboy, id:Date.now(), status:"aguardando", criadoEm:Date.now()};
                setPedidos(prev=>[...prev, pedidoReenviado]);
                setAvisoSemMotoboy(null);
                setAba("ativos");
              }}
              style={{width:"100%",padding:"16px",borderRadius:10,background:"#10b981",border:"none",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",marginBottom:10}}>
              🔄 Reenviar pedido agora
            </button>
            <button
              onClick={()=>setAvisoSemMotoboy(null)}
              style={{width:"100%",padding:"12px",borderRadius:10,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
