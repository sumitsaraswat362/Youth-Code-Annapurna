const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://bzztmirdtagooejwuxlw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6enRtaXJkdGFnb29land1eGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NjY0MjQsImV4cCI6MjA5NjU0MjQyNH0.KuyPmoeB72aJWpVgU82FqjYWB7Y1sCpVwxJ41d8P8cU";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing select cargos...");
  const { data, error } = await supabase.from('cargos').select('*');
  console.log("Select Result:", error || data);

  console.log("Testing insert cargo...");
  const { data: insertData, error: insertError } = await supabase.from('cargos').insert({
    id: "test-cargo-1",
    truck_plate: "TEST-123",
    type: "tomatoes",
    quantity_kg: 1000,
    estimated_cargo_value: 50000,
    safe_temperature_max: 10,
    spoilage_time_minutes: 1440,
    status: "in_transit",
    telemetry: { temperature: 5 }
  }).select();
  console.log("Insert Result:", insertError || insertData);
}
test();
