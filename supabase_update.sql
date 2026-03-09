-- Run this in your Supabase SQL Editor to update the Fichas table
ALTER TABLE public.gfa_fichas_assistencia
ADD COLUMN IF NOT EXISTS realizado_a2 INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS realizado_a1 INTEGER NOT NULL DEFAULT 0;

-- Renomear colunas historico_a2/historico_a1 para realizado_a2/realizado_a1 (caso já existam com o nome antigo)
ALTER TABLE public.gfa_fichas_assistencia RENAME COLUMN historico_a2 TO realizado_a2;
ALTER TABLE public.gfa_fichas_assistencia RENAME COLUMN historico_a1 TO realizado_a1;

-- Remove campo data_nascimento da tabela de assistidos (campo não utilizado)
ALTER TABLE public.gfa_assistidos DROP COLUMN IF EXISTS data_nascimento;
