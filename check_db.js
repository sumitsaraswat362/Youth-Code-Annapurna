const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bzztmirdtagooejwuxlw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6enRtaXJkdGFnb29land1eGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjY0MjQsImV4cCI6MjA5NjU0MjQyNH0.KuyPmoeB72aJWpVgU82FqjYWB7Y1sCpVwxJ41d8P8cU");

async function run() {
  const { data, error } = await supabase.from('cargos').select('*').order('created_at', { ascending: false }).limit(2);
  console.log("Latest Cargos:", data.map(d => ({id: d.id, time: d.created_at, status: d.status, asking_price: d.asking_price_per_kg})));
}
run();
