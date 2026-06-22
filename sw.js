// MotoFast Service Worker — notificações push para motoboy
// Versão 1.0

const CACHE_NAME = "motofast-v1";

// Instala o service worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Recebe notificação push e exibe no celular (mesmo com tela bloqueada)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const titulo = data.titulo || "🏍️ Novo Pedido MotoFast!";
  const corpo = data.corpo || "Você tem um novo pedido disponível. Abra o app para aceitar!";
  const url = data.url || "/motoboy";

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: corpo,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true, // notificação fica na tela até o motoboy interagir
      data: { url },
      actions: [
        { action: "abrir", title: "✅ Ver pedido" },
        { action: "fechar", title: "❌ Ignorar" },
      ],
    })
  );
});

// Quando motoboy clica na notificação, abre o app na tela certa
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "fechar") return;

  const url = event.notification.data?.url || "/motoboy";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Se já tem a aba aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes("motofastentregas.com.br") && "focus" in client) {
          client.focus();
          return;
        }
      }
      // Senão abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Mensagem recebida da página (ex: para testar notificação)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
