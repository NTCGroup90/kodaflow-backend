/**
 * Campaign Architect - AI Strategy Engine
 * Module 3: Generates campaign angles, ad copy, video scripts, and landing pages
 * Based on Brand DNA and Competitor Analysis
 */

import { callGemini } from './gemini';

// ==================== TYPES ====================

export interface BrandDNAInput {
    brandName: string;
    tagline: string;
    businessSummary: string;
    coreValues: string[];
    toneOfVoice: string[];
    targetAudience: string;
    painPoints: string[];
    uniqueSellingPoints: string[];
    industryCategory: string;
    brandColors: string[];
}

export interface CompetitorInput {
    name: string;
    strengths: string[];
    weaknesses: string[];
    attackAngle: string;
    opportunityScore: number;
}

// Campaign Angle - 3 góc tấn công
export interface CampaignAngle {
    id: string;
    angleNumber: 1 | 2 | 3;
    angleType: 'usp_focus' | 'social_proof' | 'emotion_story';
    title: string;
    description: string;
    targetEmotion: string;
    keyMessage: string;
    aiPredictScore: number; // 0-100
    basedOnWeakness?: string;
}

// Ad Copy Set
export interface AdCopySet {
    angleId: string;
    headlines: string[]; // 5 headlines
    descriptions: string[]; // 3 descriptions  
    callToAction: string;
    platform: 'google' | 'facebook' | 'tiktok' | 'all';
}

// Video Script với storyboard chi tiết
export interface VideoScene {
    sceneNumber: number;
    durationSeconds: number;
    visual: string;       // Mô tả cảnh quay/hiệu ứng
    voiceover: string;    // Lời bình
    textOverlay: string;  // Chữ chạy trên màn hình
    musicNote: string;    // Gợi ý nhạc nền
    transition: string;   // Hiệu ứng chuyển cảnh
}

export interface VideoScriptFull {
    angleId: string;
    duration: 15 | 30;
    format: 'shorts' | 'reels' | 'story';
    hook: string;         // Câu mở đầu thu hút
    scenes: VideoScene[];
    callToAction: string;
    suggestedMusic: string;
    overallMood: string;
}

// Landing Page Structure
export interface LandingPageSection {
    type: 'header' | 'hero' | 'features' | 'testimonials' | 'cta' | 'faq';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: Record<string, any>;
}

export interface LandingPageStructure {
    angleId: string;
    header: {
        logo: boolean;
        headline: string;
        subheadline: string;
        navigation: boolean;
    };
    hero: {
        mainHeadline: string;
        subHeadline: string;
        ctaButton: string;
        ctaLink: string;
        heroImagePrompt: string;
        urgencyText?: string;
        trustBadges: string[];
    };
    features: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
    socialProof: {
        testimonials: Array<{
            quote: string;
            author: string;
            role: string;
        }>;
        stats: Array<{
            number: string;
            label: string;
        }>;
    };
    cta: {
        headline: string;
        subheadline: string;
        buttonText: string;
        guarantee?: string;
        urgencyTimer?: boolean;
    };
}

// Full Campaign Package
export interface CampaignPackage {
    id: string;
    brandName: string;
    createdAt: Date;
    angles: CampaignAngle[];
    selectedAngleId?: string;
    adCopies: AdCopySet[];
    videoScripts: VideoScriptFull[];
    landingPages: LandingPageStructure[];
    status: 'generating' | 'ready' | 'editing' | 'approved';
}

// ==================== AI PROMPTS ====================

const CAMPAIGN_ANGLES_PROMPT = `
Bạn là một chuyên gia chiến lược marketing hàng đầu. Dựa trên Brand DNA và phân tích đối thủ, hãy tạo ra 3 GÓC TẤN CÔNG (Campaign Angles) khác biệt để đánh bại đối thủ.

BRAND DNA:
{brandDNA}

ĐỐI THỦ CẠNH TRANH:
{competitors}

Yêu cầu tạo 3 Góc tấn công:

1. **Angle 1 - USP Focus (Đánh mạnh điểm khác biệt)**:
   - Tập trung vào unique selling point mạnh nhất
   - Khai thác điểm yếu của đối thủ
   - Thông điệp rõ ràng, trực tiếp

2. **Angle 2 - Social Proof/Trust (Xây dựng uy tín)**:
   - Sử dụng tâm lý học đám đông
   - Testimonials, case studies, số liệu
   - Phá tan sự nghi ngờ của khách hàng

3. **Angle 3 - Emotion/Storytelling (Cảm xúc)**:
   - Kể câu chuyện chạm vào trái tim
   - Phù hợp cho Reels/TikTok/Stories
   - Tạo kết nối cảm xúc sâu sắc

Trả về JSON với format:
{
  "angles": [
    {
      "angleNumber": 1,
      "angleType": "usp_focus",
      "title": "Tên góc tấn công ngắn gọn",
      "description": "Mô tả chiến lược 2-3 câu",
      "targetEmotion": "Cảm xúc mục tiêu (VD: tự tin, an tâm, phấn khích)",
      "keyMessage": "Thông điệp chính của góc này",
      "aiPredictScore": 85,
      "basedOnWeakness": "Điểm yếu đối thủ đang khai thác"
    }
  ]
}

CHÚ Ý:
- aiPredictScore từ 60-95, dựa trên mức độ phù hợp với market
- Mỗi angle phải KHÁC BIỆT và có thể triển khai độc lập
- Viết bằng tiếng Việt, giọng điệu phù hợp với brand
`;

const AD_COPY_PROMPT = `
Bạn là copywriter chuyên nghiệp. Viết Ad Copy cho góc tấn công sau:

THÔNG TIN BRAND:
{brandInfo}

GÓC TẤN CÔNG:
{angle}

Yêu cầu viết:
- 5 Headlines giật gân (tối đa 30 ký tự cho Google, 40 cho Facebook)
- 3 Descriptions thuyết phục (tối đa 90 ký tự)
- 1 Call-to-Action mạnh mẽ

Áp dụng:
- Công thức AIDA (Attention, Interest, Desire, Action)
- Power words tạo urgency
- Tâm lý học hành vi người tiêu dùng

Trả về JSON:
{
  "headlines": ["headline1", "headline2", "headline3", "headline4", "headline5"],
  "descriptions": ["desc1", "desc2", "desc3"],
  "callToAction": "CTA text"
}
`;

const VIDEO_SCRIPT_PROMPT = `
Bạn là đạo diễn video quảng cáo chuyên nghiệp. Viết kịch bản video {duration}s cho góc tấn công sau:

BRAND INFO:
{brandInfo}

GÓC TẤN CÔNG:
{angle}

Yêu cầu viết kịch bản PHÂN CẢNH CHI TIẾT gồm {sceneCount} cảnh:

Mỗi cảnh cần có:
- **Visual**: Mô tả hình ảnh/cảnh quay cụ thể (angle camera, chuyển động, hiệu ứng)
- **Voiceover**: Lời bình chính xác (đếm được thời lượng)
- **Text Overlay**: Chữ hiện trên màn hình (slogan, key points)
- **Music Note**: Gợi ý nhạc nền (beat, mood)
- **Transition**: Hiệu ứng chuyển cảnh

Cấu trúc video:
- Scene 1-2: HOOK - Thu hút attention trong 3s đầu
- Scene 3-{middleScene}: STORY - Kể câu chuyện/giải quyết pain point  
- Scene cuối: CTA - Kêu gọi hành động mạnh mẽ

Trả về JSON:
{
  "hook": "Câu mở đầu gây sốc/tò mò",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 3,
      "visual": "Close-up sản phẩm với ánh sáng dramatic, camera zoom in chậm",
      "voiceover": "Bạn có biết 90% người dùng đã...",
      "textOverlay": "SỰ THẬT GÂY SỐC",
      "musicNote": "Bass drop, tense build-up",
      "transition": "Quick cut"
    }
  ],
  "callToAction": "Đăng ký ngay hôm nay!",
  "suggestedMusic": "Upbeat electronic, 120 BPM",
  "overallMood": "Energetic, confident"
}
`;

const LANDING_PAGE_PROMPT = `
Bạn là chuyên gia thiết kế landing page chuyển đổi cao. Tạo cấu trúc landing page cho góc tấn công sau:

BRAND INFO:
{brandInfo}

GÓC TẤN CÔNG:
{angle}

AD COPY:
{adCopy}

Yêu cầu tạo landing page với các section:

1. **Header**: Logo, headline ngắn, có thể có timer đếm ngược
2. **Hero Section**: Headline chính, subheadline, CTA button, hero image prompt, trust badges
3. **Features**: 3-4 điểm nổi bật với icon
4. **Social Proof**: 2-3 testimonials giả định, statistics ấn tượng
5. **Final CTA**: Headline urgency, button, guarantee

Landing page phải:
- Đồng bộ 100% với message của ad
- Tối ưu cho mobile-first
- Có urgency elements
- Clear value proposition

Trả về JSON:
{
  "header": {
    "logo": true,
    "headline": "Short headline",
    "subheadline": "Supporting text",
    "navigation": false
  },
  "hero": {
    "mainHeadline": "Main headline matching ad",
    "subHeadline": "Supporting value prop",
    "ctaButton": "CTA text",
    "ctaLink": "#register",
    "heroImagePrompt": "AI image generation prompt",
    "urgencyText": "Chỉ còn 24h",
    "trustBadges": ["100+ đánh giá 5⭐", "Bảo hành 30 ngày"]
  },
  "features": [
    {"icon": "🚀", "title": "Feature 1", "description": "Description"}
  ],
  "socialProof": {
    "testimonials": [
      {"quote": "...", "author": "Tên", "role": "Chức vụ"}
    ],
    "stats": [
      {"number": "10,000+", "label": "Khách hàng"}
    ]
  },
  "cta": {
    "headline": "Đừng bỏ lỡ cơ hội!",
    "subheadline": "Đăng ký ngay để nhận ưu đãi",
    "buttonText": "ĐĂNG KÝ NGAY",
    "guarantee": "Hoàn tiền 100% nếu không hài lòng",
    "urgencyTimer": true
  }
}
`;

// ==================== CORE FUNCTIONS ====================

/**
 * Generate 3 Campaign Angles based on Brand DNA and Competitors
 */
export async function generateCampaignAngles(
    brandDNA: BrandDNAInput,
    competitors: CompetitorInput[]
): Promise<CampaignAngle[]> {
    console.log('[Campaign] Generating 3 campaign angles...');

    const prompt = CAMPAIGN_ANGLES_PROMPT
        .replace('{brandDNA}', JSON.stringify(brandDNA, null, 2))
        .replace('{competitors}', JSON.stringify(competitors, null, 2));

    try {
        const response = await callGemini(prompt, { temperature: 0.8, maxTokens: 4096 });

        // Parse JSON from response
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Add IDs to angles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const angles: CampaignAngle[] = parsed.angles.map((angle: any, idx: number) => ({
            id: `angle_${Date.now()}_${idx + 1}`,
            ...angle
        }));

        console.log('[Campaign] Generated', angles.length, 'campaign angles');
        return angles;

    } catch (error) {
        console.error('[Campaign] Failed to generate angles:', error);
        // Return fallback angles
        return createFallbackAngles(brandDNA);
    }
}

/**
 * Generate Ad Copy for a specific angle
 */
export async function generateAdCopy(
    brandDNA: BrandDNAInput,
    angle: CampaignAngle
): Promise<AdCopySet> {
    console.log('[Campaign] Generating ad copy for angle:', angle.title);

    const brandInfo = `
Brand: ${brandDNA.brandName}
Tagline: ${brandDNA.tagline}
Industry: ${brandDNA.industryCategory}
USPs: ${brandDNA.uniqueSellingPoints.join(', ')}
Tone: ${brandDNA.toneOfVoice.join(', ')}
Target: ${brandDNA.targetAudience}
`;

    const prompt = AD_COPY_PROMPT
        .replace('{brandInfo}', brandInfo)
        .replace('{angle}', JSON.stringify(angle, null, 2));

    try {
        const response = await callGemini(prompt, { temperature: 0.7, maxTokens: 2048 });

        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            angleId: angle.id,
            headlines: parsed.headlines || [],
            descriptions: parsed.descriptions || [],
            callToAction: parsed.callToAction || 'Tìm hiểu ngay',
            platform: 'all'
        };

    } catch (error) {
        console.error('[Campaign] Ad copy generation failed:', error);
        return createFallbackAdCopy(brandDNA, angle);
    }
}

/**
 * Generate Video Script with detailed storyboard
 */
export async function generateVideoScript(
    brandDNA: BrandDNAInput,
    angle: CampaignAngle,
    duration: 15 | 30 = 15
): Promise<VideoScriptFull> {
    console.log('[Campaign] Generating', duration, 's video script for:', angle.title);

    const sceneCount = duration === 15 ? 4 : 6;
    const middleScene = duration === 15 ? 3 : 5;

    const brandInfo = `
Brand: ${brandDNA.brandName}
Tagline: ${brandDNA.tagline}
Summary: ${brandDNA.businessSummary}
Tone: ${brandDNA.toneOfVoice.join(', ')}
Pain Points: ${brandDNA.painPoints.join(', ')}
`;

    const prompt = VIDEO_SCRIPT_PROMPT
        .replace('{duration}', String(duration))
        .replace('{brandInfo}', brandInfo)
        .replace('{angle}', JSON.stringify(angle, null, 2))
        .replace('{sceneCount}', String(sceneCount))
        .replace('{middleScene}', String(middleScene));

    try {
        const response = await callGemini(prompt, { temperature: 0.8, maxTokens: 4096 });

        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            angleId: angle.id,
            duration,
            format: 'reels',
            hook: parsed.hook || '',
            scenes: parsed.scenes || [],
            callToAction: parsed.callToAction || '',
            suggestedMusic: parsed.suggestedMusic || '',
            overallMood: parsed.overallMood || ''
        };

    } catch (error) {
        console.error('[Campaign] Video script generation failed:', error);
        return createFallbackVideoScript(brandDNA, angle, duration);
    }
}

/**
 * Generate Landing Page Structure
 */
export async function generateLandingPage(
    brandDNA: BrandDNAInput,
    angle: CampaignAngle,
    adCopy: AdCopySet
): Promise<LandingPageStructure> {
    console.log('[Campaign] Generating landing page for:', angle.title);

    const brandInfo = `
Brand: ${brandDNA.brandName}
Tagline: ${brandDNA.tagline}
Summary: ${brandDNA.businessSummary}
Colors: ${brandDNA.brandColors.join(', ')}
`;

    const prompt = LANDING_PAGE_PROMPT
        .replace('{brandInfo}', brandInfo)
        .replace('{angle}', JSON.stringify(angle, null, 2))
        .replace('{adCopy}', JSON.stringify(adCopy, null, 2));

    try {
        const response = await callGemini(prompt, { temperature: 0.7, maxTokens: 4096 });

        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            angleId: angle.id,
            ...parsed
        };

    } catch (error) {
        console.error('[Campaign] Landing page generation failed:', error);
        return createFallbackLandingPage(brandDNA, angle, adCopy);
    }
}

/**
 * Generate Full Campaign Package (orchestrator)
 */
export async function generateFullCampaignPackage(
    brandDNA: BrandDNAInput,
    competitors: CompetitorInput[]
): Promise<CampaignPackage> {
    console.log('[Campaign] Starting full campaign generation for:', brandDNA.brandName);

    const packageId = `campaign_${Date.now()}`;

    // Step 1: Generate 3 Campaign Angles
    const angles = await generateCampaignAngles(brandDNA, competitors);

    // Step 2: Generate Ad Copy for each angle (parallel)
    const adCopyPromises = angles.map(angle => generateAdCopy(brandDNA, angle));
    const adCopies = await Promise.all(adCopyPromises);

    // Step 3: Generate Video Scripts for each angle (parallel)
    const videoScriptPromises = angles.map(angle =>
        generateVideoScript(brandDNA, angle, 15)
    );
    const videoScripts = await Promise.all(videoScriptPromises);

    // Step 4: Generate Landing Pages for each angle (parallel)
    const landingPagePromises = angles.map((angle, idx) =>
        generateLandingPage(brandDNA, angle, adCopies[idx])
    );
    const landingPages = await Promise.all(landingPagePromises);

    console.log('[Campaign] Full campaign package generated successfully');

    return {
        id: packageId,
        brandName: brandDNA.brandName,
        createdAt: new Date(),
        angles,
        adCopies,
        videoScripts,
        landingPages,
        status: 'ready'
    };
}

// ==================== FALLBACK FUNCTIONS ====================

function createFallbackAngles(brandDNA: BrandDNAInput): CampaignAngle[] {
    return [
        {
            id: `angle_${Date.now()}_1`,
            angleNumber: 1,
            angleType: 'usp_focus',
            title: 'Khác biệt vượt trội',
            description: `Tập trung vào điểm mạnh độc nhất của ${brandDNA.brandName} so với đối thủ`,
            targetEmotion: 'Tự tin',
            keyMessage: brandDNA.uniqueSellingPoints[0] || 'Giải pháp tốt nhất cho bạn',
            aiPredictScore: 75,
            basedOnWeakness: 'Đối thủ chưa tập trung vào USP này'
        },
        {
            id: `angle_${Date.now()}_2`,
            angleNumber: 2,
            angleType: 'social_proof',
            title: 'Được tin tưởng',
            description: 'Sử dụng testimonials và case studies để xây dựng niềm tin',
            targetEmotion: 'An tâm',
            keyMessage: 'Hàng nghìn khách hàng đã tin tưởng lựa chọn',
            aiPredictScore: 80,
            basedOnWeakness: 'Đối thủ thiếu social proof'
        },
        {
            id: `angle_${Date.now()}_3`,
            angleNumber: 3,
            angleType: 'emotion_story',
            title: 'Câu chuyện cảm động',
            description: 'Kể câu chuyện chạm vào trái tim khách hàng',
            targetEmotion: 'Đồng cảm',
            keyMessage: 'Chúng tôi hiểu bạn đang cần gì',
            aiPredictScore: 70,
            basedOnWeakness: 'Đối thủ quá khô khan, thiếu cảm xúc'
        }
    ];
}

function createFallbackAdCopy(brandDNA: BrandDNAInput, angle: CampaignAngle): AdCopySet {
    return {
        angleId: angle.id,
        headlines: [
            `${brandDNA.brandName} - ${angle.title}`,
            `Khám phá ${brandDNA.brandName} ngay!`,
            `Tại sao chọn ${brandDNA.brandName}?`,
            `${brandDNA.brandName} - Giải pháp cho bạn`,
            `Đừng bỏ lỡ ${brandDNA.brandName}`
        ],
        descriptions: [
            brandDNA.businessSummary.substring(0, 90) || 'Giải pháp hoàn hảo cho nhu cầu của bạn.',
            angle.keyMessage,
            `Trải nghiệm ${brandDNA.brandName} hôm nay!`
        ],
        callToAction: 'Tìm hiểu ngay',
        platform: 'all'
    };
}

function createFallbackVideoScript(
    brandDNA: BrandDNAInput,
    angle: CampaignAngle,
    duration: 15 | 30
): VideoScriptFull {
    const scenes: VideoScene[] = [
        {
            sceneNumber: 1,
            durationSeconds: 3,
            visual: 'Logo xuất hiện với hiệu ứng glitch, background gradient động',
            voiceover: 'Bạn đã sẵn sàng chưa?',
            textOverlay: brandDNA.brandName.toUpperCase(),
            musicNote: 'Bass drop, attention grabber',
            transition: 'Quick cut'
        },
        {
            sceneNumber: 2,
            durationSeconds: duration === 15 ? 5 : 8,
            visual: 'Montage nhanh các sản phẩm/dịch vụ, camera movement dynamic',
            voiceover: angle.keyMessage,
            textOverlay: angle.title,
            musicNote: 'Build-up, energetic',
            transition: 'Zoom transition'
        },
        {
            sceneNumber: 3,
            durationSeconds: duration === 15 ? 4 : 6,
            visual: 'Customer testimonial hoặc product demo',
            voiceover: brandDNA.uniqueSellingPoints[0] || 'Giải pháp hoàn hảo',
            textOverlay: '✓ ' + (brandDNA.coreValues[0] || 'Chất lượng hàng đầu'),
            musicNote: 'Emotional, trust-building',
            transition: 'Fade'
        },
        {
            sceneNumber: 4,
            durationSeconds: 3,
            visual: 'CTA screen với logo và button animated',
            voiceover: 'Đăng ký ngay hôm nay!',
            textOverlay: '🔥 ĐĂNG KÝ NGAY',
            musicNote: 'Final drop, urgency',
            transition: 'None'
        }
    ];

    if (duration === 30) {
        scenes.splice(2, 0, {
            sceneNumber: 3,
            durationSeconds: 5,
            visual: 'Problem visualization, pain point dramatization',
            voiceover: brandDNA.painPoints[0] || 'Bạn đang gặp khó khăn?',
            textOverlay: '❌ Vấn đề thường gặp',
            musicNote: 'Tension build',
            transition: 'Glitch'
        });
        scenes.splice(4, 0, {
            sceneNumber: 5,
            durationSeconds: 5,
            visual: 'Solution reveal, before/after comparison',
            voiceover: 'Giải pháp đã có mặt!',
            textOverlay: '✅ ' + brandDNA.brandName,
            musicNote: 'Relief, positive',
            transition: 'Swipe'
        });
        // Renumber scenes
        scenes.forEach((s, i) => s.sceneNumber = i + 1);
    }

    return {
        angleId: angle.id,
        duration,
        format: 'reels',
        hook: 'Stop scrolling! Điều này sẽ thay đổi cuộc sống bạn...',
        scenes,
        callToAction: 'Link trong bio! Đăng ký nhận ưu đãi 50%',
        suggestedMusic: 'Trending TikTok sound, upbeat electronic',
        overallMood: 'Energetic, confident, modern'
    };
}

function createFallbackLandingPage(
    brandDNA: BrandDNAInput,
    angle: CampaignAngle,
    adCopy: AdCopySet
): LandingPageStructure {
    return {
        angleId: angle.id,
        header: {
            logo: true,
            headline: brandDNA.tagline || brandDNA.brandName,
            subheadline: 'Chỉ còn 24h để nhận ưu đãi đặc biệt',
            navigation: false
        },
        hero: {
            mainHeadline: adCopy.headlines[0] || `Chào mừng đến với ${brandDNA.brandName}`,
            subHeadline: adCopy.descriptions[0] || brandDNA.businessSummary,
            ctaButton: adCopy.callToAction || 'ĐĂNG KÝ NGAY',
            ctaLink: '#register',
            heroImagePrompt: `Professional hero image for ${brandDNA.industryCategory}, modern, premium feel, ${brandDNA.brandColors[0]} accent`,
            urgencyText: '⏰ Ưu đãi kết thúc trong 24:00:00',
            trustBadges: ['1000+ khách hàng hài lòng', '⭐ 4.9/5 đánh giá', '🛡️ Bảo hành 30 ngày']
        },
        features: brandDNA.uniqueSellingPoints.slice(0, 4).map((usp, i) => ({
            icon: ['🚀', '💎', '⚡', '🎯'][i] || '✓',
            title: usp,
            description: `Với ${brandDNA.brandName}, bạn sẽ trải nghiệm ${usp.toLowerCase()}`
        })),
        socialProof: {
            testimonials: [
                {
                    quote: `${brandDNA.brandName} đã thay đổi hoàn toàn cách tôi làm việc. Tuyệt vời!`,
                    author: 'Nguyễn Văn A',
                    role: 'CEO, Công ty XYZ'
                },
                {
                    quote: 'Sản phẩm/dịch vụ tốt nhất tôi từng sử dụng trong ngành này.',
                    author: 'Trần Thị B',
                    role: 'Marketing Manager'
                }
            ],
            stats: [
                { number: '10,000+', label: 'Khách hàng tin tưởng' },
                { number: '99%', label: 'Tỷ lệ hài lòng' },
                { number: '24/7', label: 'Hỗ trợ khách hàng' }
            ]
        },
        cta: {
            headline: 'Sẵn sàng thay đổi?',
            subheadline: 'Đăng ký ngay để nhận ưu đãi độc quyền chỉ có hôm nay',
            buttonText: '🎁 NHẬN ƯU ĐÃI NGAY',
            guarantee: '💯 Hoàn tiền 100% trong 30 ngày nếu không hài lòng',
            urgencyTimer: true
        }
    };
}

const CampaignStrategist = {
    generateCampaignAngles,
    generateAdCopy,
    generateVideoScript,
    generateLandingPage,
    generateFullCampaignPackage
};

export default CampaignStrategist;
