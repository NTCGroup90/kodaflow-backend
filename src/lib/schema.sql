-- KODAFLOW Database Schema
-- Run this in Supabase SQL Editor

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== USER WALLETS ====================
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CREDIT TRANSACTIONS ====================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT,
  related_resource_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== BRANDS ====================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  source_url TEXT,
  
  -- Brand Identity
  slogan TEXT,
  mission_statement TEXT,
  core_values TEXT[],
  
  -- Visual Identity
  primary_color TEXT DEFAULT '#00F0FF',
  secondary_color TEXT DEFAULT '#A100FF',
  accent_color TEXT DEFAULT '#00D4FF',
  font_primary TEXT DEFAULT 'Inter',
  font_secondary TEXT,
  logo_url TEXT,
  
  -- Brand Voice
  tone_of_voice TEXT DEFAULT 'professional',
  voice_attributes TEXT[],
  writing_style TEXT,
  
  -- Target Audience
  target_demographics JSONB,
  pain_points TEXT[],
  desires TEXT[],
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== VISUAL ASSETS ====================
CREATE TABLE IF NOT EXISTS visual_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('product', 'lifestyle', 'concept', 'logo', 'banner', 'video')),
  source TEXT NOT NULL CHECK (source IN ('scraped', 'uploaded', 'ai_generated')),
  
  original_url TEXT NOT NULL,
  cdn_url TEXT,
  filename TEXT,
  
  width INTEGER,
  height INTEGER,
  quality_score FLOAT,
  
  ai_description TEXT,
  ai_tags TEXT[],
  dominant_colors TEXT[],
  
  is_selected BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CAMPAIGNS ====================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'facebook', 'instagram', 'tiktok', 'youtube')),
  
  -- Campaign details
  objective TEXT,
  daily_budget INTEGER,
  total_budget INTEGER,
  start_date DATE,
  end_date DATE,
  
  -- External IDs
  external_campaign_id TEXT,
  external_adgroup_id TEXT,
  external_ad_id TEXT,
  
  -- Content
  ad_copies JSONB,
  creatives JSONB,
  targeting JSONB,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'failed')),
  
  -- Metrics (cached)
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== VIDEO JOBS ====================
CREATE TABLE IF NOT EXISTS video_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
  template_type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  
  external_job_id TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  video_url TEXT,
  error_message TEXT,
  
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ==================== FUNCTIONS ====================

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE user_wallets 
  SET 
    credits = credits + p_amount,
    total_purchased = total_purchased + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use credits
CREATE OR REPLACE FUNCTION use_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM user_wallets WHERE user_id = p_user_id;
  
  IF current_credits >= p_amount THEN
    UPDATE user_wallets 
    SET 
      credits = credits - p_amount,
      total_used = total_used + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Wallets: Users can view their own wallet
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);

-- Transactions: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Brands: Users can CRUD their own brands
CREATE POLICY "Users can manage own brands" ON brands FOR ALL USING (auth.uid() = user_id);

-- Visual assets: Users can manage assets of their brands
CREATE POLICY "Users can manage own assets" ON visual_assets 
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Campaigns: Users can manage their own campaigns
CREATE POLICY "Users can manage own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);

-- Video jobs: Users can manage their own jobs
CREATE POLICY "Users can manage own video jobs" ON video_jobs FOR ALL USING (auth.uid() = user_id);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_visual_assets_brand_id ON visual_assets(brand_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON video_jobs(user_id);
