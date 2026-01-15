/**
 * Hook Formulas Library
 * 10+ proven viral hook formulas for video scripts
 */

export interface HookFormula {
    id: string;
    name: string;
    nameVi: string;
    template: string;
    example: string;
    bestFor: ('usp_focus' | 'social_proof' | 'emotion_story')[];
    engagementScore: number; // 1-100
    platforms: ('tiktok' | 'reels' | 'youtube' | 'facebook')[];
}

export const HOOK_FORMULAS: HookFormula[] = [
    {
        id: 'question',
        name: 'Question Hook',
        nameVi: 'Hook Câu Hỏi',
        template: 'Bạn có biết {fact}?',
        example: 'Bạn có biết 90% marketer đang làm sai điều này?',
        bestFor: ['usp_focus', 'social_proof'],
        engagementScore: 85,
        platforms: ['tiktok', 'reels', 'youtube']
    },
    {
        id: 'shock',
        name: 'Shock/Controversy Hook',
        nameVi: 'Hook Gây Sốc',
        template: '{statistic}% người dùng đang {mistake}',
        example: '90% người dùng đang lãng phí tiền quảng cáo mà không biết',
        bestFor: ['usp_focus'],
        engagementScore: 92,
        platforms: ['tiktok', 'reels']
    },
    {
        id: 'story',
        name: 'Story Hook',
        nameVi: 'Hook Kể Chuyện',
        template: 'Tôi đã từng {struggle}. Cho đến khi...',
        example: 'Tôi đã từng mất 100 triệu vào ads. Cho đến khi tôi phát hiện ra điều này...',
        bestFor: ['emotion_story'],
        engagementScore: 88,
        platforms: ['tiktok', 'reels', 'youtube', 'facebook']
    },
    {
        id: 'curiosity',
        name: 'Curiosity Gap Hook',
        nameVi: 'Hook Tò Mò',
        template: 'Điều này sẽ thay đổi cách bạn nghĩ về {topic}...',
        example: 'Điều này sẽ thay đổi cách bạn nghĩ về marketing...',
        bestFor: ['usp_focus', 'emotion_story'],
        engagementScore: 86,
        platforms: ['tiktok', 'reels', 'youtube']
    },
    {
        id: 'pov',
        name: 'POV Hook',
        nameVi: 'Hook POV',
        template: 'POV: Bạn vừa {discovery}',
        example: 'POV: Bạn vừa tìm ra công cụ tăng 5x view',
        bestFor: ['emotion_story', 'social_proof'],
        engagementScore: 90,
        platforms: ['tiktok', 'reels']
    },
    {
        id: 'number',
        name: 'Number/List Hook',
        nameVi: 'Hook Số Liệu',
        template: '{number} bí mật để {result}',
        example: '3 bí mật để viral TikTok mỗi tuần',
        bestFor: ['usp_focus'],
        engagementScore: 84,
        platforms: ['tiktok', 'reels', 'youtube']
    },
    {
        id: 'challenge',
        name: 'Challenge Hook',
        nameVi: 'Hook Thử Thách',
        template: 'Thử làm điều này và xem {result}',
        example: 'Thử làm điều này trong 7 ngày và xem doanh số tăng vọt',
        bestFor: ['usp_focus', 'emotion_story'],
        engagementScore: 82,
        platforms: ['tiktok', 'reels']
    },
    {
        id: 'behind_scenes',
        name: 'Behind-the-Scenes Hook',
        nameVi: 'Hook Hậu Trường',
        template: 'Cách tôi {achievement} (không ai nói cho bạn)',
        example: 'Cách tôi đạt 1M views (không ai nói cho bạn)',
        bestFor: ['social_proof', 'emotion_story'],
        engagementScore: 87,
        platforms: ['tiktok', 'reels', 'youtube']
    },
    {
        id: 'result',
        name: 'Result/Transformation Hook',
        nameVi: 'Hook Kết Quả',
        template: 'Từ {before} đến {after} trong {time}',
        example: 'Từ 0 đến 1M followers trong 6 tháng',
        bestFor: ['social_proof'],
        engagementScore: 91,
        platforms: ['tiktok', 'reels', 'youtube', 'facebook']
    },
    {
        id: 'fear',
        name: 'Fear/Warning Hook',
        nameVi: 'Hook Cảnh Báo',
        template: 'Đừng bao giờ {mistake} nếu bạn muốn {goal}',
        example: 'Đừng bao giờ chạy ads mà không làm điều này trước',
        bestFor: ['usp_focus'],
        engagementScore: 89,
        platforms: ['tiktok', 'reels', 'youtube']
    },
    {
        id: 'if_then',
        name: 'If-Then Hook',
        nameVi: 'Hook Nếu-Thì',
        template: 'Nếu bạn đang {situation}, hãy {action}',
        example: 'Nếu bạn đang mất tiền vào ads, hãy xem video này',
        bestFor: ['usp_focus', 'emotion_story'],
        engagementScore: 83,
        platforms: ['tiktok', 'reels', 'youtube', 'facebook']
    },
    {
        id: 'stop',
        name: 'Stop Scroll Hook',
        nameVi: 'Hook Dừng Lại',
        template: 'STOP! {urgent_reason}',
        example: 'STOP! Nếu bạn đang chạy Facebook Ads, xem ngay!',
        bestFor: ['usp_focus'],
        engagementScore: 88,
        platforms: ['tiktok', 'reels']
    }
];

/**
 * Get best hooks for a specific angle type
 */
export function getHooksForAngle(angleType: 'usp_focus' | 'social_proof' | 'emotion_story'): HookFormula[] {
    return HOOK_FORMULAS
        .filter(h => h.bestFor.includes(angleType))
        .sort((a, b) => b.engagementScore - a.engagementScore);
}

/**
 * Get best hooks for a specific platform
 */
export function getHooksForPlatform(platform: 'tiktok' | 'reels' | 'youtube' | 'facebook'): HookFormula[] {
    return HOOK_FORMULAS
        .filter(h => h.platforms.includes(platform))
        .sort((a, b) => b.engagementScore - a.engagementScore);
}

/**
 * Generate hook variations using a formula and brand data
 */
export function generateHookVariations(
    formula: HookFormula,
    brandData: {
        brandName: string;
        painPoints: string[];
        uniqueSellingPoints: string[];
        targetAudience: string;
    }
): string[] {
    const variations: string[] = [];
    const { template, id } = formula;

    switch (id) {
        case 'question':
            variations.push(
                `Bạn có biết tại sao ${brandData.targetAudience} đang chuyển sang ${brandData.brandName}?`,
                `Bạn có biết ${brandData.painPoints[0]?.toLowerCase() || 'điều này'}?`
            );
            break;
        case 'shock':
            variations.push(
                `90% ${brandData.targetAudience} đang mắc sai lầm này với ${brandData.painPoints[0]?.toLowerCase() || 'marketing'}`,
                `Sự thật gây sốc: ${brandData.uniqueSellingPoints[0] || 'Điều này sẽ thay đổi tất cả'}`
            );
            break;
        case 'result':
            variations.push(
                `Từ 0 đến thành công với ${brandData.brandName}`,
                `Trước và sau khi dùng ${brandData.brandName}`
            );
            break;
        case 'pov':
            variations.push(
                `POV: Bạn vừa phát hiện ra ${brandData.brandName}`,
                `POV: ${brandData.uniqueSellingPoints[0] || 'Cuộc sống thay đổi'}`
            );
            break;
        default:
            variations.push(template);
    }

    return variations;
}

export default HOOK_FORMULAS;
