# Publicação do MotoFast na Google Play Store

Guia montado em 06/10/2026 a partir do estado real do projeto (`app-mobile/`, branch `app-nativo-capacitor`).

As regras do Google mudam com frequência. Antes de cada etapa, confira no próprio Play Console os valores e prazos citados aqui (taxa, número de testadores, nível de API exigido).

**Quem faz cada coisa:**
- **Você:** contas, documentos, textos, imagens e o que é feito no Play Console.
- **Claude Code:** código do app (`app-mobile/`).
- **Chat do site:** páginas e `/api` na `main`. O Claude Code não mexe lá, pela regra do CLAUDE.md.

---

## 1. Ordem recomendada

Algumas etapas demoram dias e não dependem de código. Comece por elas.

| # | Etapa | Quem | Pode começar já? | Demora |
|---|---|---|---|---|
| 1 | Pedir o número D-U-N-S da MotoFast | Você | ✅ | dias a semanas |
| 2 | Escrever e publicar a Política de Privacidade | Você + chat do site | ✅ | 1–2 dias |
| 3 | Exclusão de conta (no app + página na web) | Claude Code + chat do site | ✅ | 1–2 dias |
| 4 | Imagens e textos da página da loja | Você | ✅ | 1 dia |
| 5 | Conta de demonstração para a revisão do Google | Você + Claude Code | ✅ | horas |
| 6 | Criar a conta de desenvolvedor (organização) | Você | depois do D-U-N-S | dias (verificação) |
| 7 | Assinatura de lançamento + gerar o AAB | Claude Code + você (guardar a chave) | ✅ | horas |
| 8 | Preencher as declarações no Play Console | Você (eu ajudo com as respostas) | depois do 6 | 1 dia |
| 9 | Teste interno | Você | depois do 6, 7 e 8 | 1–3 dias |
| 10 | Enviar para produção e aguardar a revisão | Você | depois do 9 | alguns dias (a 1ª revisão costuma demorar mais) |

---

## 2. Conta de desenvolvedor no Google Play Console

- **Custo:** taxa única de **US$ 25**, paga no cartão.
- **Tipo de conta: recomendo organização**, em nome da MotoFast (CNPJ 51.269.432/0001-33).
  - **Conta pessoal criada hoje:** o Google exige um **teste fechado com pelo menos 12 testadores por 14 dias seguidos** antes de liberar a publicação em produção.
  - **Conta de organização:** não tem essa exigência, e o nome que aparece na loja é o da empresa, o que passa mais confiança para estabelecimentos e motoboys.
- **O que a conta de organização pede:**
  - **Número D-U-N-S** da empresa. É gratuito, pedido pelo site da Dun & Bradstreet, e pode levar de dias a algumas semanas. **É a etapa mais demorada; peça primeiro.**
  - Os dados da empresa precisam bater **exatamente** com os do D-U-N-S (razão social e endereço).
  - Site da empresa (o `motofast-platform.vercel.app` serve), e-mail e telefone de contato. O Google verifica o telefone e o e-mail.
  - Documento de quem administra a conta, para a verificação de identidade.
- **Use um e-mail Google da empresa,** não um pessoal, para a conta não ficar presa a uma pessoa.

---

## 3. O que já está pronto no app

| Item | Situação |
|---|---|
| Nome do app | ✅ "MotoFast" |
| Identificador (`applicationId`) | ✅ `com.motofast.app`. **Não pode mudar depois de publicado.** |
| Ícone e splash | ✅ Próprios, gerados de `app-mobile/assets/` (`icon-foreground.png`, `icon-background.png`, `splash.png`) |
| Versão de Android alvo | ✅ `targetSdk 36`, dentro da exigência atual do Google |
| Versão mínima | ✅ Android 7.0 (`minSdk 24`) |
| Permissões | ✅ Só 5: internet, notificações, manter o aparelho acordado, serviço em primeiro plano e serviço em primeiro plano de mídia (alarme) |
| Push (Firebase/OneSignal) | ✅ `google-services.json` no projeto |
| Login salvo | ✅ Gerenciador de Credenciais. O app não guarda senha. |
| Alarme de corrida | ✅ Validado nos 7 cenários de teste |

---

## 4. O que falta no código

### 4.1 Exclusão de conta (obrigatória)
**Regra do Google:** todo app em que o usuário **cria conta** precisa oferecer:
- um caminho **dentro do app** para pedir a exclusão da conta e dos dados;
- um **link na web** onde a pessoa pede a exclusão sem precisar do app (é informado no Play Console).

**Hoje o app não tem nenhum dos dois.**

**Proposta, respeitando a regra do CLAUDE.md** (banco só com mudanças aditivas):
- **No app:** botão "Excluir minha conta" nas telas de Motoboy e Empresário, com confirmação e explicação clara.
  - Grava um pedido numa **tabela nova** (ex.: `solicitacoes_exclusao`), deixa o motoboy offline e sai da conta.
  - Tabela nova, sem `REFERENCES` para não criar caminho de JOIN, e sem alterar nada que a web já usa.
- **No Admin:** lista dos pedidos de exclusão, para você concluir.
  - O apagamento de verdade do login precisa da chave de servidor do Supabase. Então a remoção final fica num endpoint em `/api`, que é com o chat do site, ou é feita por você no painel do Supabase.
- **Na web:** uma página simples, por exemplo `/excluir-conta`, com instruções e um formulário de pedido. É com o chat do site.
- **O que se pode manter:** o Google aceita guardar dados que a lei obriga a manter (ex.: registros financeiros e fiscais das entregas), desde que isso esteja dito na política de privacidade.
  - Ex.: apagar documentos pessoais (CPF, RG, nomes dos pais, endereço, PIX) e manter o histórico de entregas anonimizado.
  - **Defina com quem cuida da parte jurídica e contábil da MotoFast.**

### 4.2 Assinatura de lançamento e AAB
- Hoje o projeto só gera o **APK de teste**: não há assinatura de lançamento configurada.
- **A Play Store exige o formato AAB** (Android App Bundle).
- **Passos:**
  1. Criar a **chave de upload** (arquivo `.jks` + senhas). É feito uma vez.
  2. Configurar o build de lançamento para usar essa chave. As senhas ficam **fora do Git**, num arquivo local ignorado.
  3. Ativar o **Play App Signing** (padrão). O Google guarda a chave final de assinatura; você só guarda a chave de upload.
  4. Gerar o AAB pelo Android Studio (**Build → Generate Signed App Bundle**).
- ⚠️ **Guarde a chave de upload e as senhas em pelo menos dois lugares fora do notebook**, por exemplo um pendrive e um cofre de senhas. Se ela se perder, dá para pedir ao Google a troca, mas é demorado. Lembre do computador que quebrou.

### 4.3 Versão
- Hoje: `versionCode 1`, `versionName "1.0"`.
- **Cada envio para a Play Store precisa de um `versionCode` maior que o anterior.** O `versionName` é só o texto que o usuário vê.
- Sugestão: primeira publicação com `versionCode 1` / `versionName "1.0.0"`, e subir a cada atualização.

### 4.4 Revisões de conformidade
- **Logs:** no build de teste, o Capacitor mostra no Logcat o conteúdo lido do armazenamento, inclusive o **token de sessão**, como vimos no teste do emulador. No build de lançamento esses logs ficam desligados por padrão, mas convém deixar isso explícito na configuração (`loggingBehavior: "none"`).
- **Localização (corrigido em 06/10/2026):** o sistema **coleta** a localização do motoboy.
  - Durante uma corrida ativa, a cada 5 segundos, o site grava `latitude`, `longitude` e `ultima_localizacao` em `motoboys`, e a página de Rastreio mostra essa posição ao cliente. A cláusula 9 dos Termos está correta.
  - O app tem o mesmo código, mas **não declara a permissão de localização no Android**, então nele a coleta falha e o Rastreio não mostra motoboys que usam o app.
  - **Decisão pendente:**
    - **ou** adicionar a permissão de localização "com o app em uso" no app (paridade com o site, e entra na declaração ao Google);
    - **ou** remover esse código do app.

    Nos dois casos, o formulário de segurança dos dados tem que declarar localização, porque o site coleta.

---

## 5. Política de privacidade (obrigatória)

- Precisa estar **publicada num link público** (ex.: `motofast-platform.vercel.app/privacidade`). É com o chat do site.
- O link é informado no Play Console e deve ficar acessível **dentro do app** também, por exemplo no cadastro e no menu.
- Hoje só existe a cláusula 9 dos Termos, com duas linhas. Isso **não basta**.
- **O que a política precisa cobrir**, com base no que o app coleta de verdade:
  - **Motoboy:** nome completo, e-mail, telefone, CPF, RG, data de nascimento, nome do pai e da mãe, endereço, bairro base, chave PIX, status online, histórico de entregas e ganhos, e **localização durante as corridas** (a cada 5s, mostrada ao cliente no Rastreio; a última posição fica gravada).
  - **Empresário:** dados do estabelecimento (nome, endereço, CNPJ/CPF, telefone, e-mail) e histórico de pedidos e pagamentos.
  - **Clientes finais dos estabelecimentos:** nome, telefone e endereço de entrega. Esses são **dados de terceiros**, cadastrados pelo estabelecimento, e precisam ser citados.
  - **Do aparelho:** identificador de notificação push (OneSignal/Firebase).
  - **Para que cada dado é usado:** operação das entregas, pagamentos, contato e segurança.
  - **Com quem é compartilhado:** motoboy ↔ estabelecimento (dados da entrega), e os provedores (Supabase para banco e login, Google Maps para distância, OneSignal/Firebase para notificações, Vercel para hospedagem).
  - **Quanto tempo os dados ficam guardados** e o que é mantido após a exclusão da conta (ver 4.1).
  - **Direitos da LGPD** (acesso, correção, exclusão) e o **contato** do responsável pelos dados.
- **Recomendo revisão por alguém da área jurídica,** porque o app lida com CPF, RG e dados de terceiros.

---

## 6. Declarações no Play Console

Preenchidas por você. Posso ajudar com as respostas de cada formulário.

- **Segurança dos dados (Data safety):** lista do que é coletado, para quê, se é compartilhado e se é criptografado.
  - Tem que bater com a política de privacidade e com o app.
  - O tráfego com o Supabase é criptografado (HTTPS).
  - Informar que existe pedido de exclusão de conta, com o link da web.
- **Acesso ao app:** o app exige login, então é preciso entregar ao Google **uma conta que funcione** para a revisão.
  - ⚠️ O app usa o **banco de produção**, então use uma **conta de demonstração separada**: um motoboy e um estabelecimento de teste, **sem** turno fixo e de preferência deixados offline, para não receberem pedidos reais.
  - Explique na nota da revisão como testar.
- **Serviço em primeiro plano:** o alarme de corrida usa o tipo `mediaPlayback`, e o Google pede justificativa de uso, às vezes com **vídeo curto** mostrando o recurso.
  - Explicação sugerida: "toca o alarme sonoro contínuo de corrida nova para o entregador, até ele aceitar ou recusar".
  - ⚠️ **Risco:** o Google pode entender que `mediaPlayback` é só para música e vídeo e pedir outro tipo. Se acontecer, a troca do tipo **mexe no alarme** e só será feita com a sua aprovação e testes nos dois aparelhos.
- **Classificação de conteúdo:** questionário. App de logística, sem conteúdo sensível.
- **Público-alvo:** maiores de 18 anos (motoboys e estabelecimentos), sem apelo infantil.
- **Anúncios:** o app **não** tem anúncios.
- **Recursos financeiros:** o app não faz pagamentos dentro dele (o PIX é combinado fora), mas responda conforme o questionário pedir.
- **Categoria sugerida:** "Empresas" ou "Mapas e navegação". "Empresas" combina mais.

---

## 7. Página da loja

| Item | Formato | Observação |
|---|---|---|
| Ícone | 512 × 512 px, PNG | Pode sair do `assets/icon-only.png` |
| Imagem de destaque | 1024 × 500 px | Aparece no topo da página |
| Capturas de tela do celular | mínimo 2, ideal 4–8 | Tela do motoboy (oferta de corrida, corrida em andamento, ganhos) e do estabelecimento (nova entrega, pedidos em andamento). **Use a conta de demonstração**, sem dados reais de clientes. |
| Nome | até 30 caracteres | "MotoFast" ou "MotoFast Entregas" |
| Descrição curta | até 80 caracteres | Ex.: "Entregas de moto em Ilhabela: chame um motoboy em segundos." |
| Descrição completa | até 4.000 caracteres | Como funciona para o estabelecimento e para o motoboy, região atendida, suporte |
| Contato | e-mail obrigatório; telefone/site opcionais | Aparece publicamente na loja |

---

## 8. Testes antes de publicar

1. **Teste interno:** até 100 testadores por e-mail, liberado em minutos e sem revisão longa. Instale pela Play Store no Samsung e em mais um ou dois aparelhos, e refaça os principais testes do alarme.
2. **Relatório de pré-lançamento:** o Google roda o app em aparelhos de teste e aponta travamentos e problemas de acessibilidade. Vale olhar.
3. **Produção:** dá para liberar aos poucos (ex.: 20% dos usuários) e ampliar depois.

---

## 9. Depois de publicado

- **Atualizações:** cada nova versão sobe o `versionCode`, é assinada com a mesma chave de upload e passa por revisão, normalmente mais rápida.
- **Site × app:** a regra do CLAUDE.md continua valendo. Mudança de regra de negócio num lado precisa ser replicada no outro.
- **Motoboys com Samsung:** para o "Salvar senha?" aparecer, pode ser preciso trocar o preenchimento automático de "Samsung Pass" para "Google" (ver PENDENCIAS.md).
- **iPhone:** a App Store é um processo separado (conta Apple Developer de US$ 99/ano, Mac para gerar o app, revisão própria). Fica para depois, junto com as pendências de iOS do PENDENCIAS.md.

---

## 10. Checklist resumido

- [ ] Pedir D-U-N-S da MotoFast
- [ ] Criar conta Google da empresa
- [ ] Criar conta de organização no Play Console (US$ 25) e passar na verificação
- [ ] Escrever a política de privacidade (com revisão jurídica) e publicar no site
- [ ] Deixar a cláusula de geolocalização dos Termos do Motoboy mais precisa (ela está correta: o site coleta)
- [ ] Decidir sobre localização no app: adicionar a permissão (paridade com o site) ou remover o código
- [ ] Exclusão de conta: botão no app + tela no Admin
- [ ] Exclusão de conta: página na web + remoção final
- [ ] Definir o que é apagado e o que é mantido após a exclusão
- [ ] Criar a chave de upload e guardar em 2 lugares fora do notebook
- [ ] Configurar o build de lançamento, `versionName "1.0.0"` e logs desligados
- [ ] Gerar o AAB assinado
- [ ] Criar a conta de demonstração (motoboy + estabelecimento) para a revisão
- [ ] Preparar ícone 512, imagem de destaque, capturas de tela e textos
- [ ] Preencher Segurança dos dados, Acesso ao app, Serviço em primeiro plano, Classificação, Público-alvo e Anúncios
- [ ] Teste interno pela Play Store
- [ ] Enviar para produção
