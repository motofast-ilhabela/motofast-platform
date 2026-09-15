// Calcula a distância real de rota entre dois endereços usando o Google Maps
// (Routes API, modo TWO_WHEELER — rota de moto de verdade, não de carro).
// Roda no SERVIDOR — a chave de API nunca fica exposta no navegador do
// empresário, só aqui, protegida como variável de ambiente.
//
// MIGRADO em 15/09/2026: antes usava a Distance Matrix API com mode=driving
// (rota de carro). Um estabelecimento reclamou de divergência de km e,
// investigando, veio à tona que a Distance Matrix API não tem modo de moto
// — só carro, a pé, bicicleta e ônibus. Como a MotoFast entrega de moto, e
// o Google tem sim rota específica pra moto no Brasil (TWO_WHEELER) através
// da Routes API (mais nova), migramos pra ela — dá distância mais justa e
// mais barata pro cliente em ruas onde moto passa por atalho que carro não
// passa. Usa a MESMA variável de ambiente GOOGLE_MAPS_API_KEY de sempre.
export default async function handler(req, res) {
  // CORS — adicionado em 07/09/2026 pra permitir chamadas vindas do app
  // nativo (Capacitor/WebView), que faz preflight OPTIONS antes do POST de
  // verdade. Sem isso, o navegador do app bloqueava a chamada com 405 antes
  // mesmo dela chegar aqui. Não muda nada do comportamento pro site.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, erro: "Método não permitido" });
  }

  const { origem, destino } = req.body || {};
  if (!origem || !destino) {
    return res.status(400).json({ ok: false, erro: "Origem e destino são obrigatórios" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("[calcular-distancia] GOOGLE_MAPS_API_KEY não está configurada no servidor");
    return res.status(500).json({ ok: false, erro: "Chave do Google Maps não configurada no servidor" });
  }

  console.log(`[calcular-distancia] Origem: "${origem}" | Destino: "${destino}" | modo: TWO_WHEELER`);

  try {
    const resposta = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // FieldMask é obrigatório na Routes API — sem isso o Google recusa
        // a chamada inteira. Só pedimos o que realmente usamos.
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin: { address: origem },
        destination: { address: destino },
        travelMode: "TWO_WHEELER",
        routingPreference: "TRAFFIC_UNAWARE",
        units: "METRIC",
        regionCode: "BR",
      }),
    });
    const data = await resposta.json();

    // LOG COMPLETO da resposta do Google — isso é o que precisamos ver na tela
    // de Logs do Vercel pra saber exatamente o que está acontecendo.
    console.log(`[calcular-distancia] Resposta completa do Google:`, JSON.stringify(data));

    if (!resposta.ok) {
      console.error(`[calcular-distancia] FALHOU: status HTTP ${resposta.status}`, data.error?.message || "");
      return res.status(200).json({ ok: false, erro: `Google respondeu: ${data.error?.message || resposta.status}` });
    }

    const rota = data.routes?.[0];
    if (!rota || rota.distanceMeters == null) {
      console.error("[calcular-distancia] FALHOU: nenhuma rota de moto encontrada entre esses endereços");
      return res.status(200).json({ ok: false, erro: "Não foi possível calcular a rota de moto entre esses endereços" });
    }

    const km = rota.distanceMeters / 1000;
    console.log(`[calcular-distancia] SUCESSO: ${km}km (moto)`);
    return res.status(200).json({ ok: true, km });
  } catch (e) {
    console.error("[calcular-distancia] Erro de conexão/exceção:", e.message);
    return res.status(200).json({ ok: false, erro: "Erro de conexão com o Google Maps" });
  }
}

