-- ==============================================================================
-- SWACHHSETU • PUNE MUNICIPAL CORPORATION (PMC) • SOLID WASTE MANAGEMENT
-- SUPABASE / POSTGRESQL PRODUCTION DATABASE SCHEMA & INITIAL SEED DATA
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project dashboard (https://supabase.com/dashboard)
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire file, and click "Run" (Ctrl+Enter)
-- 4. Your cloud database is now fully initialized and seeded!
-- ==============================================================================

-- Clean up existing tables if re-running (cascades cleanly)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'collector', 'admin')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  points INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. REQUESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  waste_category TEXT NOT NULL CHECK (waste_category IN ('Organic', 'Plastic', 'Paper', 'E-Waste', 'Medical', 'Other')),
  pickup_location TEXT NOT NULL,
  pickup_date TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  photo_exif_present BOOLEAN NOT NULL DEFAULT FALSE,
  photo_gps_match BOOLEAN DEFAULT NULL,
  status TEXT NOT NULL CHECK (status IN ('Submitted', 'Assigned', 'On the Way', 'Completed', 'Rejected')),
  rejection_reason TEXT DEFAULT NULL,
  collector_id TEXT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_collector ON requests(collector_id);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. RATINGS TABLE (Bidirectional Citizen <-> Collector)
-- ------------------------------------------------------------------------------
CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  rater_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rater_role TEXT NOT NULL CHECK (rater_role IN ('user', 'collector')),
  target_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_rating_per_request_rater UNIQUE (request_id, rater_id)
);

CREATE INDEX idx_ratings_request ON ratings(request_id);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);
CREATE INDEX idx_ratings_target ON ratings(target_id);

-- ------------------------------------------------------------------------------
-- 4. BADGES REFERENCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  min_streak INTEGER NOT NULL DEFAULT 0
);

-- ==============================================================================
-- INITIAL SEED DATA (Pune Personas, Requests, Ratings, Badges)
-- ==============================================================================

-- Badges
INSERT INTO badges (id, name, description, min_points, min_streak) VALUES
('green_starter', 'Harit Punekar (Green Starter)', 'Completed your first verified waste segregation & collection in Pune.', 50, 1),
('eco_warrior', 'Eco Warrior (Paryavaran Rakshak)', 'Accumulated 150+ recycling points across clean PMC ward pickups.', 150, 2),
('recycling_champion', 'Recycling Champion (Swachhata Doot)', 'Reached 300+ points with consistent weekly source segregation excellence.', 300, 3),
('zero_waste_hero', 'Zero Waste Hero (Shunya Kachra Leader)', 'Achieved 500+ points and demonstrated a 4-week active municipal streak.', 500, 4);

-- Users
INSERT INTO users (id, name, contact_info, role, verified, points, streak_count, badges, created_at) VALUES
(
  'user_shreeyansh',
  'Shreeyansh Mahamuni',
  'shreeyansh.mahamuni@punecity.in',
  'user',
  TRUE,
  350,
  3,
  '["green_starter", "eco_warrior", "recycling_champion"]'::jsonb,
  '2026-08-01T09:00:00.000Z'
),
(
  'user_priya',
  'Priya Deshmukh',
  'priya.deshmukh@vimanpune.org',
  'user',
  FALSE,
  100,
  2,
  '["green_starter"]'::jsonb,
  '2026-08-15T10:30:00.000Z'
),
(
  'user_rohan',
  'Rohan Shinde',
  'rohan.shinde@hadapsarpune.in',
  'user',
  FALSE,
  0,
  0,
  '[]'::jsonb,
  '2026-09-01T11:00:00.000Z'
),
(
  'collector_santosh',
  'Santosh Shinde',
  'santosh.collector@swachpune.com',
  'collector',
  TRUE,
  0,
  0,
  '[]'::jsonb,
  '2026-07-10T08:00:00.000Z'
),
(
  'collector_sunita',
  'Sunita Kamble',
  'sunita.kamble@swachpune.com',
  'collector',
  TRUE,
  0,
  0,
  '[]'::jsonb,
  '2026-07-15T08:30:00.000Z'
),
(
  'admin_mahesh',
  'Mahesh Gokhale',
  'mahesh.gokhale@punecorporation.org',
  'admin',
  TRUE,
  0,
  0,
  '[]'::jsonb,
  '2026-06-01T07:00:00.000Z'
);

-- Requests
INSERT INTO requests (id, user_id, waste_category, pickup_location, pickup_date, photo_url, photo_exif_present, photo_gps_match, status, rejection_reason, collector_id, created_at, updated_at) VALUES
(
  'req_shreeyansh_01',
  'user_shreeyansh',
  'Plastic',
  'Flat 402, Mayur Vihar, Paud Road, Kothrud, Pune - 411038',
  '2026-09-10',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'Completed',
  NULL,
  'collector_santosh',
  '2026-09-10T08:15:00.000Z',
  '2026-09-10T11:30:00.000Z'
),
(
  'req_shreeyansh_02',
  'user_shreeyansh',
  'Paper',
  'Flat 402, Mayur Vihar, Paud Road, Kothrud, Pune - 411038',
  '2026-09-14',
  'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'Completed',
  NULL,
  'collector_santosh',
  '2026-09-14T09:00:00.000Z',
  '2026-09-14T12:00:00.000Z'
),
(
  'req_shreeyansh_03',
  'user_shreeyansh',
  'E-Waste',
  'Flat 402, Mayur Vihar, Paud Road, Kothrud, Pune - 411038',
  '2026-09-18',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'Completed',
  NULL,
  'collector_sunita',
  '2026-09-18T10:00:00.000Z',
  '2026-09-18T14:10:00.000Z'
),
(
  'req_shreeyansh_04',
  'user_shreeyansh',
  'Organic',
  'Flat 402, Mayur Vihar, Paud Road, Kothrud, Pune - 411038',
  '2026-09-22',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'Completed',
  NULL,
  'collector_santosh',
  '2026-09-22T08:30:00.000Z',
  '2026-09-22T11:45:00.000Z'
),
(
  'req_shreeyansh_05',
  'user_shreeyansh',
  'Plastic',
  'Flat 402, Mayur Vihar, Paud Road, Kothrud, Pune - 411038',
  '2026-09-25',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'Completed',
  NULL,
  'collector_sunita',
  '2026-09-25T09:15:00.000Z',
  '2026-09-25T13:20:00.000Z'
),
(
  'req_priya_01',
  'user_priya',
  'E-Waste',
  'Building B, Rohan Mithila, Viman Nagar, Pune - 411014',
  '2026-09-27',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'Assigned',
  NULL,
  'collector_santosh',
  '2026-09-27T08:00:00.000Z',
  '2026-09-27T08:15:00.000Z'
),
(
  'req_priya_02',
  'user_priya',
  'Organic',
  'Survey 45, Pancard Club Road, Baner, Pune - 411045',
  '2026-09-28',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  TRUE,
  NULL,
  'Submitted',
  NULL,
  NULL,
  '2026-09-27T10:00:00.000Z',
  '2026-09-27T10:00:00.000Z'
),
(
  'req_shreeyansh_06',
  'user_shreeyansh',
  'Paper',
  'Near Parihar Chowk, DP Road, Aundh, Pune - 411007',
  '2026-09-27',
  'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
  TRUE,
  TRUE,
  'On the Way',
  NULL,
  'collector_sunita',
  '2026-09-27T07:30:00.000Z',
  '2026-09-27T09:00:00.000Z'
),
(
  'req_rohan_01',
  'user_rohan',
  'Plastic',
  'Plot 88, Magarpatta Road, Hadapsar, Pune - 411028',
  '2026-09-02',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
  FALSE,
  FALSE,
  'Rejected',
  'No waste found at location outside society gate',
  'collector_santosh',
  '2026-09-02T11:00:00.000Z',
  '2026-09-02T14:30:00.000Z'
),
(
  'req_rohan_02',
  'user_rohan',
  'E-Waste',
  'Plot 88, Magarpatta Road, Hadapsar, Pune - 411028',
  '2026-09-08',
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
  FALSE,
  FALSE,
  'Rejected',
  'Fake request / downloaded internet image detected',
  'collector_sunita',
  '2026-09-08T10:15:00.000Z',
  '2026-09-08T12:00:00.000Z'
),
(
  'req_rohan_03',
  'user_rohan',
  'Medical',
  'Plot 88, Magarpatta Road, Hadapsar, Pune - 411028',
  '2026-09-15',
  'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
  FALSE,
  FALSE,
  'Rejected',
  'Duplicate request already logged by neighbor',
  'collector_santosh',
  '2026-09-15T13:00:00.000Z',
  '2026-09-15T15:20:00.000Z'
);

-- Ratings
INSERT INTO ratings (id, request_id, rater_id, rater_role, target_id, rating, comment, created_at) VALUES
(
  'rat_santosh_shreeyansh_01',
  'req_shreeyansh_01',
  'collector_santosh',
  'collector',
  'user_shreeyansh',
  5,
  'Dry plastic bottles were neatly crushed and segregated in blue bag outside Kothrud society.',
  '2026-09-10T11:35:00.000Z'
),
(
  'rat_shreeyansh_santosh_01',
  'req_shreeyansh_01',
  'user_shreeyansh',
  'user',
  'collector_santosh',
  5,
  'Santosh arrived right on time on the morning PMC collection route. Very polite and efficient!',
  '2026-09-10T12:00:00.000Z'
),
(
  'rat_sunita_shreeyansh_01',
  'req_shreeyansh_03',
  'collector_sunita',
  'collector',
  'user_shreeyansh',
  5,
  'E-waste properly boxed with old chargers and cables bundled together.',
  '2026-09-18T14:15:00.000Z'
);
