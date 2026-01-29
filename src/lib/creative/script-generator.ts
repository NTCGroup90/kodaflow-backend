// Pro-Quality Viral Script Generator
// Creates conversion-focused, DNA-infused video scripts

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface BrandDNA {
    brandName: string;
    selectedTagline: string;
    coreValues: string[];
    targetAudience: string;
    painPoints: string[];
    uniqueSellingPoints: string[];
    toneOfVoice: string[];
    industryCategory: string;
    brandColors: string[];
    productDescription?: string;
    competitorWeaknesses?: string[];
}

export interface ViralVideoScript {
    platform: string;
    duration: string;
    aspectRatio: string;
    scenes: ScriptScene[];
    aiVideoPrompt: string;
    suggestedMusic: string;
    captionText: string;
    hashtagSuggestions: string[];
    conversionTips: string[];
    hookType: string;
    estimatedCTR: string;
}

export interface ScriptScene {
    timeRange: string;
    type: 'hook' | 'problem' | 'agitate' | 'solution' | 'proof' | 'cta';
    duration: number;
    visual: string;
    voiceover: string;
    textOverlay: string;
    emotionalTrigger: string;
    transition: string;
}

export type Platform = 'tiktok' | 'youtube_shorts' | 'youtube_preroll' | 'facebook_reels' | 'facebook_feed';

const PLATFORM_SPECS: Record<Platform, {
    duration: string;
    aspectRatio: string;
    style: string;
    hookTime: number;
    skipButton?: boolean;
}> = {
    tiktok: {
        duration: '9-15s',
        aspectRatio: '9:16',
        style: 'Raw, authentic, POV style. Trending sounds. Pattern interrupt opening.',
        hookTime: 2
    },
    youtube_shorts: {
        duration: '30-60s',
        aspectRatio: '9:16',
        style: 'Value-packed, tutorial feel. Strong visual hook.',
        hookTime: 3
    },
    youtube_preroll: {
        duration: '15-30s',
        aspectRatio: '16:9',
        style: 'Professional, cinematic. MUST hook before 5s skip button.',
        hookTime: 5,
        skipButton: true
    },
    facebook_reels: {
        duration: '15-30s',
        aspectRatio: '9:16',
        style: 'Story-driven, emotional connection. Share-worthy ending.',
        hookTime: 3
    },
    facebook_feed: {
        duration: '15-30s',
        aspectRatio: '1:1 hoặc 4:5',
        style: 'MUST work without sound - strong captions. Scroll-stopping visual.',
        hookTime: 2
    }
};

// Hook types that drive engagement
const HOOK_TYPES = [
    { type: 'controversy', desc: 'Controversial statement that challenges common belief', example: '"Mọi người đang làm SAI cách này..."' },
    { type: 'curiosity_gap', desc: 'Opens a loop that viewer needs to close', example: '"Điều này đã thay đổi hoàn toàn cách tôi..."' },
    { type: 'pain_call', desc: 'Calls out specific pain point directly', example: '"Nếu bạn đang struggle với X, xem tiếp..."' },
    { type: 'result_first', desc: 'Shows the transformation/result immediately', example: '"Before/After - Đây là cách tôi đạt được..."' },
    { type: 'fomo', desc: 'Creates fear of missing out', example: '"90% người không biết trick này..."' },
    { type: 'pattern_interrupt', desc: 'Unexpected visual/audio that stops scroll', example: 'Unexpected zoom, sound effect, action' }
];

export async function generateViralScripts(
    brandDNA: BrandDNA,
    platforms: Platform[],
    geminiApiKey: string
): Promise<ViralVideoScript[]> {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const scripts: ViralVideoScript[] = [];

    for (const platform of platforms) {
        const spec = PLATFORM_SPECS[platform];

        const prompt = `Bạn là COPYWRITER HÀNG ĐẦU THẾ GIỚI chuyên về viral content và conversion optimization.

## THÔNG TIN THƯƠNG HIỆU (DNA):
- Tên: ${brandDNA.brandName}
- Tagline: ${brandDNA.selectedTagline}
- Mô tả sản phẩm: ${brandDNA.productDescription || brandDNA.selectedTagline}
- Giá trị cốt lõi: ${brandDNA.coreValues.join(', ')}
- Đối tượng mục tiêu: ${brandDNA.targetAudience}
- PAIN POINTS khách hàng: ${brandDNA.painPoints.join(', ')}
- USP (điểm độc đáo): ${brandDNA.uniqueSellingPoints.join(', ')}
- Giọng điệu brand: ${brandDNA.toneOfVoice.join(', ')}
- Ngành: ${brandDNA.industryCategory}
- Điểm yếu đối thủ: ${brandDNA.competitorWeaknesses?.join(', ') || 'Không có'}

## PLATFORM: ${platform.toUpperCase()}
- Thời lượng tổng: ${spec.duration}
- Tỉ lệ: ${spec.aspectRatio}
- Style: ${spec.style}

## QUY TẮC CẤU TRÚC VIDEO (QUAN TRỌNG NHẤT):
Video AI (Kling, Veo, Runway) cần prompt có độ dài chuẩn.
**BẠN BẮT BUỘC PHẢI CHIA KỊCH BẢN THÀNH CÁC PHÂN CẢNH (SCENES) CÓ ĐỘ DÀI CỐ ĐỊNH LÀ 5 GIÂY HOẶC 8 GIÂY.**

KHÔNG ĐƯỢC chia nhỏ lẻ như 2s, 3s, 4s.
Tổng thời lượng video được ghép từ các block 5s hoặc 8s này.

Ví dụ cách chia (Strategy):
- Option 1 (Nhanh): Các scence đều 5s. (Ví dụ 15s = 5s + 5s + 5s)
- Option 2 (Chuẩn): Các scene đều 8s. (Ví dụ 16s = 8s + 8s)
- Option 3 (Mix): Kết hợp 8s và 5s. (Ví dụ 13s = 8s + 5s)

## QUY TẮC NGÔN NGỮ:
1. **VISUAL PROMPT**: PHẢI viết bằng **TIẾNG ANH (ENGLISH)**. Mô tả chi tiết chuyển động, ánh sáng, góc máy cho AI.
2. **VOICEOVER & TEXT**: PHẢI viết bằng **TIẾNG VIỆT**.

## YÊU CẦU NỘI DUNG (Lồng ghép vào các scene 5s/8s ở trên):
1. **Framework**: Đi từ Hook -> Problem -> Solution -> CTA.
2. Bạn phải tóm gọn nội dung của từng phần này sao cho khớp với block thời gian 5s/8s.
   - Ví dụ: Hook nằm trọn trong Scene 1 (0-5s).
   - Problem nằm trong Scene 2 (5-10s).

## FORMAT JSON:
{
  "hookType": "loại hook sử dụng",
  "estimatedCTR": "Hight/Medium",
  "scenes": [
    {
      "timeRange": "0-5s",
      "type": "hook",
      "duration": 5,
      "visual": "ENGLISH PROMPT for AI Video Generator. Cinematic, lighting, movement description.",
      "voiceover": "Lời thoại tiếng việt khớp với 5s này.",
      "textOverlay": "Text tiếng việt",
      "emotionalTrigger": "curiosity",
      "transition": "cut"
    },
    {
      "timeRange": "5-13s",
      "type": "problem",
      "duration": 8,
      "visual": "ENGLISH PROMPT for next scene...",
      "voiceover": "...",
      "textOverlay": "..."
    }
  ],
  "aiVideoPrompt": "ENGLISH. General style description.",
  "suggestedMusic": "...",
  "captionText": "...",
  "hashtagSuggestions": ["..."],
  "conversionTips": ["..."]
}

HÃY TẠO RA 1 KỊCH BẢN HOÀN CHỈNH, TUÂN THỦ NGHIÊM NGẶT ĐỘ DÀI SCENE (5s HOẶC 8s).`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                scripts.push({
                    platform,
                    duration: spec.duration,
                    aspectRatio: spec.aspectRatio,
                    scenes: data.scenes || [],
                    aiVideoPrompt: data.aiVideoPrompt || '',
                    suggestedMusic: data.suggestedMusic || '',
                    captionText: data.captionText || '',
                    hashtagSuggestions: data.hashtagSuggestions || [],
                    conversionTips: data.conversionTips || [],
                    hookType: data.hookType || 'unknown',
                    estimatedCTR: data.estimatedCTR || 'Medium'
                });
            }
        } catch (error) {
            console.error(`Error generating script for ${platform}:`, error);
        }
    }

    return scripts;
}

// Image prompt generator with deep DNA integration
export interface ImagePromptData {
    platform: string;
    size: string;
    basePrompt: string;
    dnaElements: {
        brandName: string;
        colors: string[];
        tone: string[];
        industry: string;
    };
    editablePrompt: string;
}

export function generateImagePrompt(
    brandDNA: BrandDNA,
    platform: 'facebook' | 'youtube' | 'google_display',
    size: string,
    headline?: string,
    subheadline?: string
): ImagePromptData {
    const colorDescription = brandDNA.brandColors.map((c, i) =>
        i === 0 ? `primary color ${c}` : `accent color ${c}`
    ).join(', ');

    const toneDescription = brandDNA.toneOfVoice.join(', ');

    let styleGuide = '';
    if (toneDescription.includes('chuyên nghiệp') || toneDescription.includes('professional')) {
        styleGuide = 'Clean, minimalist, corporate aesthetic with subtle gradients';
    } else if (toneDescription.includes('trẻ trung') || toneDescription.includes('dynamic')) {
        styleGuide = 'Bold, vibrant, energetic with dynamic angles and motion blur effects';
    } else if (toneDescription.includes('sang trọng') || toneDescription.includes('luxury')) {
        styleGuide = 'Elegant, sophisticated, premium feel with gold/metallic accents';
    } else {
        styleGuide = 'Modern, eye-catching, conversion-focused design';
    }

    const basePrompt = `Professional advertisement banner for ${brandDNA.brandName}.

BRAND ELEMENTS (MUST INCLUDE):
- Brand: "${brandDNA.brandName}"
- Tagline: "${brandDNA.selectedTagline}"
- Colors: ${colorDescription}
- Industry: ${brandDNA.industryCategory}
- Style: ${styleGuide}

CONTENT:
- Headline: "${headline || brandDNA.painPoints[0] || 'Giải pháp hoàn hảo cho bạn'}"
- Subheadline: "${subheadline || brandDNA.uniqueSellingPoints[0] || ''}"
- CTA Button: Prominent, contrasting color

DESIGN REQUIREMENTS:
- Size: ${size}
- Text must be READABLE and PROMINENT
- Brand colors must be dominant
- Professional quality, ready for ads
- Clear visual hierarchy
- Eye-catching but not cluttered`;

    return {
        platform,
        size,
        basePrompt,
        dnaElements: {
            brandName: brandDNA.brandName,
            colors: brandDNA.brandColors,
            tone: brandDNA.toneOfVoice,
            industry: brandDNA.industryCategory
        },
        editablePrompt: basePrompt
    };
}

// Video specs validation
export interface VideoSpec {
    aspectRatio: string;
    minDuration: number;
    maxDuration: number;
    minResolution: string;
}

const PLATFORM_VIDEO_SPECS: Record<Platform, VideoSpec> = {
    tiktok: {
        aspectRatio: '9:16',
        minDuration: 5,
        maxDuration: 60,
        minResolution: '720x1280'
    },
    youtube_shorts: {
        aspectRatio: '9:16',
        minDuration: 15,
        maxDuration: 60,
        minResolution: '720x1280'
    },
    youtube_preroll: {
        aspectRatio: '16:9',
        minDuration: 6,
        maxDuration: 180,
        minResolution: '1920x1080'
    },
    facebook_reels: {
        aspectRatio: '9:16',
        minDuration: 15,
        maxDuration: 90,
        minResolution: '720x1280'
    },
    facebook_feed: {
        aspectRatio: '1:1 / 4:5',
        minDuration: 1,
        maxDuration: 240,
        minResolution: '720p'
    }
};

export function getVideoSpecs(platform: Platform): VideoSpec {
    return PLATFORM_VIDEO_SPECS[platform];
}

// Image specs for all platforms
export const IMAGE_SPECS = {
    facebook: [
        { id: 'fb_feed', name: 'Facebook Feed', width: 1200, height: 628 },
        { id: 'fb_square', name: 'Facebook Square', width: 1080, height: 1080 }
    ],
    youtube: [
        { id: 'yt_thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720 }
    ],
    google_display: [
        { id: 'gdn_medium', name: 'Medium Rectangle', width: 300, height: 250 },
        { id: 'gdn_leaderboard', name: 'Leaderboard', width: 728, height: 90 },
        { id: 'gdn_skyscraper', name: 'Wide Skyscraper', width: 160, height: 600 },
        { id: 'gdn_large', name: 'Large Rectangle', width: 336, height: 280 }
    ]
};
