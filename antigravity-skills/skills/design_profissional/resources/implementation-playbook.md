# Implementation playbook — Design Profissional (GFA Nossa Casa)

Guia prático para produzir entregáveis de design com qualidade profissional e validar usabilidade/visual.

1) Perguntas iniciais (coletar inputs)

- Quem é o usuário alvo? (voluntários, coordenadores, faixa 30-70 anos)
- Qual é o objetivo desta tela/feature? (tarefa primária)
- Quais plataformas precisamos suportar? (mobile-first PWA)
- Quais restrições de marca ou técnicos existem? (TailwindCSS, Supabase, React)

2) Heurísticas de avaliação rápida

- Visibilidade do estado: o usuário sempre sabe o que está acontecendo.
- Mapeamento entre sistema e mundo real: termos compreensíveis para voluntários espíritas.
- Controle do usuário e liberdade: fácil desfazer/voltar.
- Consistência e padrões: elementos previsíveis e reutilizáveis.
- Prevenção de erros e recuperação clara.

3) Validação acessível (mínimos)

- Contraste: texto principal ≥ 4.5:1; textos grandes ≥ 3:1.
- Keyboard: navegar e ativar todos os controles sem mouse.
- Labels: fornecer labels claros e aria-describedby quando necessário.
- Touch targets: mínimo 44x44px para botões e links em mobile.

4) Padrões visuais recomendados (quick wins)

- Grid: base 8px para espaçamento e alinhamento.
- Tipografia: Inter para corpo, Playfair Display para títulos elegantes.
- Botões: primário (bg-primary), secundário (border), ghost (text only).
- Cards: bg-white rounded-xl shadow-soft border border-card-border.

5) Entregáveis mínimos para handoff

- Protótipo navegável ou telas anotadas.
- Tokens: cores, tipografia e espaçamentos via Tailwind config.
- Microcopy: strings em PT-BR para labels, erros, confirmações.
- Checklist de QA (itens do passo 3 e 4).

6) Exemplo rápido de microcopy GFA

- CTA primário: "Montar Salas"
- CTA secundário: "Registrar Assistido"
- Erro de formulário: "Campo obrigatório — preencha o nome do trabalhador"
- Empty state: "Nenhum atendimento registrado hoje. Toque em '+' para iniciar."
- Confirmação: "Distribuição de passes concluída com sucesso!"

7) Integração com `estilo_paf`

- Reutilizar snippets de microcopy e checklist em PR descriptions.
- Sempre adicionar nota de acessibilidade em entregáveis que afetam UI.

---

Arquivo fonte: `SKILL.md`.
