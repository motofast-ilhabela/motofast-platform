import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

const SUPORTE_TEL = "5512991213656";
const BAIRROS = ["Perequê","Vila","Barra Velha","Itaquanduba","Água Branca","Zabumba","Sul","Centro","Armação","Curral"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MENSALIDADE = 95;
const PG = { pix:{label:"Pix",icon:"💠",cor:"#34d399"}, dinheiro:{label:"Dinheiro",icon:"💵",cor:"#fbbf24"}, cartao:{label:"Cartão",icon:"💳",cor:"#60a5fa"} };

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
  const agora = new Date();
  const mesAtual = agora.getMonth()+1;
  const anoAtual = agora.getFullYear();
  const mAtu = ent.filter(e=>e.mes===mesAtual);
  const lucroTotal = ent.reduce((s,e)=>s+e.lucro,0).toFixed(2);
  const lucroMes   = mAtu.reduce((s,e)=>s+e.lucro,0).toFixed(2);
  const taxasMes   = mAtu.reduce((s,e)=>s+e.taxaEmpresario,0).toFixed(2);
  const empAtivos  = empresarios.filter(e=>!e.planoGratis&&!e.bloqueado).length;
  const mensMes    = (empAtivos*MENSALIDADE*4).toFixed(2);
  const fatMes     = (parseFloat(taxasMes)+parseFloat(mensMes)).toFixed(2);
  const pagoMb     = mAtu.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2);

  const ranking = motoboys.filter(m=>!m.banido).map(mb=>{
    const mine = mAtu.filter(e=>e.motoboyId===mb.id);
    return {...mb, qtd:mine.length, ganhos:mine.reduce((s,e)=>s+e.taxaMotoboy,0).toFixed(2)};
  }).sort((a,b)=>b.qtd-a.qtd);
  const maxQ = ranking[0]?.qtd || 1;

  const porMes = MESES.slice(0,mesAtual).map((mes,i)=>{
    const e = ent.filter(x=>x.mes===i+1);
    return {mes, qtd:e.length, lucro:e.reduce((s,x)=>s+x.lucro,0).toFixed(2)};
  });
  const maxMes = Math.max(...porMes.map(p=>p.qtd), 1);

  const porEmp = empresarios.map(emp=>{
    const e = mAtu.filter(x=>x.empresarioId===emp.id);
    return {...emp, qtd:e.length, fat:e.reduce((s,x)=>s+x.taxaEmpresario,0).toFixed(2)};
  }).sort((a,b)=>b.qtd-a.qtd);
  const maxEmp = Math.max(...porEmp.map(p=>p.qtd), 1);
  const nomeMes = MESES[mesAtual-1];

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:22}}>📊 Dashboard</div>
        <div style={{color:"#6b7280",fontSize:13}}>Visão geral — {nomeMes} {anoAtual}</div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
        <Stat icon="✅" label="Entregas este mês" value={mAtu.length} sub={`${ent.length} total histórico`} cor="#34d399"/>
        <Stat icon="💰" label="Faturado este mês" value={`R$${fatMes}`} sub={`Taxas R$${taxasMes} + Mensalidades R$${mensMes}`} cor="#60a5fa"/>
        <Stat icon="🏍️" label="A pagar motoboys" value={`R$${pagoMb}`} sub="a repassar na terça-feira" cor="#fbbf24"/>
        <Stat icon="💵" label="Seu lucro mês" value={`R$${lucroMes}`} sub={`R$${lucroTotal} total acumulado`} cor="#a78bfa"/>
        <Stat icon="🟢" label="Motoboys online" value={motoboys.filter(m=>m.online&&!m.banido).length} sub={`de ${motoboys.filter(m=>!m.banido).length} ativos`} cor="#34d399"/>
        <Stat icon="🏪" label="Estabelecimentos" value={empresarios.filter(e=>!e.bloqueado).length} sub={`${empresarios.filter(e=>e.bloqueado).length} bloqueado(s)`} cor="#60a5fa"/>
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <Card style={{flex:2,minWidth:240}}>
          <SectionTitle>Entregas por mês</SectionTitle>
          {porMes.length===0 && <div style={{color:"#4b5563",fontSize:13}}>Nenhuma entrega registrada ainda.</div>}
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
          <SectionTitle>📦 Entregas por Estabelecimento — {nomeMes}</SectionTitle>
          {porEmp.filter(e=>e.qtd>0).length===0 && <div style={{color:"#4b5563",fontSize:13}}>Nenhuma entrega este mês.</div>}
          {porEmp.filter(e=>e.qtd>0).map(emp=>(
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
          <SectionTitle>🏆 Ranking Motoboys — {nomeMes}</SectionTitle>
          {ranking.filter(m=>m.qtd>0).length===0 && <div style={{color:"#4b5563",fontSize:13}}>Nenhuma entrega este mês.</div>}
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

  const agora = new Date();
  const mesAtual = agora.getMonth()+1;
  const dia = agora.getDate();
  const semAtual = dia<=7?1:dia<=14?2:dia<=21?3:4;
  const semAnterior = semAtual>1?semAtual-1:4;
  const mesAnterior = semAtual>1?mesAtual:(mesAtual>1?mesAtual-1:12);

  const sems = {
    atual:{mes:mesAtual,s:semAtual,label:`Semana ${semAtual} — ${MESES[mesAtual-1]} ${agora.getFullYear()}`},
    anterior:{mes:mesAnterior,s:semAnterior,label:`Semana ${semAnterior} — ${MESES[mesAnterior-1]} ${agora.getFullYear()}`}
  };
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
      {dadosMb.length===0&&dadosEmp.length===0 && (
        <Card style={{textAlign:"center",padding:30}}>
          <div style={{color:"#4b5563",fontSize:14}}>Nenhuma entrega nesta semana ainda.</div>
        </Card>
      )}
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
                {["Data","Saiu às","Entregue às","Cliente","Bairro","Pgto","Valor"].map(h=>(
                  <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entsDet.map(e=>(
                <tr key={e.id} style={{borderBottom:"1px solid #1a2035"}}>
                  <td style={{padding:"8px 12px",color:"#9ca3af",fontSize:12}}>{e.data}</td>
                  <td style={{padding:"8px 12px",color:"#fbbf24",fontSize:12,fontWeight:700}}>🏍️ {e.horaSaida||"—"}</td>
                  <td style={{padding:"8px 12px",color:"#34d399",fontSize:12,fontWeight:700}}>✅ {e.horaEntrega||"—"}</td>
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

  async function cadastrar() {
    if (!form.nomeCompleto.trim()) return;
    const { data, error } = await supabase.from("motoboys").insert({
      nome_completo: form.nomeCompleto,
      telefone: form.tel,
      pix: form.pix,
      bairro_base: form.bairroBase,
      cpf: form.cpf,
      rg: form.rg,
      nascimento: form.nascimento,
      nome_pai: form.nomePai,
      nome_mae: form.nomeMae,
      endereco: form.endereco,
      aprovado: true,
      online: false,
      banido: false,
    }).select().single();
    if (!error && data) {
      setMotoboys(p=>[...p,{
        id:data.id, nomeCompleto:form.nomeCompleto, tel:form.tel, pix:form.pix,
        bairroBase:form.bairroBase, cpf:form.cpf, rg:form.rg, nascimento:form.nascimento,
        nomePai:form.nomePai, nomeMae:form.nomeMae, endereco:form.endereco,
        online:false, ativo:true, banido:false, motivoBanimento:null, dataBanimento:null,
      }]);
    }
    setModalCad(false); setForm(FVAZIO);
  }

  async function bloquear(id) {
    const mb = motoboys.find(m=>m.id===id);
    await supabase.from("motoboys").update({bloqueado: mb.ativo}).eq("id", id);
    setMotoboys(p=>p.map(m=>m.id===id?{...m,ativo:!m.ativo}:m));
  }

  async function banir(id) {
    if (!motivo.trim()) return;
    await supabase.from("motoboys").update({banido:true, bloqueado:true, motivo_banimento:motivo, data_banimento:new Date().toISOString().split("T")[0]}).eq("id", id);
    setMotoboys(p=>p.map(m=>m.id===id?{...m,banido:true,ativo:false,online:false,motivoBanimento:motivo,dataBanimento:new Date().toISOString().split("T")[0]}:m));
    setModalBanir(null); setMotivo(""); setDetalhe(null);
  }

  async function desbanir(id) {
    await supabase.from("motoboys").update({banido:false, bloqueado:false, motivo_banimento:null, data_banimento:null}).eq("id", id);
    setMotoboys(p=>p.map(m=>m.id===id?{...m,banido:false,ativo:true,motivoBanimento:null,dataBanimento:null}:m));
  }

  const mesAtual = new Date().getMonth()+1;
  const mbDet = detalhe ? motoboys.find(m=>m.id===detalhe) : null;
  const histDet = detalhe ? historico.filter(e=>e.motoboyId===detalhe&&e.status==="Entregue") : [];
  const histMensal = MESES.slice(0,mesAtual).map((mes,i)=>{
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

      {aba==="ativos" && ativos.length===0 && (
        <Card style={{textAlign:"center",padding:30}}>
          <div style={{color:"#4b5563",fontSize:14}}>Nenhum motoboy aprovado ainda.</div>
        </Card>
      )}

      {aba==="ativos" && ativos.map(mb=>{
        const ents = historico.filter(e=>e.motoboyId===mb.id&&e.status==="Entregue");
        const entsMes = ents.filter(e=>e.mes===mesAtual);
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
                <div style={{textAlign:"center"}}><div style={{color:"#a78bfa",fontWeight:700,fontSize:14}}>R${totalHist}</div><div style={{color:"#6b7280",fontSize:10}}>total a pagar a ele</div></div>
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
              <div key={h.mes} style={{flex:1,textAlign:"center",padding:"10px 4px",borderRight:i<histMensal.length-1?"1px solid #1f2937":"none",background:h.qtd>0?"#0f172a":"transparent"}}>
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
  const [dataSelecionadaEmp, setDataSelecionadaEmp] = useState(new Date().toISOString().split("T")[0]);
  const FVAZIO = {nome:"",tel:"",bairro:"",planoPagamento:"semanal",planoPagamentoMotoboy:"diario",cnpj:"",nomeDono:"",telDono:"",nomeSocio:"",telSocio:"",enderecoEstab:""};
  const [form, setForm] = useState(FVAZIO);

  const agora = new Date();
  const mesAtual = agora.getMonth()+1;
  const DIAS = Array.from({length:7},(_,i)=>{
    const d = new Date(agora); d.setDate(agora.getDate()-i);
    return d.toISOString().split("T")[0];
  });
  const DNOMES = {};
  DIAS.forEach(d=>{
    const dia = new Date(d);
    DNOMES[d] = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][dia.getDay()];
  });

  const empSel = empresarios.find(e=>e.id===sel);

  function abrirEmp(emp) { setSel(emp.id); setAbaEmp("geral"); setTaxasEdit(JSON.parse(JSON.stringify(emp.taxas||{}))); setTaxaSalva(false); }

  async function salvarTaxas() {
    await supabase.from("empresarios").update({taxas: taxasEdit}).eq("id", sel);
    setEmpresarios(p=>p.map(e=>e.id===sel?{...e,taxas:taxasEdit}:e));
    setTaxaSalva(true);
    setTimeout(()=>setTaxaSalva(false),3000);
  }

  function adicionarBairro() {
    const nome = novoBairro.trim();
    if (!nome) return;
    setTaxasEdit(p=>({...p,[nome]:{e:0,m:0}}));
    setNovoBairro("");
  }

  function excluirBairro(b) {
    setTaxasEdit(p=>{ const novo={...p}; delete novo[b]; return novo; });
  }

  function renomearBairro(bAntigo) {
    const novoNome = novoNomeBairro.trim();
    if (!novoNome || novoNome===bAntigo) { setBairroEditando(null); return; }
    setTaxasEdit(p=>{
      const novo={};
      Object.entries(p).forEach(([k,v])=>{ novo[k===bAntigo?novoNome:k]=v; });
      return novo;
    });
    setBairroEditando(null);
  }

  async function ativarGratis(id, meses) {
    let update = {};
    if (meses===0) update = {plano_gratis:false, data_fim_gratis:null};
    else if (meses===-1) update = {plano_gratis:true, data_fim_gratis:null, mensalidade_paga:true, bloqueado:false};
    else {
      const fim = new Date(); fim.setMonth(fim.getMonth()+meses);
      update = {plano_gratis:true, data_fim_gratis:fim.toISOString().split("T")[0], mensalidade_paga:true, bloqueado:false};
    }
    await supabase.from("empresarios").update(update).eq("id", id);
    setEmpresarios(p=>p.map(e=>{
      if (e.id!==id) return e;
      if (meses===0) return {...e,planoGratis:false,dataFimGratis:null};
      if (meses===-1) return {...e,planoGratis:true,dataFimGratis:"∞",mensalidadePaga:true,bloqueado:false};
      const fim = new Date(); fim.setMonth(fim.getMonth()+meses);
      return {...e,planoGratis:true,dataFimGratis:fim.toISOString().split("T")[0],mensalidadePaga:true,bloqueado:false};
    }));
  }

  async function toggleBloqueio(id) {
    const emp = empresarios.find(e=>e.id===id);
    await supabase.from("empresarios").update({bloqueado: !emp.bloqueado}).eq("id", id);
    setEmpresarios(p=>p.map(e=>e.id===id?{...e,bloqueado:!e.bloqueado}:e));
  }

  async function marcarMensalidade(id) {
    await supabase.from("empresarios").update({mensalidade_paga:true, bloqueado:false}).eq("id", id);
    setEmpresarios(p=>p.map(e=>e.id===id?{...e,mensalidadePaga:true,bloqueado:false}:e));
  }

  async function toggleDia(id, dia) {
    const emp = empresarios.find(e=>e.id===id);
    const novoPag = {...(emp.pagamentosDiarios||{}),[dia]:!emp.pagamentosDiarios?.[dia]};
    await supabase.from("empresarios").update({pagamentos_diarios: novoPag}).eq("id", id);
    setEmpresarios(p=>p.map(e=>e.id===id?{...e,pagamentosDiarios:novoPag}:e));
  }

  async function cadastrar() {
    if (!form.nome.trim()) return;
    const t = {}; BAIRROS.forEach(b=>{t[b]={e:0,m:0};});
    const mg = parseInt(mesesGratis);
    let dataFim = null;
    if (mg>0) { const d=new Date(); d.setMonth(d.getMonth()+mg); dataFim=d.toISOString().split("T")[0]; }
    const { data, error } = await supabase.from("empresarios").insert({
      nome: form.nome, telefone: form.tel, bairro: form.bairro.trim(),
      cnpj: form.cnpj, nome_dono: form.nomeDono, tel_dono: form.telDono,
      nome_socio: form.nomeSocio, tel_socio: form.telSocio,
      endereco_estabelecimento: form.enderecoEstab,
      plano_pagamento: form.planoPagamento,
      plano_pagamento_motoboy: form.planoPagamentoMotoboy,
      plano_gratis: mg!==0, data_fim_gratis: mg===-1?null:dataFim,
      bloqueado: false, mensalidade_paga: mg!==0, pagamentos_diarios: {}, taxas: t,
      aprovado: true,
    }).select().single();
    if (!error && data) {
      setEmpresarios(p=>[...p,{
        id:data.id, nome:form.nome, tel:form.tel, bairro:form.bairro.trim(),
        cnpj:form.cnpj, nomeDono:form.nomeDono, telDono:form.telDono,
        nomeSocio:form.nomeSocio, telSocio:form.telSocio, enderecoEstab:form.enderecoEstab,
        planoPagamento:form.planoPagamento, planoPagamentoMotoboy:form.planoPagamentoMotoboy,
        planoGratis:mg!==0, dataFimGratis:mg===-1?"∞":dataFim,
        bloqueado:false, mensalidadePaga:mg!==0, pagamentosDiarios:{}, taxas:t,
      }]);
    }
    setModalCad(false); setForm(FVAZIO); setMesesGratis("0");
  }

  function totalSemana(emp) {
    const agora2 = new Date();
    const mes = agora2.getMonth()+1;
    const dia2 = agora2.getDate();
    const sem = dia2<=7?1:dia2<=14?2:dia2<=21?3:4;
    const ents = historico.filter(e=>e.empresarioId===emp.id&&e.status==="Entregue"&&e.mes===mes&&e.semana===sem&&!e.repasePago);
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

      {empresarios.length===0 && (
        <Card style={{textAlign:"center",padding:30}}>
          <div style={{color:"#4b5563",fontSize:14}}>Nenhum estabelecimento aprovado ainda.</div>
        </Card>
      )}

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
                {/* Régua de meta de entregas */}
                {(()=>{
                  const meta = 40;
                  const atual = emp.entregasMes || 0;
                  const pct = Math.min((atual/meta)*100, 100);
                  const bateu = atual >= meta;
                  return (
                    <div style={{marginTop:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <span style={{color: bateu?"#f59e0b":"#6b7280", fontSize:11, fontWeight:700}}>
                          {bateu ? "🏆 Meta batida — cobrar mensalidade!" : `📦 ${atual}/${meta} entregas este mês`}
                        </span>
                        <span style={{color: bateu?"#f59e0b":"#4b5563", fontSize:10}}>
                          {bateu ? "✅ Acima de 40" : `faltam ${meta-atual}`}
                        </span>
                      </div>
                      <div style={{background:"#1f2937",borderRadius:4,height:5}}>
                        <div style={{
                          background: bateu?"#f59e0b":"#3b82f6",
                          borderRadius:4, height:5,
                          width:`${pct}%`,
                          transition:"width 0.5s"
                        }}/>
                      </div>
                    </div>
                  );
                })()}

                {emp.planoGratis && emp.dataFimGratis && emp.dataFimGratis !== "∞" && (()=>{
                  const d = new Date(emp.dataFimGratis+"T12:00:00");
                  const hoje = new Date();
                  const diffMs = d - hoje;
                  const diffDias = Math.ceil(diffMs/(1000*60*60*24));
                  const meses = Math.round(diffDias/30);
                  const dataFmt = d.toLocaleDateString("pt-BR");
                  const label = meses>=3?"3 meses grátis":meses>=2?"2 meses grátis":meses>=1?"1 mês grátis":"período grátis";
                  return <div style={{color:"#a78bfa",fontSize:12,marginTop:2}}>🎁 {label} — até {dataFmt}</div>;
                })()}
                {emp.planoGratis && emp.dataFimGratis === "∞" && <div style={{color:"#a78bfa",fontSize:12,marginTop:2}}>♾️ Sempre grátis</div>}
                {!emp.planoGratis && !emp.mensalidadePaga && <div style={{color:"#ef4444",fontSize:12,marginTop:2,fontWeight:700}}>🔴 Período grátis encerrado — cobrar mensalidade!</div>}
                {motInad && emp.mensalidadePaga !== false && <div style={{color:"#fbbf24",fontSize:12,marginTop:2}}>⚠️ Inadimplente: {motInad}</div>}
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{textAlign:"center"}}><div style={{color:"#60a5fa",fontWeight:700,fontSize:16}}>R${ts.taxas}</div><div style={{color:"#6b7280",fontSize:10}}>taxas semana</div></div>
                <div style={{textAlign:"center"}}><div style={{color:emp.planoGratis||emp.mensalidadePaga?"#34d399":"#ef4444",fontWeight:700,fontSize:13}}>{emp.planoGratis?"🎁 Grátis":emp.mensalidadePaga?"✅ Pago":`❌ R$${MENSALIDADE}`}</div><div style={{color:"#6b7280",fontSize:10}}>mensalidade</div></div>
                <div style={{textAlign:"center"}}><div style={{color:"#a78bfa",fontWeight:900,fontSize:20}}>R${ts.total}</div><div style={{color:"#6b7280",fontSize:10}}>total a cobrar</div></div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {emp.planoGratis ? (
                  <Btn small cor="amarelo" onClick={()=>ativarGratis(emp.id,0)}>💰 Ativar cobrança</Btn>
                ) : (
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <Btn small cor="roxo" onClick={()=>ativarGratis(emp.id,1)}>🎁 1 mês</Btn>
                    <Btn small cor="roxo" onClick={()=>ativarGratis(emp.id,2)}>🎁 2 meses</Btn>
                    <Btn small cor="roxo" onClick={()=>ativarGratis(emp.id,3)}>🎁 3 meses</Btn>
                    <Btn small cor="roxo" onClick={()=>ativarGratis(emp.id,-1)}>♾️ Sempre</Btn>
                  </div>
                )}
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
            {[["geral","📊 Visão Geral"],["porDia","📅 Por Dia"],["pagamentos","💰 Pagamentos"],["taxas","🗺️ Taxas"]].map(([id,label])=>(
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
                {!empSel.planoGratis && (
                  <div style={{marginTop:10}}>
                    <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:8}}>🎁 Conceder período grátis:</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Btn small cor="roxo" onClick={()=>{ativarGratis(empSel.id,1);setSel(null);}}>🎁 1 mês</Btn>
                      <Btn small cor="roxo" onClick={()=>{ativarGratis(empSel.id,2);setSel(null);}}>🎁 2 meses</Btn>
                      <Btn small cor="roxo" onClick={()=>{ativarGratis(empSel.id,3);setSel(null);}}>🎁 3 meses</Btn>
                      <Btn small cor="roxo" onClick={()=>{ativarGratis(empSel.id,-1);setSel(null);}}>♾️ Sempre grátis</Btn>
                    </div>
                  </div>
                )}
                {empSel.planoGratis && (
                  <div style={{marginTop:10}}>
                    <Btn cor="amarelo" full onClick={()=>{ativarGratis(empSel.id,0);setSel(null);}}>💰 Encerrar período grátis — ativar cobrança</Btn>
                  </div>
                )}
              </Card>
            </div>
          )}

          {abaEmp==="porDia" && (()=>{
            const entregasDia = historico.filter(e=>e.empresarioId===empSel.id&&e.status==="Entregue"&&e.data===dataSelecionadaEmp);
            const totalDia = entregasDia.reduce((s,e)=>s+e.taxaEmpresario,0);
            const dataFmt = new Date(dataSelecionadaEmp+"T12:00:00").toLocaleDateString("pt-BR");
            const hojeISO = new Date().toISOString().split("T")[0];
            const ontemISO = (()=>{ const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().split("T")[0]; })();

            const porDia = {};
            historico.filter(e=>e.empresarioId===empSel.id&&e.status==="Entregue").forEach(e=>{
              if (!porDia[e.data]) porDia[e.data] = {qtd:0, total:0};
              porDia[e.data].qtd++;
              porDia[e.data].total += e.taxaEmpresario;
            });
            const diasOrdenados = Object.entries(porDia).sort((a,b)=>b[0].localeCompare(a[0]));

            return (
              <div>
                <Card style={{marginBottom:14,background:"#0d3d2e",border:"1px solid #34d399"}}>
                  <SectionTitle>💰 Taxas por dia — {empSel.nome}</SectionTitle>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
                    <input type="date" value={dataSelecionadaEmp} onChange={e=>setDataSelecionadaEmp(e.target.value)}
                      style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"9px 12px",fontSize:14,outline:"none"}}/>
                    <button onClick={()=>setDataSelecionadaEmp(hojeISO)} style={{padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:dataSelecionadaEmp===hojeISO?"#0d3d2e":"#1f2937",border:dataSelecionadaEmp===hojeISO?"1px solid #34d399":"1px solid #374151",color:dataSelecionadaEmp===hojeISO?"#34d399":"#9ca3af"}}>Hoje</button>
                    <button onClick={()=>setDataSelecionadaEmp(ontemISO)} style={{padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:dataSelecionadaEmp===ontemISO?"#0d3d2e":"#1f2937",border:dataSelecionadaEmp===ontemISO?"1px solid #34d399":"1px solid #374151",color:dataSelecionadaEmp===ontemISO?"#34d399":"#9ca3af"}}>Ontem</button>
                  </div>
                  <div style={{color:"#6b7280",fontSize:12,marginBottom:4}}>{dataFmt}</div>
                  <div style={{color:"#34d399",fontSize:32,fontWeight:900}}>R${totalDia}</div>
                  <div style={{color:"#6b7280",fontSize:12,marginTop:2}}>{entregasDia.length} entrega{entregasDia.length!==1?"s":""} nesta data</div>
                </Card>

                {entregasDia.length>0 && (
                  <Card style={{marginBottom:14}}>
                    <SectionTitle>Entregas de {dataFmt}</SectionTitle>
                    {entregasDia.map(e=>(
                      <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1f2937"}}>
                        <div>
                          <span style={{color:"#f9fafb",fontSize:13,fontWeight:600}}>{e.clienteNome}</span>
                          <span style={{color:"#6b7280",fontSize:12,marginLeft:8}}>{e.bairro}</span>
                        </div>
                        <span style={{color:"#60a5fa",fontWeight:700,fontSize:13}}>R${e.taxaEmpresario}</span>
                      </div>
                    ))}
                  </Card>
                )}

                {diasOrdenados.length>0 && (
                  <Card>
                    <SectionTitle>📅 Dias anteriores</SectionTitle>
                    {diasOrdenados.slice(0,30).map(([data,info])=>{
                      const dFmt = new Date(data+"T12:00:00").toLocaleDateString("pt-BR");
                      const sel = data===dataSelecionadaEmp;
                      return (
                        <div key={data} onClick={()=>setDataSelecionadaEmp(data)}
                          style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:sel?"#0d3d2e":"#0f172a",border:sel?"1px solid #34d399":"1px solid #1f2937",borderRadius:8,padding:"9px 14px",marginBottom:6,cursor:"pointer"}}>
                          <span style={{color:sel?"#34d399":"#d1d5db",fontSize:13,fontWeight:600}}>{dFmt}</span>
                          <span style={{color:"#6b7280",fontSize:12}}>{info.qtd} entrega{info.qtd!==1?"s":""}</span>
                          <span style={{color:"#60a5fa",fontWeight:700,fontSize:14}}>R${info.total.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </Card>
                )}
              </div>
            );
          })()}

          {abaEmp==="pagamentos" && (
            <div>
              <Card style={{marginBottom:12,padding:"14px 16px",background:"#0f172a"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{color:"#9ca3af",fontWeight:700,fontSize:13}}>💰 Comissão MotoFast</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {empSel.planoGratis ? <Tag label="🎁 Grátis" cor="#a78bfa"/> : empSel.mensalidadePaga ? (
                      <div style={{display:"flex",gap:6}}>
                        <Tag label="✅ Paga" cor="#34d399"/>
                        <Btn small cor="perigo" onClick={async()=>{
                          await supabase.from("empresarios").update({mensalidade_paga:false}).eq("id",empSel.id);
                          setEmpresarios(p=>p.map(e=>e.id===empSel.id?{...e,mensalidadePaga:false}:e));
                        }}>❌ Desmarcar</Btn>
                      </div>
                    ) : (
                      <Btn small cor="amarelo" onClick={()=>marcarMensalidade(empSel.id)}>💰 Marcar paga</Btn>
                    )}
                  </div>
                </div>
                <div style={{color:"#6b7280",fontSize:12,marginBottom:10}}>Plano atual: <strong style={{color:"#f9fafb"}}>{empSel.planoPagamento==="mensal"?"🗓️ Mensal (R$"+MENSALIDADE*4+"/mês)":"📋 Semanal (R$"+MENSALIDADE+"/semana — toda terça)"}</strong></div>
                <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:6}}>Mudar plano de pagamento:</div>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  {[["semanal","📋 Semanal (toda terça)"],["mensal","🗓️ Mensal"]].map(([val,label])=>(
                    <button key={val} onClick={async()=>{
                      await supabase.from("empresarios").update({plano_pagamento:val}).eq("id",empSel.id);
                      setEmpresarios(p=>p.map(e=>e.id===empSel.id?{...e,planoPagamento:val}:e));
                    }} style={{flex:1,padding:"10px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,
                      background:empSel.planoPagamento===val?"#0d3d2e":"#0f172a",
                      border:empSel.planoPagamento===val?"2px solid #34d399":"2px solid #374151",
                      color:empSel.planoPagamento===val?"#34d399":"#6b7280"}}>
                      {label} {empSel.planoPagamento===val?"✅":""}
                    </button>
                  ))}
                </div>
                {empSel.planoPagamento==="mensal" && (
                  <div style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{color:"#9ca3af",fontSize:12,fontWeight:700,marginBottom:8}}>📅 Qual dia do mês o empresário vai pagar?</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <input
                        type="number" min="1" max="28"
                        defaultValue={empSel.diaVencimento || new Date(empSel.criadoEm||Date.now()).getDate()}
                        id={`dia-venc-${empSel.id}`}
                        style={{background:"#111827",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"8px 12px",width:80,fontSize:16,fontWeight:700,outline:"none",textAlign:"center"}}
                      />
                      <span style={{color:"#6b7280",fontSize:13}}>de cada mês</span>
                      <button onClick={async()=>{
                        const dia = parseInt(document.getElementById(`dia-venc-${empSel.id}`).value);
                        if (!dia || dia<1 || dia>28) return;
                        await supabase.from("empresarios").update({dia_vencimento:dia}).eq("id",empSel.id);
                        setEmpresarios(p=>p.map(e=>e.id===empSel.id?{...e,diaVencimento:dia}:e));
                        alert(`✅ Dia de vencimento atualizado para todo dia ${dia}!`);
                      }} style={{padding:"8px 16px",borderRadius:8,background:"#10b981",border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                        💾 Salvar dia
                      </button>
                    </div>
                    <div style={{color:"#4b5563",fontSize:11,marginTop:6}}>
                      ⚠️ Máximo dia 28 — para funcionar em todos os meses do ano
                    </div>
                  </div>
                )}
              </Card>
              <Card style={{marginBottom:12,padding:"14px 16px",background:"#0f172a"}}>
                <div style={{color:"#9ca3af",fontWeight:700,fontSize:13,marginBottom:6}}>🏍️ Pagamento ao motoboy</div>
                <div style={{color:"#6b7280",fontSize:12,marginBottom:10}}>Plano atual: <strong style={{color:"#f9fafb"}}>{empSel.planoPagamentoMotoboy==="diario"?"📅 Diário (dia seguinte)":"📋 Semanal (toda terça)"}</strong></div>
                <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:6}}>Mudar forma de pagamento ao motoboy:</div>
                <div style={{display:"flex",gap:8}}>
                  {[["diario","📅 Diário"],["semanal","📋 Semanal"]].map(([val,label])=>(
                    <button key={val} onClick={async()=>{
                      await supabase.from("empresarios").update({plano_pagamento_motoboy:val}).eq("id",empSel.id);
                      setEmpresarios(p=>p.map(e=>e.id===empSel.id?{...e,planoPagamentoMotoboy:val}:e));
                    }} style={{flex:1,padding:"10px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,
                      background:empSel.planoPagamentoMotoboy===val?"#1a2f4a":"#0f172a",
                      border:empSel.planoPagamentoMotoboy===val?"2px solid #fbbf24":"2px solid #374151",
                      color:empSel.planoPagamentoMotoboy===val?"#fbbf24":"#6b7280"}}>
                      {label} {empSel.planoPagamentoMotoboy===val?"✅":""}
                    </button>
                  ))}
                </div>
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
                        <td style={{padding:"7px 12px"}}>
                          {editando
                            ? <input value={novoNomeBairro} onChange={e=>setNovoNomeBairro(e.target.value)}
                                onKeyDown={e=>{if(e.key==="Enter")renomearBairro(b);if(e.key==="Escape")setBairroEditando(null);}}
                                autoFocus style={{background:"#0f172a",border:"1px solid #60a5fa",borderRadius:6,color:"#f9fafb",padding:"5px 9px",fontSize:13,outline:"none",width:120}}/>
                            : <span style={{color:"#f9fafb",fontWeight:600,fontSize:13}}>{b}</span>}
                        </td>
                        <td style={{padding:"7px 12px"}}>
                          <input type="number" value={t.e} min="0" step="0.5" onChange={e=>setTaxasEdit(p=>({...p,[b]:{...p[b],e:+e.target.value}}))}
                            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:6,color:"#60a5fa",padding:"5px 9px",width:70,fontSize:14,fontWeight:700,outline:"none"}}/>
                        </td>
                        <td style={{padding:"7px 12px"}}>
                          <input type="number" value={t.m} min="0" step="0.5" onChange={e=>setTaxasEdit(p=>({...p,[b]:{...p[b],m:+e.target.value}}))}
                            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:6,color:"#fbbf24",padding:"5px 9px",width:70,fontSize:14,fontWeight:700,outline:"none"}}/>
                        </td>
                        <td style={{padding:"9px 12px",color:+lucro>0?"#a78bfa":"#f87171",fontWeight:700,fontSize:14}}>R${lucro}</td>
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

  async function salvar() {
    await supabase.from("clientes").update({
      nome: form.nome, telefone: form.tel,
      rua: form.endereco.rua, numero: form.endereco.num,
      bairro: form.endereco.bairro, referencia: form.endereco.ref,
    }).eq("id", editId);
    setClientes(p=>p.map(c=>c.id===editId?{...c,...form}:c));
    setEditId(null);
  }

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
      {clientes.length===0 && <Card style={{textAlign:"center",padding:30}}><div style={{color:"#4b5563"}}>Nenhum cliente cadastrado ainda.</div></Card>}
      {clientes.length>0 && (
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
      )}

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

  const mesesDisponiveis = [...new Set(historico.map(e=>MESES[e.mes-1]))];

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
          <select value={filtroMes} onChange={e=>setFiltroMes(e.target.value)} style={ss}>
            <option value="Todos">Todos os meses</option>
            {mesesDisponiveis.map(o=><option key={o}>{o}</option>)}
          </select>
          <select value={filtroMb} onChange={e=>setFiltroMb(e.target.value)} style={ss}>
            <option value="Todos">Todos motoboys</option>
            {motoboys.filter(m=>!m.banido).map(m=><option key={m.id} value={String(m.id)}>{m.nomeCompleto.split(" ")[0]}</option>)}
          </select>
        </div>
      </div>
      {historico.length===0 && <Card style={{textAlign:"center",padding:30}}><div style={{color:"#4b5563"}}>Nenhuma entrega registrada ainda.</div></Card>}
      {historico.length>0 && (
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"#0f172a",borderBottom:"1px solid #1f2937"}}>
                {["Data","Saiu às","Entregue às","Cliente","Bairro","Motoboy","Estabelecimento","Pgto","Cobrado","Motoboy","Lucro","Status"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.slice(0,100).map(e=>{
                const mb  = motoboys.find(m=>m.id===e.motoboyId);
                const emp = empresarios.find(x=>x.id===e.empresarioId);
                const pg  = PG[e.pagamento] || {icon:"•",cor:"#9ca3af"};
                const entregue = e.status==="Entregue";
                return (
                  <tr key={e.id} style={{borderBottom:"1px solid #1a2035"}} onMouseOver={ev=>ev.currentTarget.style.background="#0f172a"} onMouseOut={ev=>ev.currentTarget.style.background="transparent"}>
                    <td style={{padding:"8px 12px",color:"#9ca3af",whiteSpace:"nowrap"}}>{e.data}</td>
                    <td style={{padding:"8px 12px",color:"#fbbf24",fontWeight:700,whiteSpace:"nowrap"}}>🏍️ {e.horaSaida||"—"}</td>
                    <td style={{padding:"8px 12px",color:"#34d399",fontWeight:700,whiteSpace:"nowrap"}}>✅ {e.horaEntrega||"—"}</td>
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
          {lista.length===0 && <div style={{textAlign:"center",padding:30,color:"#4b5563"}}>Nenhum registro encontrado.</div>}
        </Card>
      )}
    </div>
  );
}

// ─── AVALIAÇÕES ───────────────────────────────────────────────────────────────
function Avaliacoes({ avaliacoes, motoboys }) {
  const [filtroMb, setFiltroMb] = useState("Todos");

  const lista = filtroMb === "Todos"
    ? avaliacoes
    : avaliacoes.filter(a => a.motoboy_nome === filtroMb);

  // Média por motoboy
  const medias = motoboys.filter(m=>!m.banido).map(mb => {
    const avs = avaliacoes.filter(a => a.motoboy_nome === mb.nomeCompleto);
    const mediaMb = avs.length > 0
      ? (avs.reduce((s,a)=>s+(a.nota_motoboy||0),0)/avs.length).toFixed(1)
      : "—";
    const mediaMf = avs.length > 0
      ? (avs.reduce((s,a)=>s+(a.nota_motofast||0),0)/avs.length).toFixed(1)
      : "—";
    return {...mb, qtdAval: avs.length, mediaMotoboy: mediaMb, mediaMotofast: mediaMf};
  }).sort((a,b)=>b.qtdAval-a.qtdAval);

  const mediaGeralMb = avaliacoes.length > 0
    ? (avaliacoes.reduce((s,a)=>s+(a.nota_motoboy||0),0)/avaliacoes.length).toFixed(1)
    : "—";
  const mediaGeralMf = avaliacoes.length > 0
    ? (avaliacoes.reduce((s,a)=>s+(a.nota_motofast||0),0)/avaliacoes.length).toFixed(1)
    : "—";

  function Estrelinhas({ nota }) {
    if (!nota || nota === "—") return <span style={{color:"#4b5563"}}>—</span>;
    const n = parseFloat(nota);
    return (
      <span style={{color:"#f59e0b",fontSize:13}}>
        {"⭐".repeat(Math.round(n))}{"☆".repeat(5-Math.round(n))}
        <span style={{color:"#fbbf24",fontWeight:700,marginLeft:4}}>{nota}</span>
      </span>
    );
  }

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{color:"#34d399",fontWeight:800,fontSize:20}}>⭐ Avaliações</div>
        <div style={{color:"#6b7280",fontSize:13}}>{avaliacoes.length} avaliações recebidas</div>
      </div>

      {/* Cards de média geral */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
        <Stat icon="⭐" label="Média dos Motoboys" value={mediaGeralMb} sub={`${avaliacoes.length} avaliações`} cor="#f59e0b"/>
        <Stat icon="⚡" label="Média do MotoFast" value={mediaGeralMf} sub="satisfação geral" cor="#34d399"/>
        <Stat icon="📋" label="Total de avaliações" value={avaliacoes.length} cor="#60a5fa"/>
      </div>

      {/* Ranking por motoboy */}
      {/* Legenda das estrelas */}
      <Card style={{marginBottom:16,background:"#0f172a"}}>
        <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>📖 Significado das estrelas</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["⭐","1 — Muito ruim","#ef4444"],["⭐⭐","2 — Ruim","#f97316"],["⭐⭐⭐","3 — Regular","#fbbf24"],["⭐⭐⭐⭐","4 — Bom","#84cc16"],["⭐⭐⭐⭐⭐","5 — Excelente","#34d399"]].map(([s,l,c])=>(
            <div key={l} style={{background:"#111827",borderRadius:8,padding:"8px 12px",flex:1,minWidth:100,textAlign:"center"}}>
              <div style={{fontSize:14}}>{s}</div>
              <div style={{color:c,fontSize:11,fontWeight:700,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{marginBottom:20}}>
        <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>🏆 Ranking por Motoboy</div>
        {medias.filter(m=>m.qtdAval>0).length === 0 && (
          <Card><div style={{color:"#4b5563",textAlign:"center",padding:20}}>Nenhuma avaliação ainda.</div></Card>
        )}
        {medias.filter(m=>m.qtdAval>0).map((mb,i)=>(
          <Card key={mb.id} style={{marginBottom:10,border: parseFloat(mb.mediaMotoboy)<3?"1px solid #ef4444":"1px solid #1f2937"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,background:i===0?"#f59e0b":i===1?"#9ca3af":i===2?"#b45309":"#1f2937",color:i<3?"#000":"#6b7280",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{color:"#f9fafb",fontWeight:700,fontSize:14,marginBottom:4}}>{mb.nomeCompleto}</div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <div>
                    <div style={{color:"#6b7280",fontSize:10,fontWeight:600,marginBottom:2}}>🏍️ ENTREGA</div>
                    <Estrelinhas nota={mb.mediaMotoboy}/>
                  </div>
                  <div>
                    <div style={{color:"#6b7280",fontSize:10,fontWeight:600,marginBottom:2}}>⚡ MOTOFAST</div>
                    <Estrelinhas nota={mb.mediaMotofast}/>
                  </div>
                  <div>
                    <div style={{color:"#6b7280",fontSize:10,fontWeight:600,marginBottom:2}}>📋 AVALIAÇÕES</div>
                    <span style={{color:"#60a5fa",fontWeight:700}}>{mb.qtdAval}</span>
                  </div>
                </div>
              </div>
              {parseFloat(mb.mediaMotoboy)<3 && (
                <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"6px 12px"}}>
                  <div style={{color:"#f87171",fontSize:11,fontWeight:700}}>⚠️ Nota baixa — verificar</div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Lista de avaliações */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <div style={{color:"#9ca3af",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>📋 Todas as Avaliações</div>
          <select value={filtroMb} onChange={e=>setFiltroMb(e.target.value)}
            style={{background:"#0f172a",border:"1px solid #374151",borderRadius:8,color:"#f9fafb",padding:"6px 10px",fontSize:12}}>
            <option value="Todos">Todos os motoboys</option>
            {motoboys.filter(m=>!m.banido).map(m=>(
              <option key={m.id} value={m.nomeCompleto}>{m.nomeCompleto.split(" ")[0]}</option>
            ))}
          </select>
        </div>

        {lista.length === 0 && (
          <Card><div style={{color:"#4b5563",textAlign:"center",padding:20}}>Nenhuma avaliação encontrada.</div></Card>
        )}

        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"#0f172a",borderBottom:"1px solid #1f2937"}}>
                {["Data","Cliente","Estabelecimento","Motoboy","🏍️ Entrega","⚡ MotoFast"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",color:"#6b7280",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((a,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #1a2035"}}
                  onMouseOver={e=>e.currentTarget.style.background="#0f172a"}
                  onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 14px",color:"#9ca3af",fontSize:12}}>
                    {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{padding:"10px 14px",color:"#f9fafb",fontSize:12,fontWeight:600}}>{a.cliente_nome||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#d1d5db",fontSize:12}}>{a.empresa_nome||"—"}</td>
                  <td style={{padding:"10px 14px",color:"#f9fafb",fontWeight:600,fontSize:12}}>{a.motoboy_nome?.split(" ")[0]||"—"}</td>
                  <td style={{padding:"10px 14px"}}>
                    <span style={{color:"#f59e0b"}}>{"⭐".repeat(a.nota_motoboy||0)}</span>
                    <span style={{color:"#fbbf24",fontWeight:700,marginLeft:4}}>{a.nota_motoboy}/5</span>
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    <span style={{color:"#34d399"}}>{"⭐".repeat(a.nota_motofast||0)}</span>
                    <span style={{color:"#34d399",fontWeight:700,marginLeft:4}}>{a.nota_motofast}/5</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length===0 && <div style={{textAlign:"center",padding:24,color:"#4b5563"}}>Nenhuma avaliação.</div>}
        </Card>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [aba, setAba] = useState("dashboard");
  const [motoboys, setMotoboys]       = useState([]);
  const [empresarios, setEmpresarios] = useState([]);
  const [clientes, setClientes]       = useState([]);
  const [historico, setHistorico]     = useState([]);
  const [carregando, setCarregando]   = useState(true);

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [pendentes, setPendentes] = useState({motoboys:[], empresarios:[]});
  const [loadingPendentes, setLoadingPendentes] = useState(false);
  const [modalRejeitar, setModalRejeitar] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  // ── Carrega dados reais do Supabase ao iniciar ──
  useEffect(()=>{
    carregarTudo();

    // Realtime — atualiza online dos motoboys em tempo real
    const canal = supabase
      .channel("motoboys-online")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "motoboys" }, (payload) => {
        if (payload.new) {
          setMotoboys(prev => prev.map(m =>
            m.id === payload.new.id ? {
              ...m,
              online: payload.new.online,
              ativo: !payload.new.bloqueado,
            } : m
          ));
        }
      })
      .subscribe();

    // Polling de segurança a cada 10s — atualiza status online de todos os motoboys
    const pollingOnline = setInterval(async () => {
      const { data } = await supabase
        .from("motoboys")
        .select("id, online, bloqueado")
        .eq("aprovado", true);
      if (data) {
        setMotoboys(prev => prev.map(m => {
          const atualizado = data.find(d => d.id === m.id);
          if (!atualizado) return m;
          return {...m, online: atualizado.online, ativo: !atualizado.bloqueado};
        }));
      }
    }, 10000);

    return () => {
      supabase.removeChannel(canal);
      clearInterval(pollingOnline);
    };
  },[]);

  async function carregarTudo() {
    setCarregando(true);
    try {
      const [mbRes, empRes, cliRes, pedRes, avalRes] = await Promise.all([
        supabase.from("motoboys").select("*").eq("aprovado", true),
        supabase.from("empresarios").select("*").eq("aprovado", true),
        supabase.from("clientes").select("*"),
        supabase.from("pedidos").select("*").order("criado_em", {ascending: false}),
        supabase.from("avaliacoes").select("*").order("criado_em", {ascending: false}),
      ]);

      const mbs = (mbRes.data || []).map(m => ({
        id: m.id,
        nomeCompleto: m.nome_completo || "",
        tel: m.telefone || "",
        pix: m.pix || "",
        bairroBase: m.bairro_base || "",
        cpf: m.cpf || "",
        rg: m.rg || "",
        nascimento: m.nascimento || "",
        nomePai: m.nome_pai || "",
        nomeMae: m.nome_mae || "",
        endereco: m.endereco || "",
        online: m.online || false,
        ativo: !m.bloqueado,
        banido: m.banido || false,
        motivoBanimento: m.motivo_banimento || null,
        dataBanimento: m.data_banimento || null,
      }));

      const emps = (empRes.data || []).map(e => ({
        id: e.id,
        nome: e.nome || "",
        tel: e.telefone || "",
        bairro: e.bairro || "",
        cnpj: e.cnpj || "",
        nomeDono: e.nome_dono || "",
        telDono: e.tel_dono || "",
        nomeSocio: e.nome_socio || "",
        telSocio: e.tel_socio || "",
        enderecoEstab: e.endereco_estabelecimento || "",
        planoPagamento: e.plano_pagamento || "semanal",
        planoPagamentoMotoboy: e.plano_pagamento_motoboy || "diario",
        planoGratis: e.plano_gratis || false,
        dataFimGratis: e.data_fim_gratis || null,
        bloqueado: e.bloqueado || false,
        mensalidadePaga: e.mensalidade_paga !== false,
        pagamentosDiarios: e.pagamentos_diarios || {},
        taxas: e.taxas || {},
        diaVencimento: e.dia_vencimento || new Date(e.criado_em||Date.now()).getDate(),
      }));

      const clis = (cliRes.data || []).map(c => ({
        id: c.id,
        nome: c.nome || "",
        tel: c.telefone || "",
        endereco: {
          rua: c.rua || "",
          num: c.numero || "",
          bairro: c.bairro || "",
          ref: c.referencia || "",
        }
      }));

      const hist = (pedRes.data || [])
        .filter(p => p.status === "entregue" || p.status === "cancelado")
        .map(p => {
          const criadoEm = new Date(p.criado_em);
          const mes = criadoEm.getMonth() + 1;
          const dia = criadoEm.getDate();
          const sem = dia<=7?1:dia<=14?2:dia<=21?3:4;
          const dataStr = criadoEm.toISOString().split("T")[0];
          let horaSaida = "—";
          if (p.saiu_estabelecimento_em) {
            const d = new Date(p.saiu_estabelecimento_em);
            horaSaida = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
          }
          let horaEntrega = "—";
          if (p.entregue_em) {
            const d = new Date(p.entregue_em);
            horaEntrega = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
          }
          const taxaEmp = p.taxa_empresario || p.taxa || 0;
          const taxaMb  = p.taxa_motoboy || 0;
          // lucro = o que você fica (diferença entre taxa do cliente e taxa do motoboy)
          const lucroEntrega = taxaEmp - taxaMb;
          return {
            id: p.id,
            motoboyId: p.motoboy_id,
            empresarioId: p.empresario_id,
            clienteNome: p.cliente_nome || "",
            bairro: p.bairro || "",
            pagamento: p.forma_pagamento || "pix",
            taxaEmpresario: taxaEmp,
            taxaMotoboy: taxaMb,
            lucro: lucroEntrega,
            status: p.status === "entregue" ? "Entregue" : "Cancelada",
            data: dataStr,
            horaSaida,
            horaEntrega,
            mes,
            semana: sem,
            repasePago: p.repasse_pago || false,
          };
        });

      // Verifica empresários com plano grátis vencido e atualiza banco automaticamente
      const hoje = new Date().toISOString().split("T")[0];
      const vencidos = emps.filter(e =>
        e.planoGratis && e.dataFimGratis && e.dataFimGratis !== "∞" && e.dataFimGratis < hoje
      );
      for (const emp of vencidos) {
        await supabase.from("empresarios").update({
          plano_gratis: false,
          data_fim_gratis: null,
          mensalidade_paga: false,
        }).eq("id", emp.id);
        // Atualiza localmente
        const idx = emps.findIndex(e => e.id === emp.id);
        if (idx >= 0) {
          emps[idx] = {...emps[idx], planoGratis: false, dataFimGratis: null, mensalidadePaga: false};
        }
      }

      // Busca entregas do mês atual por empresário para régua de meta
      const inicioMesAtual = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: entregasMesDB } = await supabase
        .from("pedidos")
        .select("empresario_id")
        .eq("status", "entregue")
        .gte("criado_em", inicioMesAtual);

      // Conta entregas por empresário
      const contagemEntregas = {};
      (entregasMesDB || []).forEach(p => {
        if (!p.empresario_id) return;
        contagemEntregas[p.empresario_id] = (contagemEntregas[p.empresario_id] || 0) + 1;
      });

      // Adiciona contagem nas empresas
      const empsComMeta = emps.map(e => ({...e, entregasMes: contagemEntregas[e.id] || 0}));

      setMotoboys(mbs);
      setEmpresarios(empsComMeta);
      setClientes(clis);
      setHistorico(hist);
      setAvaliacoes(avalRes.data || []);
    } catch(err) {
      console.error("Erro ao carregar dados:", err);
    }
    setCarregando(false);
  }

  useEffect(()=>{
    if (aba==="pendentes") carregarPendentes();
  },[aba]);

  // Polling de 30s — verifica novos cadastros automaticamente
  useEffect(()=>{
    const intervalo = setInterval(async ()=>{
      const [mb, emp] = await Promise.all([
        supabase.from("motoboys").select("id").eq("aprovado",false).eq("rejeitado",false),
        supabase.from("empresarios").select("id").eq("aprovado",false).eq("rejeitado",false),
      ]);
      const totalNovo = (mb.data?.length||0) + (emp.data?.length||0);
      const totalAtual = pendentes.motoboys.length + pendentes.empresarios.length;
      // Se chegou cadastro novo, recarrega e notifica
      if (totalNovo > totalAtual) {
        carregarPendentes();
      }
    }, 30000);
    return ()=>clearInterval(intervalo);
  },[pendentes]);

  async function carregarPendentes() {
    setLoadingPendentes(true);
    const [mb, emp] = await Promise.all([
      supabase.from("motoboys").select("*").eq("aprovado",false).eq("rejeitado",false),
      supabase.from("empresarios").select("*").eq("aprovado",false).eq("rejeitado",false),
    ]);
    setPendentes({
      motoboys: mb.data || [],
      empresarios: emp.data || [],
    });
    setLoadingPendentes(false);
  }

  async function aprovar(tipo, id) {
    await supabase.from(tipo).update({aprovado:true, aprovado_em: new Date().toISOString()}).eq("id", id);
    carregarPendentes();
    carregarTudo();
  }

  async function rejeitar() {
    if (!modalRejeitar || !motivoRejeicao.trim()) return;
    await supabase.from(modalRejeitar.tipo).update({rejeitado:true, motivo_rejeicao: motivoRejeicao}).eq("id", modalRejeitar.id);
    setModalRejeitar(null);
    setMotivoRejeicao("");
    carregarPendentes();
  }

  const totalPendentes = pendentes.motoboys.length + pendentes.empresarios.length;
  const saldo     = historico.filter(e=>e.status==="Entregue"&&!e.repasePago).reduce((s,e)=>s+e.lucro,0).toFixed(2);
  const bloqueados = empresarios.filter(e=>e.bloqueado).length;
  const banidos   = motoboys.filter(m=>m.banido).length;

  const ABAS = [
    {id:"dashboard",label:"📊 Dashboard"},
    {id:"pendentes",label:"⏳ Pendentes", badge: pendentes.motoboys.length + pendentes.empresarios.length},
    {id:"repasse",label:"💰 Repasse"},
    {id:"motoboys",label:"🏍️ Motoboys"},
    {id:"estabelecimentos",label:"🏪 Estabelecimentos"},
    {id:"clientes",label:"👤 Clientes"},
    {id:"historico",label:"📋 Histórico"},
    {id:"avaliacoes",label:"⭐ Avaliações"},
  ];

  if (carregando) return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>⚡</div>
        <div style={{color:"#34d399",fontWeight:700,fontSize:20}}>Carregando dados...</div>
        <div style={{color:"#6b7280",fontSize:13,marginTop:8}}>Buscando informações do banco de dados</div>
      </div>
    </div>
  );

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
              <button key={a.id} onClick={()=>setAba(a.id)} style={{background:aba===a.id?"#0d3d2e":"transparent",color:aba===a.id?"#34d399":"#6b7280",border:"none",borderBottom:aba===a.id?"2px solid #34d399":"2px solid transparent",padding:"13px 12px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",position:"relative"}}>
                {a.label}
                {a.id==="pendentes" && totalPendentes>0 && (
                  <span style={{position:"absolute",top:6,right:2,background:"#ef4444",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{totalPendentes}</span>
                )}
              </button>
            ))}
          </nav>
          <div style={{display:"flex",gap:8,padding:"8px 0",flexShrink:0}}>
            {+saldo>0 && <button onClick={()=>setAba("repasse")} style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#34d399",fontWeight:700,cursor:"pointer"}}>💰 Meu lucro: R${saldo}</button>}
            {bloqueados>0 && <button onClick={()=>setAba("estabelecimentos")} style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#f87171",fontWeight:700,cursor:"pointer"}}>⛔ {bloqueados} bloqueado(s)</button>}
            {banidos>0 && <button onClick={()=>setAba("motoboys")} style={{background:"#1f2937",border:"1px solid #6b7280",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#9ca3af",fontWeight:700,cursor:"pointer"}}>⛔ {banidos} banido(s)</button>}
            <button onClick={async()=>{ await supabase.auth.signOut(); window.location.href = "/"; }}
              style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>
              🚪 Sair
            </button>
            <button onClick={carregarTudo} style={{background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>
              🔄
            </button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}}>
        {aba==="pendentes" && (
          <div>
            <div style={{marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#f9fafb",fontWeight:800,fontSize:20}}>⏳ Cadastros Pendentes</div>
                <div style={{color:"#6b7280",fontSize:13,marginTop:2}}>Aprove ou rejeite cada cadastro antes de liberar o acesso</div>
              </div>
              <button onClick={carregarPendentes} style={{background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12}}>🔄 Atualizar</button>
            </div>

            {loadingPendentes && <div style={{textAlign:"center",color:"#6b7280",padding:40}}>Carregando...</div>}

            {!loadingPendentes && totalPendentes===0 && (
              <Card style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:12}}>✅</div>
                <div style={{color:"#34d399",fontWeight:700,fontSize:18,marginBottom:6}}>Tudo em dia!</div>
                <div style={{color:"#6b7280",fontSize:14}}>Não há cadastros aguardando aprovação.</div>
              </Card>
            )}

            {pendentes.motoboys.length>0 && (
              <div style={{marginBottom:24}}>
                <div style={{color:"#fbbf24",fontWeight:700,fontSize:14,marginBottom:12}}>🏍️ Motoboys aguardando aprovação ({pendentes.motoboys.length})</div>
                {pendentes.motoboys.map(mb=>(
                  <Card key={mb.id} style={{marginBottom:12,border:"1px solid #fbbf2444"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{color:"#f9fafb",fontWeight:700,fontSize:16,marginBottom:4}}>{mb.nome_completo}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:6}}>
                          <span style={{color:"#9ca3af",fontSize:12}}>📞 {mb.telefone}</span>
                          <span style={{color:"#9ca3af",fontSize:12}}>💠 PIX: {mb.pix||"—"}</span>
                          <span style={{color:"#9ca3af",fontSize:12}}>📅 Nasc: {mb.nascimento||"—"}</span>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
                          <span style={{color:"#9ca3af",fontSize:12}}>🪪 CPF: {mb.cpf||"—"}</span>
                          <span style={{color:"#9ca3af",fontSize:12}}>🪪 RG: {mb.rg||"—"}</span>
                        </div>
                        {mb.endereco && <div style={{color:"#9ca3af",fontSize:12,marginTop:4}}>🏠 {mb.endereco}</div>}
                        <div style={{color:"#4b5563",fontSize:11,marginTop:6}}>Cadastrado em: {new Date(mb.criado_em).toLocaleString("pt-BR")}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:120}}>
                        <button onClick={()=>aprovar("motoboys",mb.id)} style={{padding:"10px 16px",borderRadius:8,background:"#10b981",border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>✅ Aprovar</button>
                        <button onClick={()=>{setModalRejeitar({tipo:"motoboys",id:mb.id,nome:mb.nome_completo});setMotivoRejeicao("");}} style={{padding:"10px 16px",borderRadius:8,background:"#1f2937",border:"1px solid #ef4444",color:"#f87171",fontWeight:700,fontSize:13,cursor:"pointer"}}>❌ Rejeitar</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {pendentes.empresarios.length>0 && (
              <div>
                <div style={{color:"#60a5fa",fontWeight:700,fontSize:14,marginBottom:12}}>🏪 Empresários aguardando aprovação ({pendentes.empresarios.length})</div>
                {pendentes.empresarios.map(emp=>(
                  <Card key={emp.id} style={{marginBottom:12,border:"1px solid #3b82f644"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{color:"#f9fafb",fontWeight:700,fontSize:16,marginBottom:4}}>{emp.nome}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:6}}>
                          <span style={{color:"#9ca3af",fontSize:12}}>📞 {emp.telefone}</span>
                          <span style={{color:"#9ca3af",fontSize:12}}>📍 {emp.bairro||"—"}</span>
                        </div>
                        <span style={{color:"#9ca3af",fontSize:12}}>👤 Dono: {emp.nome_dono||"—"} · {emp.tel_dono||"—"}</span>
                        {emp.nome_socio && <div style={{color:"#9ca3af",fontSize:12,marginTop:2}}>👥 Sócio: {emp.nome_socio} · {emp.tel_socio}</div>}
                        <div style={{color:"#4b5563",fontSize:11,marginTop:6}}>Cadastrado em: {new Date(emp.criado_em).toLocaleString("pt-BR")}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:120}}>
                        <button onClick={()=>aprovar("empresarios",emp.id)} style={{padding:"10px 16px",borderRadius:8,background:"#10b981",border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>✅ Aprovar</button>
                        <button onClick={()=>{setModalRejeitar({tipo:"empresarios",id:emp.id,nome:emp.nome});setMotivoRejeicao("");}} style={{padding:"10px 16px",borderRadius:8,background:"#1f2937",border:"1px solid #ef4444",color:"#f87171",fontWeight:700,fontSize:13,cursor:"pointer"}}>❌ Rejeitar</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {modalRejeitar && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div style={{background:"#111827",border:"2px solid #ef4444",borderRadius:16,width:"100%",maxWidth:420,padding:24}}>
                  <div style={{color:"#f87171",fontWeight:900,fontSize:18,marginBottom:6}}>❌ Rejeitar cadastro</div>
                  <div style={{color:"#9ca3af",fontSize:13,marginBottom:16}}>{modalRejeitar.nome}</div>
                  <textarea value={motivoRejeicao} onChange={e=>setMotivoRejeicao(e.target.value)}
                    placeholder="Ex: Documentos inválidos, CPF incorreto..."
                    rows={3} style={{background:"#0f172a",border:"1px solid #ef4444",borderRadius:8,color:"#f9fafb",padding:"10px 12px",width:"100%",fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:14}}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={rejeitar} disabled={!motivoRejeicao.trim()}
                      style={{flex:2,padding:"12px",borderRadius:8,background:"#ef4444",border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",opacity:motivoRejeicao.trim()?1:0.4}}>
                      Confirmar rejeição
                    </button>
                    <button onClick={()=>setModalRejeitar(null)}
                      style={{flex:1,padding:"12px",borderRadius:8,background:"#1f2937",border:"1px solid #374151",color:"#9ca3af",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {aba==="dashboard" && <Dashboard historico={historico} motoboys={motoboys} empresarios={empresarios}/> }
        {aba==="repasse"          && <Repasse historico={historico} setHistorico={setHistorico} motoboys={motoboys} empresarios={empresarios}/>}
        {aba==="motoboys"         && <Motoboys motoboys={motoboys} setMotoboys={setMotoboys} historico={historico}/>}
        {aba==="estabelecimentos" && <Estabelecimentos empresarios={empresarios} setEmpresarios={setEmpresarios} historico={historico}/>}
        {aba==="clientes"         && <Clientes clientes={clientes} setClientes={setClientes} historico={historico} empresarios={empresarios}/>}
        {aba==="historico"        && <Historico historico={historico} motoboys={motoboys} empresarios={empresarios}/>}
        {aba==="avaliacoes"        && <Avaliacoes avaliacoes={avaliacoes} motoboys={motoboys}/>}
      </div>
    </div>
  );
}
