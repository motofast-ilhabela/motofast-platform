# Pendências do app nativo (app-mobile)

Atualizado em 06/10/2026. Antes de mexer em qualquer item que tenha versão no site, comparar com o código atual da `main` (regra do CLAUDE.md: as telas do site e do app não se sincronizam sozinhas).

## Varredura site × nativo (12 itens): situação

| # | Item | Situação | Commit |
|---|---|---|---|
| 1 | Fórmula de preço por km progressiva | ✅ Feito | `8e51ac3` |
| 2 | Bairro fora da busca de endereço no Google | ✅ Feito | `b7af7a3` |
| 3 | Aviso de endereço impreciso | ✅ Feito no app. ⏳ Só aparece quando o servidor mandar os campos (ver "Depende do chat do site") | `93277c4` |
| 4 | Histórico do Empresário com JOIN ambíguo | ✅ Feito | `f129c36` |
| 5 | Corrida do Empresário sumindo inteira quando 1 pedido é entregue | ✅ Feito, junto com o card novo de corridas | `c0e6d82` |
| 6 | "Marcar como pago" mirando a semana errada | ✅ Feito | `42262db` |
| 7 | Cronômetro de chegada ao estabelecimento | ✅ Feito | `abd742a` |
| 8 | Limite de pedidos por corrida 3 → 4 | ✅ Feito | `62531ce` |
| 9 | Motivo do cancelamento no histórico do Empresário | ✅ Feito | `01e4d38` |
| 10 | Ranking por entrega individual | ✅ Feito | `65f912d` |
| 11 | Pedido cancelado reaparecendo na resincronização | ✅ Feito | `f12326e` |
| 12 | Guard antigo perto do `RideAlert` | 🟠 Investigado, não aplicado (detalhes abaixo) | — |

Detalhes dos itens feitos em 06/10 e do item 12:

1. ✅ **Item 4: histórico do Empresário com JOIN ambíguo.** Feito em 06/10/2026.
   - O JOIN ambíguo em si já tinha sido corrigido no app em 12/09 (commit `28eeada`, relação explícita `motoboys!pedidos_motoboy_id_fkey`).
   - Em 06/10, o `carregarHistorico` foi igualado ao site: pedidos sem JOIN e nomes dos motoboys numa segunda consulta separada. Se ela falhar, o histórico continua na tela, com "—" no nome.
2. ✅ **Item 6: "marcar como pago" mirando a semana errada.** Feito em 06/10/2026.
   - O card "Taxa semanal" do Admin (estabelecimento no plano semanal) marcava a semana ATUAL, ainda em andamento. Agora marca a semana ANTERIOR, já fechada, igual ao site desde 20/09.
3. ✅ **Item 9: motivo do cancelamento não aparece no histórico do Empresário.** Feito em 06/10/2026.
   - Trazido o bloco "Motivo do cancelamento" do site, que existe lá desde 24/09.
   - Além do site: o `carregarHistorico` agora preenche `motivo` com o `motivo_cancelamento` do banco. No site esse campo nunca é preenchido, então lá o bloco não aparece (ver "Depende do chat do site").
4. ✅ **Item 10: ranking não atualiza a cada entrega individual.** Feito em 06/10/2026.
   - O `entregarItemIndividual` do Motoboy agora soma a entrega no Ranking e reordena na hora, igual ao site desde 23/09. Antes, a posição só mudava ao reabrir o app.
5. 🟠 **Item 12: guard antigo perto do `RideAlert.stopAlert()`/`startAlert()`.** **Investigado em 06/10/2026, NÃO aplicado** (decisão do Alessandro). **Aplicar só se incomodar, e com teste nos dois aparelhos antes e depois.**
   - **O que é:** no `Motoboy.jsx`, no começo do efeito que procura pedido novo (o que termina com `},[online, corridaAtiva, motoboyId, ehContaMonitoramento]);`), ainda existe a linha `if (pedidoRef.current) return;`. O site removeu essa linha em 28/09.
   - **Quando dá problema:** só com **conta de monitoramento (Alessandro/Alencar) com corrida em andamento e uma oferta nova tocando**.
     - A sincronização da corrida (a cada 3s) reinicia o efeito, e a trava encerra ele antes de qualquer coisa. A checagem a cada 2s, que para o alarme quando o pedido já foi pego, deixa de rodar.
     - Se outro motoboy aceitar, o card da oferta fica preso na tela, e o ciclo de 30s chama `RideAlert.startAlert()` de novo para um pedido já aceito, até 10 vezes (~5 min).
   - **Por que é pouco grave no app:** as proteções nativas calam o som. São elas o push `cancelar_oferta`, a checagem do `RideAlertService` a cada 3s e o teto de 9 min. Sobra um toque curto (até ~3s) a cada 30s e o card preso. Aceitar esse card não faz nada de errado, porque o aceite exige o pedido ainda "aguardando". Motoboys comuns não são afetados.
   - **Teste para reproduzir:** Samsung (monitoramento) numa corrida, chega uma oferta nova, outro aparelho (emulador) aceita essa oferta. Observar se o Samsung volta a tocar a cada 30s com o card preso. Repetir depois de aplicar.
   - **Diff proposto (não aplicado):**
     ```diff
          if (corridaAtiva && !ehContaMonitoramento) return;
     -    if (pedidoRef.current) return;
     +    // CORRIGIDO em 28/09/2026 no site: aqui existia um "if (pedidoRef.current) return;"
     +    // que fazia esta busca NÃO recomeçar quando já havia uma oferta na tela.
     +    // Pras contas de monitoramento com corrida ativa, a sincronização da corrida
     +    // (a cada 3s) faz este efeito recomeçar o tempo todo — com uma oferta
     +    // tocando, ele saía cedo, a verificação "esse pedido ainda está disponível?"
     +    // morria, e o ciclo de 30s religava o alarme de um pedido já aceito por
     +    // outra pessoa. A trava era desnecessária: a própria buscarPedidoReal já
     +    // trata "tem oferta na tela" verificando o status dela e saindo, sem criar
     +    // oferta duplicada.
     ```
     Não muda nenhuma chamada do `RideAlert`. Só deixa a verificação que **para** o alarme voltar a rodar.

## Depende do chat do site (claude.ai)

O Claude Code não edita `/api` nem a `main`.

- **Aviso de endereço impreciso.** O app e o site já mostram "Confere o endereço do cliente", mas o `api/calcular-distancia.js` em produção só devolve `{ ok, km }`. Faltam os campos `enderecoImpreciso` e `enderecoEncontrado`, então o aviso não aparece em lugar nenhum. A Routes API do Google informa quando o endereço foi achado só por aproximação. Quando o servidor mandar os campos, o app já funciona sem mudança.

- ✅ **Motivo do cancelamento no histórico do Empresário (site).** Resolvido no site em 06/10/2026 (commit `7499c51` da `main`), com a mesma linha do app.

- ✅ **"Sair" do Motoboy no site não marcava offline.** Corrigido no site em 06/10/2026 (commit `1f59bc0` da `main`), com a mesma lógica do app. Validado pelo Alessandro no site: ao sair, o Admin mostrou a conta offline.

## Divergências site × app já trazidas

- ✅ **Paginação acima de 1.000 linhas (site, 28/09).** Feito em 06/10/2026.
  - `buscarTodasPaginado` foi trazida para o Admin, o Empresário e o Motoboy, e aplicada nas mesmas 5 consultas que o site pagina:
    - Admin: clientes e pedidos;
    - Empresário: total pendente de 120 dias e valor pendente do bloqueio;
    - Motoboy: ranking do mês.
  - Teste em 06/10: o banco tinha 1.489 pedidos, e a consulta sem paginar trazia só 1.000.

## Melhorias futuras

- **Lista de pedidos em andamento do Empresário (`carregarPedidos`) ainda usa JOIN com motoboys.** Hoje funciona, porque a relação é explícita. Mas se o JOIN falhar algum dia, a lista inteira some da tela. O site já usa duas consultas separadas (pedidos sem JOIN e nomes dos motoboys à parte), igual ao que foi feito no histórico em 06/10.
  - Deixado de fora de propósito: essa lista alimenta o card novo de corridas, que já foi testado e aprovado.
  - Se for mexer, testar o card de novo: cores por motoboy, resumo, entregas finalizadas e limite de vagas.

## Outros problemas encontrados

- ✅ **"Sair" não marcava o motoboy offline no banco.** Corrigido no app (`76d8d1a`) e no site (`1f59bc0`) em 06/10/2026, e **validado nos dois** pelo Alessandro: ao tocar em Sair, o Admin mostra a conta offline.
  - Empresário e Admin não têm status online, então não são afetados.
- **Admin forçando offline não chega no celular do motoboy.** O app só percebe na hora o bloqueio/banimento, não a mudança do `online`. Ele continua achando que está online e toca pelo tempo real, mas para de receber o push dos pedidos reais até o motoboy mexer no botão.

## Publicação na Play Store

Guia completo, com ordem das etapas, quem faz cada uma e checklist, em [PUBLICACAO-PLAY-STORE.md](PUBLICACAO-PLAY-STORE.md). Os itens de código que bloqueiam a publicação:

- **Exclusão de conta** no app (+ página na web e remoção final, com o chat do site). É obrigatória para apps com cadastro.
- **Assinatura de lançamento + AAB.** Hoje só existe o APK de teste.
- **Cláusula de geolocalização nos Termos do Motoboy:** diz que o app coleta localização, mas ele não coleta.

## Futuro: iPhone

- **Contas salvas ("lembrar login") no iOS.** No Android, isso usa o `CredenciaisPlugin.java` (Gerenciador de Credenciais). No iPhone vai precisar de:
  - um plugin equivalente (painel de senhas da Apple);
  - o Associated Domains (`webcredentials:`) configurado no projeto iOS;
  - o arquivo `apple-app-site-association` publicado no site.

  Sem isso, o Chaveiro do iCloud não oferece salvar nem preencher a senha dentro do app.

## Observações de uso

- **Samsung e o "Salvar senha?".** Em aparelhos Samsung, o serviço de preenchimento automático pode vir como **Samsung Pass**. No teste de 04/10/2026, o "Salvar senha?" só apareceu depois de trocar para **Google**, em Configurações → "Serviço de preenchimento automático". Se um motoboy com Samsung disser que o app não oferece salvar a senha, é a primeira coisa a conferir.
