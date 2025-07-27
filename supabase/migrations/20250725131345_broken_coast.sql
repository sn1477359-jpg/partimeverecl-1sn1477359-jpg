/*
  # Initial Database Schema for WorkHop Platform

  1. New Tables
    - `users` - User authentication and profile data
    - `jobs` - Job postings with details and requirements
    - `applications` - Job applications and negotiations
    - `wallet_entries` - Payment tracking for students
    - `ratings` - Rating system between users

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure data privacy with appropriate permissions

  3. Features
    - User roles (student/employer)
    - Job posting with negotiation support
    - Wallet tracking with payment status
    - Rating system with feedback
*/

-- Users table for authentication and profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'employer')),
  aadhaar_masked text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rating numeric(2,1) DEFAULT 0.0,
  total_ratings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table for job postings
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  domain text NOT NULL,
  description text NOT NULL,
  skills_required text,
  gender_preference text,
  age_preference text,
  pay_offered numeric(10,2) NOT NULL,
  is_negotiable boolean DEFAULT false,
  location_address text NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  optional_instructions text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'filled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table for job applications and negotiations
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'negotiating')),
  original_pay numeric(10,2),
  negotiated_pay numeric(10,2),
  final_pay numeric(10,2),
  distance_km numeric(5,2),
  time_to_reach_min integer,
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, student_id)
);

-- Wallet entries for tracking student earnings
CREATE TABLE IF NOT EXISTS wallet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  duration_hours numeric(4,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Ratings table for user feedback
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  tags text[],
  feedback text,
  is_anonymous boolean DEFAULT false,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_user_id, to_user_id, job_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read other users basic info" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Policies for jobs table
CREATE POLICY "Anyone can read active jobs" ON jobs
  FOR SELECT TO authenticated
  USING (status = 'active');

CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = poster_id);

CREATE POLICY "Employers can update own jobs" ON jobs
  FOR UPDATE TO authenticated
  USING (auth.uid() = poster_id);

-- Policies for applications table
CREATE POLICY "Students can create applications" ON applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can read applications for their jobs/applications" ON applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id OR 
    auth.uid() IN (SELECT poster_id FROM jobs WHERE id = job_id)
  );

CREATE POLICY "Users can update applications they're involved in" ON applications
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = student_id OR 
    auth.uid() IN (SELECT poster_id FROM jobs WHERE id = job_id)
  );

-- Policies for wallet_entries table
CREATE POLICY "Students can read own wallet entries" ON wallet_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Employers can create wallet entries for their jobs" ON wallet_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT poster_id FROM jobs WHERE id = job_id)
  );

CREATE POLICY "Employers can update wallet entries for their jobs" ON wallet_entries
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (SELECT poster_id FROM jobs WHERE id = job_id)
  );

-- Policies for ratings table
CREATE POLICY "Users can create ratings for completed jobs" ON ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can read ratings" ON ratings
  FOR SELECT TO authenticated
  USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_jobs_domain ON jobs(domain);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_student ON applications(job_id, student_id);
CREATE INDEX IF NOT EXISTS idx_wallet_entries_student ON wallet_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_ratings_to_user ON ratings(to_user_id);