
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fix: Expanded db object to include players and fees to resolve property access errors in UI components
export const db = {
  config: {
    get: () => supabase
      .from('club_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle(),
    
    update: (data: any) => supabase
      .from('club_config')
      .upsert({ id: 1, ...data })
  },
  players: {
    getAll: () => supabase
      .from('players')
      .select('*'),
    
    upsert: (player: any) => supabase
      .from('players')
      .upsert(player)
  },
  fees: {
    getAll: () => supabase
      .from('fees')
      .select('*, player:players(*)'),
    
    upsert: (fee: any) => supabase
      .from('fees')
      .upsert(fee),
    
    delete: (id: string) => supabase
      .from('fees')
      .delete()
      .eq('id', id)
  }
};
