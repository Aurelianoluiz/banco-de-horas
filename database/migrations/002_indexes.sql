CREATE INDEX IF NOT EXISTS idx_apontamentos_data ON apontamentos (data);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores (status);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_ativo ON usuarios (perfil, ativo);
CREATE INDEX IF NOT EXISTS idx_feriados_data ON feriados (data);
CREATE INDEX IF NOT EXISTS idx_atestados_colaborador_inicio ON atestados (colaborador_id, inicio);
