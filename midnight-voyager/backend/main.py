"""
KODAFLOW Marketing - FastAPI Backend
Main application entry point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import uvicorn

# Import modules
from ai_processor import process_product, ProductInfo, AdCopy
from ads_engine import AdsEngine, CampaignConfig, AdCreative, Campaign
from payment_handler import PaymentHandler, PaymentLink, WebhookPayload


# ============== App Configuration ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    print("🚀 KODAFLOW Backend starting...")
    yield
    print("👋 KODAFLOW Backend shutting down...")


app = FastAPI(
    title="KODAFLOW Marketing API",
    description="API backend cho hệ thống Marketing Automation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://kodaflow.vn",
        os.getenv("FRONTEND_URL", "*")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ads_engine = AdsEngine()
payment_handler = PaymentHandler()


# ============== Request/Response Models ==============

class AnalyzeRequest(BaseModel):
    url: str


class AnalyzeResponse(BaseModel):
    product: dict
    ad_copy: dict
    images: dict


class CreateCampaignRequest(BaseModel):
    platform: Literal["google", "facebook", "youtube"]
    product_url: str
    daily_budget: float
    user_id: str


class CreatePaymentRequest(BaseModel):
    amount: int
    user_id: str


class PaymentStatusResponse(BaseModel):
    order_code: str
    status: str
    amount: int


# ============== Health Check ==============

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "kodaflow-backend",
        "version": "1.0.0"
    }


# ============== AI Processing Endpoints ==============

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_product(request: AnalyzeRequest):
    """
    Phân tích URL sản phẩm và tạo nội dung quảng cáo
    
    1. Scrape product info từ URL
    2. Generate ad copy với Gemini
    3. Generate ad images với Flux.1
    """
    try:
        result = await process_product(request.url)
        return AnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============== Campaign Endpoints ==============

@app.post("/api/campaigns", response_model=Campaign)
async def create_campaign(request: CreateCampaignRequest):
    """
    Tạo chiến dịch quảng cáo mới
    
    1. Phân tích sản phẩm
    2. Tạo nội dung quảng cáo
    3. Tạo chiến dịch trên platform
    """
    try:
        # Analyze product
        product_data = await process_product(request.product_url)
        
        # Create campaign config
        config = CampaignConfig(
            name=f"KODAFLOW_{product_data['product']['name'][:30]}",
            daily_budget=request.daily_budget
        )
        
        # Create ad creative from AI-generated content
        creative = AdCreative(
            headlines=product_data["ad_copy"]["headlines"],
            descriptions=product_data["ad_copy"]["descriptions"],
            images=product_data["images"]["variants"],
            final_url=request.product_url
        )
        
        # Create campaign on platform
        campaign = await ads_engine.create_campaign(
            platform=request.platform,
            config=config,
            creative=creative
        )
        
        # TODO: Save to database
        # TODO: Deduct from user wallet
        
        return campaign
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/campaigns/{campaign_id}/metrics")
async def get_campaign_metrics(campaign_id: str, platform: str):
    """Lấy metrics của chiến dịch"""
    try:
        metrics = await ads_engine.get_campaign_metrics(platform, campaign_id)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: str, platform: str):
    """Tạm dừng chiến dịch"""
    try:
        success = await ads_engine.pause_campaign(platform, campaign_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============== Payment Endpoints ==============

@app.post("/api/payment/create", response_model=PaymentLink)
async def create_payment(request: CreatePaymentRequest):
    """
    Tạo link thanh toán PayOS
    
    Returns QR code và checkout URL
    """
    try:
        base_url = os.getenv("BASE_URL", "http://localhost:3000")
        
        payment = await payment_handler.create_payment(
            user_id=request.user_id,
            amount=request.amount,
            base_url=base_url
        )
        
        return payment
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/payment/status", response_model=PaymentStatusResponse)
async def check_payment_status(orderCode: str):
    """Kiểm tra trạng thái thanh toán"""
    try:
        status = await payment_handler.check_payment_status(orderCode)
        return PaymentStatusResponse(
            order_code=status.order_code,
            status=status.status,
            amount=status.amount
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/payment/webhook")
async def payment_webhook(request: Request):
    """
    Webhook endpoint cho PayOS
    
    Nhận callback khi thanh toán hoàn tất
    """
    try:
        payload = await request.json()
        webhook = WebhookPayload(**payload)
        
        success = await payment_handler.handle_webhook(webhook)
        
        return {"success": success}
        
    except Exception as e:
        # Always return 200 to PayOS to avoid retries
        print(f"Webhook error: {e}")
        return {"success": False, "error": str(e)}


# ============== Wallet Endpoints ==============

@app.get("/api/wallet/balance")
async def get_wallet_balance(user_id: str):
    """Lấy số dư ví của user"""
    # TODO: Get from database
    return {
        "user_id": user_id,
        "balance": 500000,
        "currency": "VND"
    }


# ============== Run Server ==============

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
