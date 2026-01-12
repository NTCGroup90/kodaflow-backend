# KODAFLOW Backend - API Key Setup Guide

Hướng dẫn lấy API keys cho tất cả services.

---

## 1. Supabase (Database + Auth) - BẮT BUỘC

### Bước 1: Tạo project
1. Vào https://supabase.com → Sign up / Login
2. Click **"New Project"**
3. Điền:
   - **Name**: `kodaflow`
   - **Password**: Tạo password mạnh (save lại!)
   - **Region**: Singapore (gần VN nhất)
4. Click **"Create new project"** → Chờ 2 phút

### Bước 2: Lấy API Keys
1. Vào **Project Settings** (icon bánh răng) → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (KHÔNG share!)

---

## 2. Gemini AI (Content Generation) - BẮT BUỘC

1. Vào https://makersuite.google.com/app/apikey
2. Login với Google account
3. Click **"Create API Key"**
4. Chọn project hoặc tạo mới
5. Copy API key → `GEMINI_API_KEY`

> 💡 Free tier: 60 requests/phút, đủ dùng!

---

## 3. Replicate (Image Generation - Flux.1)

1. Vào https://replicate.com → Sign up với GitHub
2. Vào **Account Settings** → **API tokens**
3. Click **"Create token"**
4. Copy token → `REPLICATE_API_TOKEN`

> 💰 Pricing: ~$0.003/ảnh với Flux.1 Schnell

---

## 4. JSON2Video (Video Generation)

1. Vào https://json2video.com → Sign up
2. Vào **Dashboard** → **API Keys**
3. Click **"Generate new API key"**
4. Copy key → `JSON2VIDEO_API_KEY`

> 💰 Pricing: Free tier 10 videos/tháng, Pro $25/100 videos

---

## 5. PayOS (Payment - VietQR)

1. Vào https://payos.vn → Đăng ký doanh nghiệp
2. Hoàn tất KYC (cần CCCD + Giấy phép KD)
3. Sau khi được duyệt, vào **Tích hợp** → **API Keys**
4. Copy:
   - **Client ID** → `PAYOS_CLIENT_ID`
   - **API Key** → `PAYOS_API_KEY`
   - **Checksum Key** → `PAYOS_CHECKSUM_KEY`

> ⚠️ Test mode: Có thể dùng sandbox để test trước

---

## 6. Google Ads API

### Bước 1: Tạo Developer Token
1. Vào https://ads.google.com → Login
2. Vào **Tools & Settings** → **API Center**
3. Apply for **Developer Token** (Basic access)
4. Chờ approval (1-2 ngày)

### Bước 2: OAuth Credentials
1. Vào https://console.cloud.google.com
2. Tạo project mới hoặc chọn existing
3. **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **OAuth Client ID**
5. Chọn **Desktop app**
6. Copy:
   - **Client ID** → `GOOGLE_ADS_CLIENT_ID`
   - **Client Secret** → `GOOGLE_ADS_CLIENT_SECRET`

### Bước 3: Get Refresh Token
```bash
# Dùng OAuth Playground hoặc script để lấy refresh token
# https://developers.google.com/oauthplayground/
```

### Bước 4: Customer ID
1. Vào Google Ads dashboard
2. Copy **Customer ID** (số 10 chữ số) → `GOOGLE_ADS_CUSTOMER_ID`

---

## 7. Meta (Facebook/Instagram Ads)

### Bước 1: Tạo App
1. Vào https://developers.facebook.com
2. **My Apps** → **Create App**
3. Chọn **Business** → **Marketing API**

### Bước 2: Get Credentials
1. Vào app **Settings** → **Basic**:
   - **App ID** → `META_APP_ID`
   - **App Secret** → `META_APP_SECRET`

### Bước 3: Get Access Token
1. Vào **Marketing API** → **Tools** → **Access Token Tool**
2. Generate **System User Access Token**
3. Chọn permissions: `ads_management`, `ads_read`, `business_management`
4. Copy → `META_ACCESS_TOKEN`

### Bước 4: Ad Account ID
1. Vào https://business.facebook.com → **Business Settings**
2. **Accounts** → **Ad Accounts**
3. Copy ID (format: `act_XXXXXXX`) → `META_AD_ACCOUNT_ID`

---

## 8. TikTok Marketing API

### Bước 1: Tạo App
1. Vào https://business-api.tiktok.com/portal/apps
2. Click **"Create App"**
3. Chọn **Marketing API**
4. Điền thông tin app

### Bước 2: Get Credentials
1. Sau khi app được approve:
   - **App ID** → `TIKTOK_APP_ID`
   - **App Secret** → `TIKTOK_APP_SECRET`

### Bước 3: Get Access Token
1. Thực hiện OAuth flow
2. Copy access token → `TIKTOK_ACCESS_TOKEN`

### Bước 4: Advertiser ID
1. Vào TikTok Ads Manager
2. Copy **Advertiser ID** → `TIKTOK_ADVERTISER_ID`

---

## 📋 Checklist API Keys

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=       # ✅ Required
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # ✅ Required
SUPABASE_SERVICE_ROLE_KEY=      # ✅ Required

# AI Services
GEMINI_API_KEY=                 # ✅ Required
REPLICATE_API_TOKEN=            # ✅ Required
JSON2VIDEO_API_KEY=             # Optional (cho video)

# Payment
PAYOS_CLIENT_ID=                # Required cho payment
PAYOS_API_KEY=                  # Required cho payment
PAYOS_CHECKSUM_KEY=             # Required cho payment

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=     # Optional
GOOGLE_ADS_CLIENT_ID=           # Optional
GOOGLE_ADS_CLIENT_SECRET=       # Optional
GOOGLE_ADS_REFRESH_TOKEN=       # Optional
GOOGLE_ADS_CUSTOMER_ID=         # Optional

# Meta Ads
META_APP_ID=                    # Optional
META_APP_SECRET=                # Optional
META_ACCESS_TOKEN=              # Optional
META_AD_ACCOUNT_ID=             # Optional

# TikTok Ads
TIKTOK_APP_ID=                  # Optional
TIKTOK_APP_SECRET=              # Optional
TIKTOK_ACCESS_TOKEN=            # Optional
TIKTOK_ADVERTISER_ID=           # Optional
```

> 💡 **Tip**: Bắt đầu với Supabase + Gemini + Replicate trước. Các Ad platform APIs có thể thêm sau!
