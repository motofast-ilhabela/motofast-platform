// Detalhamento das taxas no histórico do motoboy (regra igual à do site, 09/11/2026).
//
// Se taxa_chamado, taxa_deslocamento ou taxa_retorno for maior que zero (e o pedido NÃO
// for um cancelamento cobrado), a tela mostra:
//   "Entrega R$ (taxa do motoboy menos os extras) + chamado + deslocamento + retorno = total"
//
// Fica num arquivo próprio (JS puro, sem tela) pra dar pra testar a conta sozinha.
// Devolve null quando não há o que detalhar.
export function montarDetalheTaxas(e) {
  if (!e || e.cancelamentoCobrado) return null;
  const chamado = Number(e.taxaChamado) || 0;
  const deslocamento = Number(e.taxaDeslocamento) || 0;
  const retorno = Number(e.taxaRetorno) || 0;
  if (!(chamado > 0 || deslocamento > 0 || retorno > 0)) return null;
  const total = Number(e.taxa) || 0;
  const extras = chamado + deslocamento + retorno;
  const base = Math.max(0, +(total - extras).toFixed(2));
  return { base, chamado, deslocamento, retorno, total };
}

export function formatarReais(v) {
  return "R$" + Number(v).toFixed(2).replace(".", ",");
}
