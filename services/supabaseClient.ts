import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://sua-url-aqui.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'sua-anon-key-aqui';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
        'Aviso: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão configurados nas variáveis de ambiente! O app pode não conseguir ler ou salvar dados no banco.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
