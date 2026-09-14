package com.motofast.app;

import android.content.Context;
import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.INotificationServiceExtension;

// Ponto de entrada que intercepta TODO push do OneSignal antes dele decidir
// mostrar uma notificação comum sozinho. Registrado via meta-data no
// AndroidManifest.xml ("com.onesignal.NotificationServiceExtension") — essa
// chave e essa interface foram confirmadas decompilando o SDK de verdade
// (com.onesignal:core:5.10.0), não por documentação, porque a versão da lib
// disponível não deixava claro no material público.
//
// Hoje o servidor só manda um tipo de push (corrida nova — ver
// api/notificar-motoboys.js e api/notificar-motoboy-especifico.js), então
// tratamos QUALQUER push como corrida nova. Se um dia existir um segundo
// tipo de push, o servidor vai precisar mandar um campo extra nos "dados" da
// notificação pra essa classe conseguir diferenciar (hoje não dá, o payload
// só tem título/corpo).
public class RideAlertNotificationExtension implements INotificationServiceExtension {
    @Override
    public void onNotificationReceived(INotificationReceivedEvent event) {
        event.preventDefault();

        Context context = event.getContext();
        String titulo = event.getNotification().getTitle();
        String corpo = event.getNotification().getBody();

        Intent intent = new Intent(context, RideAlertService.class);
        intent.setAction(RideAlertService.ACTION_START);
        if (titulo != null) intent.putExtra(RideAlertService.EXTRA_TITLE, titulo);
        if (corpo != null) intent.putExtra(RideAlertService.EXTRA_BODY, corpo);
        ContextCompat.startForegroundService(context, intent);
    }
}
