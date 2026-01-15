/**
 * Campaign Generation API - Streaming Version
 * POST /api/campaign/stream
 * Generates campaign with real-time progress updates via Server-Sent Events
 */

import { NextRequest } from 'next/server';
import {
    generateCampaignAngles,
    generateAdCopy,
    generateVideoScript,
    generateLandingPage,
    BrandDNAInput,
    CompetitorInput,
    CampaignAngle,
    AdCopySet,
    VideoScriptFull,
    LandingPageStructure
} from '@/lib/ai/campaign-strategist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Progress steps for UI
const STEPS = {
    INIT: { progress: 0, message: 'Khởi tạo chiến dịch...', phase: 'init' },
    ANGLES: { progress: 15, message: 'AI đang phân tích 3 góc tấn công...', phase: 'angles' },
    ANGLES_DONE: { progress: 30, message: '✓ 3 Góc tấn công đã sẵn sàng', phase: 'angles' },
    AD_COPY: { progress: 45, message: 'Viết Ad Copy cho từng góc...', phase: 'adcopy' },
    AD_COPY_DONE: { progress: 55, message: '✓ Ad Copy hoàn thành', phase: 'adcopy' },
    VIDEO: { progress: 65, message: 'Tạo Video Scripts...', phase: 'video' },
    VIDEO_DONE: { progress: 75, message: '✓ Video Scripts hoàn thành', phase: 'video' },
    LANDING: { progress: 85, message: 'Xây dựng Landing Pages...', phase: 'landing' },
    LANDING_DONE: { progress: 95, message: '✓ Landing Pages hoàn thành', phase: 'landing' },
    COMPLETE: { progress: 100, message: '🎉 Chiến dịch hoàn tất!', phase: 'complete' }
};

export async function POST(request: NextRequest) {
    const encoder = new TextEncoder();

    const body = await request.json();
    const { brandDNA, competitors } = body;

    // Validate input
    if (!brandDNA || !brandDNA.brandName) {
        return new Response(
            JSON.stringify({ success: false, error: 'Brand DNA is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Convert to expected format
    const brandInput: BrandDNAInput = {
        brandName: brandDNA.brandName || '',
        tagline: brandDNA.selectedTagline || brandDNA.taglineSuggestions?.[0] || '',
        businessSummary: brandDNA.businessSummary || '',
        coreValues: brandDNA.coreValues || [],
        toneOfVoice: brandDNA.toneOfVoice || [],
        targetAudience: brandDNA.targetAudience || '',
        painPoints: brandDNA.painPoints || [],
        uniqueSellingPoints: brandDNA.uniqueSellingPoints || [],
        industryCategory: brandDNA.industryCategory || '',
        brandColors: brandDNA.brandColors || ['#00d4ff', '#a855f7']
    };

    const competitorInputs: CompetitorInput[] = (competitors || []).map((c: any) => ({
        name: c.name || '',
        strengths: c.strengths || [],
        weaknesses: c.weaknesses || [],
        attackAngle: c.attackAngle || '',
        opportunityScore: c.opportunityScore || 5
    }));

    // Create streaming response
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (type: string, data: any) => {
                const message = `data: ${JSON.stringify({ type, ...data })}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            try {
                const packageId = `campaign_${Date.now()}`;

                // STEP 1: Init
                sendEvent('progress', STEPS.INIT);
                await new Promise(r => setTimeout(r, 300));

                // STEP 2: Generate Campaign Angles
                sendEvent('progress', STEPS.ANGLES);
                let angles: CampaignAngle[];
                try {
                    angles = await generateCampaignAngles(brandInput, competitorInputs);
                } catch (err) {
                    console.error('[Stream] Angles error:', err);
                    angles = createFallbackAngles(brandInput);
                }
                sendEvent('progress', STEPS.ANGLES_DONE);
                sendEvent('angles', { angles });

                // STEP 3: Generate Ad Copy (parallel for all angles)
                sendEvent('progress', STEPS.AD_COPY);
                let adCopies: AdCopySet[];
                try {
                    adCopies = await Promise.all(
                        angles.map(angle => generateAdCopy(brandInput, angle))
                    );
                } catch (err) {
                    console.error('[Stream] Ad copy error:', err);
                    adCopies = angles.map(angle => createFallbackAdCopy(brandInput, angle));
                }
                sendEvent('progress', STEPS.AD_COPY_DONE);
                sendEvent('adCopies', { adCopies });

                // STEP 4: Generate Video Scripts (parallel)
                sendEvent('progress', STEPS.VIDEO);
                let videoScripts: VideoScriptFull[];
                try {
                    videoScripts = await Promise.all(
                        angles.map(angle => generateVideoScript(brandInput, angle, 15))
                    );
                } catch (err) {
                    console.error('[Stream] Video error:', err);
                    videoScripts = angles.map(angle => createFallbackVideoScript(brandInput, angle));
                }
                sendEvent('progress', STEPS.VIDEO_DONE);
                sendEvent('videoScripts', { videoScripts });

                // STEP 5: Generate Landing Pages (parallel)
                sendEvent('progress', STEPS.LANDING);
                let landingPages: LandingPageStructure[];
                try {
                    landingPages = await Promise.all(
                        angles.map((angle, idx) => generateLandingPage(brandInput, angle, adCopies[idx]))
                    );
                } catch (err) {
                    console.error('[Stream] Landing page error:', err);
                    landingPages = angles.map((angle, idx) => createFallbackLandingPage(brandInput, angle, adCopies[idx]));
                }
                sendEvent('progress', STEPS.LANDING_DONE);
                sendEvent('landingPages', { landingPages });

                // STEP 6: Complete
                sendEvent('progress', STEPS.COMPLETE);

                const campaignPackage = {
                    id: packageId,
                    brandName: brandInput.brandName,
                    createdAt: new Date().toISOString(),
                    angles,
                    adCopies,
                    videoScripts,
                    landingPages,
                    status: 'ready'
                };

                sendEvent('complete', { success: true, data: campaignPackage });

            } catch (error: any) {
                console.error('[Stream] Fatal error:', error);
                sendEvent('error', { error: error.message || 'Campaign generation failed' });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}

// Fallback functions (copied for standalone use)
function createFallbackAngles(brandDNA: BrandDNAInput): CampaignAngle[] {
    return [
        {
            id: `angle_${Date.now()}_1`,
            angleNumber: 1,
            angleType: 'usp_focus',
            title: 'Khác biệt vượt trội',
            description: `Tập trung vào điểm mạnh độc nhất của ${brandDNA.brandName}`,
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
            aiPredictScore: 80
        },
        {
            id: `angle_${Date.now()}_3`,
            angleNumber: 3,
            angleType: 'emotion_story',
            title: 'Câu chuyện cảm động',
            description: 'Kể câu chuyện chạm vào trái tim khách hàng',
            targetEmotion: 'Đồng cảm',
            keyMessage: 'Chúng tôi hiểu bạn đang cần gì',
            aiPredictScore: 70
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
            brandDNA.businessSummary.substring(0, 90) || 'Giải pháp hoàn hảo.',
            angle.keyMessage,
            `Trải nghiệm ${brandDNA.brandName} hôm nay!`
        ],
        callToAction: 'Tìm hiểu ngay',
        platform: 'all'
    };
}

function createFallbackVideoScript(brandDNA: BrandDNAInput, angle: CampaignAngle): VideoScriptFull {
    return {
        angleId: angle.id,
        duration: 15,
        format: 'reels',
        hook: 'Stop scrolling! Điều này sẽ thay đổi cuộc sống bạn...',
        scenes: [
            {
                sceneNumber: 1,
                durationSeconds: 3,
                visual: 'Logo xuất hiện với hiệu ứng glitch',
                voiceover: 'Bạn đã sẵn sàng chưa?',
                textOverlay: brandDNA.brandName.toUpperCase(),
                musicNote: 'Bass drop',
                transition: 'Quick cut'
            },
            {
                sceneNumber: 2,
                durationSeconds: 5,
                visual: 'Montage nhanh sản phẩm',
                voiceover: angle.keyMessage,
                textOverlay: angle.title,
                musicNote: 'Build-up',
                transition: 'Zoom'
            },
            {
                sceneNumber: 3,
                durationSeconds: 4,
                visual: 'CTA screen',
                voiceover: 'Đăng ký ngay!',
                textOverlay: '🔥 ĐĂNG KÝ NGAY',
                musicNote: 'Final drop',
                transition: 'None'
            }
        ],
        callToAction: 'Link trong bio!',
        suggestedMusic: 'Trending TikTok sound',
        overallMood: 'Energetic'
    };
}

function createFallbackLandingPage(brandDNA: BrandDNAInput, angle: CampaignAngle, adCopy: AdCopySet): LandingPageStructure {
    return {
        angleId: angle.id,
        header: {
            logo: true,
            headline: brandDNA.tagline || brandDNA.brandName,
            subheadline: 'Chỉ còn 24h để nhận ưu đãi đặc biệt',
            navigation: false
        },
        hero: {
            mainHeadline: adCopy.headlines[0],
            subHeadline: adCopy.descriptions[0],
            ctaButton: adCopy.callToAction,
            ctaLink: '#register',
            heroImagePrompt: `Professional hero image for ${brandDNA.industryCategory}`,
            urgencyText: '⏰ Ưu đãi kết thúc trong 24:00:00',
            trustBadges: ['1000+ khách hàng', '⭐ 4.9/5', '🛡️ Bảo hành 30 ngày']
        },
        features: brandDNA.uniqueSellingPoints.slice(0, 3).map((usp, i) => ({
            icon: ['🚀', '💎', '⚡'][i] || '✓',
            title: usp,
            description: `Với ${brandDNA.brandName}, bạn sẽ trải nghiệm ${usp.toLowerCase()}`
        })),
        socialProof: {
            testimonials: [
                { quote: `${brandDNA.brandName} đã thay đổi hoàn toàn cách tôi làm việc!`, author: 'Nguyễn A', role: 'CEO' }
            ],
            stats: [
                { number: '10,000+', label: 'Khách hàng' },
                { number: '99%', label: 'Hài lòng' }
            ]
        },
        cta: {
            headline: 'Sẵn sàng thay đổi?',
            subheadline: 'Đăng ký ngay để nhận ưu đãi',
            buttonText: '🎁 NHẬN ƯU ĐÃI NGAY',
            guarantee: '💯 Hoàn tiền 100% trong 30 ngày',
            urgencyTimer: true
        }
    };
}
