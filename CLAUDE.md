# MotoFast — Regras de isolamento (LEIA ANTES DE QUALQUER MUDANÇA)

Este repositório contém a **plataforma web em produção** (branch `main`), usada agora por motoboys e empresários de verdade, e o **app nativo novo** (pasta `app-mobile/`, branch `app-nativo-capacitor`). São dois projetos que compartilham repositório mas não devem compartilhar código nem deploy.

## Regras que nunca podem ser quebradas

1. **Nunca editar, sobrescrever ou fazer deploy sobre os arquivos da plataforma web em produção**: `Admin.jsx`, `Empresario.jsx`, `Motoboy.jsx`, `Cadastro.jsx`, tudo em `/api`, e qualquer outro arquivo da raiz que pertença ao app web já existente. Ler esses arquivos para entender a lógica de negócio é permitido e esperado — editar/sobrescrever não.
2. **Nunca dar merge de nada na branch `main`.** Todo o trabalho do app nativo acontece na branch `app-nativo-capacitor` (ou branches derivadas dela), isolado dentro de `app-mobile/`.
3. **Nunca rodar migration destrutiva no banco de produção** (Supabase, projeto `eynpjqhjkwwdpemsospy.supabase.co`). Qualquer mudança de banco para o app nativo precisa ser **estritamente aditiva** (tabela nova, nunca alterar/remover algo que a web já usa). Nunca criar `REFERENCES` (foreign key) que crie um segundo caminho de relacionamento entre tabelas já usadas em join — isso já causou uma queda geral da plataforma em 27/08/2026.
4. **Em caso de dúvida sobre qualquer uma dessas regras, parar e perguntar antes de agir — nunca assumir.**

Quem faz mudanças na plataforma web em produção é exclusivamente o Alessandro conversando com o Claude no chat (claude.ai) — não o Claude Code.

## Regra extra: telas duplicadas entre web e app-mobile não sincronizam sozinhas

O app nativo em `app-mobile/` é construído copiando e adaptando as telas da web (Admin, Empresário, Motoboy, Cadastro) — não importando os arquivos originais diretamente (ver regra 1). Isso significa que **`app-mobile/` e a plataforma web têm cópias independentes da mesma lógica de negócio**.

**Sempre que uma regra de negócio mudar em uma das duas versões (preço, regra de turno fixo, prioridade paga, etc.), essa mudança NÃO se propaga automaticamente para a outra.** Precisa ser replicada manualmente, tela por tela.

Na prática, isso quer dizer:
- Antes de mexer numa tela do `app-mobile/`, checar se a lógica equivalente na web mudou desde a última vez que foi copiada.
- Ao terminar uma mudança de regra de negócio em uma versão (a pedido do Alessandro, via chat, na web — ou no app nativo, aqui), avisar explicitamente que a mesma mudança pode precisar ser replicada manualmente na outra versão, e perguntar se é para fazer isso.
- Nunca presumir que as duas telas estão em sincronia só porque vieram da mesma origem.
