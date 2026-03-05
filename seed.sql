-- ==============================================================================
-- SCRIPT DE CARGA INICIAL: Trabalhadores e Salas
-- Execute no SQL Editor do Supabase (projeto Inventario)
-- ==============================================================================

-- IMPORTANTE: Desabilitar RLS para permitir acesso anônimo (desenvolvimento)
-- Sem isso, as queries do frontend retornarão vazio mesmo com dados no banco.
ALTER TABLE public.gfa_salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gfa_trabalhadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gfa_assistidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gfa_fichas_assistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gfa_atendimentos_passe ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (anon) para todas as tabelas
-- Em produção, substituir por políticas baseadas em auth.uid()

CREATE POLICY "Permitir leitura pública" ON public.gfa_salas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.gfa_salas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON public.gfa_salas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON public.gfa_salas FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública" ON public.gfa_trabalhadores FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.gfa_trabalhadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON public.gfa_trabalhadores FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON public.gfa_trabalhadores FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública" ON public.gfa_assistidos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.gfa_assistidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON public.gfa_assistidos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON public.gfa_assistidos FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública" ON public.gfa_fichas_assistencia FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.gfa_fichas_assistencia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON public.gfa_fichas_assistencia FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON public.gfa_fichas_assistencia FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública" ON public.gfa_atendimentos_passe FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON public.gfa_atendimentos_passe FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON public.gfa_atendimentos_passe FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON public.gfa_atendimentos_passe FOR DELETE USING (true);


-- ==============================================================================
-- SALAS
-- ==============================================================================
INSERT INTO public.gfa_salas (id, nome_sala, tipo_sala, capacidade, descricao, url_avatar, icone_avatar) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Sala Passe 01', 'Passe', 5, 'Terreo', NULL, 'DoorIcon'),
  ('a0000001-0000-0000-0000-000000000002', 'Sala Passe 02', 'Passe', 5, '', NULL, 'DoorIcon'),
  ('a0000001-0000-0000-0000-000000000003', 'Recepção', 'Entrevista', 5, NULL, NULL, NULL),
  ('a0000001-0000-0000-0000-000000000004', 'Palestra', 'Entrevista', 1, '', NULL, NULL),
  ('a0000001-0000-0000-0000-000000000005', 'Aulinha', 'Entrevista', 1, 'Atendimento para iniciantes', NULL, 'BookIcon'),
  ('a0000001-0000-0000-0000-000000000006', 'Sala Passe 09', 'Passe', 5, '', NULL, 'DoorIcon'),
  ('a0000001-0000-0000-0000-000000000007', 'Sala Passe 10', 'Passe', 5, '', NULL, 'DoorIcon');

-- ==============================================================================
-- TRABALHADORES
-- Papéis: Coordenador, Médium, Diálogo, Psicografa, Sustentação, Entrevista, Recepção
-- ==============================================================================
INSERT INTO public.gfa_trabalhadores (id, nome_trabalhador, contato, papeis, coordenador, presente, id_sala_alocada, url_avatar) VALUES
  -- Sala Passe 01
  ('b0000001-0000-0000-0000-000000000001', 'Carmela',          '', ARRAY['Médium','Psicografa'],                    false, true,  'a0000001-0000-0000-0000-000000000001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmela2&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000004', 'Claudio',          '', ARRAY['Coordenador','Médium','Diálogo'],         true,  true,  'a0000001-0000-0000-0000-000000000001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Claudio1&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000005', 'Lineu',            '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lineu&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000006', 'Marcelo',          '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000001', ''),
  ('b0000001-0000-0000-0000-000000000007', 'Adriana',          '', ARRAY['Sustentação'],                            false, true,  'a0000001-0000-0000-0000-000000000001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adriana2&backgroundColor=c0aede'),

  -- Sala Passe 02
  ('b0000001-0000-0000-0000-000000000008', 'Marcia',           '', ARRAY['Coordenador','Médium','Diálogo'],         true,  true,  'a0000001-0000-0000-0000-000000000002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcia&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000009', 'Jefferson',        '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jefferson&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000010', 'Leny',             '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leny&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000011', 'Marlene',          '', ARRAY['Médium'],                                 false, true,  'a0000001-0000-0000-0000-000000000002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marlene2&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000012', 'Rogerio',          '', ARRAY['Médium','Sustentação'],                   false, true,  'a0000001-0000-0000-0000-000000000002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rogerio1&backgroundColor=b6e3f4'),

  -- Sala Passe 09 (room-1765217671307)
  ('b0000001-0000-0000-0000-000000000013', 'Elisete',          '', ARRAY['Coordenador','Médium','Diálogo'],         true,  true,  'a0000001-0000-0000-0000-000000000006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elisete&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000014', 'Camila',           '', ARRAY['Médium'],                                 false, true,  'a0000001-0000-0000-0000-000000000006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cami&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000015', 'Ana Laura',        '', ARRAY['Médium'],                                 false, true,  'a0000001-0000-0000-0000-000000000006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana%20Laura2&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000016', 'Beth Herrero',     '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bethi%20Herrer1&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000023', 'Katia',            '', ARRAY['Sustentação'],                            false, true,  'a0000001-0000-0000-0000-000000000006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katia&backgroundColor=d1d4f9'),

  -- Sala Passe 10 (room-1765217703620)
  ('b0000001-0000-0000-0000-000000000017', 'Renata',           '', ARRAY['Coordenador','Médium','Diálogo'],         true,  true,  'a0000001-0000-0000-0000-000000000007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Renat1&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000018', 'Paulo',            '', ARRAY['Diálogo','Sustentação'],                  false, true,  'a0000001-0000-0000-0000-000000000007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paulo%20a&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000019', 'Angélica',         '', ARRAY['Diálogo','Sustentação'],                  false, true,  'a0000001-0000-0000-0000-000000000007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Angell1&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000020', 'Sebastião',        '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sebast&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000021', 'Sandra',           '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000007', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sand&backgroundColor=d1d4f9'),

  -- Recepção
  ('b0000001-0000-0000-0000-000000000002', 'José Luiz',        '', ARRAY['Recepção'],                               false, true,  'a0000001-0000-0000-0000-000000000003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jos%C3%A9%20Luiz1&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000003', 'Marcio',           '', ARRAY['Recepção'],                               false, true,  'a0000001-0000-0000-0000-000000000003', ''),

  -- Palestra
  ('b0000001-0000-0000-0000-000000000028', 'Beth Peinado',     '', ARRAY['Médium','Diálogo'],                       false, true,  'a0000001-0000-0000-0000-000000000004', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beth%20Peinad2&backgroundColor=c0aede'),

  -- Sem sala alocada
  ('b0000001-0000-0000-0000-000000000029', 'Kati',             '', ARRAY['Médium'],                                 false, true,  NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katia1&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000024', 'André',            '', ARRAY['Médium','Diálogo'],                       false, true,  NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=An2&backgroundColor=c0aede'),
  ('b0000001-0000-0000-0000-000000000026', 'Roberto',          '', ARRAY['Médium','Diálogo'],                       false, true,  NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rob&backgroundColor=d1d4f9'),

  -- Ausentes (presente = false)
  ('b0000001-0000-0000-0000-000000000022', 'Beth Torres',      '', ARRAY['Coordenador','Médium'],                   true,  false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beth%20Torre&backgroundColor=b6e3f4'),
  ('b0000001-0000-0000-0000-000000000027', 'Rose',             '', ARRAY['Sustentação'],                            false, false, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rose1&backgroundColor=b6e3f4'),

  -- Aulinha (Marcia Silveira)
  ('b0000001-0000-0000-0000-000000000025', 'Marcia Silveira',  '', ARRAY['Médium'],                                 false, true,  'a0000001-0000-0000-0000-000000000005', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcia%20Silveira1&backgroundColor=b6e3f4');


-- Verificação
SELECT 'Salas inseridas: ' || count(*) FROM public.gfa_salas;
SELECT 'Trabalhadores inseridos: ' || count(*) FROM public.gfa_trabalhadores;
