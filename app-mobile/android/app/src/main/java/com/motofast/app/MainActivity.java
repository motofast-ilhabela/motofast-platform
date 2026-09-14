package com.motofast.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    public static final String EXTRA_RIDE_ALERT = "ride_alert";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RideAlertPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // MUDANÇA em 14/09/2026 a pedido do Alessandro: por segurança, o app
        // não abre mais sozinho por cima da tela bloqueada direto na tela de
        // Aceitar/Recusar (risco de toque acidental no bolso/capinha aceitar
        // ou recusar uma corrida sem o motoboy perceber). O motoboy agora
        // TEM que desbloquear o celular e abrir o app por conta própria — o
        // alarme e a notificação chamativa (ver RideAlertService) só acordam
        // a tela e avisam, não tomam nenhuma ação sozinhos. Esse aviso ao
        // plugin continua só pelo temporizador de segurança de 90s do JS
        // (ver Motoboy.jsx), não abre mais nenhuma tela por cima do bloqueio.
        if (intent != null && intent.getBooleanExtra(EXTRA_RIDE_ALERT, false)) {
            avisarPluginRideAlert();
        }
    }

    private void avisarPluginRideAlert() {
        if (getBridge() == null) return;
        PluginHandle handle = getBridge().getPlugin("RideAlert");
        if (handle == null) return;
        Plugin plugin = handle.getInstance();
        if (plugin instanceof RideAlertPlugin) {
            ((RideAlertPlugin) plugin).notificarAlertaRecebido();
        }
    }
}
