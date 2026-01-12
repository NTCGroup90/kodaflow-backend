# KODAFLOW Marketing Platform - Deployment Guide

## Mục lục
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Setup Local Development](#setup-local-development)
- [Cấu hình PayOS (Thanh toán)](#cấu-hình-payos)
- [Cấu hình Google Ads API](#cấu-hình-google-ads-api)
- [Cấu hình Facebook Marketing API](#cấu-hình-facebook-marketing-api)
- [Deploy Production](#deploy-production)

---

## Yêu cầu hệ thống

### Frontend
- Node.js 18+
- npm hoặc yarn

### Backend
- Python 3.10+
- PostgreSQL 14+

---

## Setup Local Development

### 1. Frontend (Next.js)

```bash
cd midnight-voyager

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Mở http://localhost:3000

### 2. Backend (FastAPI)

```bash
cd midnight-voyager/backend

# Tạo virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
# hoặc
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Database (PostgreSQL)

```bash
# Tạo database
createdb kodaflow

# Chạy schema
psql -d kodaflow -f backend/database/schema.sql
```

---

## Cấu hình PayOS

> ⚠️ **BẮT BUỘC** để nhận thanh toán từ khách hàng

### Bước 1: Đăng ký tài khoản
1. Truy cập https://payos.vn
2. Đăng ký tài khoản Merchant
3. Hoàn thành xác minh doanh nghiệp

### Bước 2: Lấy API Keys
1. Vào Dashboard → Settings → API Keys
2. Copy các giá trị:
   - Client ID
   - API Key  
   - Checksum Key

### Bước 3: Cấu hình Webhook
1. Vào Dashboard → Settings → Webhook
2. Thêm URL: `https://your-domain.com/api/payment/webhook`
3. Chọn event: `paymentLinkSuccess`

### Bước 4: Cập nhật .env
```env
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

---

## Cấu hình Google Ads API

### Bước 1: Tạo Google Cloud Project
1. Truy cập https://console.cloud.google.com
2. Tạo Project mới
3. Enable "Google Ads API"

### Bước 2: Tạo OAuth Credentials
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application type: Web application
4. Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Lưu Client ID và Client Secret

### Bước 3: Đăng ký Developer Token
1. Truy cập https://ads.google.com/aw/apicenter
2. Đăng ký Developer Token
3. Chờ phê duyệt (Basic access cho testing)

### Bước 4: Generate Refresh Token
```python
# Chạy script này để lấy refresh token
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/adwords']

flow = InstalledAppFlow.from_client_secrets_file(
    'client_secrets.json',
    scopes=SCOPES
)

credentials = flow.run_local_server(port=8080)
print(f"Refresh Token: {credentials.refresh_token}")
```

### Bước 5: Cập nhật .env
```env
GOOGLE_ADS_DEVELOPER_TOKEN=your_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret  
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

---

## Cấu hình Facebook Marketing API

### Bước 1: Tạo Facebook App
1. Truy cập https://developers.facebook.com
2. My Apps → Create App
3. Chọn "Business" type
4. Thêm "Marketing API" product

### Bước 2: Lấy Access Token
1. Tools → Graph API Explorer
2. Chọn App của bạn
3. Thêm permissions: `ads_management`, `ads_read`
4. Generate Access Token

### Bước 3: Kết nối Ad Account
1. Vào Business Settings
2. Thêm Ad Account vào App
3. Copy Ad Account ID (bắt đầu bằng `act_`)

### Bước 4: Cập nhật .env
```env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_access_token
FACEBOOK_AD_ACCOUNT_ID=act_123456789
FACEBOOK_PAGE_ID=123456789
```

---

## Deploy Production

### Option 1: Vercel + Railway

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel
```

**Backend (Railway):**
1. Push code lên GitHub
2. Kết nối repository với Railway
3. Thêm PostgreSQL addon
4. Set environment variables

### Option 2: VPS (Ubuntu)

```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm python3 python3-pip postgresql nginx

# Clone repo
git clone your-repo
cd midnight-voyager

# Frontend
npm install
npm run build

# Backend
cd backend
pip install -r requirements.txt

# Nginx config
sudo nano /etc/nginx/sites-available/kodaflow
```

Nginx config:
```nginx
server {
    listen 80;
    server_name kodaflow.vn;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

### SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d kodaflow.vn
```

---

## Checklist triển khai

- [ ] Database PostgreSQL đã setup
- [ ] PayOS đã cấu hình và test webhook
- [ ] Google Ads API đã approved  
- [ ] Facebook App đã verified
- [ ] SSL certificate đã cài
- [ ] Environment variables đã set
- [ ] Monitoring đã setup

---

## Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- Email: support@kodaflow.vn
- Telegram: @kodaflow_support
