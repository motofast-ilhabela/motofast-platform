# ⚡ MotoFast — Plataforma de Entregas (Ilhabela/SP)

Plataforma de logística de entregas que conecta empresários (estabelecimentos) e motoboys em Ilhabela e região.

## 🔗 Rotas da plataforma

Depois de publicada, a plataforma terá os seguintes endereços:

- `/` → Tela inicial — cadastro e login (empresário e motoboy)
- `/empresario` → Painel do empresário (solicitar entregas, acompanhar pedidos)
- `/motoboy` → Painel do motoboy (receber pedidos, ganhos)
- `/admin` → Painel administrativo (privado — uso exclusivo do dono da plataforma)

## 🛠️ Tecnologia

- React + Vite
- React Router (navegação entre painéis)
- Estilização inline (sem dependências externas de CSS)

## 📌 Status

Protótipo funcional com dados de demonstração. Próximos passos:
- Conectar banco de dados real (Supabase)
- Substituir dados de demonstração por dados reais
- Configurar WhatsApp Business API para notificações automáticas
