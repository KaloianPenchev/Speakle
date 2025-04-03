const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('URL available:', !!supabaseUrl);
  console.error('Key available:', !!supabaseKey);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; 