-- HVAC Hub Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  tech_id TEXT,
  timestamp TEXT NOT NULL,
  required_skill_level TEXT NOT NULL,
  location_lat DECIMAL(10,6),
  location_lng DECIMAL(10,6),
  estimated_duration DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  location_lat DECIMAL(10,6),
  location_lng DECIMAL(10,6),
  location_label TEXT,
  inventory TEXT[] DEFAULT '{}',
  avatar TEXT,
  is_available BOOLEAN DEFAULT TRUE
);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  location_type TEXT,
  location_name TEXT,
  distance TEXT
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  owner_id TEXT,
  owner_name TEXT,
  status TEXT DEFAULT 'Available',
  image_url TEXT,
  location TEXT
);

-- Enable Row Level Security (RLS) but allow all operations for now
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (can be restricted later for auth)
CREATE POLICY "Allow all on jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all on technicians" ON technicians FOR ALL USING (true);
CREATE POLICY "Allow all on parts" ON parts FOR ALL USING (true);
CREATE POLICY "Allow all on assets" ON assets FOR ALL USING (true);

-- SEED DATA --

-- Insert sample jobs
INSERT INTO jobs (id, client_id, client_name, address, description, status, tech_id, timestamp, required_skill_level, location_lat, location_lng, estimated_duration) VALUES
  ('J101', 'C501', 'Empire State Prop', '350 5th Ave, NY', 'Chiller 2 vibration alert', 'In Progress', 'T001', '10:30 AM', 'Master', 40.7484, -73.9857, 4),
  ('J102', 'C502', 'Joe''s Pizza', '145 W 4th St, NY', 'Walk-in freezer warm', 'En Route', 'T002', '11:15 AM', 'Journeyman', 40.7305, -74.0021, 2),
  ('J103', 'C503', 'Res. Complex A', '220 CPS, NY', 'Seasonal Maintenance', 'Pending', NULL, '12:00 PM', 'Apprentice', 40.7663, -73.9774, 1.5),
  ('J104', 'C504', 'Tech Startup HQ', '111 8th Ave, NY', 'Server room AC failure', 'Pending', NULL, '09:00 AM', 'Master', 40.7410, -74.0025, 3),
  ('J105', 'C505', 'Brooklyn Hospital', '121 Dekalb Ave, BK', 'Negative pressure error', 'Pending', NULL, '08:30 AM', 'Journeyman', 40.6905, -73.9772, 5)
ON CONFLICT (id) DO NOTHING;

-- Insert sample technicians
INSERT INTO technicians (id, name, level, location_lat, location_lng, location_label, inventory, avatar, is_available) VALUES
  ('T001', 'Alex Rivera', 'Master', 40.7128, -74.0060, 'Lower Manhattan', ARRAY['P101', 'P102', 'P115'], 'https://picsum.photos/id/1005/50/50', true),
  ('T002', 'Sarah Chen', 'Journeyman', 40.7484, -73.9857, 'Midtown', ARRAY['P103', 'P120'], 'https://picsum.photos/id/1011/50/50', true),
  ('T003', 'Mike Kowalski', 'Apprentice', 40.7831, -73.9712, 'Upper West Side', ARRAY['P101', 'P104', 'P112'], 'https://picsum.photos/id/1025/50/50', true),
  ('T004', 'David Kim', 'Master', 40.6782, -73.9442, 'Brooklyn Hub', ARRAY['P105', 'P106', 'P118'], 'https://picsum.photos/id/1012/50/50', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample parts
INSERT INTO parts (id, name, sku, category, price, stock, location_type, location_name, distance) VALUES
  ('P101', 'Run Capacitor 35+5', 'CAP-355-UNIV', 'Electrical', 15.00, 12, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P102', 'Contactor 2-Pole 30A', 'CTR-2P30', 'Electrical', 22.50, 4, 'Van', 'T001 (Alex)', '0.8 mi'),
  ('P103', 'TXV Valve R410A', 'TXV-410-2T', 'Refrigerant', 85.00, 2, 'Retailer', 'United Ref. Brooklyn', '2.1 mi'),
  ('P104', 'Transformer 40VA', 'TRF-40VA-MULTI', 'Electrical', 18.00, 15, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P105', 'Thermostat C-Wire Adapter', 'THERM-CW-01', 'Controls', 35.00, 8, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P106', 'R410A Refrigerant 25lb', 'REF-410-25', 'Refrigerant', 350.00, 3, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P108', 'Fan Motor 1/3 HP', 'MTR-13-825', 'Motors', 145.00, 1, 'Van', 'T003 (Mike)', '1.5 mi'),
  ('P109', 'Condenser Fan Blade 22"', 'FAN-BLD-22', 'Mechanical', 55.00, 6, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P110', 'Blower Wheel 10x10', 'BLW-WHL-1010', 'Mechanical', 65.00, 0, 'Retailer', 'United Ref. Brooklyn', '2.1 mi'),
  ('P111', 'Universal Control Board', 'PCB-UNI-X', 'Electronics', 120.00, 1, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P112', 'Defrost Control Board', 'PCB-DEF-UNIV', 'Electrical', 85.00, 2, 'Retailer', 'SupplyCorp BX', '8.5 mi'),
  ('P113', 'Ignition Control Module', 'IGN-MOD-77', 'Electronics', 180.00, 3, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P114', 'Flame Sensor', 'SEN-FLM-01', 'Electronics', 12.00, 25, 'Van', 'T002 (Sarah)', '1.2 mi'),
  ('P115', 'Leak Stop (Injectable)', 'CHEM-LK-STP', 'Chemicals', 45.00, 20, 'Van', 'T001 (Alex)', '0.8 mi'),
  ('P116', 'Coil Cleaner (Foaming)', 'CHEM-CL-FOAM', 'Chemicals', 12.00, 4, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P117', 'R22 Refrigerant 30lb', 'REF-22-LEGACY', 'Refrigerant', 850.00, 1, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P118', 'Filter Drier 3/8', 'FLT-DRI-38', 'Refrigerant', 18.00, 8, 'Warehouse', 'Queens Hub', '4.2 mi'),
  ('P119', 'Schrader Valve Cores (10pk)', 'VLV-CORE-10', 'Misc', 5.00, 50, 'Van', 'T004 (David)', '3.5 mi'),
  ('P120', 'PVC Trap 3/4"', 'PVC-TRP-34', 'Plumbing', 8.00, 11, 'Van', 'T002 (Sarah)', '1.2 mi')
ON CONFLICT (id) DO NOTHING;

-- Insert sample assets
INSERT INTO assets (id, name, category, daily_rate, owner_id, owner_name, status, image_url, location) VALUES
  ('A001', 'FLIR Thermal Camera E8', 'Diagnostics', 45, 'C902', 'Mike''s HVAC', 'Available', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=400', 'Brooklyn Navy Yard'),
  ('A002', 'Refrigerant Recovery Machine', 'Heavy Equipment', 85, 'C501', 'Empire Mechanical', 'Available', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400', 'Long Island City'),
  ('A003', 'Hydro-Jetting Rig Used', 'Plumbing', 150, 'C888', 'City Services Corp', 'Rented', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400', 'Jersey City'),
  ('A004', 'Scissor Lift 19ft', 'Access', 120, 'C101', 'Premier Heights', 'Available', 'https://images.unsplash.com/photo-1588636224151-f40884df00e9?auto=format&fit=crop&q=80&w=400', 'Midtown West'),
  ('A005', 'Digital Manifold Gauge', 'Diagnostics', 25, 'C902', 'Mike''s HVAC', 'Available', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400', 'Brooklyn Navy Yard'),
  ('A006', 'Vacuum Pump 8CFM', 'Heavy Equipment', 40, 'C501', 'Empire Mechanical', 'Available', 'https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?auto=format&fit=crop&q=80&w=400', 'Long Island City'),
  ('A007', 'Combustion Analyzer', 'Diagnostics', 55, 'C888', 'City Services Corp', 'Available', 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=400', 'Jersey City'),
  ('A008', 'Pipe Press Tool', 'Plumbing', 65, 'C101', 'Premier Heights', 'Rented', 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=400', 'Midtown West'),
  ('A009', 'Portable AC 5 Ton', 'Temporary Cooling', 200, 'C501', 'Empire Mechanical', 'Available', 'https://images.unsplash.com/photo-1632053002228-e4d0d04c3527?auto=format&fit=crop&q=80&w=400', 'Queens Warehouse')
ON CONFLICT (id) DO NOTHING;

-- Customers table (for personal info and billing)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  billing_country TEXT DEFAULT 'US',
  save_for_future BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (for purchase tracking and receipts)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  user_id TEXT NOT NULL,
  asset_id TEXT REFERENCES assets(id),
  asset_name TEXT NOT NULL,
  rental_days INTEGER NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Completed',
  payment_method TEXT DEFAULT 'card',
  payment_intent_id TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  receipt_number TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true);

-- Sample customer (admin user)
INSERT INTO customers (id, user_id, full_name, email, phone, billing_address_line1, billing_city, billing_state, billing_zip) VALUES
  ('CUST001', 'u1', 'Admin User', 'admin@hvachub.com', '555-0100', '123 HVAC Street', 'New York', 'NY', '10001')
ON CONFLICT (id) DO NOTHING;

-- Sample order (demo purchase)
INSERT INTO orders (id, customer_id, user_id, asset_id, asset_name, rental_days, daily_rate, subtotal, tax, total, status, start_date, end_date, receipt_number) VALUES
  ('ORD001', 'CUST001', 'u1', 'A003', 'Hydro-Jetting Rig Used', 3, 150.00, 450.00, 36.00, 486.00, 'Completed', '2026-01-05', '2026-01-08', 'RCP-20260105-001')
ON CONFLICT (id) DO NOTHING;
