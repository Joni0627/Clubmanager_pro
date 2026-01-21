
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkijuhefbatayefcpcbn.supabase.co';
const supabaseKey = 'sb_publishable_oFs8-5mUjP9rr5P07Ol1gw_ssxbm1PB';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers para operaciones comunes
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
