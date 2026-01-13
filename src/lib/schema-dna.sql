-- ==================== BRAND DNA & INTELLIGENCE SYSTEM ====================
-- Additional schema for the advanced Brand DNA module
-- Run this AFTER the main schema.sql

-- ==================== COMPETITOR REPORTS ====================
CREATE TABLE IF NOT EXISTS competitor_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Competitor Info
    competitor_name TEXT NOT NULL,
    competitor_url TEXT,
    logo_url TEXT,
    
    -- Analysis Data
    products_services TEXT,
    marketing_angle TEXT,
    target_audience TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    attack_angle TEXT,
    opportunity_score INTEGER CHECK (opportunity_score BETWEEN 1 AND 10),
    
    -- Metadata
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    is_outdated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== BRAND DNA CACHE ====================
-- Cache analyzed URLs to speed up repeat analyses
CREATE TABLE IF NOT EXISTS brand_dna_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url_hash TEXT UNIQUE NOT NULL,
    source_url TEXT NOT NULL,
    dna_data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dna_cache_hash ON brand_dna_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_dna_cache_expires ON brand_dna_cache(expires_at);

-- ==================== EXTEND BRANDS TABLE ====================
-- Add new columns for enhanced Brand DNA

ALTER TABLE brands ADD COLUMN IF NOT EXISTS tagline_suggestions TEXT[];
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_aesthetic TEXT[];
ALTER TABLE brands ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Inter';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS business_summary TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS analysis_source TEXT DEFAULT 'url';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_colors TEXT[] DEFAULT ARRAY['#00d4ff', '#a855f7', '#f97316'];

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE competitor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_dna_cache ENABLE ROW LEVEL SECURITY;

-- Competitor reports: Users can manage reports for their brands
CREATE POLICY "Users can manage own competitor reports" ON competitor_reports 
    FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Cache is readable by all authenticated users (public cache)
CREATE POLICY "Authenticated users can read cache" ON brand_dna_cache 
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only system can write to cache (via service role)
CREATE POLICY "Service role can manage cache" ON brand_dna_cache 
    FOR ALL USING (auth.role() = 'service_role');

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_competitor_reports_brand_id ON competitor_reports(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_last_analyzed ON brands(last_analyzed_at);
