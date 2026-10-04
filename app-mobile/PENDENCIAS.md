# Pendências do app nativo (app-mobile)

Atualizado em 04/10/2026. Antes de mexer em qualquer item que tenha versão no site, comparar com o código atual da `main` (regra do CLAUDE.md: as telas do site e do app não se sincronizam sozinhas).

## Próximos itens, nesta ordem

Da varredura site × nativo:

1. 🔴 **Item 4: histórico do Empresário com JOIN ambíguo.** É o mesmo bug já corrigido no Admin.
2. 🔴 **Item 6: "marcar como pago" mirando a semana errada.**
3. 🟡 **Item 9: motivo do cancelamento não aparece no histórico do Empresário.**
4. 🟡 **Item 10: ranking não atualiza a cada entrega individual.**
5. 🟠 **Item 12: guard antigo perto do `RideAlert.stopAlert()`/`startAlert()`** que o site já removeu. **Só investigar e mostrar ao Alessandro, sem aplicar.** Encosta no alarme, e nada do alarme (`RideAlertService`, `RideAlertNotificationExtension`, `RideAlertPlugin`) muda sem confirmação dele.

## Depende do chat do site (claude.ai)

O Claude Code não edita `/api` nem a `main`.

- **Aviso de endereço impreciso.** O app e o site já mostram "Confere o endereço do cliente", mas o `api/calcular-distancia.js` em produção só devolve `{ ok, km }`. Faltam os campos `enderecoImpreciso` e `enderecoEncontrado`, então o aviso não aparece em lugar nenhum. A Routes API do Google informa quando o endereço foi achado só por aproximação. Quando o servidor mandar os campos, o app já funciona sem mudança.

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
