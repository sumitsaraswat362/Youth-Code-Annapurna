-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS cargos (
  id VARCHAR(255) PRIMARY KEY,
  truck_plate VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  estimated_cargo_value NUMERIC NOT NULL,
  safe_temperature_max NUMERIC NOT NULL,
  spoilage_time_minutes NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,
  origin JSONB NOT NULL,
  original_destination JSONB NOT NULL,
  telemetry JSONB NOT NULL,
  asking_price_per_kg NUMERIC,
  selected_market JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable realtime for these tables
alter publication supabase_realtime add table cargos;
alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table alerts;
