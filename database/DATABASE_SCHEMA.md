# DATABASE_SCHEMA.md — GFA Nossa Casa

## Visão Geral

O banco de dados do GFA Nossa Casa utiliza **Supabase (PostgreSQL)** com tabelas prefixadas com `gfa_`.

## Diagrama de Relacionamentos

```
gfa_salas ─────────────────┐
   │                       │
   │ (1:N)                 │ (1:N)
   ▼                       ▼
gfa_trabalhadores    gfa_atendimentos_passe
                           │
                           │ (N:1)
                           ▼
                    gfa_fichas_assistencia
                           │
                           │ (N:1)
                           ▼
                      gfa_assistidos
```

## Tabelas

### 1. `gfa_salas` — Salas do Centro

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| id | UUID | ✅ | uuid_generate_v4() | PK |
| nome_sala | TEXT | ✅ | — | Nome da sala |
| tipo_sala | TEXT | ✅ | — | Tipo (Passe, Palestra, Aulinha, etc.) |
| capacidade | INTEGER | ✅ | 0 | Capacidade máxima |
| descricao | TEXT | — | — | Descrição |
| url_avatar | TEXT | — | — | URL da imagem |
| icone_avatar | TEXT | — | — | Nome do ícone |
| criado_em | TIMESTAMPTZ | ✅ | now() | Data de criação |

### 2. `gfa_trabalhadores` — Trabalhadores/Voluntários

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| id | UUID | ✅ | uuid_generate_v4() | PK |
| nome_trabalhador | TEXT | ✅ | — | Nome completo |
| contato | TEXT | — | — | Telefone/contato |
| papeis | TEXT[] | ✅ | '{}' | Papéis/funções (array) |
| coordenador | BOOLEAN | ✅ | false | É coordenador? |
| presente | BOOLEAN | ✅ | true | Presente hoje? |
| id_sala_alocada | UUID | — | — | FK → gfa_salas |
| url_avatar | TEXT | — | — | URL da foto |
| criado_em | TIMESTAMPTZ | ✅ | now() | Data de criação |

### 3. `gfa_assistidos` — Pessoas Assistidas

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| id | UUID | ✅ | uuid_generate_v4() | PK |
| nome_assistido | TEXT | ✅ | — | Nome completo |
| telefone | TEXT | — | — | Telefone |
| data_nascimento | DATE | — | — | Data de nascimento |
| observacoes | TEXT | — | — | Observações |
| criado_em | TIMESTAMPTZ | ✅ | now() | Data de criação |

### 4. `gfa_fichas_assistencia` — Fichas de Assistência

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| id | UUID | ✅ | uuid_generate_v4() | PK |
| id_assistido | UUID | ✅ | — | FK → gfa_assistidos |
| id_entrevistador | UUID | — | — | FK → gfa_trabalhadores |
| data_entrevista | DATE | ✅ | — | Data da entrevista |
| qtd_a2 | INTEGER | ✅ | 0 | Qtd. atendimentos tipo A2 |
| qtd_a1 | INTEGER | ✅ | 0 | Qtd. atendimentos tipo A1 |
| tipo_ficha | TEXT | ✅ | 'Inicial' | Tipo (Inicial, Retorno) |
| status_ficha | TEXT | ✅ | 'Ativa' | Status (Ativa, Concluída) |
| criado_em | TIMESTAMPTZ | ✅ | now() | Data de criação |

### 5. `gfa_atendimentos_passe` — Sessões de Passe

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| id | UUID | ✅ | uuid_generate_v4() | PK |
| id_ficha_assistencia | UUID | — | — | FK → gfa_fichas_assistencia |
| id_assistido | UUID | ✅ | — | FK → gfa_assistidos |
| id_sala_alocada | UUID | — | — | FK → gfa_salas |
| data_atendimento | DATE | ✅ | — | Data do atendimento |
| tipo_passe | TEXT | ✅ | — | Tipo de passe |
| fase_atendimento | TEXT | ✅ | — | Fase (1ª vez, Retorno, etc.) |
| status_atendimento | TEXT | ✅ | 'Aguardando' | Status |
| criado_em | TIMESTAMPTZ | ✅ | now() | Data de criação |

## Índices

| Nome | Tabela | Campo(s) |
|------|--------|----------|
| idx_trabalhadores_sala | gfa_trabalhadores | id_sala_alocada |
| idx_atend_passe_data | gfa_atendimentos_passe | data_atendimento |
| idx_atend_passe_sala | gfa_atendimentos_passe | id_sala_alocada |
| idx_atend_passe_ficha | gfa_atendimentos_passe | id_ficha_assistencia |
| idx_fichas_assistido | gfa_fichas_assistencia | id_assistido |
| idx_fichas_entrevistador | gfa_fichas_assistencia | id_entrevistador |

## Queries Comuns

### Listar atendimentos de hoje com dados do assistido
```sql
SELECT ap.*, a.nome_assistido, s.nome_sala
FROM gfa_atendimentos_passe ap
JOIN gfa_assistidos a ON a.id = ap.id_assistido
LEFT JOIN gfa_salas s ON s.id = ap.id_sala_alocada
WHERE ap.data_atendimento = CURRENT_DATE
ORDER BY ap.criado_em;
```

### Trabalhadores presentes com sala
```sql
SELECT t.*, s.nome_sala, s.tipo_sala
FROM gfa_trabalhadores t
LEFT JOIN gfa_salas s ON s.id = t.id_sala_alocada
WHERE t.presente = true
ORDER BY t.nome_trabalhador;
```

### Ficha completa de assistido
```sql
SELECT a.*, f.*, 
       t.nome_trabalhador AS entrevistador
FROM gfa_assistidos a
JOIN gfa_fichas_assistencia f ON f.id_assistido = a.id
LEFT JOIN gfa_trabalhadores t ON t.id = f.id_entrevistador
WHERE a.id = $1;
```
