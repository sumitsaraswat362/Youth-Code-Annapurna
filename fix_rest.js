const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase.from('cargos').select('*');
  if (data) {
    for (const row of data) {
      if (row.telemetry.ethyleneLevel === 0.1) {
        await supabase.from('cargos').update({
          telemetry: { ...row.telemetry, ethyleneLevel: 'low' }
        }).eq('id', row.id);
        console.log("Fixed row", row.id);
      }
    }
  }
}

fix();
