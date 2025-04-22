const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('URL available:', !!supabaseUrl);
  console.error('Key available:', !!supabaseKey);
}


const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    
    headers: { 'x-supabase-custom': 'handle-multiple-rows' }
  }
});

module.exports = supabase; 