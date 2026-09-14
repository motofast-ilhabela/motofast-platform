package com.motofast.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import androidx.core.content.ContextCompat;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.INotificationServiceExtension;
import java.util.HashSet;
import java.util.Set;

// Ponto de entrada que intercepta TODO push do OneSignal antes dele decidir
// mostrar uma notificação comum sozinho. Registrado via meta-data no
// AndroidManifest.xml ("com.onesignal.NotificationServiceExtension") — essa
// chave e essa interface foram confirmadas decompilando o SDK de verdade
// (com.onesignal:core), não por documentação, porque a versão da lib
// disponível não deixava claro no material público.
//
// Hoje o servidor só manda um tipo de push (corrida nova — ver
// api/notificar-motoboys.js e api/notificar-motoboy-especifico.js), então
// tratamos QUALQUER push como corrida nova. Se um dia existir um segundo
// tipo de push, o servidor vai precisar mandar um campo extra nos "dados" da
// notificação pra essa classe conseguir diferenciar (hoje não dá, o payload
// só tem título/corpo).
public class RideAlertNotificationExtension implements INotificationServiceExtension {
    private static final String PREFS_NAME = "ride_alert_notifications";
    private static final String KEY_IDS_VISTOS = "ids_vistos";

    @Override
    public void onNotificationReceived(INotificationReceivedEvent event) {
        event.preventDefault();

        Context context = event.getContext();
        String notificationId = event.getNotification().getNotificationId();

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
        if (jaFoiTratada(context, notificationId)) return;
        marcarComoTratada(context, notificationId);

        String titulo = event.getNotification().getTitle();
        String corpo = event.getNotification().getBody();

        Intent intent = new Intent(context, RideAlertService.class);
        intent.setAction(RideAlertService.ACTION_START);
        if (titulo != null) intent.putExtra(RideAlertService.EXTRA_TITLE, titulo);
        if (corpo != null) intent.putExtra(RideAlertService.EXTRA_BODY, corpo);
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
