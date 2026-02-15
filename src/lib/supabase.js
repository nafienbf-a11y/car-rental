import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for deployment
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase configuration missing!');
    console.error('URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
    console.error('Key:', supabaseKey ? '✓ Found' : '✗ Missing');
    console.error('All env vars:', import.meta.env);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
