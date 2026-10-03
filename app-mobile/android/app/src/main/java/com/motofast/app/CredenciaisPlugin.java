package com.motofast.app;

import android.app.Activity;
import android.os.CancellationSignal;
import androidx.core.content.ContextCompat;
import androidx.credentials.CreateCredentialResponse;
import androidx.credentials.CreatePasswordRequest;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.GetPasswordOption;
import androidx.credentials.PasswordCredential;
import androidx.credentials.exceptions.CreateCredentialCancellationException;
import androidx.credentials.exceptions.CreateCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// "Lembrar login" pelo Gerenciador de Credenciais do Android — adicionado em
// 03/10/2026 a pedido do Alessandro, depois que o teste no Samsung mostrou que
// só marcar os campos de login (autoComplete) não fazia o "Salvar senha?"
// aparecer de forma confiável dentro do app (o WebView se apresenta como
// "localhost" e o login não é um envio de formulário clássico).
//
// Aqui o app pede DIRETO pro sistema:
// - salvarSenha(): depois de um login certo digitado à mão — o Android mostra
//   a própria janela "Salvar senha?" (Google, ou o gerenciador escolhido no
//   aparelho, ex: Samsung Pass).
// - obterSenhaSalva(): na tela de login — o Android mostra a lista de contas
//   salvas pra esse app; um toque devolve e-mail e senha pro JS entrar.
//
// SEGURANÇA: o app nunca guarda a senha. Ela fica só no gerenciador de senhas
// do aparelho, que pode pedir a digital/PIN antes de entregar.
//
// Sistema TOTALMENTE separado do RideAlertPlugin/RideAlertService — não toca
// em nada do alarme de corrida.
@CapacitorPlugin(name = "Credenciais")
public class CredenciaisPlugin extends Plugin {

    @PluginMethod
    public void salvarSenha(PluginCall call) {
        String email = call.getString("email");
        String senha = call.getString("senha");
        Activity activity = getActivity();
        if (email == null || email.isEmpty() || senha == null || senha.isEmpty() || activity == null) {
            call.reject("email e senha são obrigatórios");
            return;
        }

        CredentialManager gerenciador = CredentialManager.create(activity);
        CreatePasswordRequest pedido = new CreatePasswordRequest(email, senha);
        gerenciador.createCredentialAsync(
            activity,
            pedido,
            new CancellationSignal(),
            ContextCompat.getMainExecutor(activity),
            new CredentialManagerCallback<CreateCredentialResponse, CreateCredentialException>() {
                @Override
                public void onResult(CreateCredentialResponse resposta) {
                    JSObject ret = new JSObject();
                    ret.put("salvo", true);
                    call.resolve(ret);
                }

                @Override
                public void onError(CreateCredentialException e) {
                    // Pessoa tocou em "Agora não" (ou fechou a janela) — não é
                    // erro, só não salvou.
                    JSObject ret = new JSObject();
                    ret.put("salvo", false);
                    ret.put("cancelado", e instanceof CreateCredentialCancellationException);
                    ret.put("motivo", e.getClass().getSimpleName() + ": " + e.getMessage());
                    call.resolve(ret);
                }
            }
        );
    }

    @PluginMethod
    public void obterSenhaSalva(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity indisponível");
            return;
        }

        CredentialManager gerenciador = CredentialManager.create(activity);
        GetCredentialRequest pedido = new GetCredentialRequest.Builder()
            .addCredentialOption(new GetPasswordOption())
            .build();
        gerenciador.getCredentialAsync(
            activity,
            pedido,
            new CancellationSignal(),
            ContextCompat.getMainExecutor(activity),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse resposta) {
                    Credential credencial = resposta.getCredential();
                    JSObject ret = new JSObject();
                    if (credencial instanceof PasswordCredential) {
                        PasswordCredential senhaSalva = (PasswordCredential) credencial;
                        ret.put("email", senhaSalva.getId());
                        ret.put("senha", senhaSalva.getPassword());
                    } else {
                        ret.put("nenhuma", true);
                    }
                    call.resolve(ret);
                }

                @Override
                public void onError(GetCredentialException e) {
                    // Sem nenhuma senha salva pra esse app, ou a pessoa fechou
                    // a lista — os dois são casos normais, não erro: o JS só
                    // segue com o login digitado.
                    JSObject ret = new JSObject();
                    ret.put("nenhuma", e instanceof NoCredentialException);
                    ret.put("cancelado", e instanceof GetCredentialCancellationException);
                    ret.put("motivo", e.getClass().getSimpleName() + ": " + e.getMessage());
                    call.resolve(ret);
                }
            }
        );
    }
}
