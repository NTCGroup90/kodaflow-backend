/**
 * Dynamic Creative API
 * POST /api/creative/dynamic
 * Generates multiple ad copy variations for A/B testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/gemini';

const VARIATION_PROMPT = `
Bạn là chuyên gia copywriting A/B testing. Tạo các biến thể ad copy để test hiệu quả.

AD COPY GỐC:
{adCopy}

BRAND DNA:
{brandDNA}

GÓC TẤN CÔNG:
{angle}

Yêu cầu tạo:
1. 5 HEADLINE biến thể:
   - Original: Giữ nguyên ý chính
   - Urgency: Thêm deadline/scarcity
   - Emotional: Chạm vào cảm xúc
   - Question: Dạng câu hỏi
   - Number: Thêm con số cụ thể

2. 3 DESCRIPTION biến thể:
   - Original: Giữ nguyên ý chính
   - Urgency: Thêm urgency elements
   - Social Proof: Thêm testimonial/số liệu

Mỗi variation:
- Giữ dưới 40 ký tự cho headline
- Giữ dưới 90 ký tự cho description
- Bằng tiếng Việt

Trả về JSON:
{
  "headlines": [
    {"text": "...", "variant": "Original"},
    {"text": "...", "variant": "Urgency"},
    {"text": "...", "variant": "Emotional"},
    {"text": "...", "variant": "Question"},
    {"text": "...", "variant": "Number"}
  ],
  "descriptions": [
    {"text": "...", "variant": "Original"},
    {"text": "...", "variant": "Urgency"},
    {"text": "...", "variant": "Social Proof"}
  ]
}
`;

export async function POST(request: NextRequest) {
    try {
        const { adCopy, brandDNA, angle } = await request.json();

        if (!adCopy) {
            return NextResponse.json({
                success: false,
                error: 'Ad copy is required'
            }, { status: 400 });
        }

        const prompt = VARIATION_PROMPT
            .replace('{adCopy}', JSON.stringify(adCopy, null, 2))
            .replace('{brandDNA}', JSON.stringify(brandDNA || {}, null, 2))
            .replace('{angle}', JSON.stringify(angle || {}, null, 2));

        const response = await callGemini(prompt, { temperature: 0.8, maxTokens: 2048 });

        // Parse JSON
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Could not parse variations');
        }

        const result = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            headlines: result.headlines || [],
            descriptions: result.descriptions || []
        });

    } catch (error: any) {
        console.error('[Dynamic] Generation failed:', error);

        // Return fallback variations
        return NextResponse.json({
            success: true,
            headlines: [
                { text: 'Khám phá ngay hôm nay', variant: 'Original' },
                { text: '🔥 Chỉ còn 24h - Đăng ký ngay!', variant: 'Urgency' },
                { text: 'Bạn xứng đáng được tốt hơn', variant: 'Emotional' },
                { text: 'Bạn đã sẵn sàng thay đổi?', variant: 'Question' },
                { text: '3 bước để thành công', variant: 'Number' }
            ],
            descriptions: [
                { text: 'Giải pháp hoàn hảo cho doanh nghiệp của bạn', variant: 'Original' },
                { text: '⚡ Ưu đãi đặc biệt kết thúc trong 48h!', variant: 'Urgency' },
                { text: 'Hơn 10,000 khách hàng đã tin tưởng lựa chọn', variant: 'Social Proof' }
            ]
        });
    }
}
