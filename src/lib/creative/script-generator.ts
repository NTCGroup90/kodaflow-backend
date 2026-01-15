// Platform-Specific Script Generator
// Creates conversion-focused video scripts based on Brand DNA

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
}

export interface VideoScript {
    platform: string;
    duration: string;
    aspectRatio: string;
    scenes: ScriptScene[];
    aiPrompt: string;
    suggestedMusic: string;
    captionText: string;
    conversionTips: string[];
}

export interface ScriptScene {
    timeRange: string;
    type: 'hook' | 'problem' | 'solution' | 'cta' | 'value' | 'story';
    duration: number;
    visual: string;
    voiceover: string;
    textOverlay: string;
    transition: string;
}

export type Platform = 'tiktok' | 'youtube_shorts' | 'youtube_preroll' | 'facebook_reels' | 'facebook_feed' | 'instagram_reels';

const PLATFORM_SPECS: Record<Platform, { duration: string; aspectRatio: string; style: string; hookTime: number }> = {
    tiktok: {
        duration: '9-15s',
        aspectRatio: '9:16',
        style: 'Native, organic, trending sounds, meme-friendly',
        hookTime: 3
    },
    youtube_shorts: {
        duration: '15-60s',
        aspectRatio: '9:16',
        style: 'Value-first, thumbnail text, subscribe CTA',
        hookTime: 5
    },
    youtube_preroll: {
        duration: '15-30s',
        aspectRatio: '16:9',
        style: 'Professional, skip-proof hook, clear CTA',
        hookTime: 5
    },
    facebook_reels: {
        duration: '15-30s',
        aspectRatio: '9:16',
        style: 'Emotional, story-driven, share trigger',
        hookTime: 3
    },
    facebook_feed: {
        duration: '15-30s',
        aspectRatio: '1:1 or 4:5',
        style: 'Silent-friendly, captions essential, scroll-stopper',
        hookTime: 3
    },
    instagram_reels: {
        duration: '15-30s',
        aspectRatio: '9:16',
        style: 'Aesthetic, visual-first, trendy transitions',
        hookTime: 3
    }
};

export async function generatePlatformScripts(
    brandDNA: BrandDNA,
    platforms: Platform[],
    geminiApiKey: string
): Promise<VideoScript[]> {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const scripts: VideoScript[] = [];

    for (const platform of platforms) {
        const spec = PLATFORM_SPECS[platform];

        const prompt = `Bạn là một chuyên gia marketing và copywriter hàng đầu. Tạo kịch bản video quảng cáo CHUYỂN ĐỔI CAO cho:

THÔNG TIN THƯƠNG HIỆU:
- Tên: ${brandDNA.brandName}
- Tagline: ${brandDNA.selectedTagline}
- Giá trị cốt lõi: ${brandDNA.coreValues.join(', ')}
- Đối tượng mục tiêu: ${brandDNA.targetAudience}
- Pain points khách hàng: ${brandDNA.painPoints.join(', ')}
- USP (điểm bán độc đáo): ${brandDNA.uniqueSellingPoints.join(', ')}
- Giọng điệu: ${brandDNA.toneOfVoice.join(', ')}
- Ngành: ${brandDNA.industryCategory}

PLATFORM: ${platform.toUpperCase()}
- Thời lượng: ${spec.duration}
- Tỉ lệ khung hình: ${spec.aspectRatio}
- Phong cách: ${spec.style}
- Thời gian hook: ${spec.hookTime} giây đầu PHẢI THU HÚT

YÊU CẦU:
1. HOOK (0-${spec.hookTime}s): Câu mở đầu SHOCK, gây tò mò, hoặc gọi tên pain point. Người xem PHẢI dừng scroll!
2. NỘI DUNG: Kết nối pain point → giải pháp của sản phẩm
3. CTA: Hành động cụ thể, tạo urgency (ưu đãi giới hạn, số lượng có hạn...)
4. Phải phù hợp với DNA thương hiệu

Trả về JSON với format:
{
  "scenes": [
    {
      "timeRange": "0-3s",
      "type": "hook",
      "duration": 3,
      "visual": "Mô tả hình ảnh chi tiết",
      "voiceover": "Lời thoại/giọng nói",
      "textOverlay": "Chữ hiện trên màn hình",
      "transition": "cut/fade/zoom"
    }
  ],
  "aiPrompt": "Prompt để tạo video bằng AI (Veo 3/Kling/Runway)",
  "suggestedMusic": "Gợi ý nhạc phù hợp",
  "captionText": "Caption đầy đủ cho video",
  "conversionTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                scripts.push({
                    platform,
                    duration: spec.duration,
                    aspectRatio: spec.aspectRatio,
                    scenes: data.scenes,
                    aiPrompt: data.aiPrompt,
                    suggestedMusic: data.suggestedMusic,
                    captionText: data.captionText,
                    conversionTips: data.conversionTips
                });
            }
        } catch (error) {
            console.error(`Error generating script for ${platform}:`, error);
        }
    }

    return scripts;
}

export function getVideoUploadSpecs(platform: Platform): {
    aspectRatio: string;
    minDuration: number;
    maxDuration: number;
    minResolution: string;
    maxFileSize: string;
} {
    const specs: Record<Platform, any> = {
        tiktok: {
            aspectRatio: '9:16',
            minDuration: 5,
            maxDuration: 60,
            minResolution: '720x1280',
            maxFileSize: '500MB'
        },
        youtube_shorts: {
            aspectRatio: '9:16',
            minDuration: 15,
            maxDuration: 60,
            minResolution: '720x1280',
            maxFileSize: '256GB'
        },
        youtube_preroll: {
            aspectRatio: '16:9',
            minDuration: 6,
            maxDuration: 180,
            minResolution: '1920x1080',
            maxFileSize: '256GB'
        },
        facebook_reels: {
            aspectRatio: '9:16',
            minDuration: 15,
            maxDuration: 90,
            minResolution: '720x1280',
            maxFileSize: '4GB'
        },
        facebook_feed: {
            aspectRatio: '1:1 or 4:5 or 16:9',
            minDuration: 1,
            maxDuration: 240,
            minResolution: '720p',
            maxFileSize: '4GB'
        },
        instagram_reels: {
            aspectRatio: '9:16',
            minDuration: 15,
            maxDuration: 90,
            minResolution: '720x1280',
            maxFileSize: '4GB'
        }
    };

    return specs[platform];
}

export function validateVideoFile(
    file: { duration: number; width: number; height: number; size: number },
    platform: Platform
): { valid: boolean; errors: string[] } {
    const specs = getVideoUploadSpecs(platform);
    const errors: string[] = [];

    // Check duration
    if (file.duration < specs.minDuration) {
        errors.push(`Video quá ngắn. Tối thiểu ${specs.minDuration} giây cho ${platform}`);
    }
    if (file.duration > specs.maxDuration) {
        errors.push(`Video quá dài. Tối đa ${specs.maxDuration} giây cho ${platform}`);
    }

    // Check aspect ratio
    const ratio = file.width / file.height;
    if (platform === 'youtube_preroll') {
        if (Math.abs(ratio - 16 / 9) > 0.1) {
            errors.push('Video phải có tỉ lệ 16:9 cho YouTube Pre-roll');
        }
    } else if (['tiktok', 'youtube_shorts', 'facebook_reels', 'instagram_reels'].includes(platform)) {
        if (Math.abs(ratio - 9 / 16) > 0.1) {
            errors.push('Video phải có tỉ lệ 9:16 (dọc) cho platform này');
        }
    }

    // Check resolution
    const minRes = platform === 'youtube_preroll' ? 1080 : 720;
    if (file.height < minRes) {
        errors.push(`Độ phân giải tối thiểu ${minRes}p`);
    }

    return { valid: errors.length === 0, errors };
}
