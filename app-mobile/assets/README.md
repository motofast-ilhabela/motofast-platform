# Ícone e Splash Screen — MotoFast

Esta pasta é onde a ferramenta `@capacitor/assets` espera encontrar a imagem de origem
pra gerar automaticamente TODOS os tamanhos de ícone e splash screen que Android e
iOS precisam (não precisa criar cada tamanho manualmente).

## Arquivo que o Alessandro precisa fornecer

Coloque aqui um arquivo chamado **`logo.png`** com:

- **Formato:** PNG, com fundo **transparente** (não branco, não preto — transparente de
  verdade)
- **Tamanho:** pelo menos **1024×1024 pixels**, quadrado
- **Conteúdo:** só o símbolo/logo do MotoFast (o raio ⚡ + o texto "MotoFast", ou só o
  raio, o que fizer mais sentido como ícone de app), **centralizado**, com uma margem de
  respiro ao redor (não encostar nas bordas — o Android corta os ícones em formatos
  diferentes — círculo, quadrado arredondado, etc. — e o que estiver muito perto da
  borda pode ser cortado)

Se você tiver esse logo em alta resolução em outro formato (SVG, PDF, arquivo do
Canva/Figma), me avisa que eu ajudo a exportar como PNG no tamanho certo.

## O que acontece depois

Com o `logo.png` nesta pasta, rodamos:

```
npx @capacitor/assets generate --iconBackgroundColor "#0a0f1a" --splashBackgroundColor "#0a0f1a"
```

Isso gera automaticamente:
- Todos os ícones do Android (várias densidades, incluindo o "ícone adaptativo" que
  o Android usa desde a versão 8)
- A splash screen (tela que aparece um instante ao abrir o app) do Android
- Os mesmos, já preparados, para quando formos gerar o projeto iOS

As cores de fundo (`#0a0f1a`) já são o mesmo azul bem escuro usado em todas as telas do
app, pra manter a identidade visual consistente.
