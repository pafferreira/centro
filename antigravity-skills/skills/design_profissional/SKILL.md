---
name: design_profissional
description: Skill para produzir entregáveis de design profissional com foco em usabilidade, acessibilidade e aparência agradável. Use para criação de design systems, entregáveis visuais, microcopy e validação de usabilidade no projeto GFA Nossa Casa.
metadata:
  language: pt-BR
  model: sonnet
---

# Design Profissional

Esta skill sintetiza práticas de UI/UX profissionais para produzir artefatos prontos para desenvolvimento e revisão: telas, protótipos, guidelines e microcopy.

## Use esta skill quando

- Precisar de entregáveis de design com qualidade profissional (mockups, especificações, tokens).
- Criar guidelines de usabilidade e acessibilidade para features novas ou existentes.
- Gerar microcopy, mensagens de erro, CTAs e fluxos de interação.

## Não use esta skill quando

- A tarefa for estritamente de infraestrutura ou backend sem pontos de interação com o usuário.

## Objetivos / Contrato

- Inputs: contexto do produto, público-alvo, restrições (tempo, plataforma), assets existentes (logos, paleta, tokens).
- Outputs: sumário de design, recomendações de layout, tokens sugeridos, exemplos de microcopy e checklist de validação.
- Sucesso: entregável com critérios de aceitação claros e checklist de usabilidade preenchido.

## Contexto GFA Nossa Casa

- **Público-alvo:** Voluntários e coordenadores do centro espírita, geralmente 30-70 anos, variados níveis de habilidade digital.
- **Plataforma:** Mobile-first (PWA), usado em smartphones durante as sessões.
- **Tom:** Acolhedor, sereno, profissional. Sem excessos visuais.
- **Paleta base:** Azul ciano (#44d2f0), Azul institucional (#004e89), Amarelo acento (#ffb703), Beige (#fdfbf7).
- **Fontes:** Inter (corpo) + Playfair Display (títulos elegantes).

## Checklist essencial (mínimo)

1. Objetivo do usuário claramente definido.
2. Fluxo principal mapeado (passos do usuário).
3. Critérios de sucesso / métricas.
4. Paleta e tipografia sugeridas (mínimo 2 variações: normal/dark).
5. Acessibilidade: contraste e navegação por teclado verificados.
6. Microcopy para CTAs, erros e confirmações.
7. Entregáveis: protótipo navegável ou telas anotadas.

## Abordagem de resposta

1. Perguntar ou inferir os inputs críticos.
2. Definir rapidamente o objetivo e restrições.
3. Propor arquitetura visual (hierarquia, grid, tokens).
4. Gerar microcopy e exemplos de estados (erro, vazio, carregando).
5. Fornecer checklist de validação e passos de QA.

## Exemplos de uso

- "Crie mockups para a tela de registrar assistidos com foco em velocidade de cadastro."
- "Sugira microcopy acessível para formulários e mensagens de validação no módulo de passes."
- "Forneça paleta acessível e tokens CSS/JSON para o dashboard do GFA."

## Recursos

- `resources/implementation-playbook.md` — checklists, heurísticas de validação e snippets.
- `../ui-ux-designer/SKILL.md` — referência com capacidades completas do repositório.
