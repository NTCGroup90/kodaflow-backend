/**
 * Hook Generation API
 * POST /api/creative/hooks
 * Generates optimized hooks based on brand DNA and angle
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/gemini';
import { HOOK_FORMULAS, getHooksForAngle, HookFormula } from '@/lib/creative/hook-formulas';

const HOOK_GENERATION_PROMPT = `
Bạn là chuyên gia viral content. Dựa trên Brand DNA và góc tấn công, hãy tạo 10 hook gây nghiện cho video ngắn.

BRAND DNA:
{brandDNA}

GÓC TẤN CÔNG:
{angle}

CÔNG THỨC HOOK PHẢI DÙNG:
{formulas}

Yêu cầu:
1. Mỗi hook phải dưới 10 từ
2. Phải gây tò mò/shock/emotion ngay từ câu đầu
3. Phù hợp với TikTok/Reels/Shorts
4. Tối ưu cho {platform}
5. Áp dụng các công thức hook đã cho

Trả về JSON:
{
  "hooks": [
    {
      "text": "Hook text",
      "formulaId": "question",
      "predictedEngagement": 85,
      "bestPlatform": "tiktok"
    }
  ]
}
`;

export async function POST(request: NextRequest) {
    try {
        const { brandDNA, angle, platform = 'tiktok' } = await request.json();

        if (!brandDNA || !angle) {
            return NextResponse.json({
                success: false,
                error: 'Brand DNA and angle are required'
            }, { status: 400 });
        }

        // Get relevant hook formulas for this angle type
        const relevantFormulas = getHooksForAngle(angle.angleType || 'usp_focus').slice(0, 5);
        const formulaDescriptions = relevantFormulas.map(f =>
            `${f.name}: "${f.template}" (VD: ${f.example})`
        ).join('\n');

        const prompt = HOOK_GENERATION_PROMPT
            .replace('{brandDNA}', JSON.stringify(brandDNA, null, 2))
            .replace('{angle}', JSON.stringify(angle, null, 2))
            .replace('{formulas}', formulaDescriptions)
            .replace('{platform}', platform);

        const response = await callGemini(prompt, { temperature: 0.9, maxTokens: 2048 });

        // Parse JSON
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Could not parse hooks');
        }

        const result = JSON.parse(jsonMatch[0]);

        // Enrich with formula data
        const enrichedHooks = result.hooks.map((hook: any) => {
            const formula = HOOK_FORMULAS.find(f => f.id === hook.formulaId);
            return {
                ...hook,
                formulaName: formula?.nameVi || 'Custom Hook',
                formulaTemplate: formula?.template || ''
            };
        });

        return NextResponse.json({
            success: true,
            hooks: enrichedHooks,
            formulas: relevantFormulas
        });

    } catch (error: any) {
        console.error('[Hooks] Generation failed:', error);

        // Return fallback hooks
        const fallbackHooks = [
            { text: 'Bạn có biết 90% marketer đang làm sai?', formulaId: 'question', predictedEngagement: 85, bestPlatform: 'tiktok' },
            { text: 'STOP! Nếu bạn đang chạy ads, xem ngay!', formulaId: 'stop', predictedEngagement: 88, bestPlatform: 'tiktok' },
            { text: 'POV: Bạn vừa tìm ra bí quyết viral', formulaId: 'pov', predictedEngagement: 90, bestPlatform: 'reels' },
            { text: 'Từ 0 đến 1M views trong 30 ngày', formulaId: 'result', predictedEngagement: 91, bestPlatform: 'youtube' },
            { text: 'Đừng bao giờ làm điều này nếu muốn thành công', formulaId: 'fear', predictedEngagement: 87, bestPlatform: 'tiktok' }
        ];

        return NextResponse.json({
            success: true,
            hooks: fallbackHooks,
            formulas: HOOK_FORMULAS.slice(0, 5)
        });
    }
}
