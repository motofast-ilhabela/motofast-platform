package com.motofast.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;

// Serviço em primeiro plano responsável por tocar o alarme em LOOP e mostrar
// uma notificação chamativa de "corrida nova" — mesma ideia de app de
// chamada/entrega (Uber/iFood/99), mas SEM abrir nada sozinho por cima da
// tela bloqueada: por segurança (evitar aceitar/recusar sem querer com o
// celular no bolso), o motoboy precisa desbloquear e abrir o app por conta
// própria pra decidir. Criado em 14/09/2026 a pedido do Alessandro, porque
// uma notificação comum do Android só toca som uma vez, o que não é
// suficiente pra quem está na rua trabalhando e pode não perceber de
// primeira. Só para quando o motoboy toca em Aceitar/Recusar na tela (ver
// RideAlertPlugin.stopAlert(), chamado do Motoboy.jsx) ou depois do teto de
// segurança (DURACAO_MAXIMA_MS).
public class RideAlertService extends Service {
    public static final String ACTION_START = "com.motofast.app.action.START_RIDE_ALERT";
    public static final String ACTION_STOP = "com.motofast.app.action.STOP_RIDE_ALERT";
    public static final String EXTRA_TITLE = "titulo";
    public static final String EXTRA_BODY = "corpo";
    public static final String EXTRA_PEDIDO_ID = "pedidoId";

    private static final String PREFS_NAME = "ride_alert_state";
    private static final String KEY_PEDIDO_ATUAL = "pedido_atual";
    private static final String CHANNEL_ID = "corrida_alerta";
    private static final int NOTIFICATION_ID = 991177;
    // Teto de segurança: se nada mais parar o alarme (app travou, React não
    // carregou a tempo, pedido já não existe mais quando o app abre — foi
    // exatamente o que aconteceu no teste de 14/09/2026), ele para sozinho
    // depois desse tempo, em vez de tocar pra sempre e precisar forçar
    // parada do app inteiro. 9 minutos (ajustado em 14/09/2026 a pedido do
    // Alessandro) — folga confortável acima dos até ~5 minutos que o ciclo
    // normal de reoferta (10x30s, ver Motoboy.jsx) já pode legitimamente
    // levar sozinho, sem cortar o alarme de um pedido ainda ativo.
    private static final long DURACAO_MAXIMA_MS = 9 * 60_000;

    // CRIADO em 18/09/2026, a pedido do Alessandro: o alarme só parava por
    // aviso do servidor (push "cancelar_oferta", ver
    // RideAlertNotificationExtension). Isso falha silenciosamente se a
    // assinatura de push daquele celular específico estiver com problema no
    // OneSignal — confirmado em produção: um motoboy real (não só o celular
    // de teste) ficou com o alarme tocando sem parar porque o push de
    // cancelamento nunca chegou, mesmo a corrida já tendo sido aceita por
    // outra pessoa há minutos. Essa checagem é uma segunda camada,
    // totalmente independente do OneSignal/push: enquanto o alarme está
    // tocando, o próprio serviço confere direto no banco, de tempos em
    // tempos, se o pedido ainda está "aguardando" — se não estiver mais
    // (aceito, cancelado, etc.), para sozinho, não importa se algum push
    // chegou ou não.
    private static final String SUPABASE_URL = "https://eynpjqhjkwwdpemsospy.supabase.co";
    private static final String SUPABASE_ANON_KEY = "sb_publishable_MMbUB_k9rDmEJU1j9wAKig_ZpoOTwVW";
    // 3s a pedido do Alessandro (18/09/2026) — a causa real do atraso longo
    // era o pedidoId nunca chegar a esse serviço (ver correção no push, com
    // "data.pedidoId"), não a velocidade do intervalo. Mesmo assim, com o
    // pedidoId chegando certo agora, não custa deixar essa rede de segurança
    // mais rápida também.
    private static final long INTERVALO_CHECAGEM_MS = 3_000;

    private MediaPlayer mediaPlayer;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable pararPorTimeout = this::pararAlerta;
    private ScheduledExecutorService checagemExecutor;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // CORRIGIDO em 14/09/2026: NUNCA usar START_STICKY aqui. Um crash em
        // qualquer lugar do app matava o processo, e o Android — por causa
        // do START_STICKY antigo — ressuscitava esse serviço sozinho com um
        // intent NULO pouco depois, o que reiniciava o alarme do zero (som +
        // notificação + teto de 90s de novo) sem nenhum pedido novo de
        // verdade. START_NOT_STICKY garante que, se o serviço for morto, ele
        // fica morto — nunca volta sozinho tocando alarme fantasma.
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if (ACTION_STOP.equals(action)) {
            pararAlerta();
            return START_NOT_STICKY;
        }

        String titulo = intent.getStringExtra(EXTRA_TITLE) != null
            ? intent.getStringExtra(EXTRA_TITLE) : "Nova corrida disponível!";
        String corpo = intent.getStringExtra(EXTRA_BODY) != null
            ? intent.getStringExtra(EXTRA_BODY) : "Toque para ver os detalhes e aceitar.";

        // Guarda qual pedido está tocando AGORA nesse celular — usado pelo
        // RideAlertNotificationExtension para saber, quando chega um aviso
        // "cancelar_oferta" (outro motoboy aceitou essa mesma corrida), se é
        // este alarme específico que precisa parar ou se é de um pedido
        // diferente (cenário de conta de monitoramento com duas ofertas ao
        // mesmo tempo) e deve continuar tocando.
        salvarPedidoAtual(intent.getStringExtra(EXTRA_PEDIDO_ID));

        criarCanalNotificacao();
        startForeground(NOTIFICATION_ID, construirNotificacao(titulo, corpo));
        tocarAlarmeEmLoop();
        iniciarChecagemPeriodica();

        handler.removeCallbacks(pararPorTimeout);
        handler.postDelayed(pararPorTimeout, DURACAO_MAXIMA_MS);
        return START_NOT_STICKY;
    }

    // Liga (se ainda não estiver ligada) a checagem periódica de segurança —
    // idempotente, chamada em todo re-arme do alarme (cada oferta nova ou
    // renovação do ciclo de 30s), mas só cria a thread de verdade uma vez.
    private void iniciarChecagemPeriodica() {
        if (checagemExecutor != null && !checagemExecutor.isShutdown()) return;
        checagemExecutor = Executors.newSingleThreadScheduledExecutor();
        checagemExecutor.scheduleWithFixedDelay(
            this::checarSeAindaAguardando, INTERVALO_CHECAGEM_MS, INTERVALO_CHECAGEM_MS, TimeUnit.MILLISECONDS);
    }

    private void pararChecagemPeriodica() {
        if (checagemExecutor == null) return;
        checagemExecutor.shutdownNow();
        checagemExecutor = null;
    }

    // Roda numa thread de fundo (nunca na main thread — é rede de verdade).
    // Confere o pedido que está tocando AGORA (lido de novo a cada ciclo,
    // nunca guardado localmente) direto no Supabase, sem passar pelo
    // OneSignal/push de forma nenhuma.
    private void checarSeAindaAguardando() {
        String pedidoId = lerPedidoAtual(this);
        if (pedidoId == null) return;
        HttpURLConnection conn = null;
        try {
            URL url = new URL(SUPABASE_URL + "/rest/v1/pedidos?id=eq." + pedidoId + "&select=status");
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestProperty("apikey", SUPABASE_ANON_KEY);
            conn.setRequestProperty("Authorization", "Bearer " + SUPABASE_ANON_KEY);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            if (conn.getResponseCode() != 200) return;
            StringBuilder resposta = new StringBuilder();
            try (BufferedReader leitor = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                String linha;
                while ((linha = leitor.readLine()) != null) resposta.append(linha);
            }
            JSONArray lista = new JSONArray(resposta.toString());
            String statusAtual = lista.length() > 0 ? lista.getJSONObject(0).optString("status", null) : null;
            // Pedido sumiu (id trocou, corrida antiga) ou não está mais
            // "aguardando" (foi aceito por outra pessoa, cancelado, etc.) —
            // nos dois casos, não faz mais sentido esse alarme continuar.
            if (!"aguardando".equals(statusAtual)) {
                handler.post(this::pararAlerta);
            }
        } catch (Exception e) {
            // Falha de rede/timeout não deve derrubar o alarme por engano —
            // só tenta de novo sozinho no próximo ciclo, silenciosamente.
            android.util.Log.w("RideAlertService", "Erro ao checar status do pedido (tenta de novo no próximo ciclo): " + e.getMessage());
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private void criarCanalNotificacao() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;
        // Importância alta pra virar heads-up e acender a tela mesmo com o
        // celular bloqueado, mas SEM som próprio — quem toca o alarme de
        // verdade, em loop, é o MediaPlayer abaixo, não essa notificação.
        NotificationChannel canal = new NotificationChannel(
            CHANNEL_ID, "Corrida em tempo real", NotificationManager.IMPORTANCE_HIGH);
        canal.setSound(null, null);
        canal.setDescription("Avisa de uma corrida nova chegando — não abre o app sozinho.");
        manager.createNotificationChannel(canal);
    }

    private Notification construirNotificacao(String titulo, String corpo) {
        // Toque na notificação só abre o app normalmente (o motoboy ainda
        // precisa desbloquear o celular manualmente antes disso acontecer —
        // sem full-screen intent, sem pular a tela de bloqueio). O extra
        // EXTRA_RIDE_ALERT continua servindo só de sinal pro temporizador de
        // segurança de 90s do lado do JS (ver Motoboy.jsx).
        Intent intentAbrirApp = new Intent(this, MainActivity.class);
        intentAbrirApp.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intentAbrirApp.putExtra(MainActivity.EXTRA_RIDE_ALERT, true);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, intentAbrirApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // PROPOSITALMENTE sem botão de "silenciar"/"dispensar" na
        // notificação — removido em 14/09/2026 a pedido do Alessandro: um
        // botão desses deixava o motoboy calar o alarme sem aceitar nem
        // recusar a corrida de verdade, o oposto do que essa funcionalidade
        // existe pra evitar. A única forma de parar o alarme tem que ser
        // Aceitar/Recusar na tela do pedido (ou o teto de 90s como último
        // recurso).
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(titulo)
            .setContentText(corpo)
            .setSmallIcon(getApplicationInfo().icon)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .build();
    }

    private void tocarAlarmeEmLoop() {
        pararSomSeEstiverTocando();
        try {
            mediaPlayer = MediaPlayer.create(this, R.raw.alarme_buzina);
            if (mediaPlayer == null) return;
            mediaPlayer.setLooping(true);
            mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build());
            mediaPlayer.start();
        } catch (Exception e) {
            android.util.Log.e("RideAlertService", "Erro ao tocar alarme", e);
        }
    }

    private void pararSomSeEstiverTocando() {
        if (mediaPlayer == null) return;
        try {
            if (mediaPlayer.isPlaying()) mediaPlayer.stop();
        } catch (Exception ignored) {}
        mediaPlayer.release();
        mediaPlayer = null;
    }

    private void pararAlerta() {
        handler.removeCallbacks(pararPorTimeout);
        pararChecagemPeriodica();
        pararSomSeEstiverTocando();
        salvarPedidoAtual(null);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.cancel(NOTIFICATION_ID);
        stopForeground(true);
        stopSelf();
    }

    private void salvarPedidoAtual(String pedidoId) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (pedidoId == null) {
            prefs.edit().remove(KEY_PEDIDO_ATUAL).apply();
        } else {
            prefs.edit().putString(KEY_PEDIDO_ATUAL, pedidoId).apply();
        }
    }

    // Chamado pelo RideAlertNotificationExtension (processo/classe separada,
    // por isso via SharedPreferences e não campo estático — precisa
    // sobreviver mesmo se o app foi reaberto do zero) para saber se o
    // alarme tocando agora é do mesmo pedido que acabou de ser fechado por
    // outra pessoa.
    static String lerPedidoAtual(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_PEDIDO_ATUAL, null);
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(pararPorTimeout);
        pararChecagemPeriodica();
        pararSomSeEstiverTocando();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
