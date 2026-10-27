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
// (Reaplicado depois de confirmar billing + cota + restrição da chave OK.)
//
// CORRIGIDO em 27/09/2026 — brecha real encontrada e confirmada com caso
// real (Amanda Protásio / Casa Cardoso, 25/09): o nome da rua digitado
// ("Avenida Dr Mário Costa Júnior") não existe exatamente no Google, que
// silenciosamente "adivinhou" outra rua parecida ("Av. Governador Mário
// Covas Júnior"), bem mais perto — calculou 7,6km quando a distância real
// era 13,1km (quase o dobro), subcobrando o cliente e o motoboy sem avisar
// nada. A Routes API sozinha não conta pra gente quando ela "chuta" em vez
// de achar exato. Agora, ANTES de calcular a rota, geocodificamos o destino
// separadamente (Geocoding API) e conferimos o sinalizador "partial_match"
// que o Google manda quando ele não tem certeza — se vier marcado, a
// distância ainda é calculada (não trava a entrega), mas volta marcada como
// "imprecisa" pro front salvar isso junto do pedido, pra você conseguir ver
// quais pedidos precisam de atenção.
// ATUALIZADO em 10/10/2026 — caso real (Casa Cardoso, pedido do Fernando):
// existem DUAS ruas com o mesmo nome em bairros diferentes (Rua João Leite dos
// Santos, uma perto da Barra Velha e outra no Ribeirão). Como mandamos só
// "rua, número, Ilhabela" (sem bairro, pra ninguém pagar menos digitando o
// bairro errado), o Google pegou a homônima mais perto (1,2km) em vez da do
// Ribeirão (8,3km).
//
// REGRA NOVA (o preço continua sendo SEMPRE pela distância da rota, o bairro
// nunca define preço — ele só ajuda a escolher QUAL rua):
//  1) Geocodifica "rua, número, Ilhabela" (sem bairro).
//  2) Se o Google achou UM local só → rota até ele. Bairro digitado é ignorado.
//  3) Se achou MAIS DE UM local (rua repetida) → escolhe o local cujo endereço
//     contém o bairro que o estabelecimento digitou e calcula a rota até ele.
//  4) Se nenhum local bate com o bairro digitado (ou não veio bairro) → calcula
//     até todos (máx. 3) e usa o MAIS LONGE, e marca o pedido como impreciso
//     pra você conferir. Bairro errado nunca barateia.
// Se a geocodificação não estiver disponível (erro de API/permissão), cai no
// comportamento anterior: rota por texto, com a variante "com bairro"
// (destinoAlt) e vale a maior distância. Os campos "bairro" e "destinoAlt" são
// opcionais — sem eles o app nativo continua funcionando como antes.

function normalizar(t) {
  return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function geocodificar(destino, apiKey) {
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destino)}&key=${apiKey}&region=BR&bounds=${encodeURIComponent("-23.98,-45.52|-23.70,-45.25")}`
    );
    const g = await r.json();
    console.log(`[calcular-distancia] Geocode "${destino}" (status: ${g.status}): ${(g.results || []).length} resultado(s)`, JSON.stringify((g.results || []).slice(0, 3).map(x => x.formatted_address)));
    if (g.status !== "OK" || !g.results?.length) return { status: g.status, candidatos: [] };
    const vistos = new Set();
    const candidatos = [];
    for (const x of g.results) {
      const end = x.formatted_address;
      const loc = x.geometry?.location;
      if (!end || !loc || vistos.has(end)) continue;
      vistos.add(end);
      candidatos.push({ endereco: end, lat: loc.lat, lng: loc.lng, tipos: x.types || [] });
    }
    // Corrigido em 26/10/2026: só vale endereço DENTRO de Ilhabela. Antes, uma rua
    // com o mesmo nome em outra cidade (ex.: Jacareí) entrava como candidata e, como a
    // regra usa o local mais longe, cobrava 122 km (R$882). Fora de Ilhabela = não achou.
    // Também só vale resultado de RUA/ENDEREÇO: se o Google devolve só "Ilhabela, São Paulo"
    // (a cidade inteira) ou só o bairro, ele não achou a rua e a distância seria um chute
    // (caso Rua do Retiro: calculou 3 km até o centro da cidade e cobrou R$11).
    const TIPOS_PRECISOS = ["street_address", "route", "premise", "subpremise", "intersection"];
    const daIlha = candidatos.filter(c => normalizar(c.endereco).includes("ilhabela") && c.tipos.some(t => TIPOS_PRECISOS.includes(t)));
    if (!daIlha.length) {
      const algumaDaIlha = candidatos.some(c => normalizar(c.endereco).includes("ilhabela"));
      return { status: algumaDaIlha ? "SEM_PRECISAO" : "FORA_DA_ILHA", candidatos: [] };
    }
    const primeiroIlha = g.results.find(x => normalizar(x.formatted_address).includes("ilhabela") && (x.types || []).some(t => TIPOS_PRECISOS.includes(t))) || g.results[0];
    return { status: "OK", candidatos: daIlha, partial: primeiroIlha.partial_match === true, primeiro: primeiroIlha.formatted_address };
  } catch (e) {
    console.warn("[calcular-distancia] Erro ao geocodificar (não impede o cálculo):", e.message);
    return { status: "ERRO", candidatos: [] };
  }
}

// Rota de moto até um destino que pode ser texto ({address}) ou ponto exato ({location}).
async function rotaMoto({ origem, destinoObj, apiKey, rotulo }) {
  try {
    const resposta = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin: { address: origem },
        destination: destinoObj,
        travelMode: "TWO_WHEELER",
        routingPreference: "TRAFFIC_UNAWARE",
        units: "METRIC",
        regionCode: "BR",
      }),
    });
    const data = await resposta.json();
    console.log(`[calcular-distancia] Resposta do Google (${rotulo}):`, JSON.stringify(data));
    if (!resposta.ok) {
      return { ok: false, erro: `Google respondeu: ${data.error?.message || resposta.status}` };
    }
    const rota = data.routes?.[0];
    if (!rota || rota.distanceMeters == null) {
      return { ok: false, erro: "Não foi possível calcular a rota de moto entre esses endereços" };
    }
    return { ok: true, km: rota.distanceMeters / 1000 };
  } catch (e) {
    console.error("[calcular-distancia] Erro de conexão/exceção:", e.message);
    return { ok: false, erro: "Erro de conexão com o Google Maps" };
  }
}

const porEndereco = (a) => ({ address: a });
const porPonto = (c) => ({ location: { latLng: { latitude: c.lat, longitude: c.lng } } });

export default async function handler(req, res) {
  // CORS — permite chamadas do app nativo (Capacitor/WebView), que faz
  // preflight OPTIONS antes do POST de verdade.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, erro: "Método não permitido" });
  }

  const { origem, destino, destinoAlt, bairro, destinoLatLng } = req.body || {};
  // Localização exata (26/10/2026): o empresário guardou o ponto do cliente (link do Google
  // Maps). Calcula a rota de moto direto até ele, sem geocodificar o nome da rua.
  if (origem && destinoLatLng && Number.isFinite(Number(destinoLatLng.lat)) && Number.isFinite(Number(destinoLatLng.lng))) {
    const lat = Number(destinoLatLng.lat), lng = Number(destinoLatLng.lng);
    if (lat < -23.98 || lat > -23.70 || lng < -45.52 || lng > -45.25) {
      return res.status(200).json({ ok: false, erro: "Localização fora de Ilhabela" });
    }
    const apiKeyLL = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKeyLL) return res.status(500).json({ ok: false, erro: "Chave do Google Maps não configurada no servidor" });
    const rll = await rotaMoto({ origem, destinoObj: porPonto({ lat, lng }), apiKey: apiKeyLL, rotulo: "localização exata" });
    if (!rll.ok) return res.status(200).json({ ok: false, erro: rll.erro });
    return res.status(200).json({ ok: true, km: rll.km, enderecoImpreciso: false, enderecoEncontrado: null, usouBairro: false, localizacaoExata: true });
  }
  if (!origem || !destino) {
    return res.status(400).json({ ok: false, erro: "Origem e destino são obrigatórios" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("[calcular-distancia] GOOGLE_MAPS_API_KEY não está configurada no servidor");
    return res.status(500).json({ ok: false, erro: "Chave do Google Maps não configurada no servidor" });
  }

  console.log(`[calcular-distancia] Origem: "${origem}" | Destino: "${destino}" | Bairro digitado: "${bairro || ""}" | modo: TWO_WHEELER`);

  // Tentativas de escrita (26/10/2026): o cliente muitas vezes digita a rua sem o tipo
  // ("do retiro", "Julião Torres") ou com erro. Tenta, nesta ordem, até o Google achar uma
  // RUA de Ilhabela: como veio, com "Rua " na frente, e as duas versões com o bairro.
  const TIPO_VIA = /^(rua|r\.|avenida|av\.?|travessa|tv\.?|estrada|est\.?|alameda|al\.?|praca|praça|rodovia|rod\.?|beco|servidao|servidão|caminho|largo|viela|via|trilha|rampa|praia|orla|escadaria)\b/i;
  const comRua = (t) => {
    const partes = String(t).split(",");
    if (!partes[0] || TIPO_VIA.test(partes[0].trim())) return null;
    partes[0] = "Rua " + partes[0].trim();
    return partes.join(",");
  };
  const tentativas = [destino, comRua(destino), destinoAlt, destinoAlt ? comRua(destinoAlt) : null]
    .filter((t, i, a) => t && a.indexOf(t) === i);
  let geo = { status: "ZERO_RESULTS", candidatos: [] };
  let destinoUsado = destino;
  for (const t of tentativas) {
    const g = await geocodificar(t, apiKey);
    if (g.status === "OK" && g.candidatos.length) { geo = g; destinoUsado = t; break; }
    if (geo.status === "ZERO_RESULTS" || g.status === "SEM_PRECISAO") geo = g;
  }

  // ── Caminho A: o Google achou o endereço (um ou mais locais) ──────────────
  if (geo.status === "OK" && geo.candidatos.length >= 1) {
    // A1) Um local só: rota até ele, o bairro digitado não interfere.
    if (geo.candidatos.length === 1) {
      const r = await rotaMoto({ origem, destinoObj: porPonto(geo.candidatos[0]), apiKey, rotulo: "local único" });
      if (!r.ok) return res.status(200).json({ ok: false, erro: r.erro });
      // Salvaguarda de bairro (26/10/2026): o Google às vezes acha UMA rua de nome parecido
      // bem mais perto e devolve um km muito menor que o do bairro digitado (caso
      // Feiticeira: 2,8 km). Se o km da rua for menos de 35% do km até o bairro (e o bairro
      // estiver a 4 km ou mais), usa o do bairro (nunca barateia) e marca como impreciso.
      if (bairro && String(bairro).trim()) {
        const rb = await rotaMoto({ origem, destinoObj: porEndereco(`${bairro}, Ilhabela, SP, Brasil`), apiKey, rotulo: "bairro (conferência)" });
        if (rb.ok && rb.km >= 4 && r.km < rb.km * 0.35) {
          console.warn(`[calcular-distancia] ⚠️ rua a ${r.km}km mas bairro "${bairro}" a ${rb.km}km — usando o do bairro`);
          return res.status(200).json({ ok: true, km: rb.km, enderecoImpreciso: true,
            enderecoEncontrado: `${geo.primeiro} (parece mais perto do que o bairro "${bairro}" — conferido pelo bairro)`, usouBairro: true });
        }
      }
      console.log(`[calcular-distancia] SUCESSO: ${r.km}km${geo.partial ? " — ⚠️ ENDEREÇO IMPRECISO" : ""}`);
      return res.status(200).json({ ok: true, km: r.km, enderecoImpreciso: geo.partial, enderecoEncontrado: geo.primeiro, usouBairro: false });
    }

    // A2) Rua repetida: mais de um local.
    const candidatos = geo.candidatos.slice(0, 3);
    const nb = normalizar(bairro);
    const doBairro = nb ? candidatos.filter(c => normalizar(c.endereco).includes(nb)) : [];
    const alvos = doBairro.length ? doBairro : candidatos;
    const resultados = await Promise.all(alvos.map(c => rotaMoto({ origem, destinoObj: porPonto(c), apiKey, rotulo: c.endereco })));
    const bons = resultados.map((r, i) => ({ r, c: alvos[i] })).filter(x => x.r.ok);
    if (!bons.length) return res.status(200).json({ ok: false, erro: resultados[0]?.erro || "Não foi possível calcular a rota" });
    const maior = bons.reduce((a, b) => (b.r.km > a.r.km ? b : a));

    if (doBairro.length) {
      console.log(`[calcular-distancia] RUA REPETIDA resolvida pelo bairro "${bairro}": ${maior.c.endereco} = ${maior.r.km}km`);
      return res.status(200).json({
        ok: true, km: maior.r.km, enderecoImpreciso: false,
        enderecoEncontrado: maior.c.endereco, usouBairro: true, ruaRepetida: true,
      });
    }
    const lista = candidatos.map(c => c.endereco).join(" | ");
    console.warn(`[calcular-distancia] ⚠️ RUA REPETIDA sem bairro compatível ("${bairro || ""}") — usando o local mais longe: ${maior.c.endereco} = ${maior.r.km}km. Locais: ${lista}`);
    return res.status(200).json({
      ok: true, km: maior.r.km, enderecoImpreciso: true,
      enderecoEncontrado: `Rua existe em mais de um lugar: ${lista}`, usouBairro: false, ruaRepetida: true,
    });
  }

  // Achou só a cidade/bairro (sem a rua): calcula a rota até o BAIRRO digitado e avisa.
  if (geo.status === "SEM_PRECISAO") {
    if (bairro && String(bairro).trim()) {
      const rb = await rotaMoto({ origem, destinoObj: porEndereco(`${bairro}, Ilhabela, SP, Brasil`), apiKey, rotulo: "bairro (rua não localizada)" });
      if (rb.ok) {
        console.warn(`[calcular-distancia] ⚠️ rua não localizada — usando o bairro "${bairro}": ${rb.km}km`);
        return res.status(200).json({ ok: true, km: rb.km, enderecoImpreciso: true,
          enderecoEncontrado: `Rua não localizada — distância calculada até o bairro "${bairro}"`, usouBairro: true });
      }
    }
    return res.status(200).json({ ok: false, erro: "Rua não localizada em Ilhabela" });
  }

  // Achou só endereços fora de Ilhabela: não calcula (o front tenta pelo bairro).
  if (geo.status === "FORA_DA_ILHA") {
    return res.status(200).json({ ok: false, erro: "Endereço não encontrado em Ilhabela" });
  }

  // ── Caminho B: geocodificação indisponível ou sem resultado ───────────────
  // Comportamento anterior: rota por texto + variante com bairro, vale a maior.
  const usarAlt = typeof destinoAlt === "string" && destinoAlt.trim() && destinoAlt.trim() !== destino.trim();
  const [principal, alt] = await Promise.all([
    geo.status === "ZERO_RESULTS"
      ? Promise.resolve({ ok: false, erro: "Endereço não encontrado pelo Google" })
      : rotaMoto({ origem, destinoObj: porEndereco(destino), apiKey, rotulo: "texto" }),
    usarAlt ? rotaMoto({ origem, destinoObj: porEndereco(destinoAlt), apiKey, rotulo: "texto com bairro" }) : Promise.resolve(null),
  ]);
  let escolhido = principal;
  let usouBairro = false;
  if (alt && alt.ok && (!principal.ok || alt.km > principal.km)) {
    escolhido = alt;
    usouBairro = principal.ok;
  }
  if (!escolhido.ok) return res.status(200).json({ ok: false, erro: escolhido.erro });
  return res.status(200).json({ ok: true, km: escolhido.km, enderecoImpreciso: false, enderecoEncontrado: null, usouBairro });
}
