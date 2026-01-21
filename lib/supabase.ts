
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Advertencia: Las credenciales de Supabase no están definidas en el entorno.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

export const db = {
  players: {
    getAll: () => supabase.from('players').select('*').order('name', { ascending: true }),
    upsert: (data: any) => supabase.from('players').upsert(data),
    delete: (id: string) => supabase.from('players').delete().eq('id', id)
  },
  clubConfig: {
    get: () => supabase.from('club_config').select('*').single(),
    update: (data: any) => supabase.from('club_config').upsert({ id: 1, ...data })
  },
  fees: {
    getAll: () => supabase.from('member_fees').select('*'),
    upsert: (data: any) => supabase.from('member_fees').upsert(data),
    delete: (id: string) => supabase.from('member_fees').delete().eq('id', id)
  }
};
