const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    // Delete the broken cargo or update it
    await client.query(`
      UPDATE cargos 
      SET telemetry = jsonb_set(telemetry, '{ethyleneLevel}', '"low"')
      WHERE telemetry->>'ethyleneLevel' = '0.1';
    `);
    console.log("Fixed broken telemetry data.");
  } catch (err) {
    console.error("Error fixing DB:", err);
  } finally {
    await client.end();
  }
}

fixDB();
