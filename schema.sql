-- Ativa extensão para geração de chaves primárias uuid usando uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABELA DE SALAS
-- ==============================================================================
CREATE TABLE public.gfa_salas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_sala TEXT NOT NULL,
    tipo_sala TEXT NOT NULL,
    capacidade INTEGER NOT NULL DEFAULT 0,
    descricao TEXT,
    url_avatar TEXT,
    icone_avatar TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2. TABELA DE TRABALHADORES
-- ==============================================================================
CREATE TABLE public.gfa_trabalhadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_trabalhador TEXT NOT NULL,
    contato TEXT,
    papeis TEXT[] NOT NULL DEFAULT '{}',
    coordenador BOOLEAN NOT NULL DEFAULT false,
    presente BOOLEAN NOT NULL DEFAULT true,
    id_sala_alocada UUID REFERENCES public.gfa_salas(id) ON DELETE SET NULL,
    url_avatar TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. TABELA DE ASSISTIDOS
-- ==============================================================================
CREATE TABLE public.gfa_assistidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_assistido TEXT NOT NULL,
    telefone TEXT,
    observacoes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. TABELA DE FICHAS DE ASSISTÊNCIA
-- ==============================================================================
CREATE TABLE public.gfa_fichas_assistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_assistido UUID NOT NULL REFERENCES public.gfa_assistidos(id) ON DELETE CASCADE,
    id_entrevistador UUID REFERENCES public.gfa_trabalhadores(id) ON DELETE SET NULL,
    data_entrevista DATE NOT NULL,
    qtd_a2 INTEGER NOT NULL DEFAULT 0,
    qtd_a1 INTEGER NOT NULL DEFAULT 0,
    realizado_a2 INTEGER NOT NULL DEFAULT 0,
    realizado_a1 INTEGER NOT NULL DEFAULT 0,
    tipo_ficha TEXT NOT NULL DEFAULT 'Inicial',
    status_ficha TEXT NOT NULL DEFAULT 'Ativa',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. TABELA DE ATENDIMENTOS DE PASSE (Sessões)
-- ==============================================================================
CREATE TABLE public.gfa_atendimentos_passe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_ficha_assistencia UUID REFERENCES public.gfa_fichas_assistencia(id) ON DELETE CASCADE,
    id_assistido UUID NOT NULL REFERENCES public.gfa_assistidos(id) ON DELETE CASCADE,
    id_sala_alocada UUID REFERENCES public.gfa_salas(id) ON DELETE SET NULL,
    data_atendimento DATE NOT NULL,
    tipo_passe TEXT NOT NULL,
    fase_atendimento TEXT NOT NULL,
    status_atendimento TEXT NOT NULL DEFAULT 'Aguardando',
    hora_entrada TIMESTAMPTZ,
    hora_saida TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ÍNDICES (Para melhorar velocidade de buscas em Listagens Diárias)
-- ==============================================================================
CREATE INDEX idx_trabalhadores_sala ON public.gfa_trabalhadores (id_sala_alocada);

CREATE INDEX idx_atend_passe_data ON public.gfa_atendimentos_passe (data_atendimento);
CREATE INDEX idx_atend_passe_sala ON public.gfa_atendimentos_passe (id_sala_alocada);
CREATE INDEX idx_atend_passe_ficha ON public.gfa_atendimentos_passe (id_ficha_assistencia);

CREATE INDEX idx_fichas_assistido ON public.gfa_fichas_assistencia (id_assistido);
CREATE INDEX idx_fichas_entrevistador ON public.gfa_fichas_assistencia (id_entrevistador);
