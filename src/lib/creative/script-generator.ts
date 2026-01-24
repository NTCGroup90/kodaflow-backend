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
- Thời lượng: ${spec.duration}
- Tỉ lệ: ${spec.aspectRatio}
- Style: ${spec.style}
- Thời gian hook: ${spec.hookTime} giây đầu QUYẾT ĐỊNH tất cả!
${spec.skipButton ? '- ⚠️ CÓ NÚT SKIP SAU 5 GIÂY - PHẢI HOOK TRƯỚC 5S!' : ''}

## LOẠI HOOK HIỆU QUẢ:
${HOOK_TYPES.map(h => `- ${h.type}: ${h.desc} (VD: ${h.example})`).join('\n')}

## YÊU CẦU KỊCH BẢN:
1. **HOOK (0-${spec.hookTime}s)**: PHẢI LÀ 1 TRONG CÁC LOẠI HOOK TRÊN. Gây SỐC, TÒ MÒ, hoặc PATTERN INTERRUPT. Đây là 80% thành công!
2. **PROBLEM/AGITATE**: Khuếch đại pain point - làm viewer CẢM NHẬN được vấn đề
3. **SOLUTION**: Introduce sản phẩm như GIẢI PHÁP duy nhất
4. **PROOF** (nếu có time): Social proof, số liệu, testimonial
5. **CTA**: URGENCY + SCARCITY. "Chỉ hôm nay", "Số lượng có hạn"...

## FORMAT JSON:
{
  "hookType": "loại hook sử dụng",
  "estimatedCTR": "ước tính CTR dựa trên hook strength (Low/Medium/High)",
  "scenes": [
    {
      "timeRange": "0-2s",
      "type": "hook",
      "duration": 2,
      "visual": "Mô tả CHI TIẾT hình ảnh - phải liên quan đến brand",
      "voiceover": "Câu nói GÂY SỐC/TÒ MÒ - dùng đúng tone của brand",
      "textOverlay": "Text ngắn gọn, CẦN ĐỌC ĐƯỢC TRONG 1-2 GIÂY",
      "emotionalTrigger": "Cảm xúc muốn kích hoạt: curiosity/fear/desire/frustration",
      "transition": "cut/zoom/swipe"
    }
  ],
  "aiVideoPrompt": "Prompt CHI TIẾT để tạo video bằng Veo 3/Kling - phải bao gồm brand elements, màu ${brandDNA.brandColors.join(', ')}, style ${brandDNA.toneOfVoice.join(', ')}",
  "suggestedMusic": "Gợi ý nhạc phù hợp với brand tone",
  "captionText": "Caption đầy đủ với emoji, hashtags",
  "hashtagSuggestions": ["hashtag1", "hashtag2"],
  "conversionTips": ["Tip tăng conversion 1", "Tip 2", "Tip 3"]
}

QUAN TRỌNG:
- PHẢI sử dụng thông tin DNA trong mọi scene
- Hook PHẢI liên quan trực tiếp đến pain point của target audience
- Giọng điệu PHẢI đúng với brand tone
- Visual PHẢI có màu sắc brand: ${brandDNA.brandColors.join(', ')}`;

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
