import { useState } from "react";

export default function TermosEmpresario() {
  const [expandido, setExpandido] = useState(null);

  const clausulas = [
    {
      titulo: "CLÁUSULA 1 — DAS PARTES",
      texto: `1.1. CONTRATADA: MotoFast Entregas, plataforma digital de intermediação de serviços de entrega, operada por Alessandro Andrade da Hora, CNPJ 51.269.432/0001-33, com sede em Ilhabela/SP.

1.2. CONTRATANTE: Pessoa física ou jurídica titular de estabelecimento comercial que realiza cadastro voluntário na plataforma para utilização dos serviços de intermediação de entrega.`
    },
    {
      titulo: "CLÁUSULA 2 — DO OBJETO",
      texto: `2.1. A PLATAFORMA disponibiliza ao ESTABELECIMENTO acesso a sistema digital de intermediação de serviços de entrega, conectando o ESTABELECIMENTO a entregadores autônomos cadastrados na plataforma.

2.2. A PLATAFORMA atua exclusivamente como INTERMEDIADORA tecnológica, não sendo parte nas relações entre o ESTABELECIMENTO, o motoboy e o cliente final.

2.3. A PLATAFORMA não se responsabiliza pela qualidade, integridade ou condições dos produtos entregues, sendo esta responsabilidade exclusiva do ESTABELECIMENTO.`
    },
    {
      titulo: "CLÁUSULA 3 — DOS PLANOS E MENSALIDADE",
      texto: `3.1. O ESTABELECIMENTO deverá escolher um dos planos de assinatura disponíveis:

PLANO SEMANAL — R$ 95,00 por semana
• Pagamento realizado toda segunda-feira, referente à semana em curso;
• Em caso de não pagamento até segunda-feira, o estabelecimento será bloqueado na terça-feira às 09h00.

PLANO MENSAL — R$ 380,00 por mês
• Pagamento realizado no dia de vencimento escolhido pelo estabelecimento;
• Em caso de não pagamento até o dia de vencimento, o estabelecimento será bloqueado no dia seguinte às 09h00.

3.2. Além da mensalidade, o ESTABELECIMENTO pagará TAXAS POR ENTREGA conforme tabela de preços por bairro configurada em seu cadastro.

3.3. As taxas de entrega deverão ser pagas conforme o plano escolhido:
• Plano diário: pagamento das taxas do dia anterior, todo dia seguinte;
• Plano semanal: pagamento das taxas da semana, toda segunda-feira.

3.4. A PLATAFORMA reserva-se o direito de reajustar os valores dos planos mediante comunicação prévia de 30 dias.`
    },
    {
      titulo: "CLÁUSULA 4 — DO BLOQUEIO POR INADIMPLÊNCIA",
      texto: `4.1. O ESTABELECIMENTO que não efetuar o pagamento da mensalidade ou das taxas de entrega nos prazos estabelecidos será BLOQUEADO automaticamente pela plataforma.

4.2. Durante o bloqueio, o ESTABELECIMENTO não poderá solicitar novos pedidos de entrega.

4.3. O desbloqueio ocorrerá somente após a regularização integral dos valores em aberto, mediante confirmação da PLATAFORMA.

4.4. O ESTABELECIMENTO reconhece e aceita o bloqueio como medida legítima da PLATAFORMA para garantia do pagamento pelos serviços prestados.`
    },
    {
      titulo: "CLÁUSULA 5 — DA RESPONSABILIDADE DO ESTABELECIMENTO",
      texto: `5.1. O ESTABELECIMENTO é ÚNICA E EXCLUSIVAMENTE responsável por:

• Fornecer informações corretas e completas sobre o endereço de entrega, valor do pedido e forma de pagamento;
• Disponibilizar a mercadoria em perfeitas condições para o motoboy no momento da coleta;
• Disponibilizar maquininha de cartão quando o pagamento for por cartão;
• Disponibilizar troco adequado quando o pagamento for em dinheiro;
• Qualquer prejuízo causado ao cliente final por informações incorretas fornecidas no pedido;
• Manutenção da qualidade e integridade dos produtos entregues.

5.2. O ESTABELECIMENTO se compromete a não utilizar a plataforma para entregas de produtos ilegais ou que violem a legislação vigente.`
    },
    {
      titulo: "CLÁUSULA 6 — DA ISENÇÃO DE RESPONSABILIDADE DA PLATAFORMA",
      texto: `6.1. A MotoFast Entregas NÃO SE RESPONSABILIZA por:

• Acidentes, danos ou incidentes ocorridos durante as entregas;
• Atrasos nas entregas causados por condições de trânsito, clima ou problemas técnicos;
• Qualidade, temperatura ou condições dos produtos entregues;
• Prejuízos causados por informações incorretas fornecidas pelo ESTABELECIMENTO;
• Indisponibilidade temporária de motoboys na região;
• Pedidos não aceitos por nenhum motoboy disponível.

6.2. A PLATAFORMA não garante tempo mínimo de entrega ou disponibilidade permanente de motoboys.`
    },
    {
      titulo: "CLÁUSULA 7 — DO PERÍODO GRATUITO",
      texto: `7.1. A PLATAFORMA poderá, a seu exclusivo critério, conceder ao ESTABELECIMENTO um período de uso gratuito, conforme acordado no momento do cadastro.

7.2. Durante o período gratuito, o ESTABELECIMENTO terá acesso completo à plataforma sem pagamento de mensalidade.

7.3. Ao final do período gratuito, a cobrança será iniciada automaticamente conforme o plano escolhido, e o ESTABELECIMENTO será notificado pela PLATAFORMA.

7.4. O não pagamento após o encerramento do período gratuito resultará em bloqueio conforme Cláusula 4.`
    },
    {
      titulo: "CLÁUSULA 8 — DAS OBRIGAÇÕES DO ESTABELECIMENTO",
      texto: `8.1. O ESTABELECIMENTO se compromete a:

• Efetuar os pagamentos nos prazos estabelecidos;
• Fornecer informações verdadeiras e atualizadas no cadastro;
• Tratar os motoboys com respeito e profissionalismo;
• Não solicitar serviços fora do escopo da plataforma aos motoboys;
• Manter seus dados de contato atualizados.`
    },
    {
      titulo: "CLÁUSULA 9 — DO CANCELAMENTO E RESCISÃO",
      texto: `9.1. O ESTABELECIMENTO poderá cancelar sua assinatura a qualquer momento, sem multa, devendo quitar os valores pendentes.

9.2. A PLATAFORMA poderá rescindir o contrato, sem aviso prévio e sem indenização, nos seguintes casos:

• Uso da plataforma para fins ilegais;
• Comportamento inadequado com motoboys ou clientes;
• Inadimplência reiterada;
• Fornecimento de informações falsas no cadastro;
• Descumprimento de qualquer cláusula destes termos.`
    },
    {
      titulo: "CLÁUSULA 10 — DA PRIVACIDADE E DADOS",
      texto: `10.1. Os dados do ESTABELECIMENTO serão utilizados exclusivamente para operação da plataforma, cobranças e comunicação interna.

10.2. A PLATAFORMA não comercializará dados do ESTABELECIMENTO a terceiros, exceto quando exigido por lei.`
    },
    {
      titulo: "CLÁUSULA 11 — DO FORO",
      texto: `11.1. Fica eleito o Foro da Comarca de Ilhabela/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.`
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb"}}>
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{color:"#34d399",fontWeight:900,fontSize:20}}>⚡ MotoFast</div>
        <a href="/" style={{color:"#6b7280",fontSize:13,fontWeight:600,textDecoration:"none"}}>← Voltar</a>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"32px 20px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>🏪</div>
          <div style={{color:"#60a5fa",fontWeight:900,fontSize:24,marginBottom:8}}>Termos de Uso — Empresário</div>
          <div style={{color:"#6b7280",fontSize:13}}>Contrato de Prestação de Serviços para Estabelecimentos Comerciais</div>
          <div style={{color:"#4b5563",fontSize:12,marginTop:4}}>Versão 1.0 — 03/07/2026</div>
          <div style={{color:"#4b5563",fontSize:12}}>CNPJ: 51.269.432/0001-33 · Ilhabela/SP</div>
        </div>

        <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"16px 20px",marginBottom:24}}>
          <p style={{color:"#d1d5db",fontSize:14,lineHeight:1.7,margin:0}}>
            Ao realizar o cadastro na plataforma MotoFast Entregas, o Estabelecimento declara ter lido, compreendido e aceito integralmente os presentes Termos de Uso, comprometendo-se a cumpri-los em sua totalidade.
          </p>
        </div>

        {clausulas.map((c, i) => (
          <div key={i} style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,marginBottom:10,overflow:"hidden"}}>
            <button onClick={()=>setExpandido(expandido===i?null:i)}
              style={{width:"100%",background:"none",border:"none",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",textAlign:"left"}}>
              <span style={{color:"#60a5fa",fontWeight:700,fontSize:14}}>{c.titulo}</span>
              <span style={{color:"#6b7280",fontSize:18}}>{expandido===i?"▲":"▼"}</span>
            </button>
            {expandido===i && (
              <div style={{padding:"0 20px 16px",borderTop:"1px solid #1f2937"}}>
                {c.texto.split("\n").map((linha, j) => (
                  <p key={j} style={{color:"#d1d5db",fontSize:13,lineHeight:1.7,margin:"8px 0",
                    paddingLeft: linha.startsWith("•") ? 16 : 0}}>
                    {linha}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{background:"#1a2f4a",border:"1px solid #60a5fa",borderRadius:12,padding:"20px",marginTop:24,textAlign:"center"}}>
          <div style={{color:"#60a5fa",fontWeight:700,fontSize:15,marginBottom:8}}>✅ Declaração de Aceite</div>
          <p style={{color:"#9ca3af",fontSize:13,lineHeight:1.6,margin:0}}>
            Ao marcar o checkbox no formulário de cadastro, o Estabelecimento declara que leu e aceita integralmente todos os termos acima, incluindo os planos de pagamento (R$95/semana ou R$380/mês), taxas de entrega e política de bloqueio por inadimplência.
          </p>
        </div>

        <div style={{textAlign:"center",marginTop:24,paddingBottom:40}}>
          <a href="/" style={{display:"inline-block",background:"#3b82f6",color:"#fff",fontWeight:700,fontSize:14,padding:"12px 24px",borderRadius:10,textDecoration:"none"}}>
            ← Voltar ao cadastro
          </a>
        </div>
      </div>
    </div>
  );
}
