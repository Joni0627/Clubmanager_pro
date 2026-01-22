
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
      // Limpiamos el objeto para asegurar que no enviamos campos calculados o temporales de React
      const { ...payload } = data;
      return supabase.from('players').upsert(payload);
    },
    delete: (id: string) => supabase.from('players').delete().eq('id', id)
  },
  clubConfig: {
    // Obtenemos la fila única de configuración
    get: () => supabase.from('club_config').select('*').eq('id', 1).maybeSingle(),
    // Sincronizamos la jerarquía completa (disciplinas, categorías, métricas)
    update: (data: any) => {
        const payload = {
            id: 1,
            name: data.name,
            logo_url: data.logoUrl,
            disciplines: data.disciplines,
            updated_at: new Date().toISOString()
        };
        return supabase.from('club_config').upsert(payload);
    }
  },
  fees: {
    getAll: () => supabase.from('member_fees').select('*').order('due_date', { ascending: false }),
    upsert: (data: any) => supabase.from('member_fees').upsert(data),
    delete: (id: string) => supabase.from('member_fees').delete().eq('id', id)
  }
};
