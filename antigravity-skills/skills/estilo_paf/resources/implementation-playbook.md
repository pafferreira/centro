# Implementation playbook — Estilo PAF (versão GFA Nossa Casa)

Este playbook explica como aplicar a `estilo_paf` em mensagens do agente e como reutilizar práticas de design/usabilidade em comunicações.

1) Ciclo de nomes

- Contagem: 5x `PAF`, 6x `Affonso`, 5x `Paulão`. Registrar cada saída que mencione o proprietário (nome, timestamp, número no ciclo).
- Persistência: idealmente guardar contador em um pequeno armazenamento de sessão. Se não for possível, começar do `PAF` por padrão.

2) Quando aplicar as regras de design

- Ao escrever PR descriptions, templates de issues, e mensagens que contenham instruções de UI/UX.
- Ao fornecer microcopy, CTAs, labels de formulário ou mensagens de erro.
- Ao criar ou modificar views/componentes do App GFA.

3) Checklist de usabilidade aplicável a comunicações

- Legibilidade: fonte/size/contraste (quando gerar exemplos visuais).
- Hierarquia: garantir que títulos e CTAs estejam claros.
- Acessibilidade: sempre incluir alt-text e considerar leitura por voz (conciso, sem ambiguidade).
- Internacionalização: textos em PT-BR; evitar strings embutidas sem contexto.

4) Snippets reutilizáveis (exemplos GFA)

- Títulos: "Resumo da alteração" / "Correção: [componente]".
- Botões: "Salvar e continuar" / "Cancelar" / "Distribuir" / "Montar salas".
- Mensagens de erro: curto + razão + ação sugerida (ex.: "Falha ao salvar — verifique sua conexão e tente novamente").
- Empty states: "Nenhum trabalhador cadastrado. Toque em '+' para adicionar."

5) Exceções e notas

- Não force a inclusão do nome do proprietário em mensagens técnicas curtas.
- Se uma instrução de segurança ou confidencialidade conflitar com o ciclo, siga a instrução de segurança.

6) Padrões visuais GFA

- Cards: `bg-white rounded-xl shadow-soft p-4 border border-card-border`
- Headers: usar gradiente com `gfa-blue` (#004e89)
- Botões primários: `bg-primary hover:bg-primary-dark text-white rounded-lg`
- Botões de acento: `bg-accent text-text-main rounded-lg`
- Skeleton loading: shimmer com `bg-gray-200 animate-pulse rounded`

---

Arquivo fonte: `SKILL.md`.
