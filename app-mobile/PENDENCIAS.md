# Pendências do app nativo (app-mobile)

Atualizado em 04/10/2026. Antes de mexer em qualquer item que tenha versão no site, comparar com o código atual da `main` (regra do CLAUDE.md: as telas do site e do app não se sincronizam sozinhas).

## Próximos itens, nesta ordem

Da varredura site × nativo:

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
5. 🟠 **Item 12: guard antigo perto do `RideAlert.stopAlert()`/`startAlert()`** que o site já removeu. **Só investigar e mostrar ao Alessandro, sem aplicar.** Encosta no alarme, e nada do alarme (`RideAlertService`, `RideAlertNotificationExtension`, `RideAlertPlugin`) muda sem confirmação dele.

## Depende do chat do site (claude.ai)

O Claude Code não edita `/api` nem a `main`.

- **Aviso de endereço impreciso.** O app e o site já mostram "Confere o endereço do cliente", mas o `api/calcular-distancia.js` em produção só devolve `{ ok, km }`. Faltam os campos `enderecoImpreciso` e `enderecoEncontrado`, então o aviso não aparece em lugar nenhum. A Routes API do Google informa quando o endereço foi achado só por aproximação. Quando o servidor mandar os campos, o app já funciona sem mudança.

- **Motivo do cancelamento no histórico do Empresário (site).** O site mostra `e.motivo` no card de cancelado desde 24/09, mas o `carregarHistorico` do site não preenche esse campo. Falta lá a mesma linha que entrou no app em 06/10: `motivo: p.motivo_cancelamento || null,` no mapeamento do histórico.

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

- **"Sair" não marca o motoboy offline no banco.** O botão só faz `signOut`. A conta continua `online: true` e segue contando para a prioridade/turno fixo e para o broadcast de corrida nova. Vale para o app e para o site.

## Futuro: iPhone

- **Contas salvas ("lembrar login") no iOS.** No Android, isso usa o `CredenciaisPlugin.java` (Gerenciador de Credenciais). No iPhone vai precisar de:
  - um plugin equivalente (painel de senhas da Apple);
  - o Associated Domains (`webcredentials:`) configurado no projeto iOS;
  - o arquivo `apple-app-site-association` publicado no site.

  Sem isso, o Chaveiro do iCloud não oferece salvar nem preencher a senha dentro do app.

## Observações de uso

- **Samsung e o "Salvar senha?".** Em aparelhos Samsung, o serviço de preenchimento automático pode vir como **Samsung Pass**. No teste de 04/10/2026, o "Salvar senha?" só apareceu depois de trocar para **Google**, em Configurações → "Serviço de preenchimento automático". Se um motoboy com Samsung disser que o app não oferece salvar a senha, é a primeira coisa a conferir.
