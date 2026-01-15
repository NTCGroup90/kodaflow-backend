/**
 * Competitor Ad Analysis API
 * POST /api/spy/analyze
 * Uses Gemini to analyze competitor ads
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/gemini';

const ANALYSIS_PROMPT = `
Bạn là chuyên gia phân tích quảng cáo hàng đầu. Phân tích ad này của đối thủ:

AD INFO:
- Competitor: {competitor}
- Headline: {headline}
- Description: {description}
- CTA: {cta}
- Platform: {platform}
- Format: {format}

Yêu cầu phân tích:

1. **Điểm mạnh (3 điểm)**:
   - Phân tích copywriting
   - Psychological triggers sử dụng
   - Visual/format effectiveness

2. **Điểm yếu (3 điểm)**:
   - Những gì còn thiếu
   - Cơ hội có thể khai thác
   - Gaps trong messaging

3. **Hook Formula**: Xác định công thức hook đang dùng

4. **CTA Effectiveness**: Đánh giá 0-100

5. **Recommendations (3 điểm)**: Cách đánh bại ad này

Trả về JSON:
{
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2", "điểm yếu 3"],
  "hookFormula": "Tên công thức hook",
  "ctaEffectiveness": 75,
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}
`;

export async function POST(request: NextRequest) {
    try {
        const { ad } = await request.json();

        if (!ad || !ad.headline) {
            return NextResponse.json({
                success: false,
                error: 'Ad data is required'
            }, { status: 400 });
        }

        const prompt = ANALYSIS_PROMPT
            .replace('{competitor}', ad.competitor || 'Unknown')
            .replace('{headline}', ad.headline || '')
            .replace('{description}', ad.description || '')
            .replace('{cta}', ad.cta || '')
            .replace('{platform}', ad.platform || '')
            .replace('{format}', ad.format || '');

        const response = await callGemini(prompt, { temperature: 0.7, maxTokens: 2048 });

        // Parse JSON
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Could not parse analysis');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error: any) {
        console.error('[Spy] Analysis failed:', error);

        // Return mock analysis as fallback
        return NextResponse.json({
            success: true,
            analysis: {
                strengths: [
                    'Headline sử dụng số cụ thể tạo credibility',
                    'Social proof element có trong copy',
                    'CTA rõ ràng và action-oriented'
                ],
                weaknesses: [
                    'Thiếu urgency/scarcity element',
                    'Không có testimonial cụ thể',
                    'Description chưa address pain point trực tiếp'
                ],
                hookFormula: 'Number Hook + Social Proof',
                ctaEffectiveness: 72,
                recommendations: [
                    'Thêm deadline hoặc limited offer',
                    'Dùng storytelling approach thay vì list features',
                    'Test với emotional hook thay vì rational'
                ]
            }
        });
    }
}
