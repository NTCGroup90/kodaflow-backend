import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini Image Generation API
// Uses Gemini 2.0 Flash for generating banners and logo concepts

interface GenerateImageRequest {
    type: 'banner' | 'logo';
    brandDNA: {
        brandName: string;
        tagline: string;
        brandColors: string[];
        coreValues: string[];
        industryCategory: string;
        toneOfVoice: string[];
    };
    platform?: string;
    size?: { width: number; height: number };
    style?: string;
}

const BANNER_SIZES: Record<string, { width: number; height: number; name: string }> = {
    'fb_feed': { width: 1200, height: 628, name: 'Facebook Feed' },
    'fb_square': { width: 1080, height: 1080, name: 'Facebook Square' },
    'ig_story': { width: 1080, height: 1920, name: 'Instagram Story' },
    'google_display': { width: 300, height: 250, name: 'Google Display' },
    'youtube_thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail' }
};

export async function POST(request: NextRequest) {
    try {
        const body: GenerateImageRequest = await request.json();
        const { type, brandDNA, platform, style } = body;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                { success: false, error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);

        // Use Gemini 2.0 Flash for image generation prompts
        // Note: As of now, Gemini generates image prompts which can be used with Imagen
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let prompt: string;
        let imagePrompt: string;

        if (type === 'banner') {
            const sizeInfo = platform ? BANNER_SIZES[platform] : { width: 1200, height: 628, name: 'Standard' };

            prompt = `Bạn là designer chuyên nghiệp. Tạo mô tả chi tiết cho banner quảng cáo:

THƯƠNG HIỆU:
- Tên: ${brandDNA.brandName}
- Tagline: ${brandDNA.tagline}
- Màu sắc: ${brandDNA.brandColors.join(', ')}
- Giá trị: ${brandDNA.coreValues.join(', ')}
- Ngành: ${brandDNA.industryCategory}
- Tone: ${brandDNA.toneOfVoice.join(', ')}

KÍCH THƯỚC: ${sizeInfo.width}x${sizeInfo.height} (${sizeInfo.name})
STYLE: ${style || 'Modern, professional, eye-catching'}

Tạo prompt chi tiết để generate hình ảnh banner quảng cáo chuyên nghiệp.
Yêu cầu:
1. Phải thu hút scroll stopper
2. Text phải rõ ràng, dễ đọc
3. Có CTA button nổi bật
4. Phù hợp với brand DNA

Trả về JSON format:
{
  "imagePrompt": "Chi tiết prompt để generate hình...",
  "headline": "Headline cho banner",
  "subheadline": "Subheadline",
  "ctaText": "Nút CTA",
  "visualElements": ["Element 1", "Element 2"],
  "colorPalette": ["#hex1", "#hex2"],
  "layoutDescription": "Mô tả layout..."
}`;
        } else {
            prompt = `Bạn là logo designer chuyên nghiệp. Tạo concept logo cho:

THƯƠNG HIỆU:
- Tên: ${brandDNA.brandName}
- Tagline: ${brandDNA.tagline}
- Màu sắc: ${brandDNA.brandColors.join(', ')}
- Giá trị: ${brandDNA.coreValues.join(', ')}
- Ngành: ${brandDNA.industryCategory}
- Tone: ${brandDNA.toneOfVoice.join(', ')}

Tạo 3 concept logo khác nhau với prompt chi tiết.

Trả về JSON format:
{
  "concepts": [
    {
      "name": "Concept 1 name",
      "imagePrompt": "Prompt chi tiết...",
      "description": "Mô tả ý nghĩa...",
      "style": "Minimalist/Modern/Classic...",
      "symbolism": "Biểu tượng ẩn dụ..."
    }
  ]
}`;
        }

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse response');
        }

        const data = JSON.parse(jsonMatch[0]);

        // Now use Imagen to generate actual image if available
        // For now, return the prompt data that can be used with external tools
        let generatedImageUrl = null;

        // Try to generate with Imagen if available
        try {
            // Gemini 2.0 with Imagen support
            const imageModel = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    // @ts-ignore - Imagen config
                    responseModalities: ['image', 'text']
                }
            });

            const imageResult = await imageModel.generateContent(
                type === 'banner'
                    ? data.imagePrompt
                    : data.concepts?.[0]?.imagePrompt || data.imagePrompt
            );

            // Check if image was generated
            const parts = imageResult.response.candidates?.[0]?.content?.parts;
            if (parts) {
                for (const part of parts) {
                    if ('inlineData' in part && part.inlineData) {
                        generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }
        } catch (imgErr) {
            console.log('Imagen generation not available, returning prompts only:', imgErr);
        }

        return NextResponse.json({
            success: true,
            data: {
                type,
                platform,
                ...data,
                generatedImageUrl,
                sizes: type === 'banner' ? BANNER_SIZES : null
            }
        });

    } catch (error: any) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
}
