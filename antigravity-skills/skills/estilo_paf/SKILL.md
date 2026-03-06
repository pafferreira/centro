---
name: estilo_paf
description: Diretriz de estilo para comunicação do agente com o proprietário e padrões de redação visual/usabilidade que podem ser aplicados a mensagens, PRs e documentação interna. Adaptado para o projeto GFA Nossa Casa.
metadata:
  language: pt-BR
---

# Estilo PAF

Esta skill combina duas responsabilidades complementares:

- Política de tratamento por nome ao proprietário (PAF → Affonso → Paulão).
- Regras mínimas de estilo visual e de usabilidade para comunicações e entregáveis de design.

## Use esta skill quando

- For necessário mencionar o proprietário em mensagens ou comentários internos.
- Gerar textos, PR descriptions, changelogs, ou guidelines que devam seguir padrões de linguagem e apresentação.
- Criar recomendações rápidas de design, checklists de usabilidade ou pequenos trechos visuais (por exemplo, exemplos de texto para banners, microcopy).
- Qualquer alteração de UI no projeto GFA Nossa Casa.

## Não use esta skill quando

- A saída for plenamente técnica e não requer estilo humano (logs, dumps, etc.).
- O conteúdo é público/external-facing que segue outro guião de marca.

## Instruções principais

- Ciclo de nomes: 5 mensagens usando `PAF`, 6 mensagens usando `Affonso`, 5 mensagens usando `Paulão`, repetir. A contagem é por respostas deste agente ao proprietário.
- Quando o histórico de sessão não estiver disponível, começar o ciclo em `PAF`.
- Ao mencionar o proprietário, mantenha tom profissional, conciso e em Português do Brasil.

## Regras de estilo e usabilidade (resumo)

- Clareza e concisão: preferir frases curtas e com verbo ativo.
- Acessibilidade textual: usar linguagem simples, evitar jargões sem explicação e fornecer alternativas textuais para imagens quando aplicável.
- Microcopy: instruções e CTAs precisam ser diretas (ex.: "Salvar e continuar" em vez de "Clique aqui para salvar").
- Estrutura de mensagens: objetivo (1 linha), ação/decisão (1-2 linhas), próximo passo (1 linha).
- Visual: quando produzir exemplos visuais ou layouts mínimos, siga uma hierarquia clara: título > subtítulo > corpo > CTA.
- Fluxo de saída/cancelamento: em telas de criação/edição e modais, sempre prever `ESC`, botão explícito de `Cancelar/Voltar` e compatibilidade com botão de voltar nativo do dispositivo/browser.
- Loading UX: priorizar skeleton com shimmer suave em vez de loaders abruptos; manter proporção dos blocos finais (título, campos, cards, ações).
- Tooltips em botões: usar efeito glassmorphism com cantos bem arredondados e bordas sutis translúcidas. Requer texto escuro de alto contraste, e exibição em `hover` + navegação por teclado estilo `focus-visible`. Detalhes das classes exatas estão na seção de Snippets.

## Identidade Visual GFA Nossa Casa

- **Primária:** `#44d2f0` (azul ciano claro)
- **Primária escura:** `#13c8ec`
- **GFA Blue:** `#004e89` (azul institucional)
- **Secundária:** `#8ecae6`
- **Acento:** `#ffb703` (amarelo ouro)
- **Background:** `#f2f5f7`
- **Superfícies:** `#fdfbf7` (beige light), `#ffffff`
- **Texto:** `#0d191b` (escuro), `#7a8c90` (light)
- **Fontes:** Inter (corpo) + Playfair Display (títulos/serifa)
- **Framework CSS:** TailwindCSS via CDN

## Checklist rápido para comunicações e PRs

1. Título claro e objetivo.
2. Descrição curta do problema/alteração.
3. Passos para reproduzir / validar (quando aplicável).
4. Impacto/risco e rollout plan (quando necessário).
5. Acessibilidade e notas de usabilidade relevantes.
6. Referência a designs ou screenshots com alt-text.

## Exemplos

- `PAF, atualizei a tela de montagem de salas com correção de foco e contraste. Verifique a PR #123.`
- `Affonso, adicionei validação de passe para o fluxo de atendimento — resumo abaixo.`

## Resources

- `resources/implementation-playbook.md` — regras operacionais, contagem do ciclo e snippets reutilizáveis.
- `../../ui-ux-designer/SKILL.md` — referência para práticas de design profissionais do repositório.

## UI Snippets e Padrões Reutilizáveis

Pequenos trechos de estilo e comportamento que podem ser reutilizados em comunicações e UI dentro do projeto.

- Toasts: usar eventos `window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }))` para mensagens rápidas (tipos: `info`, `success`, `error`, `warn`). Mantém consistência e centraliza a renderização.

- Padrão de cards GFA (exemplo TailwindCSS):

```html
<div class="bg-white rounded-xl shadow-soft p-4 border border-card-border hover:shadow-glow transition-all duration-200 cursor-pointer">
  <!-- conteúdo -->
</div>
```

- Glass panel (overlay):

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

- Padrão Tooltip (React/TailwindCSS):

```html
<!-- Wrapper do trigger (ícone ou botão) -->
<span class="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 rounded" tabIndex="0">
  {children}
</span>

<!-- Balão do Tooltip (Absolute / Portal) -->
<div role="tooltip" class="fixed z-[9999] px-3.5 py-2 text-xs font-bold text-slate-900 leading-snug bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-lg shadow-slate-200/50 max-w-[220px] pointer-events-none whitespace-normal">
  {text}
  <!-- Seta (Arrow) - Exemplo Bottom (ponta p/ baixo) -->
  <span class="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0" style="border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 6px solid rgba(255, 255, 255, 0.8);"></span>
</div>
```

Inclua estes snippets no playbook quando fizer handoff para desenvolvimento. Eles servem como referência rápida — as cores vêm do Tailwind config do projeto.
