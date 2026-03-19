-- Migration: Adiciona coluna status na tabela gfa_salas
-- Data: 2026-03-19
-- Valores: 'Aberto' | 'Fechado'
-- Default: 'Aberto' (todas as salas existentes ficam abertas)

ALTER TABLE public.gfa_salas
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Aberto'
  CHECK (status IN ('Aberto', 'Fechado'));

-- Atualiza salas existentes para 'Aberto' (garantia)
UPDATE public.gfa_salas SET status = 'Aberto' WHERE status IS NULL;
