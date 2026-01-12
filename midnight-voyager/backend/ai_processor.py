"""
KODA-Creative: AI Content Engine
Sử dụng Gemini 1.5 Pro để phân tích sản phẩm và tạo nội dung quảng cáo
"""

import os
import json
import httpx
from typing import Optional
from dataclasses import dataclass
from pydantic import BaseModel


# ============== Data Models ==============

class ProductInfo(BaseModel):
    """Thông tin sản phẩm trích xuất từ URL"""
    name: str
    price: str
    original_price: Optional[str] = None
    description: str
    features: list[str]
    images: list[str]
    category: str
    brand: Optional[str] = None
    rating: Optional[float] = None
    sold_count: Optional[int] = None


class AdCopy(BaseModel):
    """Nội dung quảng cáo được tạo bởi AI"""
    headlines: list[str]  # 5 tiêu đề
    descriptions: list[str]  # 5 mô tả
    call_to_actions: list[str]  # CTA variations
    keywords: list[str]  # Từ khóa target


class GeneratedImages(BaseModel):
    """Hình ảnh quảng cáo được tạo"""
    original: str
    variants: list[str]  # 5 biến thể


# ============== Gemini API Integration ==============

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"


async def analyze_product_url(url: str) -> ProductInfo:
    """
    Sử dụng Gemini để cào và phân tích thông tin sản phẩm từ URL
    
    1. Fetch HTML từ URL
    2. Gửi cho Gemini phân tích
    3. Trả về ProductInfo
    """
    
    # Fetch HTML content
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, follow_redirects=True, timeout=30)
            html_content = response.text[:50000]  # Limit to 50k chars
        except Exception as e:
            raise ValueError(f"Không thể truy cập URL: {str(e)}")
    
    # Prepare Gemini prompt
    prompt = f"""
    Phân tích trang sản phẩm sau và trích xuất thông tin theo format JSON.
    
    HTML Content (đã rút gọn):
    {html_content[:20000]}
    
    Trả về JSON với format:
    {{
        "name": "Tên sản phẩm",
        "price": "Giá hiện tại (VND)",
        "original_price": "Giá gốc nếu có",
        "description": "Mô tả ngắn gọn",
        "features": ["Đặc điểm 1", "Đặc điểm 2", ...],
        "images": ["URL hình 1", "URL hình 2", ...],
        "category": "Danh mục sản phẩm",
        "brand": "Thương hiệu",
        "rating": 4.5,
        "sold_count": 1000
    }}
    
    CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.
    """
    
    # Call Gemini API
    gemini_response = await call_gemini(prompt)
    
    # Parse response
    try:
        product_data = json.loads(gemini_response)
        return ProductInfo(**product_data)
    except json.JSONDecodeError:
        # Fallback: try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', gemini_response, re.DOTALL)
        if json_match:
            product_data = json.loads(json_match.group())
            return ProductInfo(**product_data)
        raise ValueError("Không thể phân tích thông tin sản phẩm")


async def generate_ad_copy(product: ProductInfo) -> AdCopy:
    """
    Tạo nội dung quảng cáo tiếng Việt theo công thức AIDA
    (Attention - Interest - Desire - Action)
    """
    
    prompt = f"""
    Bạn là chuyên gia viết quảng cáo tiếng Việt. Tạo nội dung quảng cáo cho sản phẩm sau:
    
    Tên: {product.name}
    Giá: {product.price}
    Mô tả: {product.description}
    Đặc điểm: {', '.join(product.features[:5])}
    Danh mục: {product.category}
    
    YÊU CẦU:
    1. Viết 5 TIÊU ĐỀ (tối đa 30 ký tự mỗi tiêu đề):
       - Gây chú ý mạnh
       - Có số liệu hoặc % giảm giá
       - Gợi tò mò
       
    2. Viết 5 MÔ TẢ (tối đa 90 ký tự mỗi mô tả):
       - Nhấn mạnh lợi ích
       - Tạo urgency (khẩn cấp)
       - Call to action rõ ràng
       
    3. Viết 3 CALL TO ACTION ngắn gọn
    
    4. Gợi ý 10 TỪ KHÓA để target quảng cáo
    
    Trả về JSON format:
    {{
        "headlines": ["Tiêu đề 1", "Tiêu đề 2", ...],
        "descriptions": ["Mô tả 1", "Mô tả 2", ...],
        "call_to_actions": ["CTA 1", "CTA 2", "CTA 3"],
        "keywords": ["từ khóa 1", "từ khóa 2", ...]
    }}
    
    CHỈ TRẢ VỀ JSON.
    """
    
    response = await call_gemini(prompt)
    
    try:
        ad_data = json.loads(response)
        return AdCopy(**ad_data)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            ad_data = json.loads(json_match.group())
            return AdCopy(**ad_data)
        
        # Fallback với nội dung mẫu
        return AdCopy(
            headlines=[
                f"🔥 {product.name[:20]} - Giảm 50%",
                "Flash Sale - Số lượng có hạn",
                "Mua ngay - Freeship toàn quốc",
                f"Hot deal {product.category}",
                "Ưu đãi độc quyền hôm nay"
            ],
            descriptions=[
                f"{product.name} - Chất lượng cao, giá tốt nhất thị trường",
                "Miễn phí vận chuyển + Đổi trả 30 ngày. Đặt mua ngay!",
                f"Sale sốc {product.category}! Chỉ còn hôm nay",
                "Hàng chính hãng 100% - Bảo hành uy tín",
                "Mua nhiều giảm nhiều - Ưu đãi số lượng lớn"
            ],
            call_to_actions=["Mua ngay", "Xem chi tiết", "Đặt hàng"],
            keywords=[product.category, product.name.split()[0], "giá rẻ", "chính hãng"]
        )


async def call_gemini(prompt: str) -> str:
    """Helper function để gọi Gemini API"""
    
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY chưa được cấu hình")
    
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        if response.status_code != 200:
            raise ValueError(f"Gemini API error: {response.text}")
        
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


# ============== Image Generation (Flux.1 / Replicate) ==============

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")


async def generate_ad_images(product: ProductInfo) -> GeneratedImages:
    """
    Tạo 5 biến thể hình ảnh quảng cáo từ hình gốc
    Sử dụng Flux.1 qua Replicate API
    """
    
    if not product.images:
        return GeneratedImages(original="", variants=[])
    
    original_image = product.images[0]
    
    # Các style cho 5 biến thể
    styles = [
        "professional product photography, white background, studio lighting",
        "lifestyle shot, modern interior, warm lighting",
        "minimalist design, gradient background, clean aesthetic",
        "vibrant colors, dynamic composition, eye-catching",
        "premium luxury feel, dark background, dramatic lighting"
    ]
    
    variants = []
    
    for style in styles:
        prompt = f"{product.name}, {style}, high quality, 4k, commercial photography"
        
        try:
            image_url = await generate_image_replicate(prompt, original_image)
            variants.append(image_url)
        except Exception as e:
            print(f"Image generation error: {e}")
            variants.append(original_image)  # Fallback to original
    
    return GeneratedImages(original=original_image, variants=variants)


async def generate_image_replicate(prompt: str, reference_image: Optional[str] = None) -> str:
    """Gọi Replicate API để tạo hình ảnh"""
    
    if not REPLICATE_API_TOKEN:
        # Return placeholder if no API key
        return f"https://placehold.co/800x800/1a1a2e/6366f1?text=Generated+Image"
    
    headers = {
        "Authorization": f"Token {REPLICATE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Using Flux.1 Schnell model
    payload = {
        "version": "black-forest-labs/flux-schnell",
        "input": {
            "prompt": prompt,
            "num_outputs": 1,
            "aspect_ratio": "1:1",
            "output_format": "webp"
        }
    }
    
    async with httpx.AsyncClient() as client:
        # Create prediction
        response = await client.post(
            "https://api.replicate.com/v1/predictions",
            json=payload,
            headers=headers,
            timeout=60
        )
        
        if response.status_code != 201:
            raise ValueError(f"Replicate API error: {response.text}")
        
        prediction = response.json()
        prediction_id = prediction["id"]
        
        # Poll for completion
        for _ in range(60):  # Max 60 seconds
            await asyncio.sleep(1)
            
            status_response = await client.get(
                f"https://api.replicate.com/v1/predictions/{prediction_id}",
                headers=headers
            )
            
            status_data = status_response.json()
            
            if status_data["status"] == "succeeded":
                return status_data["output"][0]
            elif status_data["status"] == "failed":
                raise ValueError(f"Image generation failed: {status_data.get('error')}")
        
        raise ValueError("Image generation timeout")


# ============== Main Processing Pipeline ==============

async def process_product(url: str) -> dict:
    """
    Pipeline chính: URL -> ProductInfo -> AdCopy + Images
    """
    
    # Step 1: Phân tích URL
    product = await analyze_product_url(url)
    
    # Step 2: Tạo nội dung quảng cáo (song song với tạo hình)
    import asyncio
    ad_copy_task = generate_ad_copy(product)
    images_task = generate_ad_images(product)
    
    ad_copy, images = await asyncio.gather(ad_copy_task, images_task)
    
    return {
        "product": product.model_dump(),
        "ad_copy": ad_copy.model_dump(),
        "images": images.model_dump()
    }


# ============== Test ==============

if __name__ == "__main__":
    import asyncio
    
    async def test():
        result = await process_product("https://shopee.vn/example-product")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    asyncio.run(test())
