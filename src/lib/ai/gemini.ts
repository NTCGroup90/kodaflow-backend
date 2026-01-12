/**
 * Gemini AI Integration
 * Uses Gemini 1.5 Flash for content analysis and generation
 * Uses Imagen 3 for image generation
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const IMAGEN_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages';



// ==================== Image Generation Types ====================

export interface ImageGenerationOptions {
    prompt: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    numberOfImages?: number;
    style?: 'photorealistic' | 'artistic' | 'product' | 'banner';
    negativePrompt?: string;
}

export interface GeneratedImage {
    url: string; // Base64 data URL
    mimeType: string;
    prompt: string;
}

// ==================== Style Prompt Enhancements ====================

const STYLE_PROMPTS: Record<string, string> = {
    photorealistic: 'photorealistic, high quality, 4k, professional photography, sharp details',
    artistic: 'artistic style, creative composition, vivid colors, expressive',
    product: 'professional product photography, white background, studio lighting, commercial quality',
    banner: 'advertising banner, marketing material, eye-catching design, professional layout',
};

// ==================== Image Generation with Imagen 3 ====================

export async function generateImage(
    options: ImageGenerationOptions
): Promise<GeneratedImage[]> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Enhance prompt with style
    const stylePrompt = options.style ? STYLE_PROMPTS[options.style] : '';
    const fullPrompt = `${options.prompt}, ${stylePrompt}`.trim();

    const payload: any = {
        instances: [
            {
                prompt: fullPrompt,
            },
        ],
        parameters: {
            sampleCount: options.numberOfImages || 1,
            aspectRatio: options.aspectRatio || '1:1',
        },
    };

    if (options.negativePrompt) {
        payload.parameters.negativePrompt = options.negativePrompt;
    }

    const response = await fetch(`${IMAGEN_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Imagen API error: ${error}`);
    }

    const data = await response.json();

    // Parse response - Imagen returns base64 encoded images
    const images: GeneratedImage[] = [];

    if (data.predictions) {
        for (const prediction of data.predictions) {
            const imageData = prediction.bytesBase64Encoded;
            const mimeType = prediction.mimeType || 'image/png';

            images.push({
                url: `data:${mimeType};base64,${imageData}`,
                mimeType,
                prompt: fullPrompt,
            });
        }
    }

    return images;
}

// ==================== Quick Image Generation Helpers ====================

export async function generateProductImage(
    productName: string,
    description?: string
): Promise<GeneratedImage> {
    const prompt = description
        ? `${productName}, ${description}`
        : productName;

    const images = await generateImage({
        prompt,
        style: 'product',
        aspectRatio: '1:1',
        numberOfImages: 1,
    });

    return images[0];
}

export async function generateAdBanner(options: {
    productName: string;
    headline?: string;
    aspectRatio?: '16:9' | '1:1' | '9:16';
}): Promise<GeneratedImage> {
    const prompt = options.headline
        ? `Advertising banner for "${options.productName}" with text "${options.headline}"`
        : `Professional advertising banner for "${options.productName}"`;

    const images = await generateImage({
        prompt,
        style: 'banner',
        aspectRatio: options.aspectRatio || '16:9',
        numberOfImages: 1,
    });

    return images[0];
}

export async function generateMultipleVariants(
    basePrompt: string,
    count: number = 4
): Promise<GeneratedImage[]> {
    return generateImage({
        prompt: basePrompt,
        style: 'product',
        numberOfImages: Math.min(count, 4), // Imagen max 4 per request
    });
}

export interface GeminiResponse {
    text: string;
    tokens?: number;
}

export interface ProductAnalysis {
    productName: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    images: string[];
    category: string;
    brand?: string;
    rating?: number;
    soldCount?: number;
}

export interface AdCopy {
    headlines: string[];
    descriptions: string[];
    callToActions: string[];
    keywords: string[];
}

// ==================== Core Gemini API Call ====================

export async function callGemini(
    prompt: string,
    options: {
        temperature?: number;
        maxTokens?: number;
    } = {}
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 4096,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ==================== Product URL Analysis ====================

export async function analyzeProductUrl(url: string): Promise<ProductAnalysis> {
    // Extract domain for fallback
    let domain = '';
    try {
        domain = new URL(url).hostname.replace('www.', '');
    } catch {
        domain = 'Unknown';
    }

    // Fetch HTML content
    let htmlContent = '';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        htmlContent = await response.text();
        // Limit to first 30k characters
        htmlContent = htmlContent.substring(0, 30000);
    } catch (error) {
        console.error(`Cannot fetch URL: ${url}`, error);
        // Return fallback with domain name
        return {
            productName: domain,
            price: 'Liên hệ',
            description: `Website: ${domain}`,
            features: ['Xem chi tiết tại website'],
            images: [],
            category: 'Sản phẩm/Dịch vụ',
        };
    }

    const prompt = `
Phân tích trang sản phẩm sau và trích xuất thông tin theo format JSON.

HTML Content (đã rút gọn):
${htmlContent.substring(0, 10000)}

Trả về JSON với format CHÍNH XÁC như sau:

{
  "productName": "Tên sản phẩm đầy đủ",
  "price": "Giá hiện tại (VND)",
  "originalPrice": "Giá gốc nếu có, null nếu không",
  "description": "Mô tả ngắn gọn sản phẩm",
  "features": ["Đặc điểm 1", "Đặc điểm 2", "Đặc điểm 3"],
  "images": ["URL hình 1", "URL hình 2"],
  "category": "Danh mục sản phẩm",
  "brand": "Thương hiệu nếu có",
  "rating": 4.5,
  "soldCount": 1000
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.
`;

    try {
        const response = await callGemini(prompt, { temperature: 0.3 });

        // Try to parse JSON directly
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            return JSON.parse(cleaned);
        } catch {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Cannot parse JSON');
        }
    } catch (error) {
        console.error('Gemini analysis failed:', error);
        // Return fallback
        return {
            productName: domain,
            price: 'Liên hệ',
            description: `Đã phân tích từ: ${url}`,
            features: ['Thông tin từ website'],
            images: [],
            category: 'Sản phẩm/Dịch vụ',
        };
    }
}


// ==================== Ad Copy Generation ====================

export async function generateAdCopy(
    product: ProductAnalysis,
    platform: 'google' | 'facebook' | 'tiktok' = 'google'
): Promise<AdCopy> {
    const platformLimits = {
        google: { headline: 30, description: 90 },
        facebook: { headline: 40, description: 125 },
        tiktok: { headline: 50, description: 100 },
    };

    const limits = platformLimits[platform];

    const prompt = `
Bạn là chuyên gia viết quảng cáo tiếng Việt. Tạo nội dung quảng cáo cho sản phẩm sau:

Tên: ${product.productName}
Giá: ${product.price}
Mô tả: ${product.description}
Đặc điểm: ${product.features.slice(0, 5).join(', ')}
Danh mục: ${product.category}

YÊU CẦU:
1. Viết 5 TIÊU ĐỀ (tối đa ${limits.headline} ký tự mỗi tiêu đề):
   - Gây chú ý mạnh
   - Có số liệu hoặc % giảm giá
   - Gợi tò mò
   
2. Viết 5 MÔ TẢ (tối đa ${limits.description} ký tự mỗi mô tả):
   - Nhấn mạnh lợi ích
   - Tạo urgency (khẩn cấp)
   - Call to action rõ ràng
   
3. Viết 3 CALL TO ACTION ngắn gọn

4. Gợi ý 10 TỪ KHÓA để target quảng cáo

Trả về JSON format:
{
  "headlines": ["Tiêu đề 1", "Tiêu đề 2", ...],
  "descriptions": ["Mô tả 1", "Mô tả 2", ...],
  "callToActions": ["CTA 1", "CTA 2", "CTA 3"],
  "keywords": ["từ khóa 1", "từ khóa 2", ...]
}

CHỈ TRẢ VỀ JSON.
`;

    const response = await callGemini(prompt, { temperature: 0.8 });

    try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback with default content
        return {
            headlines: [
                `🔥 ${product.productName.substring(0, 20)} - Giảm 50%`,
                'Flash Sale - Số lượng có hạn',
                'Mua ngay - Freeship toàn quốc',
            ],
            descriptions: [
                `${product.productName} - Chất lượng cao, giá tốt nhất`,
                'Miễn phí vận chuyển + Đổi trả 30 ngày',
            ],
            callToActions: ['Mua ngay', 'Xem chi tiết', 'Đặt hàng'],
            keywords: [product.category, 'giá rẻ', 'chính hãng'],
        };
    }
}

// ==================== Brand DNA Generation ====================

export interface BrandDNA {
    slogan: string;
    missionStatement: string;
    coreValues: string[];
    toneOfVoice: 'professional' | 'friendly' | 'bold' | 'playful';
    voiceAttributes: string[];
    targetAudience: {
        ageRange: string;
        gender: string;
        interests: string[];
    };
    brandColors: string[];
}

export async function generateBrandDNA(product: ProductAnalysis): Promise<BrandDNA> {
    const prompt = `
Dựa trên sản phẩm sau, tạo Brand DNA (định vị thương hiệu) phù hợp:

Sản phẩm: ${product.productName}
Danh mục: ${product.category}
Mô tả: ${product.description}
Thương hiệu: ${product.brand || 'Chưa xác định'}

Trả về JSON với format:
{
  "slogan": "Khẩu hiệu ngắn gọn, ấn tượng",
  "missionStatement": "Sứ mệnh thương hiệu",
  "coreValues": ["Giá trị 1", "Giá trị 2", "Giá trị 3"],
  "toneOfVoice": "professional" | "friendly" | "bold" | "playful",
  "voiceAttributes": ["Đặc điểm giọng nói 1", "Đặc điểm 2"],
  "targetAudience": {
    "ageRange": "25-45",
    "gender": "all" | "male" | "female",
    "interests": ["Sở thích 1", "Sở thích 2"]
  },
  "brandColors": ["#HEX1", "#HEX2", "#HEX3"]
}

CHỈ TRẢ VỀ JSON.
`;

    const response = await callGemini(prompt, { temperature: 0.7 });

    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
}
