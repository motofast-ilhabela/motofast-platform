package com.motofast.app;

import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Ponte entre o RideAlertService (nativo) e o Motoboy.jsx (React). Três
// direções:
// - JS chama startAlert() toda vez que MOSTRA um pedido pro motoboy — não só
//   quando um push chega. Adicionado em 14/09/2026: um pedido recusado volta
//   a ser oferecido depois do tempo de espera através de uma reavaliação
//   100% local (Supabase realtime/polling), sem nenhum push novo do
//   servidor — sem essa chamada, o alarme nunca tocava nesse retorno.
// - JS chama stopAlert() quando o motoboy aceita/recusa (ou o tempo esgota) —
//   pra parar o som em loop e a notificação.
// - Nativo chama notificarAlertaRecebido() (via MainActivity.onNewIntent, ver
//   lá) quando o app é aberto/trazido pra frente por causa de uma corrida
//   nova — o JS usa isso só como sinal de segurança (ver Motoboy.jsx), já
//   que a busca do pedido de verdade continua vindo do jeito de sempre
//   (Supabase realtime/polling), sem precisar de dado nenhum vindo do push.
@CapacitorPlugin(name = "RideAlert")
public class RideAlertPlugin extends Plugin {

    @PluginMethod
    public void startAlert(PluginCall call) {
        Intent intent = new Intent(getContext(), RideAlertService.class);
        intent.setAction(RideAlertService.ACTION_START);
        intent.putExtra(RideAlertService.EXTRA_TITLE, call.getString("titulo"));
        intent.putExtra(RideAlertService.EXTRA_BODY, call.getString("corpo"));
        ContextCompat.startForegroundService(getContext(), intent);
        call.resolve();
    }

    @PluginMethod
    public void stopAlert(PluginCall call) {
        // CRÍTICO: startService() aqui, NUNCA startForegroundService(). O
        // Android exige que toda chamada a startForegroundService() seja
        // seguida de Service.startForeground() em poucos segundos — senão o
        // sistema mata o app inteiro com ForegroundServiceDidNotStartInTime
        // Exception. Isso é exatamente o que estava acontecendo aqui: o
        // comando era de PARAR (nunca chama startForeground(), faz o
        // oposto), derrubando o app todo toda vez que alguém tocava em
        // Aceitar/Recusar (confirmado no log de crash de 14/09/2026) — e
        // como esse crash podia acontecer ANTES do aceitar() terminar de
        // gravar "aceito" no banco, o pedido ficava preso como "aguardando"
        // e o alarme voltava a tocar sozinho depois. O serviço já está
        // rodando em primeiro plano nesse momento — startService() simples
        // é a forma certa de mandar um comando pra ele continuar assim.
        Intent intent = new Intent(getContext(), RideAlertService.class);
        intent.setAction(RideAlertService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve();
    }

    public void notificarAlertaRecebido() {
        // retainUntilConsumed=true é essencial aqui: num app recém-aberto
        // (o caso mais comum — foi exatamente o que travou o alarme no
        // teste de 14/09/2026), esse aviso chega ANTES do React terminar de
        // montar e registrar o listener no Motoboy.jsx. Sem reter, o evento
        // se perde e o timer de segurança do JS nunca é armado.
        notifyListeners("rideAlertReceived", new JSObject(), true);
    }
}
