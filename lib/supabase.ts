
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

export const db = {
  players: {
    getAll: () => supabase.from('players').select('*').order('name', { ascending: true }),
    upsert: (data: any) => {
      // Eliminar campos temporales de React antes de guardar
      const { ...payload } = data;
      return supabase.from('players').upsert(payload);
    },
    delete: (id: string) => supabase.from('players').delete().eq('id', id)
  },
  clubConfig: {
    get: () => supabase.from('club_config').select('*').eq('id', 1).maybeSingle(),
    update: (data: any) => {
      return supabase.from('club_config').upsert({
        id: 1,
        name: data.name,
        logo_url: data.logoUrl,
        disciplines: data.disciplines,
        updated_at: new Date().toISOString()
      });
    }
  },
  fees: {
    getAll: () => supabase.from('member_fees').select(`
      *,
      player:players(name, dni, discipline, category)
    `).order('due_date', { ascending: false }),
    upsert: (data: any) => supabase.from('member_fees').upsert(data),
    delete: (id: string) => supabase.from('member_fees').delete().eq('id', id)
  }
};
