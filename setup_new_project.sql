-- 1. Create Cargos Table
CREATE TABLE IF NOT EXISTS cargos (
  id VARCHAR(255) PRIMARY KEY,
  truck_plate VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  estimated_cargo_value NUMERIC NOT NULL,
  safe_temperature_max NUMERIC NOT NULL,
  spoilage_time_minutes NUMERIC,
  status VARCHAR(50) NOT NULL,
  origin JSONB,
  original_destination JSONB,
  telemetry JSONB NOT NULL,
  asking_price_per_kg NUMERIC,
  selected_market JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Bids Table
CREATE TABLE IF NOT EXISTS bids (
  id VARCHAR(255) PRIMARY KEY,
  cargo_id VARCHAR(255) NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  wholesaler_id VARCHAR(255) NOT NULL,
  wholesaler_name VARCHAR(255) NOT NULL,
  wholesaler_location VARCHAR(255) NOT NULL,
  offered_price_per_kg NUMERIC NOT NULL,
  requested_quantity_kg NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  distance_km NUMERIC NOT NULL,
  eta_minutes NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,
  counter_price_per_kg NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Explicitly Disable Security Rules (for Hackathon speed)
ALTER TABLE cargos DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- 4. Enable Realtime Streaming
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE cargos;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
