
import { createClient } from '@supabase/supabase-js';

// Prioridad a variables de entorno (Vercel), fallback a tus datos para preview
const supabaseUrl = process.env.SUPABASE_URL || 'https://nkijuhefbatayefcpcbn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_oFs8-5mUjP9rr5P07Ol1gw_ssxbm1PB';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las credenciales de Supabase.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  players: {
    getAll: () => supabase.from('players').select('*'),
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
