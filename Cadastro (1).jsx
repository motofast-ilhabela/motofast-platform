import { useState } from "react";
import { supabase } from "./supabaseClient.js";

// ─── VALIDAÇÕES ───────────────────────────────────────────────────────────────
function validarSenha(senha) {
  const erros = [];
  if (senha.length < 8) erros.push("Mínimo 8 caracteres");
  if (!/[A-Z]/.test(senha)) erros.push("Pelo menos 1 letra maiúscula");
  if (!/[0-9]/.test(senha)) erros.push("Pelo menos 1 número");
  const especiais = (senha.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (especiais < 2) erros.push("Pelo menos 2 caracteres especiais (!@#$%...)");
  return erros;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Inp({ label, value, onChange, placeholder="", type="text", hint, erro, obrigatorio }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{color:"#9ca3af",fontSize:12,marginBottom:4,fontWeight:600}}>
        {label}{obrigatorio && <span style={{color:"#ef4444",marginLeft:3}}>*</span>}
      </div>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:"#0f172a",border:`1px solid ${erro?"#ef4444":"#374151"}`,borderRadius:8,color:"#f9fafb",padding:"10px 14px",width:"100%",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
      {hint && !erro && <div style={{color:"#4b5563",fontSize:11,marginTop:3}}>{hint}</div>}
      {erro && <div style={{color:"#f87171",fontSize:11,marginTop:3}}>⚠️ {erro}</div>}
    </div>
  );
}

function Btn({ children, onClick, cor="verde", full, disabled, loading }) {
  const cores = {verde:{bg:"#10b981",c:"#fff"},cinza:{bg:"#1f2937",c:"#d1d5db"},azul:{bg:"#3b82f6",c:"#fff"}};
  const c = cores[cor]||cores.verde;
  return (
    <button onClick={onClick} disabled={disabled||loading}
      style={{background:c.bg,color:c.c,border:"none",borderRadius:10,padding:"13px 20px",fontSize:15,fontWeight:700,cursor:(disabled||loading)?"not-allowed":"pointer",opacity:(disabled||loading)?0.5:1,width:full?"100%":"auto",transition:"opacity 0.2s"}}>
      {loading?"Aguarde...":children}
    </button>
  );
}

function Divider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
      <div style={{flex:1,height:1,background:"#1f2937"}}/>
      {label && <span style={{color:"#4b5563",fontSize:12,whiteSpace:"nowrap"}}>{label}</span>}
      <div style={{flex:1,height:1,background:"#1f2937"}}/>
    </div>
  );
}

function STitle({ children }) {
  return <div style={{color:"#60a5fa",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12,marginTop:4}}>{children}</div>;
}

function SenhaForca({ senha }) {
  const erros = validarSenha(senha);
  const regras = [
    { label:"Mínimo 8 caracteres",      ok: senha.length>=8 },
    { label:"1 letra maiúscula",         ok: /[A-Z]/.test(senha) },
    { label:"1 número",                  ok: /[0-9]/.test(senha) },
    { label:"2 caracteres especiais",    ok: (senha.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g)||[]).length>=2 },
  ];
  if (!senha) return null;
  return (
    <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginTop:6,marginBottom:4}}>
      {regras.map((r,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:13,color:r.ok?"#34d399":"#ef4444"}}>{r.ok?"✅":"❌"}</span>
          <span style={{fontSize:12,color:r.ok?"#34d399":"#9ca3af"}}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── TELA DE SUCESSO ──────────────────────────────────────────────────────────
function TelaSucesso({ tipo, onVoltar }) {
  return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:64,marginBottom:16}}>🎉</div>
      <div style={{color:"#34d399",fontWeight:900,fontSize:24,marginBottom:10}}>
        Cadastro enviado!
      </div>
      <div style={{color:"#9ca3af",fontSize:15,lineHeight:1.7,marginBottom:24,maxWidth:360,margin:"0 auto 24px"}}>
        Recebemos suas informações com sucesso!
        <br/><br/>
        Nossa equipe vai analisar seu cadastro e você receberá uma confirmação por e-mail em até <strong style={{color:"#fbbf24"}}>24 horas</strong>.
        <br/><br/>
        {tipo==="empresario"
          ? "Assim que aprovado, você já poderá solicitar entregas pela MotoFast."
          : "Assim que aprovado, você já poderá receber pedidos pela MotoFast."}
      </div>
      <div style={{background:"#0f172a",border:"1px solid #1f2937",borderRadius:12,padding:"16px 20px",maxWidth:360,margin:"0 auto 24px",textAlign:"left"}}>
        <div style={{color:"#9ca3af",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>O que acontece agora?</div>
        {[
          "Você receberá um e-mail de confirmação",
          "Nossa equipe analisa seu cadastro",
          "Aprovado! Você entra com seu e-mail e senha",
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
            <span style={{background:"#34d399",color:"#000",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</span>
            <span style={{color:"#d1d5db",fontSize:13}}>{p}</span>
          </div>
        ))}
      </div>
      <Btn onClick={onVoltar} cor="cinza">← Voltar ao início</Btn>
    </div>
  );
}

// ─── CADASTRO EMPRESÁRIO ──────────────────────────────────────────────────────
function CadastroEmpresario({ onVoltar, onSucesso }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const [form, setForm] = useState({
    // Empresa
    nomeEstab:"", cnpj:"", enderecoEstab:"", bairro:"", tel:"",
    // Dono
    nomeDono:"", cpfDono:"", rgDono:"", whatsappDono:"",
    // Sócio (opcional)
    nomeSocio:"", whatsappSocio:"",
    // Acesso
    email:"", emailConfirm:"", senha:"", senhaConfirm:"",
  });

  function set(campo, val) { setForm(f=>({...f,[campo]:val})); }

  function validarStep1() {
    const e = {};
    if (!form.nomeEstab.trim()) e.nomeEstab = "Campo obrigatório";
    if (!form.cnpj.trim()) e.cnpj = "Campo obrigatório";
    if (!form.enderecoEstab.trim()) e.enderecoEstab = "Campo obrigatório";
    if (!form.bairro.trim()) e.bairro = "Campo obrigatório";
    if (!form.tel.trim()) e.tel = "Campo obrigatório";
    setErros(e);
    return Object.keys(e).length===0;
  }

  function validarStep2() {
    const e = {};
    if (!form.nomeDono.trim()) e.nomeDono = "Campo obrigatório";
    if (!form.cpfDono.trim()) e.cpfDono = "Campo obrigatório";
    if (!form.rgDono.trim()) e.rgDono = "Campo obrigatório";
    if (!form.whatsappDono.trim()) e.whatsappDono = "Campo obrigatório";
    setErros(e);
    return Object.keys(e).length===0;
  }

  function validarStep3() {
    const e = {};
    if (!validarEmail(form.email)) e.email = "E-mail inválido";
    if (form.email !== form.emailConfirm) e.emailConfirm = "E-mails não coincidem";
    const errosSenha = validarSenha(form.senha);
    if (errosSenha.length>0) e.senha = errosSenha[0];
    if (form.senha !== form.senhaConfirm) e.senhaConfirm = "Senhas não coincidem";
    setErros(e);
    return Object.keys(e).length===0;
  }

  function avancar() {
    if (step===1 && !validarStep1()) return;
    if (step===2 && !validarStep2()) return;
    setErros({});
    setStep(s=>s+1);
  }

  async function enviar() {
    if (!validarStep3()) return;
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    });

    if (authError) {
      setLoading(false);
      setErros({ email: authError.message === "User already registered" ? "Este e-mail já está cadastrado" : "Erro ao criar conta: " + authError.message });
      setStep(3);
      return;
    }

    const { error: dbError } = await supabase.from("empresarios").insert({
      nome: form.nomeEstab,
      cnpj: form.cnpj,
      endereco_estabelecimento: form.enderecoEstab,
      bairro: form.bairro,
      telefone: form.tel,
      nome_dono: form.nomeDono,
      tel_dono: form.whatsappDono,
      nome_socio: form.nomeSocio || null,
      tel_socio: form.whatsappSocio || null,
    });

    setLoading(false);

    if (dbError) {
      setErros({ nomeEstab: "Conta criada, mas houve um erro ao salvar seus dados. Fale com o suporte." });
      setStep(1);
      return;
    }

    onSucesso();
  }

  const steps = ["Estabelecimento","Responsável","Acesso"];

  return (
    <div>
      {/* Progresso */}
      <div style={{display:"flex",gap:0,marginBottom:24}}>
        {steps.map((s,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"center"}}>
              {i>0 && <div style={{flex:1,height:2,background:step>i?"#34d399":"#1f2937"}}/>}
              <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0,
                background:step>i+1?"#34d399":step===i+1?"#0d3d2e":"#1f2937",
                border:step===i+1?"2px solid #34d399":"2px solid transparent",
                color:step>i+1?"#000":step===i+1?"#34d399":"#6b7280"}}>
                {step>i+1?"✓":i+1}
              </div>
              {i<2 && <div style={{flex:1,height:2,background:step>i+1?"#34d399":"#1f2937"}}/>}
            </div>
            <div style={{color:step===i+1?"#34d399":"#6b7280",fontSize:11,fontWeight:600,marginTop:6}}>{s}</div>
          </div>
        ))}
      </div>

      {/* Step 1 — Estabelecimento */}
      {step===1 && (
        <div>
          <STitle>🏪 Dados do Estabelecimento</STitle>
          <Inp label="Nome do estabelecimento" obrigatorio value={form.nomeEstab} onChange={v=>set("nomeEstab",v)} placeholder="Ex: Pizzaria da Ilha" erro={erros.nomeEstab}/>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="CNPJ" obrigatorio value={form.cnpj} onChange={v=>set("cnpj",v)} placeholder="00.000.000/0001-00" erro={erros.cnpj}/></div>
            <div style={{flex:1}}><Inp label="Telefone" obrigatorio value={form.tel} onChange={v=>set("tel",v)} placeholder="(12) 3894-0000" erro={erros.tel}/></div>
          </div>
          <Inp label="Endereço completo" obrigatorio value={form.enderecoEstab} onChange={v=>set("enderecoEstab",v)} placeholder="Ex: Rua da Padroeira, 45" erro={erros.enderecoEstab}/>
          <Inp label="Bairro" obrigatorio value={form.bairro} onChange={v=>set("bairro",v)} placeholder="Ex: Vila, Perequê, Feiticeira..." erro={erros.bairro}/>
          <Btn onClick={avancar} full>Próximo →</Btn>
        </div>
      )}

      {/* Step 2 — Responsável */}
      {step===2 && (
        <div>
          <STitle>👤 Dados do Proprietário</STitle>
          <Inp label="Nome completo do dono" obrigatorio value={form.nomeDono} onChange={v=>set("nomeDono",v)} placeholder="Nome completo" erro={erros.nomeDono}/>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="CPF do dono" obrigatorio value={form.cpfDono} onChange={v=>set("cpfDono",v)} placeholder="000.000.000-00" erro={erros.cpfDono}/></div>
            <div style={{flex:1}}><Inp label="RG do dono" obrigatorio value={form.rgDono} onChange={v=>set("rgDono",v)} placeholder="00.000.000-0" erro={erros.rgDono}/></div>
          </div>
          <Inp label="WhatsApp do dono" obrigatorio value={form.whatsappDono} onChange={v=>set("whatsappDono",v)} placeholder="(12) 99999-0000" erro={erros.whatsappDono}/>

          <Divider label="Sócio (opcional)"/>
          <STitle>👥 Dados do Sócio</STitle>
          <Inp label="Nome completo do sócio" value={form.nomeSocio} onChange={v=>set("nomeSocio",v)} placeholder="Deixe em branco se não tiver sócio"/>
          <Inp label="WhatsApp do sócio" value={form.whatsappSocio} onChange={v=>set("whatsappSocio",v)} placeholder="(12) 99999-0000"/>

          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn cor="cinza" onClick={()=>{setErros({});setStep(1);}}>← Voltar</Btn>
            <Btn onClick={avancar} full>Próximo →</Btn>
          </div>
        </div>
      )}

      {/* Step 3 — Acesso */}
      {step===3 && (
        <div>
          <STitle>🔐 Dados de Acesso</STitle>
          <Inp label="E-mail" obrigatorio value={form.email} onChange={v=>set("email",v)} placeholder="seuemail@exemplo.com" type="email" erro={erros.email}/>
          <Inp label="Confirmar e-mail" obrigatorio value={form.emailConfirm} onChange={v=>set("emailConfirm",v)} placeholder="Digite o e-mail novamente" type="email" erro={erros.emailConfirm}/>
          <Divider/>
          <Inp label="Senha" obrigatorio value={form.senha} onChange={v=>set("senha",v)} placeholder="Crie uma senha forte" type="password" erro={erros.senha}/>
          <SenhaForca senha={form.senha}/>
          <Inp label="Confirmar senha" obrigatorio value={form.senhaConfirm} onChange={v=>set("senhaConfirm",v)} placeholder="Digite a senha novamente" type="password" erro={erros.senhaConfirm}/>

          <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
            <div style={{color:"#9ca3af",fontSize:12}}>
              Ao se cadastrar, você concorda com os <span style={{color:"#60a5fa",cursor:"pointer"}}>Termos de Uso</span> do MotoFast. Seu cadastro será analisado e aprovado em até 24 horas.
            </div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <Btn cor="cinza" onClick={()=>{setErros({});setStep(2);}}>← Voltar</Btn>
            <Btn onClick={enviar} full loading={loading}>✅ Enviar cadastro</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CADASTRO MOTOBOY ─────────────────────────────────────────────────────────
function CadastroMotoboy({ onVoltar, onSucesso }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const [form, setForm] = useState({
    // Pessoal
    nomeCompleto:"", cpf:"", rg:"", nascimento:"",
    nomePai:"", nomeMae:"", endereco:"",
    // Contato
    tel:"", pix:"",
    // Acesso
    email:"", emailConfirm:"", senha:"", senhaConfirm:"",
  });

  function set(campo, val) { setForm(f=>({...f,[campo]:val})); }

  function validarStep1() {
    const e = {};
    if (!form.nomeCompleto.trim()) e.nomeCompleto = "Campo obrigatório";
    if (!form.cpf.trim()) e.cpf = "Campo obrigatório";
    if (!form.rg.trim()) e.rg = "Campo obrigatório";
    if (!form.nascimento.trim()) e.nascimento = "Campo obrigatório";
    if (!form.nomePai.trim()) e.nomePai = "Campo obrigatório";
    if (!form.nomeMae.trim()) e.nomeMae = "Campo obrigatório";
    if (!form.endereco.trim()) e.endereco = "Campo obrigatório";
    setErros(e);
    return Object.keys(e).length===0;
  }

  function validarStep2() {
    const e = {};
    if (!form.tel.trim()) e.tel = "Campo obrigatório";
    if (!form.pix.trim()) e.pix = "Campo obrigatório";
    setErros(e);
    return Object.keys(e).length===0;
  }

  function validarStep3() {
    const e = {};
    if (!validarEmail(form.email)) e.email = "E-mail inválido";
    if (form.email !== form.emailConfirm) e.emailConfirm = "E-mails não coincidem";
    const errosSenha = validarSenha(form.senha);
    if (errosSenha.length>0) e.senha = errosSenha[0];
    if (form.senha !== form.senhaConfirm) e.senhaConfirm = "Senhas não coincidem";
    setErros(e);
    return Object.keys(e).length===0;
  }

  function avancar() {
    if (step===1 && !validarStep1()) return;
    if (step===2 && !validarStep2()) return;
    setErros({});
    setStep(s=>s+1);
  }

  async function enviar() {
    if (!validarStep3()) return;
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    });

    if (authError) {
      setLoading(false);
      setErros({ email: authError.message === "User already registered" ? "Este e-mail já está cadastrado" : "Erro ao criar conta: " + authError.message });
      setStep(3);
      return;
    }

    // Converte data de DD/MM/AAAA para AAAA-MM-DD (formato que o banco entende)
    function converterData(dataBr) {
      const partes = dataBr.split("/");
      if (partes.length !== 3) return null;
      const [dia, mes, ano] = partes;
      return `${ano}-${mes.padStart(2,"0")}-${dia.padStart(2,"0")}`;
    }

    const { error: dbError } = await supabase.from("motoboys").insert({
      nome_completo: form.nomeCompleto,
      cpf: form.cpf,
      rg: form.rg,
      nascimento: converterData(form.nascimento),
      nome_pai: form.nomePai,
      nome_mae: form.nomeMae,
      endereco: form.endereco,
      telefone: form.tel,
      pix: form.pix,
    });

    setLoading(false);

    if (dbError) {
      console.error("Erro ao salvar motoboy:", dbError);
      setErros({ tel: "Conta criada, mas houve um erro ao salvar seus dados. Fale com o suporte." });
      setStep(2);
      return;
    }

    onSucesso();
  }

  const steps = ["Dados Pessoais","Contato & PIX","Acesso"];

  return (
    <div>
      {/* Progresso */}
      <div style={{display:"flex",gap:0,marginBottom:24}}>
        {steps.map((s,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"center"}}>
              {i>0 && <div style={{flex:1,height:2,background:step>i?"#34d399":"#1f2937"}}/>}
              <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0,
                background:step>i+1?"#34d399":step===i+1?"#0d3d2e":"#1f2937",
                border:step===i+1?"2px solid #34d399":"2px solid transparent",
                color:step>i+1?"#000":step===i+1?"#34d399":"#6b7280"}}>
                {step>i+1?"✓":i+1}
              </div>
              {i<2 && <div style={{flex:1,height:2,background:step>i+1?"#34d399":"#1f2937"}}/>}
            </div>
            <div style={{color:step===i+1?"#34d399":"#6b7280",fontSize:11,fontWeight:600,marginTop:6}}>{s}</div>
          </div>
        ))}
      </div>

      {/* Step 1 — Pessoal */}
      {step===1 && (
        <div>
          <STitle>🏍️ Dados Pessoais</STitle>
          <Inp label="Nome completo" obrigatorio value={form.nomeCompleto} onChange={v=>set("nomeCompleto",v)} placeholder="Ex: Carlos Eduardo Silva" erro={erros.nomeCompleto}/>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}><Inp label="CPF" obrigatorio value={form.cpf} onChange={v=>set("cpf",v)} placeholder="000.000.000-00" erro={erros.cpf}/></div>
            <div style={{flex:1}}><Inp label="RG" obrigatorio value={form.rg} onChange={v=>set("rg",v)} placeholder="00.000.000-0" erro={erros.rg}/></div>
          </div>
          <Inp label="Data de nascimento" obrigatorio value={form.nascimento} onChange={v=>set("nascimento",v)} placeholder="Ex: 15/03/1995" hint="Digite no formato DD/MM/AAAA" erro={erros.nascimento}/>
          <Inp label="Nome completo do pai" obrigatorio value={form.nomePai} onChange={v=>set("nomePai",v)} placeholder="Ex: José Antônio Silva" erro={erros.nomePai}/>
          <Inp label="Nome completo da mãe" obrigatorio value={form.nomeMae} onChange={v=>set("nomeMae",v)} placeholder="Ex: Maria das Graças Silva" erro={erros.nomeMae}/>
          <Inp label="Endereço residencial completo" obrigatorio value={form.endereco} onChange={v=>set("endereco",v)} placeholder="Ex: Rua das Flores, 45, Perequê, Ilhabela/SP" erro={erros.endereco}/>
          <Btn onClick={avancar} full>Próximo →</Btn>
        </div>
      )}

      {/* Step 2 — Contato */}
      {step===2 && (
        <div>
          <STitle>📞 Contato e PIX</STitle>
          <Inp label="Telefone / WhatsApp" obrigatorio value={form.tel} onChange={v=>set("tel",v)} placeholder="(12) 99999-0000" erro={erros.tel}/>
          <Inp label="Chave PIX" obrigatorio value={form.pix} onChange={v=>set("pix",v)} placeholder="CPF, telefone ou e-mail" hint="É por aqui que você vai receber seus ganhos toda terça-feira" erro={erros.pix}/>

          <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{color:"#34d399",fontWeight:700,fontSize:13,marginBottom:6}}>💰 Como funciona o pagamento?</div>
            <div style={{color:"#6b7280",fontSize:12,lineHeight:1.6}}>
              Seus ganhos são depositados via PIX toda <strong style={{color:"#f9fafb"}}>terça-feira</strong>. Certifique-se de que sua chave PIX está correta e ativa.
            </div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <Btn cor="cinza" onClick={()=>{setErros({});setStep(1);}}>← Voltar</Btn>
            <Btn onClick={avancar} full>Próximo →</Btn>
          </div>
        </div>
      )}

      {/* Step 3 — Acesso */}
      {step===3 && (
        <div>
          <STitle>🔐 Dados de Acesso</STitle>
          <Inp label="E-mail" obrigatorio value={form.email} onChange={v=>set("email",v)} placeholder="seuemail@exemplo.com" type="email" erro={erros.email}/>
          <Inp label="Confirmar e-mail" obrigatorio value={form.emailConfirm} onChange={v=>set("emailConfirm",v)} placeholder="Digite o e-mail novamente" type="email" erro={erros.emailConfirm}/>
          <Divider/>
          <Inp label="Senha" obrigatorio value={form.senha} onChange={v=>set("senha",v)} placeholder="Crie uma senha forte" type="password" erro={erros.senha}/>
          <SenhaForca senha={form.senha}/>
          <Inp label="Confirmar senha" obrigatorio value={form.senhaConfirm} onChange={v=>set("senhaConfirm",v)} placeholder="Digite a senha novamente" type="password" erro={erros.senhaConfirm}/>

          <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
            <div style={{color:"#9ca3af",fontSize:12}}>
              Ao se cadastrar, você concorda com os <span style={{color:"#60a5fa",cursor:"pointer"}}>Termos de Uso</span> do MotoFast. Seu cadastro será analisado e aprovado em até 24 horas.
            </div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <Btn cor="cinza" onClick={()=>{setErros({});setStep(2);}}>← Voltar</Btn>
            <Btn onClick={enviar} full loading={loading}>✅ Enviar cadastro</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TELA DE LOGIN ────────────────────────────────────────────────────────────
function TelaLogin({ tipo, onCadastrar, onEntrar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    if (!validarEmail(email)) { setErro("E-mail inválido."); return; }
    setErro("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email: email, password: senha });

    if (error) {
      setLoading(false);
      const msg = error.message;
      if (msg.includes("Invalid login")) {
        setErro("E-mail ou senha incorretos.");
      } else if (msg.includes("Email not confirmed")) {
        setErro("Confirme seu e-mail antes de entrar.");
      } else {
        setErro("Erro ao entrar. Tente novamente.");
      }
      return;
    }

    const tabela = tipo === "motoboy" ? "motoboys" : "empresarios";
    const { data: perfil } = await supabase.from(tabela).select("aprovado,rejeitado,motivo_rejeicao").maybeSingle();

    setLoading(false);

    if (!perfil || !perfil.aprovado) {
      await supabase.auth.signOut();
      setErro("Seu cadastro ainda está sendo analisado. Aguarde o e-mail de aprovação.");
      return;
    }

    if (perfil.rejeitado) {
      await supabase.auth.signOut();
      const motivo = perfil.motivo_rejeicao || "Entre em contato com o suporte.";
      setErro("Cadastro rejeitado. Motivo: " + motivo);
      return;
    }

    window.location.href = tipo === "motoboy" ? "/motoboy" : "/empresario";
  }

  const config = {
    empresario: { emoji:"🏪", label:"Empresário", cor:"#60a5fa", desc:"Acesse para solicitar entregas" },
    motoboy:    { emoji:"🏍️", label:"Motoboy",    cor:"#34d399", desc:"Acesse para receber pedidos"  },
  };
  const c = config[tipo];

  return (
    <div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:48,marginBottom:8}}>{c.emoji}</div>
        <div style={{color:"#f9fafb",fontWeight:800,fontSize:20}}>{c.label}</div>
        <div style={{color:"#6b7280",fontSize:13,marginTop:4}}>{c.desc}</div>
      </div>

      {erro && <div style={{background:"#3d1010",border:"1px solid #ef4444",borderRadius:8,padding:"10px 14px",marginBottom:12,color:"#f87171",fontSize:13}}>{erro}</div>}

      <Inp label="E-mail" value={email} onChange={setEmail} placeholder="seuemail@exemplo.com" type="email"/>
      <Inp label="Senha" value={senha} onChange={setSenha} placeholder="Sua senha" type="password"/>

      <div style={{textAlign:"right",marginBottom:14}}>
        <span style={{color:"#60a5fa",fontSize:12,cursor:"pointer"}}>Esqueci minha senha</span>
      </div>

      <Btn onClick={entrar} full loading={loading}>Entrar</Btn>

      <Divider label="Não tem conta?"/>

      <button onClick={onCadastrar} style={{width:"100%",padding:"12px",borderRadius:10,background:"transparent",border:`2px solid ${c.cor}`,color:c.cor,fontWeight:700,fontSize:14,cursor:"pointer"}}>
        Cadastrar-se como {c.label}
      </button>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function AppCadastro() {
  const [tela, setTela] = useState("inicio"); // inicio | login-emp | login-mb | cad-emp | cad-mb | sucesso-emp | sucesso-mb

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb",display:"flex",flexDirection:"column"}}>

      {/* Header */}
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setTela("inicio")}>
          <span style={{color:"#34d399",fontWeight:900,fontSize:20,letterSpacing:-0.5}}>⚡ MotoFast</span>
        </div>
        {tela!=="inicio" && (
          <button onClick={()=>setTela("inicio")} style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13,fontWeight:600}}>
            ← Início
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
        <div style={{width:"100%",maxWidth:460}}>

          {/* TELA INICIAL */}
          {tela==="inicio" && (
            <div style={{textAlign:"center"}}>
              <div style={{marginBottom:32}}>
                <div style={{color:"#34d399",fontWeight:900,fontSize:32,letterSpacing:-1,marginBottom:8}}>⚡ MotoFast</div>
                <div style={{color:"#9ca3af",fontSize:15}}>Logística de entregas para Ilhabela e região</div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
                {/* Card Empresário */}
                <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:14,padding:"20px",cursor:"pointer",transition:"border 0.2s"}}
                  onClick={()=>setTela("login-emp")}
                  onMouseOver={e=>e.currentTarget.style.border="1px solid #60a5fa"}
                  onMouseOut={e=>e.currentTarget.style.border="1px solid #1f2937"}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{fontSize:36}}>🏪</div>
                    <div style={{textAlign:"left"}}>
                      <div style={{color:"#f9fafb",fontWeight:700,fontSize:16}}>Sou Empresário</div>
                      <div style={{color:"#6b7280",fontSize:13,marginTop:2}}>Quero solicitar entregas para meus clientes</div>
                    </div>
                    <div style={{marginLeft:"auto",color:"#60a5fa",fontSize:20}}>→</div>
                  </div>
                </div>

                {/* Card Motoboy */}
                <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:14,padding:"20px",cursor:"pointer",transition:"border 0.2s"}}
                  onClick={()=>setTela("login-mb")}
                  onMouseOver={e=>e.currentTarget.style.border="1px solid #34d399"}
                  onMouseOut={e=>e.currentTarget.style.border="1px solid #1f2937"}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{fontSize:36}}>🏍️</div>
                    <div style={{textAlign:"left"}}>
                      <div style={{color:"#f9fafb",fontWeight:700,fontSize:16}}>Sou Motoboy</div>
                      <div style={{color:"#6b7280",fontSize:13,marginTop:2}}>Quero receber pedidos e fazer entregas</div>
                    </div>
                    <div style={{marginLeft:"auto",color:"#34d399",fontSize:20}}>→</div>
                  </div>
                </div>
              </div>

              <div style={{color:"#4b5563",fontSize:12}}>
                Já tem conta? Clique na sua categoria acima para entrar.
              </div>
            </div>
          )}

          {/* LOGIN EMPRESÁRIO */}
          {tela==="login-emp" && (
            <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:16,padding:28}}>
              <TelaLogin tipo="empresario" onCadastrar={()=>setTela("cad-emp")} onEntrar={()=>{}}/>
            </div>
          )}

          {/* LOGIN MOTOBOY */}
          {tela==="login-mb" && (
            <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:16,padding:28}}>
              <TelaLogin tipo="motoboy" onCadastrar={()=>setTela("cad-mb")} onEntrar={()=>{}}/>
            </div>
          )}

          {/* CADASTRO EMPRESÁRIO */}
          {tela==="cad-emp" && (
            <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:16,padding:28}}>
              <div style={{marginBottom:20}}>
                <div style={{color:"#60a5fa",fontWeight:900,fontSize:20,marginBottom:4}}>🏪 Cadastro de Empresário</div>
                <div style={{color:"#6b7280",fontSize:13}}>Preencha todos os dados para solicitar seu acesso</div>
              </div>
              <CadastroEmpresario onVoltar={()=>setTela("login-emp")} onSucesso={()=>setTela("sucesso-emp")}/>
            </div>
          )}

          {/* CADASTRO MOTOBOY */}
          {tela==="cad-mb" && (
            <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:16,padding:28}}>
              <div style={{marginBottom:20}}>
                <div style={{color:"#34d399",fontWeight:900,fontSize:20,marginBottom:4}}>🏍️ Cadastro de Motoboy</div>
                <div style={{color:"#6b7280",fontSize:13}}>Preencha todos os dados para solicitar seu acesso</div>
              </div>
              <CadastroMotoboy onVoltar={()=>setTela("login-mb")} onSucesso={()=>setTela("sucesso-mb")}/>
            </div>
          )}

          {/* SUCESSO EMPRESÁRIO */}
          {tela==="sucesso-emp" && (
            <div style={{background:"#111827",border:"1px solid #34d399",borderRadius:16,padding:28}}>
              <TelaSucesso tipo="empresario" onVoltar={()=>setTela("inicio")}/>
            </div>
          )}

          {/* SUCESSO MOTOBOY */}
          {tela==="sucesso-mb" && (
            <div style={{background:"#111827",border:"1px solid #34d399",borderRadius:16,padding:28}}>
              <TelaSucesso tipo="motoboy" onVoltar={()=>setTela("inicio")}/>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",padding:"16px",borderTop:"1px solid #1f2937"}}>
        <div style={{color:"#4b5563",fontSize:12}}>⚡ MotoFast · Ilhabela/SP · Suporte: Seg-Sex 9h-22h • Sáb 9h-19h • Dom/feriados: fechado</div>
      </div>
    </div>
  );
}
