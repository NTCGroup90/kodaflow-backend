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
    brandDNA?: {
        slogan?: string;
        mission?: string;
        values?: string[];
        toneOfVoice?: string[];
        aesthetics?: string[];
        painPoints?: string[];
        brandColors?: string[];
        fonts?: string[];
        keywords?: string[];
    };
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

    // Fetch HTML content with better headers
    let htmlContent = '';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        htmlContent = await response.text();
        // Increase limit to capture more context for brand analysis
        htmlContent = htmlContent.substring(0, 45000);
    } catch (error) {
        console.error(`Cannot fetch URL: ${url}`, error);
        // Basic fallback
        return {
            productName: domain,
            price: 'Liên hệ',
            description: `Website: ${domain}`,
            features: ['Xem chi tiết tại website'],
            images: [],
            category: 'Sản phẩm/Dịch vụ',
            brandDNA: {
                slogan: `Chào mừng đến với ${domain}`,
                mission: "Cung cấp dịch vụ chất lượng cao",
                values: ["Chất lượng", "Uy tín", "Tận tâm"],
                toneOfVoice: ["Chuyên nghiệp", "Tin cậy"],
                aesthetics: ["Hiện đại", "Sạch sẽ"],
                keywords: [],
                brandColors: ["#000000", "#ffffff", "#0088ff"]
            }
        };
    }

    const prompt = `
Bạn là một chuyên gia Chiến lược Thương hiệu (Brand Strategist) đẳng cấp thế giới. 
Nhiệm vụ của bạn là phân tích HTML file của một landing page và giải mã "Brand DNA" của doanh nghiệp đó.

URL: ${url}
HTML Content (đã rút gọn):
${htmlContent}

Hãy phân tích sâu và trích xuất thông tin theo format JSON sau. 
Nếu không tìm thấy thông tin cụ thể, hãy SUY LUẬN (INFER) dựa trên context, màu sắc, cách dùng từ của web. Đừng để trống.

YÊU CẦU PHÂN TÍCH:
1. **Tagline/Slogan**: Tìm câu khẩu hiệu chính (H1, H2 đầu trang). Nếu không có, hãy sáng tạo một câu tagline đắt giá (dưới 10 từ) tóm tắt giá trị cốt lõi.
2. **Brand Values**: 3-5 giá trị cốt lõi (VD: Tốc độ, Bảo mật, Sáng tạo).
3. **Tone of Voice**: Giọng văn (VD: Authoritative, Friendly, Luxury, Witty, Urgent).
4. **Brand Aesthetics**: Phong cách thiết kế (VD: Minimalist, Cyberpunk, Corporate, Retro, High-End).
5. **Business Overview**: 2 câu tóm tắt doanh nghiệp này làm gì, bán gì, giải quyết vấn đề gì.
6. **Colors**: Trích xuất 3-5 mã màu HEX chính từ CSS style hoặc suy luận từ ảnh/logo.
7. **User Pain Points**: 3 vấn đề lớn nhất mà khách hàng của họ đang gặp phải.

OUTPUT JSON FORMAT (Bắt buộc):
{
  "productName": "Tên Thương Hiệu / Sản Phẩm",
  "category": "Ngành hàng",
  "description": "Business Overview (2-3 sentences)",
  "brandDNA": {
    "slogan": "Tagline chính",
    "values": ["Value 1", "Value 2", "Value 3", "Value 4"],
    "toneOfVoice": ["Tone 1", "Tone 2", "Tone 3"],
    "aesthetics": ["Style 1", "Style 2", "Style 3"],
    "painPoints": ["Pain Point 1", "Pain Point 2", "Pain Point 3"],
    "brandColors": ["#Hex1", "#Hex2", "#Hex3", "#Hex4", "#Hex5"]
  },
  "price": "Giá (nếu có)",
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}

LƯU Ý: JSON phải hợp lệ. Không trả về markdown. Chỉ JSON.
`;

    try {
        const response = await callGemini(prompt, { temperature: 0.4 }); // Slightly higher temp for creativity in inference

        // Parsing logic
        let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Remove comments if any
        cleaned = cleaned.replace(/\/\/.*$/gm, '');

        try {
            return JSON.parse(cleaned);
        } catch {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('JSON Parse Failed');
        }
    } catch (error) {
        console.error('Gemini Brand Analysis failed:', error);
        return {
            productName: domain,
            price: 'Liên hệ',
            description: `Doanh nghiệp tại ${domain}`,
            features: [],
            images: [],
            category: 'General',

            brandDNA: {
                slogan: `Giải pháp từ ${domain}`,
                values: ["Chất lượng", "Hiệu quả"],
                toneOfVoice: ["Chuyên nghiệp"],
                aesthetics: ["Hiện đại"],
                painPoints: [],
                brandColors: ["#3b82f6", "#10b981", "#6366f1"]
            }
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
