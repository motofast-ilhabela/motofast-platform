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
    return res.status(500).json({ ok: false, erro: "Chave do Google Maps não configurada no servidor" });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&mode=driving&units=metric&region=br&key=${apiKey}`;
    const resposta = await fetch(url);
    const data = await resposta.json();

    if (data.status !== "OK") {
      return res.status(200).json({ ok: false, erro: `Google respondeu: ${data.status}` });
    }

    const elemento = data.rows?.[0]?.elements?.[0];
    if (!elemento || elemento.status !== "OK") {
      return res.status(200).json({ ok: false, erro: `Endereço não encontrado: ${elemento?.status || "desconhecido"}` });
    }

    const metros = elemento.distance.value;
    const km = metros / 1000;
    return res.status(200).json({ ok: true, km });
  } catch (e) {
    console.error("Erro ao calcular distância via Google Maps:", e);
    return res.status(200).json({ ok: false, erro: "Erro de conexão com o Google Maps" });
  }
}
