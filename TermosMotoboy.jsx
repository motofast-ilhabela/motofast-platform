import { useState } from "react";

export default function TermosMotoboy() {
  const [expandido, setExpandido] = useState(null);

  const clausulas = [
    {
      titulo: "CLÁUSULA 1 — DAS PARTES",
      texto: `1.1. CONTRATANTE: MotoFast Entregas, plataforma digital de intermediação de serviços de entrega, operada por Alessandro Andrade da Hora, CNPJ 51.269.432/0001-33, com sede em Ilhabela/SP.

1.2. CONTRATADO: Pessoa física prestadora de serviços de entrega, denominada MOTOBOY, que realiza cadastro voluntário na plataforma e aceita os presentes termos.`
    },
    {
      titulo: "CLÁUSULA 2 — DA NATUREZA DO SERVIÇO E VÍNCULO",
      texto: `2.1. O presente contrato tem natureza estritamente CIVIL e não gera, em hipótese alguma, vínculo empregatício, trabalhista, previdenciário ou de qualquer outra natureza entre o MOTOBOY e a PLATAFORMA.

2.2. O MOTOBOY é prestador de serviços AUTÔNOMO E INDEPENDENTE, sendo responsável pela gestão do próprio tempo, escolha de horários e aceitação ou recusa de pedidos, sem qualquer subordinação à PLATAFORMA.

2.3. A PLATAFORMA atua exclusivamente como INTERMEDIADORA digital entre estabelecimentos comerciais e o MOTOBOY, não sendo parte nas entregas realizadas.

2.4. O MOTOBOY reconhece que utiliza a plataforma como ferramenta de trabalho por livre e espontânea vontade, podendo descontinuar o uso a qualquer momento.

2.5. O MOTOBOY é responsável pelo recolhimento de seus próprios encargos fiscais, previdenciários e tributários decorrentes de sua atividade autônoma.`
    },
    {
      titulo: "CLÁUSULA 3 — DOS REQUISITOS OBRIGATÓRIOS",
      texto: `3.1. Ao aceitar estes termos, o MOTOBOY declara expressamente que:

• É MAIOR DE 18 (dezoito) anos de idade, estando plenamente capaz para contratar;
• Possui CARTEIRA NACIONAL DE HABILITAÇÃO (CNH) válida e dentro do prazo de validade, na categoria mínima exigida para condução de motocicleta;
• Possui MOTOCICLETA PRÓPRIA em perfeito estado de conservação, com documentação regularizada (CRLV) e licenciamento em dia;
• Possui SEGURO do veículo ou se responsabiliza integralmente por danos causados a terceiros e ao veículo durante as atividades;
• As informações fornecidas no cadastro são verdadeiras, completas e atualizadas.

3.2. O fornecimento de informações falsas constitui causa imediata de exclusão da plataforma, sem direito a qualquer indenização.`
    },
    {
      titulo: "CLÁUSULA 4 — DA RESPONSABILIDADE DO MOTOBOY",
      texto: `4.1. O MOTOBOY é ÚNICA E EXCLUSIVAMENTE responsável por:

• Todos os acidentes de trânsito, colisões, atropelamentos ou quaisquer incidentes ocorridos durante a prestação dos serviços;
• Danos materiais ou corporais causados a terceiros, estabelecimentos ou clientes durante o transporte;
• Multas de trânsito, infrações e penalidades decorrentes de sua condução;
• Extravio, roubo, furto ou deterioração das mercadorias sob sua guarda;
• Acidentes pessoais, lesões corporais ou morte decorrentes do exercício da atividade;
• Danos ao veículo próprio utilizado na prestação dos serviços.

4.2. A PLATAFORMA não se responsabiliza, em nenhuma hipótese, pelos eventos listados no item 4.1, sendo o MOTOBOY o único responsável civil e penalmente por seus atos.`
    },
    {
      titulo: "CLÁUSULA 5 — DA ISENÇÃO DE RESPONSABILIDADE DA PLATAFORMA",
      texto: `5.1. A MotoFast Entregas NÃO SE RESPONSABILIZA por:

• Acidentes, danos, lesões ou mortes ocorridas durante as entregas;
• Problemas mecânicos ou falhas no veículo do MOTOBOY;
• Perdas financeiras do MOTOBOY decorrentes de cancelamentos ou baixo volume de pedidos;
• Ações criminosas praticadas contra o MOTOBOY durante as entregas;
• Qualquer dano decorrente de falhas técnicas temporárias na plataforma.

5.2. A PLATAFORMA não garante volume mínimo de pedidos, renda mínima ou qualquer forma de remuneração fixa ao MOTOBOY.`
    },
    {
      titulo: "CLÁUSULA 6 — DO MODELO DE REMUNERAÇÃO",
      texto: `6.1. O MOTOBOY receberá por cada entrega concluída o valor correspondente à TAXA DO MOTOBOY definida para o bairro de destino, conforme tabela de preços disponível na plataforma.

6.2. O pagamento será realizado toda TERÇA-FEIRA, referente às entregas realizadas na semana anterior (segunda a domingo), mediante PIX para a chave cadastrada pelo MOTOBOY.

6.3. O MOTOBOY reconhece e aceita que:
• A PLATAFORMA retém uma taxa de intermediação sobre cada entrega;
• O valor exibido ao MOTOBOY no momento do pedido é o valor líquido que ele irá receber;
• Não há adiantamentos, empréstimos ou antecipações de pagamento.`
    },
    {
      titulo: "CLÁUSULA 7 — DAS OBRIGAÇÕES DO MOTOBOY",
      texto: `7.1. O MOTOBOY se compromete a:

• Manter CNH, CRLV e demais documentos válidos durante todo o período de uso;
• Utilizar capacete homologado pelo INMETRO e equipamentos de proteção obrigatórios;
• Respeitar integralmente o Código de Trânsito Brasileiro (CTB);
• Tratar estabelecimentos e clientes com respeito e profissionalismo;
• Manter seus dados cadastrais atualizados na plataforma;
• Não utilizar a plataforma para fins ilícitos.`
    },
    {
      titulo: "CLÁUSULA 8 — DO DESCREDENCIAMENTO",
      texto: `8.1. A PLATAFORMA poderá descredenciar o MOTOBOY, sem aviso prévio e sem direito a indenização, nos seguintes casos:

• Fornecimento de informações falsas no cadastro;
• Comportamento inadequado com estabelecimentos ou clientes;
• Reiteradas reclamações de clientes ou estabelecimentos;
• Prática de atos ilícitos durante as entregas;
• Descumprimento de qualquer cláusula destes termos.

8.2. O MOTOBOY poderá solicitar seu desligamento a qualquer momento, recebendo os valores pendentes na próxima terça-feira de pagamento.`
    },
    {
      titulo: "CLÁUSULA 9 — DA PRIVACIDADE E DADOS",
      texto: `9.1. Os dados pessoais fornecidos pelo MOTOBOY serão utilizados exclusivamente para operação da plataforma, pagamentos e comunicação interna.

9.2. A PLATAFORMA não comercializará dados pessoais do MOTOBOY a terceiros, exceto quando exigido por lei.

9.3. O MOTOBOY autoriza a coleta de dados de geolocalização durante as entregas, para fins de rastreamento em tempo real pelos clientes e estabelecimentos.`
    },
    {
      titulo: "CLÁUSULA 10 — DA VIGÊNCIA E ALTERAÇÕES",
      texto: `10.1. O presente contrato vigora por prazo indeterminado, a partir da data de aceite pelo MOTOBOY.

10.2. A PLATAFORMA reserva-se o direito de alterar estes termos a qualquer momento, sendo o MOTOBOY notificado com antecedência mínima de 7 (sete) dias.

10.3. A continuidade no uso da plataforma após as alterações implica aceite automático dos novos termos.`
    },
    {
      titulo: "CLÁUSULA 11 — DO FORO",
      texto: `11.1. Fica eleito o Foro da Comarca de Ilhabela/SP para dirimir quaisquer controvérsias decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#f9fafb"}}>
      {/* Header */}
      <div style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{color:"#34d399",fontWeight:900,fontSize:20}}>⚡ MotoFast</div>
        <a href="/" style={{color:"#6b7280",fontSize:13,fontWeight:600,textDecoration:"none"}}>← Voltar</a>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"32px 20px"}}>
        {/* Título */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>🏍️</div>
          <div style={{color:"#34d399",fontWeight:900,fontSize:24,marginBottom:8}}>Termos de Uso — Motoboy</div>
          <div style={{color:"#6b7280",fontSize:13}}>Contrato de Prestação de Serviços Autônomos</div>
          <div style={{color:"#4b5563",fontSize:12,marginTop:4}}>Versão 1.0 — 03/07/2026</div>
          <div style={{color:"#4b5563",fontSize:12}}>CNPJ: 51.269.432/0001-33 · Ilhabela/SP</div>
        </div>

        {/* Intro */}
        <div style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,padding:"16px 20px",marginBottom:24}}>
          <p style={{color:"#d1d5db",fontSize:14,lineHeight:1.7,margin:0}}>
            Ao realizar o cadastro na plataforma MotoFast Entregas, o Motoboy declara ter lido, compreendido e aceito integralmente os presentes Termos de Uso e Contrato de Prestação de Serviços Autônomos, comprometendo-se a cumpri-los em sua totalidade.
          </p>
        </div>

        {/* Cláusulas */}
        {clausulas.map((c, i) => (
          <div key={i} style={{background:"#111827",border:"1px solid #1f2937",borderRadius:12,marginBottom:10,overflow:"hidden"}}>
            <button onClick={()=>setExpandido(expandido===i?null:i)}
              style={{width:"100%",background:"none",border:"none",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",textAlign:"left"}}>
              <span style={{color:"#34d399",fontWeight:700,fontSize:14}}>{c.titulo}</span>
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

        {/* Declaração final */}
        <div style={{background:"#0d3d2e",border:"1px solid #34d399",borderRadius:12,padding:"20px",marginTop:24,textAlign:"center"}}>
          <div style={{color:"#34d399",fontWeight:700,fontSize:15,marginBottom:8}}>✅ Declaração de Aceite</div>
          <p style={{color:"#9ca3af",fontSize:13,lineHeight:1.6,margin:0}}>
            Ao marcar o checkbox no formulário de cadastro, o Motoboy declara que leu e aceita integralmente todos os termos acima, confirmando ser maior de 18 anos, possuir CNH válida e moto própria regularizada.
          </p>
        </div>

        <div style={{textAlign:"center",marginTop:24,paddingBottom:40}}>
          <a href="/" style={{display:"inline-block",background:"#10b981",color:"#fff",fontWeight:700,fontSize:14,padding:"12px 24px",borderRadius:10,textDecoration:"none"}}>
            ← Voltar ao cadastro
          </a>
        </div>
      </div>
    </div>
  );
}
