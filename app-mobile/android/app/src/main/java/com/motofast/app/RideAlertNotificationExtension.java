package com.motofast.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import androidx.core.content.ContextCompat;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.INotificationServiceExtension;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import org.json.JSONObject;

// Ponto de entrada que intercepta TODO push do OneSignal antes dele decidir
// mostrar uma notificação comum sozinho. Registrado via meta-data no
// AndroidManifest.xml ("com.onesignal.NotificationServiceExtension") — essa
// chave e essa interface foram confirmadas decompilando o SDK de verdade
// (com.onesignal:core), não por documentação, porque a versão da lib
// disponível não deixava claro no material público.
//
// O servidor manda dois tipos de push, diferenciados pelo campo "tipo" nos
// dados extras (additionalData) da notificação:
// - Sem "tipo" (ou "tipo" != "cancelar_oferta"): corrida nova — ver
//   api/notificar-motoboys.js e api/notificar-motoboy-especifico.js. Liga o
//   alarme em loop.
// - "tipo": "cancelar_oferta" (ver api/cancelar-oferta-pedido.js, adicionado
//   em 14/09/2026): outro motoboy já aceitou essa corrida — manda PARAR o
//   alarme, mas só se o pedido tocando agora NESTE celular for o mesmo
//   pedidoId (ver RideAlertService.salvarPedidoAtual/lerPedidoAtual). Sem
//   isso, um motoboy com a tela bloqueada continuava com o alarme tocando
//   até desbloquear e abrir o app manualmente, mesmo já tendo perdido a
//   corrida pra outra pessoa — bug real reportado em produção.
// Em ambos os casos, event.preventDefault() garante que nenhuma notificação
// visível "crua" do OneSignal aparece sozinha — só o que RideAlertService
// decide mostrar (a notificação do alarme tocando) é exibido de verdade.
public class RideAlertNotificationExtension implements INotificationServiceExtension {
    private static final String TAG = "RideAlertExtension";
    private static final String PREFS_NAME = "ride_alert_notifications";
    private static final String KEY_IDS_VISTOS = "ids_vistos";

    @Override
    public void onNotificationReceived(INotificationReceivedEvent event) {
        event.preventDefault();

        Context context = event.getContext();
        String notificationId = event.getNotification().getNotificationId();
        android.util.Log.d(TAG, "Push recebido, notificationId=" + notificationId);

        // CRÍTICO, confirmado por log real em 14/09/2026: o OneSignal tem um
        // mecanismo próprio (NotificationRestoreWorkManager) que reprocessa
        // notificações antigas do histórico local toda vez que o app abre —
        // é assim que ele reexibe avisos perdidos depois de reiniciar o
        // celular, por exemplo. Sem essa checagem, esse método era chamado
        // de novo pra cada corrida de teste já cancelada há muito tempo toda
        // vez que o app era aberto, religando o alarme sem nenhum pedido
        // novo de verdade por trás. A versão do SDK disponível pra compilar
        // (5.9.5) não expõe um jeito direto de perguntar "isso é uma
        // restauração?" (esse campo só existe numa versão mais nova) — em
        // vez de arriscar forçar outra versão do SDK, guarda o ID de cada
        // notificação já tratada e ignora qualquer repetição. Mais robusto,
        // de quebra: cobre qualquer outro motivo de reentrega duplicada do
        // FCM, não só esse.
        if (jaFoiTratada(context, notificationId)) {
            android.util.Log.d(TAG, "Ignorado: notificationId já tratado antes (provável restauração/reentrega): " + notificationId);
            return;
        }
        marcarComoTratada(context, notificationId);

        JSONObject dados = event.getNotification().getAdditionalData();
        String tipo = dados != null ? dados.optString("tipo", null) : null;

        if ("cancelar_oferta".equals(tipo)) {
            String pedidoIdCancelado = dados.optString("pedidoId", null);
            String pedidoIdTocandoAgora = RideAlertService.lerPedidoAtual(context);
            boolean bateu = pedidoIdCancelado != null && Objects.equals(pedidoIdCancelado, pedidoIdTocandoAgora);
            android.util.Log.d(TAG, "tipo=cancelar_oferta pedidoIdCancelado=" + pedidoIdCancelado
                + " pedidoIdTocandoAgora=" + pedidoIdTocandoAgora + " bateu=" + bateu);
            // Só para o alarme se for o MESMO pedido — uma conta de
            // monitoramento pode legitimamente ter uma oferta diferente
            // tocando ao mesmo tempo, que não pode ser derrubada por engano.
            if (bateu) {
                Intent intent = new Intent(context, RideAlertService.class);
                intent.setAction(RideAlertService.ACTION_STOP);
                // CRÍTICO (mesma regra do RideAlertPlugin.stopAlert): usar
                // startService() puro aqui, nunca startForegroundService(),
                // senão o Android mata o app por não chamar startForeground()
                // a tempo pra um comando que é justamente de PARAR.
                context.startService(intent);
                android.util.Log.d(TAG, "ACTION_STOP disparado nativamente (sem passar pelo JS).");
            }
            return;
        }

        String titulo = event.getNotification().getTitle();
        String corpo = event.getNotification().getBody();
        // ADICIONADO em 18/09/2026: o push de "corrida nova" agora pode
        // trazer o pedidoId junto (ver api/notificar-motoboys.js e
        // api/notificar-motoboy-especifico.js) — CRÍTICO pra checagem
        // periódica de segurança do RideAlertService funcionar com a tela
        // bloqueada: sem isso, o serviço ligava o alarme sem saber qual
        // pedido checar, e só descobria o pedidoId de verdade quando o
        // JS rodasse (o que não acontece com a tela bloqueada) — bug real
        // em produção, onde o alarme nunca parava sozinho mesmo já tendo
        // sido aceito por outro motoboy minutos antes.
        String pedidoId = dados != null ? dados.optString("pedidoId", null) : null;
        android.util.Log.d(TAG, "tipo=nova_corrida (ou sem tipo) — ligando alarme. titulo=" + titulo + " pedidoId=" + pedidoId);

        Intent intent = new Intent(context, RideAlertService.class);
        intent.setAction(RideAlertService.ACTION_START);
        if (titulo != null) intent.putExtra(RideAlertService.EXTRA_TITLE, titulo);
        if (corpo != null) intent.putExtra(RideAlertService.EXTRA_BODY, corpo);
        if (pedidoId != null) intent.putExtra(RideAlertService.EXTRA_PEDIDO_ID, pedidoId);
        ContextCompat.startForegroundService(context, intent);
    }

    private boolean jaFoiTratada(Context context, String notificationId) {
        if (notificationId == null) return false;
        Set<String> vistos = prefs(context).getStringSet(KEY_IDS_VISTOS, null);
        return vistos != null && vistos.contains(notificationId);
    }

    private void marcarComoTratada(Context context, String notificationId) {
        if (notificationId == null) return;
        SharedPreferences prefs = prefs(context);
        // getStringSet() pode devolver a MESMA instância guardada — nunca
        // mutar direto, sempre copiar antes (regra documentada do Android).
        Set<String> vistos = new HashSet<>(prefs.getStringSet(KEY_IDS_VISTOS, new HashSet<>()));
        vistos.add(notificationId);
        prefs.edit().putStringSet(KEY_IDS_VISTOS, vistos).apply();
    }

    private SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
}
