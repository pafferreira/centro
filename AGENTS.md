## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file.

### Available skills
- estilo_paf: Diretrizes de UI/UX e design visual baseadas na identidade PAF, adaptadas ao projeto GFA Nossa Casa. (file: antigravity-skills/skills/estilo_paf/SKILL.md)
- design_profissional: Skill para produzir entregáveis de design profissional com foco em usabilidade e acessibilidade. (file: antigravity-skills/skills/design_profissional/SKILL.md)
- ui-ux-designer: Especialista em design de interfaces, design systems e acessibilidade. (file: antigravity-skills/skills/ui-ux-designer/SKILL.md)
- ui-visual-validator: Validação visual rigorosa de UI, compliance com design system e acessibilidade. (file: antigravity-skills/skills/ui-visual-validator/SKILL.md)
- sql-pro: Especialista em SQL moderno, otimização de queries e modelagem de dados com Supabase/PostgreSQL. (file: antigravity-skills/skills/sql-pro/SKILL.md)

### Priority and default behavior
- `estilo_paf` is the primary skill for this repository.
- For any request involving UI, UX, layout, visual hierarchy, styling, components, pages, or frontend design decisions, always apply `estilo_paf` first, even when the user does not explicitly mention the skill.
- For any request involving database, SQL, schema, migrations, or Supabase, always apply `sql-pro`.
- If multiple skills apply, use `estilo_paf` first, then complementary skills.
- Only skip `estilo_paf` when the task is clearly unrelated to UI/UX.

### How to use skills
- Open the target skill's `SKILL.md` and follow only the sections needed for the current task.
- Resolve relative paths from the skill directory first.
- Keep context focused and avoid loading unrelated references.

### Design System
- The Design System MASTER file is located at `design-system/centro/MASTER-BR.md`.
- When building a specific page, first check `design-system/centro/pages/[page-name].md`.
- If no page-specific file exists, follow the MASTER rules.
