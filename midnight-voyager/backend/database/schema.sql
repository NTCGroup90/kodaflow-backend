-- ============================================
-- KODAFLOW Marketing Platform - Database Schema
-- PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- WALLET SYSTEM
-- ============================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'VND',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT unique_user_wallet UNIQUE (user_id)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- ============================================
-- TRANSACTIONS (Deposits & Spends)
-- ============================================

CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'SPEND', 'REFUND');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_code VARCHAR(50) UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    payment_provider VARCHAR(20), -- 'PAYOS', 'VIETQR', 'MANUAL'
    campaign_id UUID, -- For SPEND transactions
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_order_code ON transactions(order_code);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================
-- API TOKENS (Encrypted)
-- ============================================

CREATE TYPE platform_type AS ENUM ('GOOGLE_ADS', 'FACEBOOK', 'YOUTUBE');

CREATE TABLE api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_metadata_encrypted TEXT, -- Additional encrypted data
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

CREATE INDEX idx_api_tokens_user_platform ON api_tokens(user_id, platform);

-- ============================================
-- CAMPAIGNS
-- ============================================

CREATE TYPE campaign_status AS ENUM (
    'DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    external_id VARCHAR(255), -- ID từ Google/Facebook
    name VARCHAR(255) NOT NULL,
    product_url TEXT,
    product_data JSONB DEFAULT '{}', -- Cached product info
    ad_copy JSONB DEFAULT '{}', -- Generated ad content
    daily_budget DECIMAL(15,2) NOT NULL,
    total_budget DECIMAL(15,2),
    total_spent DECIMAL(15,2) DEFAULT 0.00,
    status campaign_status DEFAULT 'DRAFT',
    start_date DATE,
    end_date DATE,
    targeting JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);

-- ============================================
-- CAMPAIGN METRICS (Daily snapshots)
-- ============================================

CREATE TABLE campaign_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(15,2) DEFAULT 0.00,
    ctr DECIMAL(10,6), -- Click-through rate
    cpc DECIMAL(15,2), -- Cost per click
    cpa DECIMAL(15,2), -- Cost per acquisition
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_campaign_date UNIQUE (campaign_id, date)
);

CREATE INDEX idx_campaign_metrics_campaign_date ON campaign_metrics(campaign_id, date);

-- ============================================
-- OPTIMIZER RULES
-- ============================================

CREATE TABLE optimizer_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    metric VARCHAR(50) NOT NULL, -- 'CPA', 'CTR', 'SPEND'
    operator VARCHAR(10) NOT NULL, -- '>', '<', '>=', '<=', '='
    threshold DECIMAL(15,2) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'PAUSE', 'ALERT', 'REDUCE_BUDGET'
    is_active BOOLEAN DEFAULT TRUE,
    notification_channels JSONB DEFAULT '["TELEGRAM"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATION SETTINGS
-- ============================================

CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    telegram_chat_id VARCHAR(100),
    zalo_user_id VARCHAR(100),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_notifications UNIQUE (user_id)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create wallet for new user
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_wallet_on_user_create
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Insert test user
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo@kodaflow.vn',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G9D0gK9TptFnhq', -- password: demo123
    'KODAFLOW Demo User'
);

-- Set initial wallet balance
UPDATE wallets 
SET balance = 1000000 
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
