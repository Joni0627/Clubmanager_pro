
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  config: {
    get: () => supabase
      .from('club_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle(),
    
    update: (data: any) => supabase
      .from('club_config')
      .upsert(
        { id: 1, ...data }, 
        { onConflict: 'id' }
      )
  },
  members: {
    getAll: () => supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true }),
    
    upsert: (member: any) => supabase
      .from('members')
      .upsert(member),
      
    delete: (id: string) => supabase
      .from('members')
      .delete()
      .eq('id', id)
  },
  // Fix: Added players property to db object to fix property missing errors in multiple components
  players: {
    getAll: () => supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true }),
    
    upsert: (player: any) => supabase
      .from('players')
      .upsert(player),
      
    delete: (id: string) => supabase
      .from('players')
      .delete()
      .eq('id', id)
  },
  fees: {
    getAll: () => supabase
      .from('fees')
      .select('*, player:players(*)'), // Fix: Changed join from member to player to match FeesManagement expected property name
    
    upsert: (fee: any) => supabase
      .from('fees')
      .upsert(fee),
    
    delete: (id: string) => supabase
      .from('fees')
      .delete()
      .eq('id', id)
  }
};
