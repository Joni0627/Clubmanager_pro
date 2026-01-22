
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Advertencia: Las credenciales de Supabase no están definidas.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

export const db = {
  players: {
    getAll: () => supabase.from('players').select('*').order('name', { ascending: true }),
    upsert: (data: any) => {
      // Limpiamos el objeto para asegurar que no enviamos campos calculados o temporales
      const { ...payload } = data;
      return supabase.from('players').upsert(payload);
    },
    delete: (id: string) => supabase.from('players').delete().eq('id', id)
  },
  clubConfig: {
    // Usamos id fijo 1 para la configuración global del club
    get: () => supabase.from('club_config').select('*').eq('id', 1).maybeSingle(),
    update: (data: any) => supabase.from('club_config').upsert({ id: 1, ...data })
  },
  fees: {
    getAll: () => supabase.from('member_fees').select('*'),
    upsert: (data: any) => supabase.from('member_fees').upsert(data),
    delete: (id: string) => supabase.from('member_fees').delete().eq('id', id)
  }
};
