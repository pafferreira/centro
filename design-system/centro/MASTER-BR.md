````markdown
# Arquivo Mestre do Design System

> **LÓGICA:** Ao construir uma página específica, verifique primeiro `design-system/centro/pages/[nome-da-pagina].md`.
> Se esse arquivo existir, suas regras **sobrescrevem** este arquivo Mestre.
> Caso contrário, siga rigorosamente as regras abaixo.

---

**Projeto:** GFA Nossa Casa — Centro Espírita
**Gerado:** 2026-03-04
**Categoria:** App de Gestão Mobile-First (PWA)

---

## Regras Globais

### Paleta de Cores

| Papel | Hex | Tailwind Class / Variable |
|------|-----|--------------| 
| Primária | `#44d2f0` | `primary` |
| Primária escura | `#13c8ec` | `primary-dark` |
| GFA Blue (institucional) | `#004e89` | `gfa-blue` |
| Secundária | `#8ecae6` | `secondary` |
| Acento/CTA | `#ffb703` | `accent` |
| Fundo | `#f2f5f7` | `background` |
| Beige claro | `#fdfbf7` | `beige-light` |
| Beige dim | `#f4f1ea` | `beige-dim` |
| Borda de card | `#e8e4db` | `card-border` |
| Superfície | `#ffffff` | `surface` |
| Texto principal | `#0d191b` | `text-main` |
| Texto secundário | `#7a8c90` | `text-light` |

**Observação de cor:** Fundo claro + toques de azul ciano/amarelo para manter o tom acolhedor e institucional.

### Tipografia

- **Fonte de título:** Playfair Display (serif) — elegante, para títulos e destaques
- **Fonte do corpo:** Inter (sans-serif) — limpa, moderna, alta legibilidade
- **Tom:** acolhedor, sereno, profissional, espiritual, organizacional
- **Google Fonts:** [Inter + Playfair Display](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap)

**Import CSS (já incluso no index.html):**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
```

### Variáveis de Espaçamento

| Token | Tailwind | Valor | Uso |
|-------|----------|-------|------|
| xs | `p-1` | `4px` / `0.25rem` | Espaços muito apertados |
| sm | `p-2` | `8px` / `0.5rem` | Espaço entre ícones, inline |
| md | `p-4` | `16px` / `1rem` | Padding padrão |
| lg | `p-6` | `24px` / `1.5rem` | Padding de seção |
| xl | `p-8` | `32px` / `2rem` | Espaços grandes |
| 2xl | `p-12` | `48px` / `3rem` | Margens de seção |

### Sombras

| Nível | Tailwind | Uso |
|-------|----------|------|
| Soft | `shadow-soft` (`0 4px 20px -2px rgba(0,0,0,0.05)`) | Cards, elevação sutil |
| Glow | `shadow-glow` (`0 0 15px rgba(68,210,240,0.3)`) | Destaque primário, hover de cards especiais |
| Default | `shadow` | Botões, inputs com foco |
| Large | `shadow-lg` | Modais, dropdowns |
| 2xl | `shadow-2xl` | Container principal do app |

---

## Especificações de Componentes

### Botões

```html
<!-- Botão Primário -->
<button class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
  Montar Salas
</button>

<!-- Botão Secundário -->
<button class="bg-transparent border-2 border-gfa-blue text-gfa-blue px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer hover:bg-gfa-blue hover:text-white">
  Cancelar
</button>

<!-- Botão de Acento -->
<button class="bg-accent text-text-main px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer hover:opacity-90">
  Registrar
</button>
```

### Cards

```html
<!-- Card padrão -->
<div class="bg-white rounded-xl shadow-soft p-4 border border-card-border transition-all duration-200 cursor-pointer hover:shadow-glow hover:-translate-y-0.5">
  <!-- conteúdo -->
</div>

<!-- Card de destaque -->
<div class="bg-beige-light rounded-xl shadow-soft p-6 border border-card-border">
  <!-- conteúdo com cabeçalho serifa -->
  <h3 class="font-serif text-lg font-semibold text-text-main">Título</h3>
</div>
```

### Inputs

```html
<input class="w-full px-4 py-3 border border-gray-200 rounded-lg text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
```

### Modais

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
  <!-- Modal -->
  <div class="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-[90%] mx-auto mt-[20vh]">
    <!-- conteúdo -->
  </div>
</div>
```

### Glass Panel

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

---

## Diretrizes de Estilo

**Estilo:** App de Gestão Acolhedor

**Palavras-chave:** Mobile-first, cards organizacionais, listas de trabalhadores/assistidos, formulários limpos, navegação simplificada, fácil para público 30-70 anos

**Indicado para:** Apps de gestão social, centros espíritas, gerenciamento de voluntários, controle de atendimentos

**Efeitos-chave:** Hover com glow suave, transições de 200ms, skeleton loaders, toasts de feedback, botões com cursor:pointer

### Padrão de Página

**Padrão:** Header institucional + Conteúdo scrollável + Bottom Nav fixo

- **Header:** Gradiente ou cor sólida com branding GFA, título da seção
- **Conteúdo:** Lista de cards ou formulário, scroll vertical
- **Bottom Nav:** 4-5 ícones de navegação principal, fixo na base
- **Layout:** max-w-md centralizado, bg-beige-light, shadow-2xl nas laterais

---

## Anti-Padrões (Não usar)

- ❌ Design ornamentado ou excessivamente colorido
- ❌ Fontes decorativas fora de Playfair Display para títulos
- ❌ **Emojis como ícones** — Use SVG (Lucide React ou Heroicons)
- ❌ **Sem cursor:pointer** — Todos os elementos clicáveis devem ter cursor:pointer
- ❌ **Hovers que alteram layout** — Evitar transforms que causem deslocamento
- ❌ **Texto com baixo contraste** — Manter razão de contraste mínima 4.5:1
- ❌ **Mudanças de estado instantâneas** — Use transições (150–300ms)
- ❌ **Estados de foco invisíveis** — Focus states devem ser visíveis para acessibilidade
- ❌ **Botões/links sem rótulo acessível** — Sempre ter aria-label ou texto visível
- ❌ **Touch targets < 44x44px** — Botões e links devem ser tocáveis em mobile

---

## Checklist Pré-Entrega

Antes de entregar qualquer código de UI, verifique:

- [ ] Não usar emojis como ícones (usar SVG via Lucide)
- [ ] Todas as ícones vêm do mesmo conjunto (Lucide React)
- [ ] `cursor-pointer` em todos os elementos clicáveis
- [ ] Estados de hover com transições suaves (150–300ms)
- [ ] Contraste de texto mínimo 4.5:1
- [ ] Estados de foco visíveis para navegação por teclado
- [ ] `prefers-reduced-motion` respeitado
- [ ] Responsivo: 375px (mobile), 768px (tablet)
- [ ] Nenhum conteúdo oculto atrás de barras de navegação fixas
- [ ] Sem scroll horizontal no mobile
- [ ] Touch targets ≥ 44x44px
- [ ] Textos em Português do Brasil
- [ ] Skeleton loading em vez de loaders abruptos

````
