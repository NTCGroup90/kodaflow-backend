"""
KODA-Ads: Backend API Integration
Kết nối với Google Ads API và Meta Graph API để tạo và quản lý chiến dịch
"""

import os
import json
from datetime import datetime, timedelta
from typing import Optional, Literal
from dataclasses import dataclass
from pydantic import BaseModel
import httpx


# ============== Data Models ==============

class CampaignConfig(BaseModel):
    """Cấu hình chiến dịch quảng cáo"""
    name: str
    daily_budget: float  # VND
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    objective: str = "CONVERSIONS"
    

class AdGroupConfig(BaseModel):
    """Cấu hình nhóm quảng cáo"""
    name: str
    targeting: dict  # Keywords, demographics, etc.
    bid_amount: Optional[float] = None


class AdCreative(BaseModel):
    """Nội dung quảng cáo"""
    headlines: list[str]
    descriptions: list[str]
    images: list[str]
    final_url: str
    call_to_action: str = "SHOP_NOW"


class Campaign(BaseModel):
    """Chiến dịch đã tạo"""
    id: str
    platform: str
    name: str
    status: str
    daily_budget: float
    external_id: Optional[str] = None


# ============== Google Ads API Integration ==============

class GoogleAdsClient:
    """
    Client để tương tác với Google Ads API
    Yêu cầu: Developer Token, OAuth credentials
    """
    
    def __init__(self):
        self.developer_token = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "")
        self.client_id = os.getenv("GOOGLE_ADS_CLIENT_ID", "")
        self.client_secret = os.getenv("GOOGLE_ADS_CLIENT_SECRET", "")
        self.refresh_token = os.getenv("GOOGLE_ADS_REFRESH_TOKEN", "")
        self.customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "")
        
        self.base_url = "https://googleads.googleapis.com/v15"
        self.access_token: Optional[str] = None
    
    async def _get_access_token(self) -> str:
        """Refresh OAuth access token"""
        if self.access_token:
            return self.access_token
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "refresh_token": self.refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            
            if response.status_code != 200:
                raise ValueError(f"OAuth error: {response.text}")
            
            data = response.json()
            self.access_token = data["access_token"]
            return self.access_token
    
    async def _make_request(self, method: str, endpoint: str, data: dict = None) -> dict:
        """Make authenticated request to Google Ads API"""
        token = await self._get_access_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "developer-token": self.developer_token,
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            if method == "POST":
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    json=data,
                    headers=headers,
                    timeout=30
                )
            else:
                response = await client.get(
                    f"{self.base_url}/{endpoint}",
                    headers=headers,
                    timeout=30
                )
            
            if response.status_code not in [200, 201]:
                raise ValueError(f"Google Ads API error: {response.text}")
            
            return response.json()
    
    async def create_campaign(self, config: CampaignConfig) -> Campaign:
        """
        Tạo chiến dịch Google Ads mới
        
        Flow:
        1. Tạo Campaign Budget
        2. Tạo Campaign
        3. Return Campaign ID
        """
        
        # Convert VND to micros (Google uses micro currency units)
        budget_micros = int(config.daily_budget * 1_000_000)
        
        # Create campaign budget
        budget_operation = {
            "create": {
                "name": f"Budget_{config.name}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "deliveryMethod": "STANDARD",
                "amountMicros": str(budget_micros),
                "explicitlyShared": False
            }
        }
        
        # Create campaign
        campaign_operation = {
            "create": {
                "name": config.name,
                "advertisingChannelType": "SEARCH",
                "status": "PAUSED",  # Start paused for review
                "biddingStrategyType": "MAXIMIZE_CONVERSIONS",
                "startDate": config.start_date or datetime.now().strftime("%Y-%m-%d"),
                "endDate": config.end_date
            }
        }
        
        # Note: In production, you'd use mutate operations
        # This is simplified for demo purposes
        
        return Campaign(
            id=f"google_{datetime.now().timestamp()}",
            platform="google",
            name=config.name,
            status="PAUSED",
            daily_budget=config.daily_budget,
            external_id=None  # Would be returned from actual API
        )
    
    async def create_adgroup(self, campaign_id: str, config: AdGroupConfig) -> dict:
        """Tạo nhóm quảng cáo trong chiến dịch"""
        
        adgroup_operation = {
            "create": {
                "name": config.name,
                "campaign": f"customers/{self.customer_id}/campaigns/{campaign_id}",
                "status": "ENABLED",
                "type": "SEARCH_STANDARD"
            }
        }
        
        return {
            "id": f"adgroup_{datetime.now().timestamp()}",
            "name": config.name,
            "campaign_id": campaign_id
        }
    
    async def create_responsive_search_ad(
        self, 
        adgroup_id: str, 
        creative: AdCreative
    ) -> dict:
        """
        Tạo Responsive Search Ad
        - Tối đa 15 headlines
        - Tối đa 4 descriptions
        - Google tự động test combinations
        """
        
        # Format headlines (max 30 chars each)
        headlines = [
            {"text": h[:30]} 
            for h in creative.headlines[:15]
        ]
        
        # Format descriptions (max 90 chars each)
        descriptions = [
            {"text": d[:90]} 
            for d in creative.descriptions[:4]
        ]
        
        ad_operation = {
            "create": {
                "adGroup": f"customers/{self.customer_id}/adGroups/{adgroup_id}",
                "responsiveSearchAd": {
                    "headlines": headlines,
                    "descriptions": descriptions,
                    "finalUrls": [creative.final_url]
                },
                "status": "ENABLED"
            }
        }
        
        return {
            "id": f"ad_{datetime.now().timestamp()}",
            "adgroup_id": adgroup_id,
            "type": "RESPONSIVE_SEARCH_AD"
        }


# ============== Meta (Facebook) Ads API Integration ==============

class MetaAdsClient:
    """
    Client để tương tác với Meta Marketing API
    Yêu cầu: App ID, App Secret, Access Token
    """
    
    def __init__(self):
        self.app_id = os.getenv("FACEBOOK_APP_ID", "")
        self.app_secret = os.getenv("FACEBOOK_APP_SECRET", "")
        self.access_token = os.getenv("FACEBOOK_ACCESS_TOKEN", "")
        self.ad_account_id = os.getenv("FACEBOOK_AD_ACCOUNT_ID", "")
        
        self.base_url = "https://graph.facebook.com/v18.0"
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: dict = None
    ) -> dict:
        """Make authenticated request to Meta API"""
        
        params = {"access_token": self.access_token}
        
        async with httpx.AsyncClient() as client:
            if method == "POST":
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    params=params,
                    json=data,
                    timeout=30
                )
            else:
                response = await client.get(
                    f"{self.base_url}/{endpoint}",
                    params={**params, **(data or {})},
                    timeout=30
                )
            
            if response.status_code not in [200, 201]:
                raise ValueError(f"Meta API error: {response.text}")
            
            return response.json()
    
    async def create_campaign(self, config: CampaignConfig) -> Campaign:
        """
        Tạo chiến dịch Facebook/Instagram Ads
        
        Objectives:
        - OUTCOME_AWARENESS
        - OUTCOME_ENGAGEMENT
        - OUTCOME_LEADS
        - OUTCOME_SALES
        - OUTCOME_TRAFFIC
        """
        
        campaign_data = {
            "name": config.name,
            "objective": "OUTCOME_SALES",
            "status": "PAUSED",
            "special_ad_categories": []
        }
        
        # In production:
        # result = await self._make_request(
        #     "POST",
        #     f"act_{self.ad_account_id}/campaigns",
        #     campaign_data
        # )
        
        return Campaign(
            id=f"facebook_{datetime.now().timestamp()}",
            platform="facebook",
            name=config.name,
            status="PAUSED",
            daily_budget=config.daily_budget,
            external_id=None
        )
    
    async def create_adset(
        self, 
        campaign_id: str, 
        config: AdGroupConfig,
        daily_budget: float
    ) -> dict:
        """
        Tạo Ad Set (tương đương AdGroup trong Google)
        Bao gồm targeting và budget
        """
        
        # Convert to cents (Meta uses the smallest currency unit)
        budget_cents = int(daily_budget * 100)
        
        adset_data = {
            "name": config.name,
            "campaign_id": campaign_id,
            "daily_budget": budget_cents,
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "OFFSITE_CONVERSIONS",
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "targeting": {
                "geo_locations": {
                    "countries": ["VN"]
                },
                "age_min": 18,
                "age_max": 65,
                "publisher_platforms": ["facebook", "instagram"]
            },
            "status": "PAUSED"
        }
        
        return {
            "id": f"adset_{datetime.now().timestamp()}",
            "name": config.name,
            "campaign_id": campaign_id
        }
    
    async def create_ad(
        self, 
        adset_id: str, 
        creative: AdCreative
    ) -> dict:
        """
        Tạo quảng cáo với creative
        
        Bao gồm:
        - Image/Video
        - Headline, Description
        - CTA button
        - Link
        """
        
        # First, upload image and create creative
        ad_creative_data = {
            "name": f"Creative_{datetime.now().timestamp()}",
            "object_story_spec": {
                "page_id": os.getenv("FACEBOOK_PAGE_ID"),
                "link_data": {
                    "link": creative.final_url,
                    "message": creative.descriptions[0] if creative.descriptions else "",
                    "name": creative.headlines[0] if creative.headlines else "",
                    "call_to_action": {
                        "type": creative.call_to_action,
                        "value": {"link": creative.final_url}
                    }
                }
            }
        }
        
        # Then create ad
        ad_data = {
            "name": f"Ad_{datetime.now().timestamp()}",
            "adset_id": adset_id,
            "creative": {"creative_id": "CREATIVE_ID_HERE"},
            "status": "PAUSED"
        }
        
        return {
            "id": f"ad_{datetime.now().timestamp()}",
            "adset_id": adset_id,
            "type": "LINK_AD"
        }


# ============== Unified Ads Engine ==============

class AdsEngine:
    """
    Engine thống nhất để tạo quảng cáo trên nhiều nền tảng
    """
    
    def __init__(self):
        self.google_client = GoogleAdsClient()
        self.meta_client = MetaAdsClient()
    
    async def create_campaign(
        self,
        platform: Literal["google", "facebook", "youtube"],
        config: CampaignConfig,
        creative: AdCreative
    ) -> Campaign:
        """
        Tạo chiến dịch hoàn chỉnh trên platform được chọn
        
        1. Tạo Campaign
        2. Tạo AdGroup/AdSet
        3. Tạo Ad với creative
        4. Return Campaign info
        """
        
        if platform == "google" or platform == "youtube":
            # YouTube ads created through Google Ads
            campaign = await self.google_client.create_campaign(config)
            
            adgroup = await self.google_client.create_adgroup(
                campaign.external_id or campaign.id,
                AdGroupConfig(
                    name=f"{config.name}_AdGroup",
                    targeting={"keywords": ["keyword1", "keyword2"]}
                )
            )
            
            ad = await self.google_client.create_responsive_search_ad(
                adgroup["id"],
                creative
            )
            
            return campaign
            
        elif platform == "facebook":
            campaign = await self.meta_client.create_campaign(config)
            
            adset = await self.meta_client.create_adset(
                campaign.external_id or campaign.id,
                AdGroupConfig(
                    name=f"{config.name}_AdSet",
                    targeting={}
                ),
                config.daily_budget
            )
            
            ad = await self.meta_client.create_ad(
                adset["id"],
                creative
            )
            
            return campaign
        
        else:
            raise ValueError(f"Unsupported platform: {platform}")
    
    async def pause_campaign(
        self, 
        platform: str, 
        campaign_id: str
    ) -> bool:
        """Tạm dừng chiến dịch"""
        # Implementation would update campaign status via API
        return True
    
    async def resume_campaign(
        self, 
        platform: str, 
        campaign_id: str
    ) -> bool:
        """Tiếp tục chạy chiến dịch"""
        return True
    
    async def get_campaign_metrics(
        self, 
        platform: str, 
        campaign_id: str
    ) -> dict:
        """Lấy metrics của chiến dịch"""
        
        # Placeholder metrics
        return {
            "impressions": 10000,
            "clicks": 200,
            "spend": 150000,
            "conversions": 5,
            "ctr": 0.02,
            "cpc": 750,
            "cpa": 30000
        }


# ============== Test ==============

if __name__ == "__main__":
    import asyncio
    
    async def test():
        engine = AdsEngine()
        
        campaign = await engine.create_campaign(
            platform="google",
            config=CampaignConfig(
                name="Test Campaign",
                daily_budget=200000
            ),
            creative=AdCreative(
                headlines=["Sale 50%", "Mua ngay", "Giá tốt"],
                descriptions=["Sản phẩm chất lượng cao"],
                images=["https://example.com/image.jpg"],
                final_url="https://example.com/product"
            )
        )
        
        print(f"Created campaign: {campaign}")
    
    asyncio.run(test())
