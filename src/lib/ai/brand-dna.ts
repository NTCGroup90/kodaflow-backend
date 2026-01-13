/**
 * Brand DNA Analysis Engine
 * Deep AI-powered brand analysis using Gemini
 */

import { callGemini } from './gemini';
import * as cheerio from 'cheerio';

// ==================== TYPES ====================

export interface BrandDNA {
    brandName: string;
    taglineSuggestions: string[];
    coreValues: string[];
    brandAesthetic: string[];
    brandColors: string[];
    typography: {
        heading: string;
        body: string;
    };
    businessSummary: string;
    toneOfVoice: string[];
    targetAudience: string;
    painPoints: string[];
    uniqueSellingPoints: string[];
    industryCategory: string;
}

export interface ScrapedAsset {
    url: string;
    type: 'product' | 'lifestyle' | 'studio' | 'branding' | 'unknown';
    width?: number;
    height?: number;
    alt?: string;
}

export interface CompetitorAnalysis {
    name: string;
    url: string;
    logoUrl?: string;
    productsServices: string;
    marketingAngle: string;
    targetAudience: string;
    strengths: string[];
    weaknesses: string[];
    attackAngle: string;
    opportunityScore: number;
}

// ==================== WEB SCRAPING ====================

/**
 * Fetch HTML content from URL with smart User-Agent rotation
 */
async function fetchHTML(url: string): Promise<string> {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Try to fetch additional pages for deeper analysis
 */
async function fetchMultiplePages(baseUrl: string): Promise<string> {
    const priorityPaths = [
        '',           // Homepage
        '/about',
        '/about-us',
        '/gioi-thieu',
        '/products',
        '/san-pham',
        '/services',
        '/dich-vu',
    ];

    let combinedContent = '';
    const baseUrlObj = new URL(baseUrl);

    for (const path of priorityPaths.slice(0, 3)) { // Limit to 3 pages for speed
        try {
            const url = `${baseUrlObj.origin}${path}`;
            const html = await fetchHTML(url);
            combinedContent += `\n<!-- PAGE: ${path || '/'} -->\n${html.substring(0, 30000)}`;
        } catch {
            // Silently continue if page doesn't exist
        }
    }

    return combinedContent || await fetchHTML(baseUrl);
}

/**
 * Extract colors from HTML/CSS
 */
function extractColors(html: string): string[] {
    const hexPattern = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
    const rgbPattern = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;

    const colors = new Set<string>();

    // Extract HEX colors
    const hexMatches = html.match(hexPattern) || [];
    hexMatches.forEach(c => colors.add(c.toUpperCase()));

    // Extract RGB and convert to HEX
    let match;
    while ((match = rgbPattern.exec(html)) !== null) {
        const hex = '#' + [match[1], match[2], match[3]]
            .map(x => parseInt(x).toString(16).padStart(2, '0'))
            .join('').toUpperCase();
        colors.add(hex);
    }

    // Filter out common blacks/whites and limit to 10
    const filtered = Array.from(colors).filter(c =>
        !['#FFFFFF', '#000000', '#FFF', '#000'].includes(c)
    );

    return filtered.slice(0, 10);
}

/**
 * Extract fonts from HTML/CSS
 */
function extractFonts(html: string): { heading: string; body: string } {
    const fontFamilyPattern = /font-family:\s*([^;}"']+)/gi;
    const fonts: string[] = [];

    let match;
    while ((match = fontFamilyPattern.exec(html)) !== null) {
        const font = match[1].split(',')[0].trim().replace(/['"]/g, '');
        if (font && !fonts.includes(font) && !font.includes('inherit') && !font.includes('sans-serif')) {
            fonts.push(font);
        }
    }

    return {
        heading: fonts[0] || 'Inter',
        body: fonts[1] || fonts[0] || 'Inter'
    };
}

/**
 * Extract high-quality images from HTML
 */
function extractImages(html: string, baseUrl: string): ScrapedAsset[] {
    const $ = cheerio.load(html);
    const images: ScrapedAsset[] = [];
    const baseUrlObj = new URL(baseUrl);

    $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        const alt = $(el).attr('alt') || '';

        if (!src) return;

        // Skip icons and tiny images
        if (src.includes('icon') || src.includes('favicon') || src.includes('avatar')) return;
        if (src.includes('1x1') || src.includes('data:image')) return;

        // Resolve relative URLs
        let fullUrl = src;
        if (src.startsWith('/')) {
            fullUrl = `${baseUrlObj.origin}${src}`;
        } else if (!src.startsWith('http')) {
            fullUrl = `${baseUrlObj.origin}/${src}`;
        }

        // Categorize based on context
        let type: ScrapedAsset['type'] = 'unknown';
        const context = (alt + ' ' + $(el).parent().text()).toLowerCase();

        if (context.includes('logo') || src.includes('logo')) {
            type = 'branding';
        } else if (context.includes('product') || context.includes('sản phẩm')) {
            type = 'product';
        } else if (context.includes('lifestyle') || context.includes('phong cách')) {
            type = 'lifestyle';
        }

        images.push({ url: fullUrl, type, alt });
    });

    // Remove duplicates and limit
    const uniqueUrls = new Set<string>();
    return images.filter(img => {
        if (uniqueUrls.has(img.url)) return false;
        uniqueUrls.add(img.url);
        return true;
    }).slice(0, 30);
}

// ==================== AI ANALYSIS ====================

/**
 * Analyze brand DNA using Gemini AI
 */
export async function analyzeBrandDNA(url: string): Promise<BrandDNA> {
    console.log('[DNA] Starting deep analysis for:', url);

    // Step 1: Fetch HTML content
    let htmlContent = '';
    try {
        htmlContent = await fetchMultiplePages(url);
    } catch (error) {
        console.error('[DNA] Failed to fetch URL:', error);
        // Return minimal fallback
        const domain = new URL(url).hostname.replace('www.', '');
        return createFallbackDNA(domain);
    }

    // Step 2: Extract technical data
    const extractedColors = extractColors(htmlContent);
    const extractedFonts = extractFonts(htmlContent);

    // Step 3: AI Deep Analysis
    const prompt = `
Bạn là Senior Brand Strategist với 15 năm kinh nghiệm. Phân tích DEEP brand DNA từ HTML dưới đây.

URL: ${url}
HTML Content (đã rút gọn):
${htmlContent.substring(0, 50000)}

Màu sắc đã trích xuất từ CSS: ${extractedColors.join(', ')}
Font chữ đã phát hiện: ${JSON.stringify(extractedFonts)}

YÊU CẦU PHÂN TÍCH SÂU:

1. **BRAND NAME**: Tên thương hiệu chính xác (không phải domain).

2. **TAGLINE SUGGESTIONS**: 3 câu tagline sáng tạo, đắt giá (dưới 8 từ mỗi câu) dựa trên:
   - Giá trị cốt lõi
   - Lợi ích cho khách hàng
   - Điểm khác biệt

3. **CORE VALUES**: 5 giá trị cốt lõi (VD: Innovation, Quality, Trust, Speed, Customer-First).

4. **BRAND AESTHETIC**: 5 từ khóa mô tả phong cách visual:
   - VD: Minimalist, Vibrant, Luxurious, Modern Tech, Eco-Friendly, Playful, Corporate, Artisanal

5. **TONE OF VOICE**: 3-4 tính từ mô tả giọng điệu giao tiếp:
   - VD: Professional, Friendly, Authoritative, Witty, Warm, Bold, Sophisticated

6. **BUSINESS SUMMARY**: 2-3 câu tóm tắt doanh nghiệp này làm gì, bán gì, cho ai.

7. **TARGET AUDIENCE**: Mô tả ngắn gọn khách hàng mục tiêu.

8. **PAIN POINTS**: 3 vấn đề lớn nhất khách hàng của họ đang gặp.

9. **UNIQUE SELLING POINTS (USP)**: 3 điểm khác biệt/lợi thế cạnh tranh.

10. **INDUSTRY CATEGORY**: Ngành hàng (VD: E-commerce, SaaS, F&B, Fashion, Education).

OUTPUT JSON FORMAT (Bắt buộc - Chỉ JSON, không markdown):
{
  "brandName": "Tên Thương Hiệu",
  "taglineSuggestions": ["Tagline 1", "Tagline 2", "Tagline 3"],
  "coreValues": ["Value1", "Value2", "Value3", "Value4", "Value5"],
  "brandAesthetic": ["Style1", "Style2", "Style3", "Style4", "Style5"],
  "toneOfVoice": ["Tone1", "Tone2", "Tone3"],
  "businessSummary": "Mô tả 2-3 câu...",
  "targetAudience": "Mô tả khách hàng mục tiêu...",
  "painPoints": ["Pain1", "Pain2", "Pain3"],
  "uniqueSellingPoints": ["USP1", "USP2", "USP3"],
  "industryCategory": "Ngành hàng"
}
`;

    try {
        console.log('[DNA] Sending to Gemini...');
        const response = await callGemini(prompt, { temperature: 0.7, maxTokens: 4096 });
        console.log('[DNA] Gemini response received');

        // Parse JSON
        let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        const parsed = JSON.parse(jsonMatch[0]);

        // Merge AI analysis with extracted data
        return {
            brandName: parsed.brandName || new URL(url).hostname,
            taglineSuggestions: parsed.taglineSuggestions || [],
            coreValues: parsed.coreValues || [],
            brandAesthetic: parsed.brandAesthetic || [],
            brandColors: extractedColors.length > 0 ? extractedColors.slice(0, 5) : ['#00d4ff', '#a855f7', '#f97316'],
            typography: extractedFonts,
            businessSummary: parsed.businessSummary || '',
            toneOfVoice: parsed.toneOfVoice || [],
            targetAudience: parsed.targetAudience || '',
            painPoints: parsed.painPoints || [],
            uniqueSellingPoints: parsed.uniqueSellingPoints || [],
            industryCategory: parsed.industryCategory || 'General',
        };

    } catch (error) {
        console.error('[DNA] AI analysis failed:', error);
        const domain = new URL(url).hostname.replace('www.', '');
        return {
            ...createFallbackDNA(domain),
            brandColors: extractedColors.length > 0 ? extractedColors.slice(0, 5) : ['#00d4ff', '#a855f7', '#f97316'],
            typography: extractedFonts,
        };
    }
}

/**
 * Create fallback DNA when analysis fails
 */
function createFallbackDNA(domain: string): BrandDNA {
    return {
        brandName: domain,
        taglineSuggestions: [
            `${domain} - Giải pháp của bạn`,
            `Chất lượng từ ${domain}`,
            `${domain} - Đối tác tin cậy`
        ],
        coreValues: ['Chất lượng', 'Uy tín', 'Tận tâm', 'Sáng tạo', 'Hiệu quả'],
        brandAesthetic: ['Modern', 'Professional', 'Clean', 'Trustworthy', 'Dynamic'],
        brandColors: ['#00d4ff', '#a855f7', '#f97316', '#22c55e', '#ef4444'],
        typography: { heading: 'Inter', body: 'Inter' },
        businessSummary: `${domain} cung cấp các sản phẩm và dịch vụ chất lượng cao.`,
        toneOfVoice: ['Professional', 'Friendly', 'Trustworthy'],
        targetAudience: 'Khách hàng tìm kiếm giải pháp chất lượng',
        painPoints: ['Thiếu thời gian', 'Cần giải pháp nhanh', 'Muốn tiết kiệm chi phí'],
        uniqueSellingPoints: ['Chất lượng cao', 'Giá cạnh tranh', 'Hỗ trợ 24/7'],
        industryCategory: 'General',
    };
}

/**
 * Scrape and categorize images from URL
 */
export async function scrapeVisualAssets(url: string): Promise<ScrapedAsset[]> {
    console.log('[Assets] Scraping images from:', url);

    try {
        const html = await fetchHTML(url);
        const images = extractImages(html, url);

        console.log(`[Assets] Found ${images.length} images`);
        return images;

    } catch (error) {
        console.error('[Assets] Scraping failed:', error);
        return [];
    }
}

/**
 * Analyze competitors based on industry/product
 */
export async function analyzeCompetitors(
    brandName: string,
    industryCategory: string,
    businessSummary: string
): Promise<CompetitorAnalysis[]> {
    console.log('[Competitors] Analyzing competitors for:', brandName);

    const prompt = `
Bạn là chuyên gia phân tích thị trường. Dựa trên thông tin sau, hãy phân tích 3 đối thủ cạnh tranh tiềm năng:

Thương hiệu: ${brandName}
Ngành hàng: ${industryCategory}
Mô tả: ${businessSummary}

Với MỖI đối thủ, cung cấp:
1. Tên đối thủ (thật, phổ biến trong ngành tại Việt Nam)
2. Website (nếu biết)
3. Sản phẩm/dịch vụ họ cung cấp
4. Chiến lược marketing chính (Giá rẻ? Chất lượng? Độc đáo?)
5. Đối tượng khách hàng của họ
6. 3 điểm mạnh
7. 3 điểm yếu
8. GÓC TẤN CÔNG: Cách ${brandName} có thể đánh bại đối thủ này
9. Điểm cơ hội (1-10): Mức độ dễ dàng vượt qua đối thủ

OUTPUT JSON (Chỉ JSON, không markdown):
{
  "competitors": [
    {
      "name": "Tên Đối thủ 1",
      "url": "https://...",
      "productsServices": "Mô tả sản phẩm/dịch vụ",
      "marketingAngle": "Chiến lược chính",
      "targetAudience": "Đối tượng KH",
      "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
      "weaknesses": ["Điểm yếu 1", "Điểm yếu 2", "Điểm yếu 3"],
      "attackAngle": "Cách tấn công cụ thể...",
      "opportunityScore": 7
    }
  ]
}
`;

    try {
        const response = await callGemini(prompt, { temperature: 0.8, maxTokens: 4096 });

        let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.competitors || [];

    } catch (error) {
        console.error('[Competitors] Analysis failed:', error);
        return [];
    }
}
