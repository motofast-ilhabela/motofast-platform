import { useState } from "react";

const BAIRROS = ["Perequê","Vila","Barra Velha","Itaquanduba","Água Branca","Zabumba","Sul","Centro","Armação","Curral"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MENSALIDADE = 95;
const PG = { pix:{label:"Pix",icon:"💠",cor:"#34d399"}, dinheiro:{label:"Dinheiro",icon:"💵",cor:"#fbbf24"}, cartao:{label:"Cartão",icon:"💳",cor:"#60a5fa"} };

// ─── DADOS ────────────────────────────────────────────────────────────────────
const MB_INIT = [
  {id:1,nomeCompleto:"Carlos Eduardo Silva",tel:"(12) 99801-2233",pix:"11999012233",bairroBase:"Perequê",cpf:"123.456.789-01",rg:"12.345.678-9",nascimento:"15/03/1995",nomePai:"José Antônio Silva",nomeMae:"Maria das Graças Silva",endereco:"Rua das Flores, 45, Perequê, Ilhabela/SP",online:true,ativo:true,banido:false,motivoBanimento:null,dataBanimento:null},
  {id:2,nomeCompleto:"Marcos Antônio Souza",tel:"(12) 99712-4455",pix:"marcos@pix",bairroBase:"Vila",cpf:"234.567.890-12",rg:"23.456.789-0",nascimento:"22/07/1998",nomePai:"Paulo Roberto Souza",nomeMae:"Ana Claudia Souza",endereco:"Av. Princesa Isabel, 230, Vila, Ilhabela/SP",online:true,ativo:true,banido:false,motivoBanimento:null,dataBanimento:null},
  {id:3,nomeCompleto:"Diego Ferreira Santos",tel:"(12) 99623-6677",pix:"diego@pix",bairroBase:"Barra Velha",cpf:"345.678.901-23",rg:"34.567.890-1",nascimento:"08/11/1992",nomePai:"Roberto Carlos Santos",nomeMae:"Lucia Helena Santos",endereco:"Rua do Sol, 88, Barra Velha, Ilhabela/SP",online:false,ativo:true,banido:false,motivoBanimento:null,dataBanimento:null},
  {id:4,nomeCompleto:"Rafael Henrique Lima",tel:"(12) 99534-8899",pix:"rafael@pix",bairroBase:"Centro",cpf:"456.789.012-34",rg:"45.678.901-2",nascimento:"30/01/2000",nomePai:"Fernando José Lima",nomeMae:"Sandra Maria Lima",endereco:"Rua Central, 12, Centro, Ilhabela/SP",online:true,ativo:true,banido:false,motivoBanimento:null,dataBanimento:null},
  {id:5,nomeCompleto:"Thiago Rodrigues Costa",tel:"(12) 99445-0011",pix:"thiago@pix",bairroBase:"Itaquanduba",cpf:"567.890.123-45",rg:"56.789.012-3",nascimento:"14/06/1990",nomePai:"Antônio Carlos Costa",nomeMae:"Vera Lúcia Costa",endereco:"Estrada da Ilha, 310, Itaquanduba, Ilhabela/SP",online:false,ativo:false,banido:true,motivoBanimento:"Sumiu com dinheiro do cliente — ocorrência registrada",dataBanimento:"2026-05-20"},
];

const EMP_INIT = [
  {id:1,nome:"Pizzaria Dom João",tel:"(12) 3894-1122",bairro:"Vila",cnpj:"12.345.678/0001-90",nomeDono:"João Carlos Pereira",telDono:"(12) 99901-1111",nomeSocio:"",telSocio:"",enderecoEstab:"Rua da Padroeira, 45, Vila, Ilhabela/SP",planoPagamento:"semanal",planoPagamentoMotoboy:"semanal",planoGratis:false,dataFimGratis:null,bloqueado:false,mensalidadePaga:true,pagamentosDiarios:{"2026-06-09":true,"2026-06-08":true,"2026-06-07":true,"2026-06-06":true,"2026-06-05":true,"2026-06-04":true,"2026-06-03":true},taxas:{"Perequê":{e:12,m:9},"Vila":{e:8,m:6},"Barra Velha":{e:14,m:10},"Itaquanduba":{e:11,m:8},"Água Branca":{e:13,m:9},"Zabumba":{e:10,m:7},"Sul":{e:18,m:13},"Centro":{e:9,m:7},"Armação":{e:15,m:11},"Curral":{e:12,m:9}}},
  {id:2,nome:"Açaí da Hora",tel:"(12) 3894-3344",bairro:"Perequê",cnpj:"23.456.789/0001-01",nomeDono:"Alessandro Santos",telDono:"(12) 99902-2222",nomeSocio:"",telSocio:"",enderecoEstab:"Av. Princesa Isabel, 230, Perequê, Ilhabela/SP",planoPagamento:"semanal",planoPagamentoMotoboy:"diario",planoGratis:true,dataFimGratis:"2026-07-10",bloqueado:false,mensalidadePaga:true,pagamentosDiarios:{"2026-06-09":true,"2026-06-08":false,"2026-06-07":true,"2026-06-06":true,"2026-06-05":false,"2026-06-04":true,"2026-06-03":true},taxas:{"Perequê":{e:7,m:5},"Vila":{e:11,m:8},"Barra Velha":{e:12,m:9},"Itaquanduba":{e:9,m:7},"Água Branca":{e:8,m:6},"Zabumba":{e:9,m:6},"Sul":{e:16,m:12},"Centro":{e:10,m:7},"Armação":{e:14,m:10},"Curral":{e:10,m:7}}},
  {id:3,nome:"Farmácia Central",tel:"(12) 3894-5566",bairro:"Centro",cnpj:"34.567.890/0001-12",nomeDono:"Maria Aparecida Lima",telDono:"(12) 99903-3333",nomeSocio:"Carlos Lima",telSocio:"(12) 99903-4444",enderecoEstab:"Rua do Comércio, 12, Centro, Ilhabela/SP",planoPagamento:"semanal",planoPagamentoMotoboy:"semanal",planoGratis:false,dataFimGratis:null,bloqueado:true,mensalidadePaga:false,pagamentosDiarios:{},taxas:{"Perequê":{e:11,m:8},"Vila":{e:10,m:7},"Barra Velha":{e:13,m:9},"Itaquanduba":{e:10,m:7},"Água Branca":{e:11,m:8},"Zabumba":{e:9,m:6},"Sul":{e:17,m:12},"Centro":{e:6,m:4},"Armação":{e:14,m:10},"Curral":{e:11,m:8}}},
  {id:4,nome:"Supermercado Norte",tel:"(12) 3894-7788",bairro:"Barra Velha",cnpj:"45.678.901/0001-23",nomeDono:"Roberto Alves Costa",telDono:"(12) 99904-5555",nomeSocio:"Ana Paula Costa",telSocio:"(12) 99904-6666",enderecoEstab:"Estrada do Sul, 800, Barra Velha, Ilhabela/SP",planoPagamento:"semanal",planoPagamentoMotoboy:"diario",planoGratis:false,dataFimGratis:null,bloqueado:false,mensalidadePaga:true,pagamentosDiarios:{"2026-06-09":true,"2026-06-08":true,"2026-06-07":true,"2026-06-06":true,"2026-06-05":true,"2026-06-04":true,"2026-06-03":true},taxas:{"Perequê":{e:13,m:9},"Vila":{e:12,m:9},"Barra Velha":{e:7,m:5},"Itaquanduba":{e:10,m:7},"Água Branca":{e:12,m:9},"Zabumba":{e:9,m:6},"Sul":{e:15,m:11},"Centro":{e:11,m:8},"Armação":{e:16,m:11},"Curral":{e:11,m:8}}},
];

const CLI_INIT = [
  {id:1,nome:"João da Silva",tel:"(12) 99801-1111",endereco:{rua:"Rua das Flores",num:"45",bairro:"Perequê",ref:"Casa verde, portão de ferro"}},
  {id:2,nome:"Maria Santos",tel:"(12) 99802-2222",endereco:{rua:"Rua do Sol",num:"120",bairro:"Vila",ref:"Prédio azul, apto 3B"}},
  {id:3,nome:"Pedro Almeida",tel:"(12) 99803-3333",endereco:{rua:"Av. Beira Mar",num:"300",bairro:"Barra Velha",ref:"Em frente ao quiosque"}},
  {id:4,nome:"Ana Costa",tel:"(12) 99804-4444",endereco:{rua:"Rua Central",num:"88",bairro:"Centro",ref:"Casa amarela"}},
  {id:5,nome:"Lucas Ferreira",tel:"(12) 99805-5555",endereco:{rua:"Estrada da Ilha",num:"210",bairro:"Sul",ref:"Sítio depois da curva"}},
];

function gerarHist(mbs, emps) {
  const h = []; let id = 1;
  const nomes = ["João da Silva","Maria Santos","Pedro Almeida","Ana Costa","Lucas Ferreira"];
  for (let mes = 4; mes <= 6; mes++) {
    mbs.filter(m=>!m.banido).forEach(mb => {
      const qtd = Math.floor(Math.random()*16)+8;
      for (let i = 0; i < qtd; i++) {
        const emp = emps[Math.floor(Math.random()*emps.length)];
        const bKeys = Object.keys(emp.taxas);
        const bairro = bKeys[Math.floor(Math.random()*bKeys.length)];
        const t = emp.taxas[bairro] || {e:10,m:7};
        const pgs = ["pix","pix","dinheiro","cartao"];
        const pg = pgs[Math.floor(Math.random()*pgs.length)];
        const dia = Math.floor(Math.random()*27)+1;
        const sem = dia<=7?1:dia<=14?2:dia<=21?3:4;
        const hSaidaH = Math.floor(Math.random()*12)+10; // 10h-22h
        const hSaidaM = Math.floor(Math.random()*60);
        const horaSaida = `${String(hSaidaH).padStart(2,"0")}:${String(hSaidaM).padStart(2,"0")}`;
        const minEntrega = Math.floor(Math.random()*20)+8; // 8 a 28 min de entrega
        const dEntrega = new Date(2026,0,1,hSaidaH,hSaidaM+minEntrega);
        const horaEntrega = `${String(dEntrega.getHours()).padStart(2,"0")}:${String(dEntrega.getMinutes()).padStart(2,"0")}`;
        h.push({id:id++,motoboyId:mb.id,empresarioId:emp.id,clienteNome:nomes[Math.floor(Math.random()*nomes.length)],bairro,pagamento:pg,taxaEmpresario:t.e,taxaMotoboy:t.m,lucro:t.e-t.m,status:Math.random()>0.08?"Entregue":"Cancelada",data:`2026-${String(mes).padStart(2,"0")}-${String(dia).padStart(2,"0")}`,horaSaida,horaEntrega,mes,semana:sem,repasePago:mes<6||(mes===6&&sem<3)});
      }
    });
  }
  return h;
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"18px 22px",...style}}>{children}</div>;
}
function Inp({ label, value, onChange, placeholder="", type="text", hint }) {
  return (
    <div style={{marginBottom:10}}>
      {label && <div style={{color:"#9ca3af",fontSize:12,marginBottom:4,fontWeight:600}}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
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
function Btn({ children, onClick, cor="verde", small, full, disabled }) {
  const cores = {verde:{bg:"#10b981",c:"#fff"},perigo:{bg:"#ef4444",c:"#fff"},cinza:{bg:"#1f2937",c:"#d1d5db"},amarelo:{bg:"#f59e0b",c:"#000"},azul:{bg:"#3b82f6",c:"#fff"},roxo:{bg:"#7c3aed",c:"#fff"}};
  const c = cores[cor] || cores.verde;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:c.bg,color:c.c,border:"none",borderRadius:8,padding:small?"5px 12px":"10px 18px",fontSize:small?12:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,width:full?"100%":"auto"}}>
      {children}
    </button>
  );
}
function Stat({ label, value, sub, cor="#34d399", icon="" }) {
  return (
    <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"14px 18px",flex:1,minWidth:110}}>
      <div style={{color:"#6b7280",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{icon} {label}</div>
      <div style={{color:cor,fontSize:22,fontWeight:800,lineHeight:1}}>{value}</div>
      {sub && <div style={{color:"#6b7280",fontSize:11,marginTop:3}}>{sub}</div>}
    </div>
  );
}
function Tag({ label, cor="#34d399" }) {
  return <span style={{background:cor+"22",color:cor,padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:700,border:`1px solid ${cor}44`}}>{label}</span>;
}
function Bar({ val, max, cor="#34d399" }) {
  return (
    <div style={{background:"#1f2937",borderRadius:4,height:6,marginTop:5}}>
      <div style={{background:cor,borderRadius:4,height:6,width:`${Math.min(100,Math.round((val/Math.max(max,1))*100))}%`}}/>
    </div>
  );
}
function Overlay({ children, onClose, maxW=540, borderColor="#1f2937" }) {
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
function SectionTitle({ children }) { return <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{children}</div>; }

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ historico, motoboys, empresarios }) {
  const ent = historico.filter(e=>e.status==="Entregue");
  const m6  = ent.filter(e=>e.mes===6);
  const lucroTotal = ent.reduce((s,e)=>s+e.lucro,0).toFixed(2);
  const lucroMes   = m6.reduce((s,e)=>s+e.lucro,0).toFixed(2);
  const taxasMes   = m6.reduce((s,e)=>s+e.taxaEmpresario,0).toFixed(2);
  const empAtivos  = empresarios.filter(e=>!e.planoGratis&&!e.bloqueado).length;
  const mensMes    = (empAtivos*MENSALIDADE*4).toFixed(2);
  const fatMes     = (parseFloat(taxasMes)+parseFloat(mensMes)).toFixed(2);
  const pagoMb     = m6.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2);

  const ranking = motoboys.filter(m=>!m.banido).map(mb=>{
    const mine = m6.filter(e=>e.motoboyId===mb.id);
    return {...mb, qtd:mine.length, ganhos:mine.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2)};
  }).sort((a,b)=>b.qtd-a.qtd);
  const maxQ = ranking[0]?.qtd || 1;

  const porMes = MESES.slice(0,6).map((mes,i)=>{
    const e = ent.filter(x=>x.mes===i+1);
    return {mes, qtd:e.length, lucro:e.reduce((s,x)=>s+x.lucro,0).toFixed(2)};
  });
  const maxMes = Math.max(...porMes.map(p=>p.qtd), 1);

  const porEmp = empresarios.map(emp=>{
    const e = m6.filter(x=>x.empresarioId===emp.id);
    return {...emp, qtd:e.length, fat:e.reduce((s,x)=>s+x.taxaEmpresario,0).toFixed(2)};
  }).sort((a,b)=>b.qtd-a.qtd);
  const maxEmp = Math.max(...porEmp.map(p=>p.qtd), 1);

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:22}}>📊 Dashboard</div>
        <div style={{color:"#6b7280",fontSize:13}}>Visão geral — Jun 2026</div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <Stat icon="✅" label="Entregas este mês" value={m6.length} sub={`${ent.length} total histórico`} cor="#34d399"/>
        <Stat icon="💰" label="Faturado este mês" value={`R$${fatMes}`} sub={`Taxas R$${taxasMes} + Mensalidades R$${mensMes}`} cor="#60a5fa"/>
        <Stat icon="🏍️" label="Pago motoboys" value={`R$${pagoMb}`} sub="taxas repassadas este mês" cor="#fbbf24"/>
        <Stat icon="💵" label="Seu lucro mês" value={`R$${lucroMes}`} sub={`R$${lucroTotal} total acumulado`} cor="#a78bfa"/>
        <Stat icon="🟢" label="Motoboys online" value={motoboys.filter(m=>m.online&&!m.banido).length} sub={`de ${motoboys.filter(m=>!m.banido).length} ativos`} cor="#34d399"/>
        <Stat icon="🏪" label="Estabelecimentos" value={empresarios.filter(e=>!e.bloqueado).length} sub={`${empresarios.filter(e=>e.bloqueado).length} bloqueado(s)`} cor="#60a5fa"/>
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <Card style={{flex:2,minWidth:240}}>
          <SectionTitle>Entregas por mês</SectionTitle>
          {porMes.map(p=>(
            <div key={p.mes} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{color:"#d1d5db",fontSize:13,fontWeight:600}}>{p.mes}</span>
                <span style={{color:"#34d399",fontSize:13,fontWeight:700}}>{p.qtd} entregas · <span style={{color:"#a78bfa"}}>R${p.lucro} lucro</span></span>
              </div>
              <Bar val={p.qtd} max={maxMes}/>
            </div>
          ))}
        </Card>
        <Card style={{flex:2,minWidth:240}}>
          <SectionTitle>📦 Entregas por Estabelecimento — Jun</SectionTitle>
          {porEmp.map(emp=>(
            <div key={emp.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{color:"#d1d5db",fontSize:13,fontWeight:600}}>{emp.nome.split(" ").slice(0,2).join(" ")}</span>
                <span style={{color:"#60a5fa",fontSize:13,fontWeight:700}}>{emp.qtd} ent. · <span style={{color:"#34d399"}}>R${emp.fat}</span></span>
              </div>
              <Bar val={emp.qtd} max={maxEmp} cor="#60a5fa"/>
            </div>
          ))}
        </Card>
        <Card style={{flex:2,minWidth:240}}>
          <SectionTitle>🏆 Ranking Motoboys — Jun</SectionTitle>
          {ranking.map((mb,i)=>(
            <div key={mb.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,background:i===0?"#f59e0b":i===1?"#9ca3af":i===2?"#b45309":"#1f2937",color:i<3?"#000":"#6b7280"}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#f9fafb",fontSize:13,fontWeight:700}}>{mb.nomeCompleto.split(" ").slice(0,2).join(" ")}</span>
                  <span style={{color:"#60a5fa",fontSize:13,fontWeight:700}}>{mb.qtd}</span>
                </div>
                <Bar val={mb.qtd} max={maxQ} cor={i===0?"#f59e0b":"#34d399"}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                  <span style={{color:"#6b7280",fontSize:11}}>R${mb.ganhos} ganhos</span>
                  <span style={{color:mb.online?"#34d399":"#4b5563",fontSize:11}}>{mb.online?"🟢":"⚫"}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── REPASSE ──────────────────────────────────────────────────────────────────
function Repasse({ historico, setHistorico, motoboys, empresarios }) {
  const [semana, setSemana] = useState("atual");
  const [detalhe, setDetalhe] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [bonusValor, setBonusValor] = useState("");
  const [bonusDesc, setBonusDesc] = useState("");

  const sems = { atual:{mes:6,s:3,label:"10–16 Jun 2026"}, anterior:{mes:6,s:2,label:"03–09 Jun 2026"} };
  const sem = sems[semana];
  const fonte = historico.filter(e=>e.status==="Entregue"&&e.mes===sem.mes&&e.semana===sem.s&&(semana==="atual"?!e.repasePago:e.repasePago));

  const dadosMb = motoboys.filter(m=>!m.banido).map(mb=>{
    const ents = fonte.filter(e=>e.motoboyId===mb.id);
    return {...mb, ents, qtd:ents.length, total:+ents.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2)};
  }).filter(m=>m.qtd>0).sort((a,b)=>b.total-a.total);

  const dadosEmp = empresarios.map(emp=>{
    const ents = fonte.filter(e=>e.empresarioId===emp.id);
    const valorPlano = emp.planoPagamento==="mensal" ? MENSALIDADE*4 : MENSALIDADE;
    const mens = (!emp.planoGratis&&!emp.mensalidadePaga)?valorPlano:0;
    const taxas = +ents.reduce((s,e)=>s+e.taxaEmpresario,0).toFixed(2);
    return {...emp, ents, qtd:ents.length, taxas, mensalidade:mens, total:+(taxas+mens).toFixed(2)};
  }).filter(e=>e.qtd>0||e.mensalidade>0);

  const totalCobrar = dadosEmp.reduce((s,e)=>s+e.total,0).toFixed(2);
  const totalPagar  = dadosMb.reduce((s,m)=>s+m.total,0).toFixed(2);
  const lucro = (totalCobrar-totalPagar).toFixed(2);

  function marcarPago(mbId) {
    setHistorico(p=>p.map(e=>e.motoboyId===mbId&&e.mes===sem.mes&&e.semana===sem.s?{...e,repasePago:true}:e));
  }

  const mbDet = detalhe ? motoboys.find(m=>m.id===detalhe) : null;
  const entsDet = detalhe ? fonte.filter(e=>e.motoboyId===detalhe) : [];
  const totalDet = entsDet.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>💰 Repasse Semanal</div>
          <div style={{color:"#6b7280",fontSize:13}}>Segunda cobrar empresários · Terça pagar motoboys</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {["atual","anterior"].map(k=>(
            <button key={k} onClick={()=>setSemana(k)} style={{padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,background:semana===k?"#0d3d2e":"#1f2937",border:semana===k?"1px solid #34d399":"1px solid #374151",color:semana===k?"#34d399":"#6b7280"}}>
              {k==="atual"?"Semana atual":"Semana anterior"}
            </button>
          ))}
        </div>
      </div>
      <div style={{background:"#0f172a",borderRadius:10,padding:"11px 16px",marginBottom:14}}>
        <span style={{color:"#9ca3af",fontSize:12}}>📅 {sem.label}</span>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <Stat icon="📋" label="Cobrar empresários" value={`R$${totalCobrar}`} cor="#60a5fa"/>
        <Stat icon="🏍️" label="Pagar motoboys" value={`R$${totalPagar}`} cor="#fbbf24"/>
        <Stat icon="💵" label="Seu lucro semana" value={`R$${lucro}`} cor="#34d399"/>
        <Stat icon="📦" label="Total entregas" value={fonte.length} cor="#9ca3af"/>
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:300}}>
          <div style={{color:"#fbbf24",fontWeight:800,fontSize:14,marginBottom:10}}>🏍️ Pagar aos Motoboys</div>
          {dadosMb.length===0 && <Card><div style={{color:"#4b5563"}}>Nenhuma entrega pendente.</div></Card>}
          {dadosMb.map(mb=>(
            <Card key={mb.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{color:"#f9fafb",fontWeight:800,fontSize:15}}>{mb.nomeCompleto.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{color:"#6b7280",fontSize:12}}>PIX: {mb.pix}</div>
                  <div style={{color:"#9ca3af",fontSize:12}}>{mb.qtd} entrega{mb.qtd!==1?"s":""}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#6b7280",fontSize:11}}>A pagar terça-feira</div>
                  <div style={{color:"#fbbf24",fontWeight:900,fontSize:26}}>R${mb.total}</div>
                </div>
              </div>
              <div style={{background:"#0f172a",borderRadius:8,padding:"8px 12px",marginBottom:10}}>
                {mb.ents.slice(0,4).map(e=>(
                  <div key={e.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                    <span style={{color:"#9ca3af"}}>{e.data} · {e.bairro}</span>
                    <span style={{color:"#34d399",fontWeight:700}}>R${e.taxaMotoboy}</span>
                  </div>
                ))}
                {mb.ents.length>4 && <div style={{color:"#4b5563",fontSize:11}}>+{mb.ents.length-4} entregas</div>}
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Btn small cor="cinza" onClick={()=>setDetalhe(mb.id)}>📋 Extrato completo</Btn>
                <Btn small cor="amarelo" onClick={()=>marcarPago(mb.id)}>✅ Paguei R${mb.total}</Btn>
                <Btn small cor="roxo" onClick={()=>{setBonus(mb.id);setBonusValor("");setBonusDesc("");}}>🏆 Bônus</Btn>
              </div>
            </Card>
          ))}
        </div>
        <div style={{flex:1,minWidth:280}}>
          <div style={{color:"#60a5fa",fontWeight:800,fontSize:14,marginBottom:10}}>📋 Cobrar dos Empresários</div>
          {dadosEmp.length===0 && <Card><div style={{color:"#4b5563"}}>Nenhum a cobrar.</div></Card>}
          {dadosEmp.map(emp=>(
            <Card key={emp.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{color:"#f9fafb",fontWeight:700,fontSize:14}}>{emp.nome}</div>
                  <div style={{color:"#6b7280",fontSize:12}}>📞 {emp.tel} · {emp.qtd} entrega{emp.qtd!==1?"s":""}</div>
                </div>
                <div style={{color:"#60a5fa",fontWeight:900,fontSize:22}}>R${emp.total}</div>
              </div>
              <div style={{background:"#0f172a",borderRadius:8,padding:"8px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{color:"#9ca3af"}}>Taxas de entrega</span>
                  <span style={{color:"#60a5fa",fontWeight:700}}>R${emp.taxas}</span>
                </div>
                {emp.mensalidade>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                    <span style={{color:"#ef4444"}}>Mensalidade pendente</span>
                    <span style={{color:"#ef4444",fontWeight:700}}>R${emp.mensalidade}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {detalhe && mbDet && (
        <Overlay onClose={()=>setDetalhe(null)} maxW={580}>
          <OvHeader titulo={mbDet.nomeCompleto} sub={`Extrato — ${sem.label}`} onClose={()=>setDetalhe(null)}/>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <Stat label="Entregas" value={entsDet.length} cor="#60a5fa"/>
            <Stat label="Total a pagar" value={`R$${totalDet}`} cor="#fbbf24"/>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"#0f172a"}}>
                {["Data","Saiu às","Cliente","Bairro","Pgto","Valor"].map(h=>(
                  <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entsDet.map(e=>(
                <tr key={e.id} style={{borderBottom:"1px solid #1a2035"}}>
                  <td style={{padding:"8px 12px",color:"#9ca3af",fontSize:12}}>{e.data}</td>
                  <td style={{padding:"8px 12px",color:"#fbbf24",fontSize:12,fontWeight:700}}>🏍️ {e.horaSaida||"—"}</td>
                  <td style={{padding:"8px 12px",color:"#f9fafb"}}>{e.clienteNome}</td>
                  <td style={{padding:"8px 12px",color:"#34d399"}}>{e.bairro}</td>
                  <td style={{padding:"8px 12px"}}><span style={{color:PG[e.pagamento]?.cor,fontWeight:700}}>{PG[e.pagamento]?.icon}</span></td>
                  <td style={{padding:"8px 12px",color:"#fbbf24",fontWeight:700}}>R${e.taxaMotoboy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:14,background:"#0f172a",borderRadius:8,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"#9ca3af",fontWeight:700}}>TOTAL A PAGAR</span>
            <span style={{color:"#fbbf24",fontWeight:900,fontSize:22}}>R${totalDet}</span>
          </div>
        </Overlay>
      )}

      {bonus && (
        <Overlay onClose={()=>setBonus(null)} maxW={420} borderColor="#7c3aed">
          <OvHeader titulo="🏆 Registrar Bônus" sub={motoboys.find(m=>m.id===bonus)?.nomeCompleto} onClose={()=>setBonus(null)}/>
          <Inp label="Valor do bônus (R$)" value={bonusValor} onChange={setBonusValor} type="number" placeholder="Ex: 300"/>
          <Inp label="Motivo" value={bonusDesc} onChange={setBonusDesc} placeholder="Ex: Motoboy do mês — Junho 2026"/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn cor="roxo" full onClick={()=>setBonus(null)} disabled={!bonusValor||!bonusDesc}>🏆 Confirmar Bônus</Btn>
            <Btn cor="cinza" onClick={()=>setBonus(null)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── MOTOBOYS ─────────────────────────────────────────────────────────────────
function Motoboys({ motoboys, setMotoboys, historico }) {
  const [aba, setAba] = useState("ativos");
  const [detalhe, setDetalhe] = useState(null);
  const [modalCad, setModalCad] = useState(false);
  const [modalBanir, setModalBanir] = useState(null);
  const [motivo, setMotivo] = useState("");
  const FVAZIO = {nomeCompleto:"",tel:"",pix:"",bairroBase:BAIRROS[0],cpf:"",rg:"",nascimento:"",nomePai:"",nomeMae:"",endereco:""};
  const [form, setForm] = useState(FVAZIO);

  const ativos  = motoboys.filter(m=>!m.banido);
  const banidos = motoboys.filter(m=>m.banido);

  function cadastrar() {
    if (!form.nomeCompleto.trim()) return;
    setMotoboys(p=>[...p,{id:Date.now(),...form,online:false,ativo:true,banido:false,motivoBanimento:null,dataBanimento:null}]);
    setModalCad(false); setForm(FVAZIO);
  }
  function bloquear(id) { setMotoboys(p=>p.map(m=>m.id===id?{...m,ativo:!m.ativo}:m)); }
  function banir(id) {
    if (!motivo.trim()) return;
    setMotoboys(p=>p.map(m=>m.id===id?{...m,banido:true,ativo:false,online:false,motivoBanimento:motivo,dataBanimento:"2026-06-10"}:m));
    setModalBanir(null); setMotivo(""); setDetalhe(null);
  }
  function desbanir(id) { setMotoboys(p=>p.map(m=>m.id===id?{...m,banido:false,ativo:true,motivoBanimento:null,dataBanimento:null}:m)); }

  const mbDet = detalhe ? motoboys.find(m=>m.id===detalhe) : null;
  const histDet = detalhe ? historico.filter(e=>e.motoboyId===detalhe&&e.status==="Entregue") : [];
  const histMensal = MESES.slice(0,6).map((mes,i)=>{
    const e = histDet.filter(x=>x.mes===i+1);
    return {mes, qtd:e.length, ganhos:e.reduce((s,x)=>s+x.taxaMotoboy,0).toFixed(2)};
  });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>🏍️ Motoboys</div>
          <div style={{color:"#6b7280",fontSize:13}}>
            {ativos.length} ativos · {motoboys.filter(m=>m.online).length} online
            {banidos.length>0 && <span style={{color:"#ef4444",fontWeight:700,marginLeft:10}}>⛔ {banidos.length} banido(s)</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{display:"flex",border:"1px solid #374151",borderRadius:8,overflow:"hidden"}}>
            {[["ativos","✅ Ativos"],["banidos","⛔ Banidos"]].map(([id,label])=>(
              <button key={id} onClick={()=>setAba(id)} style={{background:aba===id?"#0d3d2e":"transparent",color:aba===id?"#34d399":"#6b7280",border:"none",padding:"7px 14px",cursor:"pointer",fontWeight:700,fontSize:13}}>
                {label}{id==="banidos"&&banidos.length>0?` (${banidos.length})`:""}
              </button>
            ))}
          </div>
          <Btn onClick={()=>setModalCad(true)}>+ Cadastrar Motoboy</Btn>
        </div>
      </div>

      {aba==="ativos" && ativos.map(mb=>{
        const ents = historico.filter(e=>e.motoboyId===mb.id&&e.status==="Entregue");
        const entsMes = ents.filter(e=>e.mes===6);
        const saldo = ents.filter(e=>!e.repasePago).reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2);
        const totalHist = ents.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2);
        const borda = !mb.ativo?"1px solid #f59e0b":"1px solid #1f2937";
        return (
          <Card key={mb.id} style={{marginBottom:10,border:borda}}>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:180}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{color:"#f9fafb",fontWeight:800,fontSize:15}}>{mb.nomeCompleto}</span>
                  <Tag label={mb.online?"🟢 Online":"⚫ Offline"} cor={mb.online?"#34d399":"#4b5563"}/>
                  {!mb.ativo && <Tag label="🔒 Bloqueado" cor="#f59e0b"/>}
                </div>
                <div style={{color:"#6b7280",fontSize:12}}>📞 {mb.tel} · PIX: {mb.pix} · Bairro base: {mb.bairroBase}</div>
                {mb.cpf && <div style={{color:"#4b5563",fontSize:11,marginTop:2}}>CPF: {mb.cpf}</div>}
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <div style={{textAlign:"center"}}><div style={{color:"#60a5fa",fontWeight:800,fontSize:18}}>{entsMes.length}</div><div style={{color:"#6b7280",fontSize:10}}>entregas este mês</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#fbbf24",fontWeight:800,fontSize:16}}>R${saldo}</div><div style={{color:"#6b7280",fontSize:10}}>a receber esta semana</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#a78bfa",fontWeight:700,fontSize:14}}>R${totalHist}</div><div style={{color:"#6b7280",fontSize:10}}>total já pago a ele</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#34d399",fontWeight:700,fontSize:14}}>{ents.length}</div><div style={{color:"#6b7280",fontSize:10}}>entregas desde o início</div></div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Btn small cor="cinza" onClick={()=>setDetalhe(mb.id)}>📋 Detalhes</Btn>
                <Btn small cor={mb.ativo?"cinza":"amarelo"} onClick={()=>bloquear(mb.id)}>{mb.ativo?"🔒 Bloquear":"🔓 Desbloquear"}</Btn>
                <Btn small cor="perigo" onClick={()=>{setModalBanir(mb.id);setMotivo("");}}>⛔ Banir</Btn>
              </div>
            </div>
          </Card>
        );
      })}

      {aba==="banidos" && (banidos.length===0
        ? <Card><div style={{color:"#4b5563",textAlign:"center",padding:20}}>Nenhum motoboy banido.</div></Card>
        : banidos.map(mb=>(
          <Card key={mb.id} style={{marginBottom:10,background:"#1a0a0a",border:"1px solid #ef4444"}}>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{color:"#f87171",fontWeight:800,fontSize:15}}>{mb.nomeCompleto}</span>
                  <Tag label="⛔ BANIDO" cor="#ef4444"/>
                </div>
                <div style={{background:"#0f172a",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                  <SectionTitle>📋 Dados para registro legal</SectionTitle>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[["Nome",mb.nomeCompleto],["CPF",mb.cpf],["RG",mb.rg],["Nascimento",mb.nascimento],["Pai",mb.nomePai],["Mãe",mb.nomeMae],["Endereço",mb.endereco],["Tel",mb.tel]].map(([l,v])=>(
                      <div key={l}><div style={{color:"#4b5563",fontSize:10}}>{l}</div><div style={{color:"#d1d5db",fontSize:12,fontWeight:600}}>{v||"—"}</div></div>
                    ))}
                  </div>
                </div>
                <div style={{background:"#3d1010",borderRadius:8,padding:"8px 12px"}}>
                  <div style={{color:"#f87171",fontWeight:700,fontSize:12}}>Motivo: {mb.motivoBanimento}</div>
                  <div style={{color:"#6b7280",fontSize:11,marginTop:2}}>Data: {mb.dataBanimento}</div>
                </div>
              </div>
              <Btn small cor="cinza" onClick={()=>desbanir(mb.id)}>🔓 Remover</Btn>
            </div>
          </Card>
        ))
      )}

      {detalhe && mbDet && (
        <Overlay onClose={()=>setDetalhe(null)} maxW={660}>
          <OvHeader titulo={mbDet.nomeCompleto} sub={`📞 ${mbDet.tel} · PIX: ${mbDet.pix}`} onClose={()=>setDetalhe(null)}/>
          <Card style={{marginBottom:14,padding:"14px 16px",background:"#0f172a"}}>
            <SectionTitle>📋 Dados Cadastrais</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Nome completo",mbDet.nomeCompleto],["CPF",mbDet.cpf],["RG",mbDet.rg],["Nascimento",mbDet.nascimento],["Nome do pai",mbDet.nomePai],["Nome da mãe",mbDet.nomeMae],["Endereço",mbDet.endereco],["Bairro base",mbDet.bairroBase]].map(([l,v])=>(
                <div key={l}><div style={{color:"#4b5563",fontSize:11}}>{l}</div><div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{v||"—"}</div></div>
              ))}
            </div>
          </Card>
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
            <Stat label="Total entregas" value={histDet.length} sub="desde o início" cor="#60a5fa"/>
            <Stat label="Total já pago a ele" value={`R$${histDet.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2)}`} sub="histórico acumulado" cor="#fbbf24"/>
            <Stat label="A receber esta semana" value={`R$${histDet.filter(e=>!e.repasePago).reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2)}`} cor="#34d399"/>
          </div>
          <SectionTitle>Histórico Mensal</SectionTitle>
          <div style={{display:"flex",border:"1px solid #1f2937",borderRadius:10,overflow:"hidden",marginBottom:14}}>
            {histMensal.map((h,i)=>(
              <div key={h.mes} style={{flex:1,textAlign:"center",padding:"10px 4px",borderRight:i<5?"1px solid #1f2937":"none",background:h.qtd>0?"#0f172a":"transparent"}}>
                <div style={{color:"#6b7280",fontSize:11}}>{h.mes}</div>
                <div style={{color:"#60a5fa",fontWeight:800,fontSize:18,marginTop:3}}>{h.qtd}</div>
                <div style={{color:"#34d399",fontSize:11}}>R${h.ganhos}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn cor={mbDet.ativo?"cinza":"amarelo"} onClick={()=>{bloquear(mbDet.id);setDetalhe(null);}}>{mbDet.ativo?"🔒 Bloquear":"🔓 Desbloquear"}</Btn>
            <Btn cor="perigo" onClick={()=>{setDetalhe(null);setModalBanir(mbDet.id);setMotivo("");}}>⛔ Banir</Btn>
          </div>
        </Overlay>
      )}

      {modalBanir && (
        <Overlay onClose={()=>setModalBanir(null)} maxW={460} borderColor="#ef4444">
          <OvHeader titulo="⛔ Banir Motoboy" sub={motoboys.find(m=>m.id===modalBanir)?.nomeCompleto} onClose={()=>setModalBanir(null)}/>
          <div style={{color:"#9ca3af",fontSize:13,marginBottom:14}}>O motoboy será removido. Dados ficam registrados para uso legal.</div>
          <div style={{marginBottom:14}}>
            <div style={{color:"#9ca3af",fontSize:12,fontWeight:600,marginBottom:6}}>Motivo do banimento *</div>
            <textarea value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Descreva detalhadamente." rows={4}
              style={{background:"#0f172a",border:"1px solid #ef4444",borderRadius:8,color:"#f9fafb",padding:"10px 12px",width:"100%",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn cor="perigo" full onClick={()=>banir(modalBanir)} disabled={!motivo.trim()}>⛔ Confirmar banimento</Btn>
            <Btn cor="cinza" onClick={()=>setModalBanir(null)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}

      {modalCad && (
        <Overlay onClose={()=>setModalCad(false)} maxW={520}>
          <OvHeader titulo="Cadastrar Motoboy" onClose={()=>setModalCad(false)}/>
          <SectionTitle>Dados de contato</SectionTitle>
          <Inp label="Nome completo *" value={form.nomeCompleto} onChange={v=>setForm(f=>({...f,nomeCompleto:v}))} placeholder="Ex: Carlos Eduardo Silva"/>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="Telefone *" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))} placeholder="(12) 99999-0000"/></div>
            <div style={{flex:1}}><Inp label="Chave PIX *" value={form.pix} onChange={v=>setForm(f=>({...f,pix:v}))} placeholder="CPF, tel ou e-mail"/></div>
          </div>
          <SelInput label="Bairro base" value={form.bairroBase} onChange={v=>setForm(f=>({...f,bairroBase:v}))}>
            {BAIRROS.map(b=><option key={b}>{b}</option>)}
          </SelInput>
          <Divider/>
          <SectionTitle>Documentos e filiação</SectionTitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="CPF" value={form.cpf} onChange={v=>setForm(f=>({...f,cpf:v}))} placeholder="000.000.000-00"/></div>
            <div style={{flex:1}}><Inp label="RG" value={form.rg} onChange={v=>setForm(f=>({...f,rg:v}))} placeholder="00.000.000-0"/></div>
          </div>
          <Inp label="Data de nascimento" value={form.nascimento} onChange={v=>setForm(f=>({...f,nascimento:v}))} placeholder="Ex: 15/03/1995" hint="Digite no formato DD/MM/AAAA"/>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="Nome completo do pai" value={form.nomePai} onChange={v=>setForm(f=>({...f,nomePai:v}))} placeholder="Nome completo"/></div>
            <div style={{flex:1}}><Inp label="Nome completo da mãe" value={form.nomeMae} onChange={v=>setForm(f=>({...f,nomeMae:v}))} placeholder="Nome completo"/></div>
          </div>
          <Inp label="Endereço residencial completo" value={form.endereco} onChange={v=>setForm(f=>({...f,endereco:v}))} placeholder="Ex: Rua das Flores, 45, Perequê, Ilhabela/SP"/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={cadastrar} full>Cadastrar</Btn>
            <Btn cor="cinza" onClick={()=>setModalCad(false)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── ESTABELECIMENTOS ─────────────────────────────────────────────────────────
function Estabelecimentos({ empresarios, setEmpresarios, historico }) {
  const [sel, setSel] = useState(null);
  const [abaEmp, setAbaEmp] = useState("geral");
  const [taxasEdit, setTaxasEdit] = useState({});
  const [taxaSalva, setTaxaSalva] = useState(false);
  const [novoBairro, setNovoBairro] = useState("");
  const [bairroEditando, setBairroEditando] = useState(null);
  const [novoNomeBairro, setNovoNomeBairro] = useState("");
  const [modalCad, setModalCad] = useState(false);
  const [mesesGratis, setMesesGratis] = useState("0");
  const FVAZIO = {nome:"",tel:"",bairro:"",planoPagamento:"semanal",planoPagamentoMotoboy:"diario",cnpj:"",nomeDono:"",telDono:"",nomeSocio:"",telSocio:"",enderecoEstab:""};
  const [form, setForm] = useState(FVAZIO);

  const DIAS = ["2026-06-09","2026-06-08","2026-06-07","2026-06-06","2026-06-05","2026-06-04","2026-06-03"];
  const DNOMES = {"2026-06-09":"Seg","2026-06-08":"Dom","2026-06-07":"Sáb","2026-06-06":"Sex","2026-06-05":"Qui","2026-06-04":"Qua","2026-06-03":"Ter"};
  const empSel = empresarios.find(e=>e.id===sel);

  function abrirEmp(emp) { setSel(emp.id); setAbaEmp("geral"); setTaxasEdit(JSON.parse(JSON.stringify(emp.taxas||{}))); setTaxaSalva(false); }

  function salvarTaxas() {
    setEmpresarios(p=>p.map(e=>e.id===sel?{...e,taxas:taxasEdit}:e));
    setTaxaSalva(true);
    setTimeout(()=>setTaxaSalva(false),3000);
  }

  function adicionarBairro() {
    if (!novoBairro.trim()) return;
    setTaxasEdit(p=>({...p,[novoBairro]:{e:0,m:0}}));
    setNovoBairro("");
  }

  function excluirBairro(b) {
    setTaxasEdit(p=>{ const novo={...p}; delete novo[b]; return novo; });
  }

  function renomearBairro(bAntigo) {
    if (!novoNomeBairro.trim() || novoNomeBairro===bAntigo) { setBairroEditando(null); return; }
    setTaxasEdit(p=>{
      const novo={};
      Object.entries(p).forEach(([k,v])=>{ novo[k===bAntigo?novoNomeBairro:k]=v; });
      return novo;
    });
    setBairroEditando(null);
  }

  function ativarGratis(id, meses) {
    setEmpresarios(p=>p.map(e=>{
      if (e.id!==id) return e;
      if (meses===0) return {...e,planoGratis:false,dataFimGratis:null};
      if (meses===-1) return {...e,planoGratis:true,dataFimGratis:"∞",mensalidadePaga:true,bloqueado:false};
      const fim = new Date("2026-06-10"); fim.setMonth(fim.getMonth()+meses);
      return {...e,planoGratis:true,dataFimGratis:fim.toISOString().split("T")[0],mensalidadePaga:true,bloqueado:false};
    }));
  }

  function toggleBloqueio(id) { setEmpresarios(p=>p.map(e=>e.id===id?{...e,bloqueado:!e.bloqueado}:e)); }
  function marcarMensalidade(id) { setEmpresarios(p=>p.map(e=>e.id===id?{...e,mensalidadePaga:true,bloqueado:false}:e)); }
  function toggleDia(id, dia) { setEmpresarios(p=>p.map(e=>e.id===id?{...e,pagamentosDiarios:{...e.pagamentosDiarios,[dia]:!e.pagamentosDiarios?.[dia]}}:e)); }

  function cadastrar() {
    if (!form.nome.trim()) return;
    const t = {}; BAIRROS.forEach(b=>{t[b]={e:0,m:0};});
    const mg = parseInt(mesesGratis);
    let dataFim = null;
    if (mg>0) { const d=new Date("2026-06-10"); d.setMonth(d.getMonth()+mg); dataFim=d.toISOString().split("T")[0]; }
    setEmpresarios(p=>[...p,{id:Date.now(),...form,taxas:t,planoGratis:mg!==0,dataFimGratis:mg===-1?"∞":dataFim,bloqueado:false,mensalidadePaga:mg!==0,pagamentosDiarios:{}}]);
    setModalCad(false); setForm(FVAZIO); setMesesGratis("0");
  }

  function totalSemana(emp) {
    const ents = historico.filter(e=>e.empresarioId===emp.id&&e.status==="Entregue"&&e.mes===6&&e.semana===3&&!e.repasePago);
    const taxas = ents.reduce((s,e)=>s+e.taxaEmpresario,0);
    const valorPlano = emp.planoPagamento==="mensal" ? MENSALIDADE*4 : MENSALIDADE;
    const mens = emp.planoGratis||emp.mensalidadePaga?0:valorPlano;
    return {taxas:+taxas.toFixed(2), mensalidade:mens, total:+(taxas+mens).toFixed(2), qtd:ents.length};
  }

  function motivoInadimplencia(emp) {
    if (emp.planoGratis) return null;
    const m = [];
    if (!emp.mensalidadePaga) m.push("mensalidade não paga");
    if (emp.planoPagamentoMotoboy==="diario") {
      const pend = DIAS.filter(d=>!emp.pagamentosDiarios?.[d]);
      if (pend.length>0) m.push(`${pend.length} dia(s) de taxas pendentes`);
    }
    return m.length>0 ? m.join(" · ") : null;
  }

  const bloqueados = empresarios.filter(e=>e.bloqueado).length;
  const inadimplentes = empresarios.filter(e=>!e.mensalidadePaga&&!e.planoGratis).length;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>🏪 Estabelecimentos</div>
          <div style={{color:"#6b7280",fontSize:13}}>
            {empresarios.length} cadastrados
            {bloqueados>0 && <span style={{color:"#ef4444",fontWeight:700,marginLeft:10}}>⛔ {bloqueados} bloqueado(s)</span>}
            {inadimplentes>0 && <span style={{color:"#fbbf24",fontWeight:700,marginLeft:10}}>⚠️ {inadimplentes} inadimplente(s)</span>}
          </div>
        </div>
        <Btn onClick={()=>setModalCad(true)}>+ Cadastrar Estabelecimento</Btn>
      </div>

      <div style={{background:"#1a1000",border:"1px solid #f59e0b",borderRadius:10,padding:"11px 16px",marginBottom:14}}>
        <span style={{color:"#fbbf24",fontWeight:700,fontSize:13}}>🔒 Bloqueio automático toda segunda às 09h00 · Mensalidade R${MENSALIDADE}/semana</span>
      </div>

      {empresarios.map(emp=>{
        const ts = totalSemana(emp);
        const motInad = motivoInadimplencia(emp);
        const borda = emp.bloqueado?"1px solid #ef4444":(motInad?"1px solid #f59e0b":"1px solid #1f2937");
        return (
          <Card key={emp.id} style={{marginBottom:10,border:borda}}>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:180}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{color:"#f9fafb",fontWeight:800,fontSize:15}}>{emp.nome}</span>
                  {emp.bloqueado ? <Tag label="⛔ BLOQUEADO" cor="#ef4444"/> : emp.planoGratis ? <Tag label="🎁 Grátis" cor="#a78bfa"/> : <Tag label="✅ Ativo" cor="#34d399"/>}
                  <Tag label={emp.planoPagamento==="mensal"?"🗓️ Mensal":"📋 Semanal"} cor="#60a5fa"/>
                </div>
                <div style={{color:"#6b7280",fontSize:12}}>📍 {emp.bairro} · 📞 {emp.tel}</div>
                {emp.cnpj && <div style={{color:"#4b5563",fontSize:11,marginTop:1}}>CNPJ: {emp.cnpj} · Dono: {emp.nomeDono}</div>}
                {emp.planoGratis && emp.dataFimGratis && <div style={{color:"#a78bfa",fontSize:12,marginTop:2}}>🎁 Grátis até {emp.dataFimGratis}</div>}
                {motInad && <div style={{color:"#fbbf24",fontSize:12,marginTop:2}}>⚠️ Inadimplente: {motInad}</div>}
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{textAlign:"center"}}><div style={{color:"#60a5fa",fontWeight:700,fontSize:16}}>R${ts.taxas}</div><div style={{color:"#6b7280",fontSize:10}}>taxas semana</div></div>
                <div style={{textAlign:"center"}}><div style={{color:emp.planoGratis||emp.mensalidadePaga?"#34d399":"#ef4444",fontWeight:700,fontSize:13}}>{emp.planoGratis?"🎁 Grátis":emp.mensalidadePaga?"✅ Pago":`❌ R$${MENSALIDADE}`}</div><div style={{color:"#6b7280",fontSize:10}}>mensalidade</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#a78bfa",fontWeight:900,fontSize:20}}>R${ts.total}</div><div style={{color:"#6b7280",fontSize:10}}>total a cobrar</div></div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {emp.planoGratis ? <Btn small cor="amarelo" onClick={()=>ativarGratis(emp.id,0)}>💰 Ativar cobrança</Btn> : <Btn small cor="roxo" onClick={()=>ativarGratis(emp.id,1)}>🎁 1 mês grátis</Btn>}
                {!emp.mensalidadePaga&&!emp.planoGratis && <Btn small cor="amarelo" onClick={()=>marcarMensalidade(emp.id)}>💰 Mensalidade paga</Btn>}
                <Btn small cor={emp.bloqueado?"verde":"perigo"} onClick={()=>toggleBloqueio(emp.id)}>{emp.bloqueado?"🔓 Desbloquear":"⛔ Bloquear"}</Btn>
                <Btn small cor="cinza" onClick={()=>abrirEmp(emp)}>⚙️ Gerenciar</Btn>
              </div>
            </div>
          </Card>
        );
      })}

      {sel && empSel && (
        <Overlay onClose={()=>setSel(null)} maxW={660}>
          <OvHeader titulo={empSel.nome} sub={`📍 ${empSel.bairro} · 📞 ${empSel.tel}`} onClose={()=>setSel(null)}/>
          <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid #1f2937"}}>
            {[["geral","📊 Visão Geral"],["pagamentos","💰 Pagamentos"],["taxas","🗺️ Taxas"]].map(([id,label])=>(
              <button key={id} onClick={()=>setAbaEmp(id)} style={{background:"transparent",border:"none",borderBottom:abaEmp===id?"2px solid #34d399":"2px solid transparent",color:abaEmp===id?"#34d399":"#6b7280",padding:"8px 16px",cursor:"pointer",fontWeight:700,fontSize:13}}>{label}</button>
            ))}
          </div>

          {abaEmp==="geral" && (
            <div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
                <Stat label="Taxas semana" value={`R$${totalSemana(empSel).taxas}`} cor="#60a5fa"/>
                <Stat label="Mensalidade" value={empSel.planoGratis?"🎁 Grátis":empSel.mensalidadePaga?"✅ Paga":"❌ Pendente"} cor={empSel.planoGratis?"#a78bfa":empSel.mensalidadePaga?"#34d399":"#ef4444"}/>
                <Stat label="Total a cobrar" value={`R$${totalSemana(empSel).total}`} cor="#a78bfa"/>
              </div>
              <Card style={{marginBottom:14,padding:"14px 16px",background:"#0f172a"}}>
                <SectionTitle>📋 Dados Cadastrais</SectionTitle>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["CNPJ",empSel.cnpj],["Telefone",empSel.tel],["Endereço",empSel.enderecoEstab],["Bairro",empSel.bairro],["Dono",empSel.nomeDono],["Tel. Dono",empSel.telDono],["Sócio",empSel.nomeSocio||"—"],["Tel. Sócio",empSel.telSocio||"—"]].map(([l,v])=>(
                    <div key={l}><div style={{color:"#4b5563",fontSize:11}}>{l}</div><div style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{v||"—"}</div></div>
                  ))}
                </div>
              </Card>
              <Card style={{padding:"14px 16px",background:"#0f172a"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{color:empSel.bloqueado?"#ef4444":"#34d399",fontWeight:700,fontSize:14}}>{empSel.bloqueado?"⛔ BLOQUEADO":"✅ Ativo"}</div>
                  <Btn small cor={empSel.bloqueado?"verde":"perigo"} onClick={()=>toggleBloqueio(empSel.id)}>{empSel.bloqueado?"🔓 Desbloquear":"⛔ Bloquear"}</Btn>
                </div>
                {!empSel.mensalidadePaga&&!empSel.planoGratis && <Btn cor="amarelo" full onClick={()=>marcarMensalidade(empSel.id)}>💰 Confirmar pagamento R${empSel.planoPagamento==="mensal"?MENSALIDADE*4:MENSALIDADE}</Btn>}
              </Card>
            </div>
          )}

          {abaEmp==="pagamentos" && (
            <div>
              <Card style={{marginBottom:12,padding:"14px 16px",background:"#0f172a"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{color:"#9ca3af",fontWeight:700,fontSize:13}}>💰 Comissão MotoFast — {empSel.planoPagamento==="mensal"?`R$${MENSALIDADE*4}/mês`:`R$${MENSALIDADE}/semana`}</div>
                  {empSel.planoGratis ? <Tag label="🎁 Grátis" cor="#a78bfa"/> : empSel.mensalidadePaga ? <Tag label="✅ Paga" cor="#34d399"/> : <Btn small cor="amarelo" onClick={()=>marcarMensalidade(empSel.id)}>💰 Marcar paga</Btn>}
                </div>
                <div style={{color:"#6b7280",fontSize:12}}>Plano: {empSel.planoPagamento==="mensal"?"🗓️ Mensal":"📋 Semanal (toda terça)"}</div>
              </Card>
              <Card style={{marginBottom:12,padding:"14px 16px",background:"#0f172a"}}>
                <div style={{color:"#9ca3af",fontWeight:700,fontSize:13,marginBottom:4}}>🏍️ Pagamento ao motoboy</div>
                <div style={{color:"#6b7280",fontSize:12}}>Plano: {empSel.planoPagamentoMotoboy==="diario"?"📅 Diário (no dia seguinte)":"📋 Semanal (toda terça)"}</div>
              </Card>
              {empSel.planoPagamentoMotoboy==="diario" && (
                <div>
                  <div style={{color:"#9ca3af",fontSize:12,fontWeight:700,marginBottom:8}}>Pagamentos diários desta semana:</div>
                  {DIAS.map(dia=>{
                    const pago = empSel.pagamentosDiarios?.[dia];
                    const ents = historico.filter(e=>e.empresarioId===empSel.id&&e.data===dia&&e.status==="Entregue");
                    const total = ents.reduce((s,e)=>s+e.taxaEmpresario,0).toFixed(2);
                    const bg = pago?"#0d3d2e":"#0f172a";
                    const brd = pago?"#34d399":"#374151";
                    return (
                      <div key={dia} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:bg,border:`1px solid ${brd}`,borderRadius:8,padding:"9px 14px",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{color:"#9ca3af",fontSize:12,minWidth:28}}>{DNOMES[dia]}</span>
                          <span style={{color:"#6b7280",fontSize:12}}>{dia}</span>
                          <span style={{color:"#60a5fa",fontWeight:700}}>R${total}</span>
                          <span style={{color:"#4b5563",fontSize:11}}>{ents.length} ent.</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {pago ? <Tag label="✅ Pago" cor="#34d399"/> : <Tag label="⚠️ Pendente" cor="#fbbf24"/>}
                          <button onClick={()=>toggleDia(empSel.id,dia)} style={{background:pago?"#1f2937":"#0d3d2e",border:`1px solid ${pago?"#374151":"#34d399"}`,borderRadius:6,color:pago?"#9ca3af":"#34d399",padding:"4px 10px",cursor:"pointer",fontWeight:700,fontSize:12}}>
                            {pago?"Desmarcar":"✅ Marcar pago"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {abaEmp==="taxas" && (
            <div>
              <div style={{color:"#9ca3af",fontSize:12,marginBottom:12}}>
                <span style={{color:"#60a5fa"}}>Azul</span> = cliente paga · <span style={{color:"#fbbf24"}}>Amarelo</span> = motoboy recebe · <span style={{color:"#a78bfa"}}>Roxo</span> = seu lucro
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <div style={{color:"#9ca3af",fontSize:12,marginBottom:4,fontWeight:600}}>Adicionar novo bairro</div>
                  <input value={novoBairro} onChange={e=>setNovoBairro(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&adicionarBairro()}
                    placeholder="Ex: Feiticeira, Siriúba..."
                    style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"9px 12px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
                </div>
                <Btn cor="azul" onClick={adicionarBairro}>+ Adicionar</Btn>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#0f172a"}}>
                    {["Bairro","Cliente (R$)","Motoboy (R$)","Lucro","Ações"].map((h,i)=>(
                      <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",color:i===0?"#6b7280":i===1?"#60a5fa":i===2?"#fbbf24":i===3?"#a78bfa":"#6b7280"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(taxasEdit).map(([b,t])=>{
                    const lucro = (t.e-t.m).toFixed(2);
                    const editando = bairroEditando===b;
                    return (
                      <tr key={b} style={{borderBottom:"1px solid #1f2937"}}>
                        {/* Nome do bairro — editável */}
                        <td style={{padding:"7px 12px"}}>
                          {editando
                            ? <input value={novoNomeBairro} onChange={e=>setNovoNomeBairro(e.target.value)}
                                onKeyDown={e=>{if(e.key==="Enter")renomearBairro(b);if(e.key==="Escape")setBairroEditando(null);}}
                                autoFocus style={{background:"#0f172a",border:"1px solid #60a5fa",borderRadius:6,color:"#f9fafb",padding:"5px 9px",fontSize:13,outline:"none",width:120}}/>
                            : <span style={{color:"#f9fafb",fontWeight:600,fontSize:13}}>{b}</span>}
                        </td>
                        {/* Taxa cliente */}
                        <td style={{padding:"7px 12px"}}>
                          <input type="number" value={t.e} min="0" step="0.5" onChange={e=>setTaxasEdit(p=>({...p,[b]:{...p[b],e:+e.target.value}}))}
                            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:6,color:"#60a5fa",padding:"5px 9px",width:70,fontSize:14,fontWeight:700,outline:"none"}}/>
                        </td>
                        {/* Taxa motoboy */}
                        <td style={{padding:"7px 12px"}}>
                          <input type="number" value={t.m} min="0" step="0.5" onChange={e=>setTaxasEdit(p=>({...p,[b]:{...p[b],m:+e.target.value}}))}
                            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:6,color:"#fbbf24",padding:"5px 9px",width:70,fontSize:14,fontWeight:700,outline:"none"}}/>
                        </td>
                        {/* Lucro */}
                        <td style={{padding:"9px 12px",color:+lucro>0?"#a78bfa":"#f87171",fontWeight:700,fontSize:14}}>R${lucro}</td>
                        {/* Ações: editar nome e excluir */}
                        <td style={{padding:"7px 12px"}}>
                          <div style={{display:"flex",gap:6}}>
                            {editando
                              ? <button onClick={()=>renomearBairro(b)} style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:6,color:"#34d399",padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:700}}>✅ Salvar</button>
                              : <button onClick={()=>{setBairroEditando(b);setNovoNomeBairro(b);}} style={{background:"#1a2f4a",border:"1px solid #3b82f6",borderRadius:6,color:"#60a5fa",padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:700}}>✏️ Editar</button>}
                            <button onClick={()=>excluirBairro(b)} style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:6,color:"#f87171",padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:700}}>🗑️ Excluir</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{marginTop:12,display:"flex",alignItems:"center",gap:10}}>
                <Btn onClick={salvarTaxas} full>💾 Salvar Taxas</Btn>
                {taxaSalva && <span style={{color:"#34d399",fontWeight:700,fontSize:13}}>✅ Taxas salvas!</span>}
              </div>
            </div>
          )}
        </Overlay>
      )}

      {modalCad && (
        <Overlay onClose={()=>setModalCad(false)} maxW={520}>
          <OvHeader titulo="Cadastrar Estabelecimento" onClose={()=>setModalCad(false)}/>
          <SectionTitle>Dados do estabelecimento</SectionTitle>
          <Inp label="Nome *" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Ex: Pizzaria da Ilha"/>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="CNPJ" value={form.cnpj} onChange={v=>setForm(f=>({...f,cnpj:v}))} placeholder="00.000.000/0001-00"/></div>
            <div style={{flex:1}}><Inp label="Telefone" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))} placeholder="(12) 3894-0000"/></div>
          </div>
          <Inp label="Endereço completo" value={form.enderecoEstab} onChange={v=>setForm(f=>({...f,enderecoEstab:v}))} placeholder="Ex: Rua da Padroeira, 45, Vila, Ilhabela/SP"/>
          <Inp label="Bairro *" value={form.bairro} onChange={v=>setForm(f=>({...f,bairro:v}))} placeholder="Digite o bairro"/>
          <Divider/>
          <SectionTitle>Responsáveis</SectionTitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="Nome do dono *" value={form.nomeDono} onChange={v=>setForm(f=>({...f,nomeDono:v}))} placeholder="Nome completo"/></div>
            <div style={{flex:1}}><Inp label="WhatsApp do dono *" value={form.telDono} onChange={v=>setForm(f=>({...f,telDono:v}))} placeholder="(12) 99999-0000"/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="Nome do sócio (opcional)" value={form.nomeSocio} onChange={v=>setForm(f=>({...f,nomeSocio:v}))} placeholder="Nome completo"/></div>
            <div style={{flex:1}}><Inp label="WhatsApp do sócio (opcional)" value={form.telSocio} onChange={v=>setForm(f=>({...f,telSocio:v}))} placeholder="(12) 99999-0000"/></div>
          </div>
          <Divider/>
          <div style={{marginBottom:12}}>
            <div style={{color:"#9ca3af",fontSize:12,fontWeight:600,marginBottom:8}}>Plano de pagamento — comissão MotoFast</div>
            <div style={{display:"flex",gap:8}}>
              {[["semanal","📋 Semanal (toda terça)"],["mensal","🗓️ Mensal (uma vez)"]].map(([val,label])=>(
                <button key={val} onClick={()=>setForm(f=>({...f,planoPagamento:val}))} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:form.planoPagamento===val?"#1e293b":"#0f172a",border:form.planoPagamento===val?"2px solid #34d399":"2px solid #1f2937",color:form.planoPagamento===val?"#34d399":"#6b7280"}}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{color:"#9ca3af",fontSize:12,fontWeight:600,marginBottom:8}}>Como o estabelecimento paga o motoboy</div>
            <div style={{display:"flex",gap:8}}>
              {[["diario","📅 Diário (dia seguinte)"],["semanal","📋 Semanal (toda terça)"]].map(([val,label])=>(
                <button key={val} onClick={()=>setForm(f=>({...f,planoPagamentoMotoboy:val}))} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:form.planoPagamentoMotoboy===val?"#1e293b":"#0f172a",border:form.planoPagamentoMotoboy===val?"2px solid #fbbf24":"2px solid #1f2937",color:form.planoPagamentoMotoboy===val?"#fbbf24":"#6b7280"}}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{color:"#9ca3af",fontSize:12,fontWeight:600,marginBottom:8}}>Período grátis</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["0","💰 Cobrar já"],["1","🎁 1 mês"],["2","🎁 2 meses"],["3","🎁 3 meses"],["-1","♾️ Sempre grátis"]].map(([val,label])=>(
                <button key={val} onClick={()=>setMesesGratis(val)} style={{flex:1,minWidth:70,padding:"8px 6px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:mesesGratis===val?"#1e293b":"#0f172a",border:mesesGratis===val?"2px solid #a78bfa":"2px solid #1f2937",color:mesesGratis===val?"#a78bfa":"#6b7280"}}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={cadastrar} full>Cadastrar</Btn>
            <Btn cor="cinza" onClick={()=>setModalCad(false)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
function Clientes({ clientes, setClientes, historico, empresarios }) {
  const [busca, setBusca] = useState("");
  const [editId, setEditId] = useState(null);
  const [detalheId, setDetalheId] = useState(null);
  const [form, setForm] = useState({nome:"",tel:"",endereco:{rua:"",num:"",bairro:BAIRROS[0],ref:""}});

  const filtrados = clientes.filter(c=>!busca||c.nome.toLowerCase().includes(busca.toLowerCase())||c.tel.includes(busca));
  const editCli = editId ? clientes.find(c=>c.id===editId) : null;
  const detCli  = detalheId ? clientes.find(c=>c.id===detalheId) : null;

  function abrirEdicao(c) { setEditId(c.id); setForm({nome:c.nome,tel:c.tel,endereco:{...c.endereco}}); }
  function salvar() { setClientes(p=>p.map(c=>c.id===editId?{...c,...form}:c)); setEditId(null); }

  function histPorEmp(clienteNome) {
    return empresarios.map(emp=>{
      const ents = historico.filter(e=>e.clienteNome===clienteNome&&e.empresarioId===emp.id&&e.status==="Entregue");
      return {...emp, qtd:ents.length, total:ents.reduce((s,e)=>s+e.taxaEmpresario,0).toFixed(2)};
    }).filter(e=>e.qtd>0).sort((a,b)=>b.qtd-a.qtd);
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>👤 Clientes</div>
          <div style={{color:"#6b7280",fontSize:13}}>{clientes.length} cadastrados</div>
        </div>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Nome ou telefone..."
          style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"8px 14px",fontSize:13,outline:"none",width:240}}/>
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#0f172a",borderBottom:"1px solid #1f2937"}}>
              {["Nome","Telefone","Endereço","Referência","Pedidos",""].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c=>{
              const pedidos = historico.filter(e=>e.clienteNome===c.nome&&e.status==="Entregue").length;
              return (
                <tr key={c.id} style={{borderBottom:"1px solid #1a2035"}} onMouseOver={e=>e.currentTarget.style.background="#0f172a"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 14px",color:"#f9fafb",fontWeight:600}}>{c.nome}</td>
                  <td style={{padding:"10px 14px"}}><a href={`https://wa.me/55${c.tel.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{color:"#34d399",textDecoration:"none",fontWeight:600}}>💬 {c.tel}</a></td>
                  <td style={{padding:"10px 14px",color:"#d1d5db",fontSize:12}}>{c.endereco?.rua}, {c.endereco?.num} — <span style={{color:"#34d399"}}>{c.endereco?.bairro}</span></td>
                  <td style={{padding:"10px 14px",color:"#fbbf24",fontSize:12}}>{c.endereco?.ref||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#60a5fa",fontWeight:700,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDetalheId(c.id)}>{pedidos}</td>
                  <td style={{padding:"10px 14px"}}><Btn small cor="cinza" onClick={()=>abrirEdicao(c)}>✏️ Editar</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtrados.length===0 && <div style={{textAlign:"center",padding:30,color:"#4b5563"}}>Nenhum cliente encontrado.</div>}
      </Card>

      {detalheId && detCli && (
        <Overlay onClose={()=>setDetalheId(null)} maxW={500}>
          <OvHeader titulo={detCli.nome} sub="Pedidos por estabelecimento" onClose={()=>setDetalheId(null)}/>
          <div style={{color:"#6b7280",fontSize:13,marginBottom:12}}>Total: {historico.filter(e=>e.clienteNome===detCli.nome&&e.status==="Entregue").length} pedidos</div>
          {histPorEmp(detCli.nome).map(emp=>(
            <Card key={emp.id} style={{marginBottom:10,padding:"14px 16px",background:"#0f172a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:"#f9fafb",fontWeight:700,fontSize:14}}>{emp.nome}</div>
                  <div style={{color:"#6b7280",fontSize:12}}>📍 {emp.bairro}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#60a5fa",fontWeight:800,fontSize:18}}>{emp.qtd} pedido{emp.qtd!==1?"s":""}</div>
                  <div style={{color:"#34d399",fontSize:12}}>R${emp.total} em taxas</div>
                </div>
              </div>
            </Card>
          ))}
          {histPorEmp(detCli.nome).length===0 && <div style={{color:"#4b5563",textAlign:"center",padding:20}}>Nenhum pedido.</div>}
        </Overlay>
      )}

      {editId && editCli && (
        <Overlay onClose={()=>setEditId(null)} maxW={440}>
          <OvHeader titulo="✏️ Editar Cliente" onClose={()=>setEditId(null)}/>
          <Inp label="Nome" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))}/>
          <Inp label="Telefone" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))}/>
          <Divider/>
          <SectionTitle>Endereço</SectionTitle>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:3}}><Inp label="Rua" value={form.endereco.rua} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,rua:v}}))}/></div>
            <div style={{flex:1}}><Inp label="Nº" value={form.endereco.num} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,num:v}}))}/></div>
          </div>
          <SelInput label="Bairro" value={form.endereco.bairro} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,bairro:v}}))}>
            {BAIRROS.map(b=><option key={b}>{b}</option>)}
          </SelInput>
          <Inp label="Ponto de referência" value={form.endereco.ref} onChange={v=>setForm(f=>({...f,endereco:{...f.endereco,ref:v}}))} placeholder="Casa de cor, portão..."/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={salvar} full>Salvar</Btn>
            <Btn cor="cinza" onClick={()=>setEditId(null)}>Cancelar</Btn>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── HISTÓRICO ────────────────────────────────────────────────────────────────
function Historico({ historico, motoboys, empresarios }) {
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [filtroMb, setFiltroMb] = useState("Todos");
  const ss = {background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"7px 10px",fontSize:13};

  const lista = historico.filter(e=>{
    if (filtroStatus!=="Todos"&&e.status!==filtroStatus) return false;
    if (filtroMes!=="Todos"&&MESES[e.mes-1]!==filtroMes) return false;
    if (filtroMb!=="Todos"&&String(e.motoboyId)!==filtroMb) return false;
    return true;
  }).slice().reverse();

  const ents = lista.filter(e=>e.status==="Entregue");
  const cobrado = ents.reduce((s,e)=>s+e.taxaEmpresario,0).toFixed(2);
  const lucro   = ents.reduce((s,e)=>s+e.lucro,0).toFixed(2);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>📋 Histórico de Entregas</div>
          <div style={{color:"#6b7280",fontSize:13}}>{lista.length} registros · Faturado: <span style={{color:"#60a5fa",fontWeight:700}}>R${cobrado}</span> · Lucro: <span style={{color:"#a78bfa",fontWeight:700}}>R${lucro}</span></div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} style={ss}>{["Todos","Entregue","Cancelada"].map(o=><option key={o}>{o}</option>)}</select>
          <select value={filtroMes} onChange={e=>setFiltroMes(e.target.value)} style={ss}>{["Todos",...MESES.slice(0,6)].map(o=><option key={o}>{o}</option>)}</select>
          <select value={filtroMb} onChange={e=>setFiltroMb(e.target.value)} style={ss}>
            <option value="Todos">Todos motoboys</option>
            {motoboys.filter(m=>!m.banido).map(m=><option key={m.id} value={String(m.id)}>{m.nomeCompleto.split(" ")[0]}</option>)}
          </select>
        </div>
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:"#0f172a",borderBottom:"1px solid #1f2937"}}>
              {["Data","Saiu às","Cliente","Bairro","Motoboy","Estabelecimento","Pgto","Cobrado","Motoboy","Lucro","Status"].map(h=>(
                <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.slice(0,80).map(e=>{
              const mb  = motoboys.find(m=>m.id===e.motoboyId);
              const emp = empresarios.find(x=>x.id===e.empresarioId);
              const pg  = PG[e.pagamento] || {icon:"•",cor:"#9ca3af"};
              const entregue = e.status==="Entregue";
              return (
                <tr key={e.id} style={{borderBottom:"1px solid #1a2035"}} onMouseOver={ev=>ev.currentTarget.style.background="#0f172a"} onMouseOut={ev=>ev.currentTarget.style.background="transparent"}>
                  <td style={{padding:"8px 12px",color:"#9ca3af",whiteSpace:"nowrap"}}>{e.data}</td>
                  <td style={{padding:"8px 12px",color:"#fbbf24",fontWeight:700,whiteSpace:"nowrap"}}>🏍️ {e.horaSaida||"—"}</td>
                  <td style={{padding:"8px 12px",color:"#f9fafb",fontWeight:600}}>{e.clienteNome}</td>
                  <td style={{padding:"8px 12px",color:"#34d399"}}>{e.bairro}</td>
                  <td style={{padding:"8px 12px",color:"#d1d5db"}}>{mb?.nomeCompleto?.split(" ")[0]||"—"}</td>
                  <td style={{padding:"8px 12px",color:"#d1d5db",fontSize:11}}>{emp?.nome?.split(" ").slice(0,2).join(" ")||"—"}</td>
                  <td style={{padding:"8px 12px"}}><span style={{color:pg.cor,fontWeight:700}}>{pg.icon}</span></td>
                  <td style={{padding:"8px 12px",color:"#60a5fa",fontWeight:700}}>R${e.taxaEmpresario}</td>
                  <td style={{padding:"8px 12px",color:"#fbbf24",fontWeight:700}}>R${e.taxaMotoboy}</td>
                  <td style={{padding:"8px 12px",color:"#a78bfa",fontWeight:700}}>R${e.lucro}</td>
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
        {lista.length===0 && <div style={{textAlign:"center",padding:30,color:"#4b5563"}}>Nenhum registro.</div>}
      </Card>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [aba, setAba] = useState("dashboard");
  const [motoboys, setMotoboys]       = useState(MB_INIT);
  const [empresarios, setEmpresarios] = useState(EMP_INIT);
  const [clientes, setClientes]       = useState(CLI_INIT);
  const [historico, setHistorico]     = useState(()=>gerarHist(MB_INIT, EMP_INIT));

  const saldo     = historico.filter(e=>e.status==="Entregue"&&!e.repasePago).reduce((s,e)=>s+e.lucro,0).toFixed(2);
  const bloqueados = empresarios.filter(e=>e.bloqueado).length;
  const banidos   = motoboys.filter(m=>m.banido).length;

  const ABAS = [
    {id:"dashboard",label:"📊 Dashboard"},
    {id:"repasse",label:"💰 Repasse"},
    {id:"motoboys",label:"🏍️ Motoboys"},
    {id:"estabelecimentos",label:"🏪 Estabelecimentos"},
    {id:"clientes",label:"👤 Clientes"},
    {id:"historico",label:"📋 Histórico"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb"}}>
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"0 20px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",flexWrap:"wrap"}}>
          <div style={{padding:"12px 20px 12px 0",borderRight:"1px solid #1f2937",marginRight:16,flexShrink:0}}>
            <div style={{color:"#34d399",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>⚡ MotoFast</div>
            <div style={{color:"#4b5563",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Painel Admin</div>
          </div>
          <nav style={{display:"flex",flexWrap:"wrap",flex:1}}>
            {ABAS.map(a=>(
              <button key={a.id} onClick={()=>setAba(a.id)} style={{background:aba===a.id?"#0d3d2e":"transparent",color:aba===a.id?"#34d399":"#6b7280",border:"none",borderBottom:aba===a.id?"2px solid #34d399":"2px solid transparent",padding:"13px 12px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{a.label}</button>
            ))}
          </nav>
          <div style={{display:"flex",gap:8,padding:"8px 0",flexShrink:0}}>
            {+saldo>0 && <button onClick={()=>setAba("repasse")} style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#34d399",fontWeight:700,cursor:"pointer"}}>💵 R${saldo} a repassar</button>}
            {bloqueados>0 && <button onClick={()=>setAba("estabelecimentos")} style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#f87171",fontWeight:700,cursor:"pointer"}}>⛔ {bloqueados} bloqueado(s)</button>}
            {banidos>0 && <button onClick={()=>setAba("motoboys")} style={{background:"#1f2937",border:"1px solid #6b7280",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#9ca3af",fontWeight:700,cursor:"pointer"}}>⛔ {banidos} banido(s)</button>}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}}>
        {aba==="dashboard"        && <Dashboard historico={historico} motoboys={motoboys} empresarios={empresarios}/>}
        {aba==="repasse"          && <Repasse historico={historico} setHistorico={setHistorico} motoboys={motoboys} empresarios={empresarios}/>}
        {aba==="motoboys"         && <Motoboys motoboys={motoboys} setMotoboys={setMotoboys} historico={historico}/>}
        {aba==="estabelecimentos" && <Estabelecimentos empresarios={empresarios} setEmpresarios={setEmpresarios} historico={historico}/>}
        {aba==="clientes"         && <Clientes clientes={clientes} setClientes={setClientes} historico={historico} empresarios={empresarios}/>}
        {aba==="historico"        && <Historico historico={historico} motoboys={motoboys} empresarios={empresarios}/>}
      </div>
    </div>
  );
}
