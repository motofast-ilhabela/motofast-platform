// Calcula a distância real de rota entre dois endereços usando o Google Maps
// (Distance Matrix API). Roda no SERVIDOR — a chave de API nunca fica exposta
// no navegador do empresário, só aqui, protegida como variável de ambiente.
export default async function handler(req, res) {
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

  console.log(`[calcular-distancia] Origem: "${origem}" | Destino: "${destino}"`);

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&mode=driving&units=metric&region=br&key=${apiKey}`;
    const resposta = await fetch(url);
    const data = await resposta.json();

    // LOG COMPLETO da resposta do Google — isso é o que precisamos ver na tela
    // de Logs do Vercel pra saber exatamente o que está acontecendo.
    console.log(`[calcular-distancia] Status geral do Google: ${data.status}`);
    if (data.error_message) {
      console.error(`[calcular-distancia] Mensagem de erro do Google: ${data.error_message}`);
    }

    if (data.status !== "OK") {
      console.error(`[calcular-distancia] FALHOU no status geral: ${data.status}`);
      return res.status(200).json({ ok: false, erro: `Google respondeu: ${data.status}${data.error_message ? " — " + data.error_message : ""}` });
    }

    const elemento = data.rows?.[0]?.elements?.[0];
    console.log(`[calcular-distancia] Status do elemento: ${elemento?.status}`);
    if (!elemento || elemento.status !== "OK") {
      console.error(`[calcular-distancia] FALHOU no elemento: ${elemento?.status || "sem elemento"}`);
      return res.status(200).json({ ok: false, erro: `Endereço não encontrado: ${elemento?.status || "desconhecido"}` });
    }

    const metros = elemento.distance.value;
    const km = metros / 1000;
    console.log(`[calcular-distancia] SUCESSO: ${km}km`);
    return res.status(200).json({ ok: true, km });
  } catch (e) {
    console.error("[calcular-distancia] Erro de conexão/exceção:", e.message);
    return res.status(200).json({ ok: false, erro: "Erro de conexão com o Google Maps" });
  }
}
