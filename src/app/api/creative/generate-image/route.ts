import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImagePrompt, IMAGE_SPECS, BrandDNA } from '@/lib/creative/script-generator';

// Pro-quality image generation API
// Returns editable prompt first, generates image on second call

interface GenerateImageRequest {
    action: 'generate_prompt' | 'generate_image';
    brandDNA: BrandDNA;
    platform: 'facebook' | 'youtube' | 'google_display';
    sizeId: string;
    headline?: string;
    subheadline?: string;
    customPrompt?: string; // When user edits the prompt
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateImageRequest = await request.json();
        const { action, brandDNA, platform, sizeId, headline, subheadline, customPrompt } = body;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                { success: false, error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Find the size specs
        const platformSpecs = IMAGE_SPECS[platform];
        const sizeSpec = platformSpecs?.find(s => s.id === sizeId);

        if (!sizeSpec) {
            return NextResponse.json(
                { success: false, error: 'Invalid platform or size' },
                { status: 400 }
            );
        }

        // Step 1: Generate editable prompt
        if (action === 'generate_prompt') {
            const promptData = generateImagePrompt(
                brandDNA,
                platform,
                `${sizeSpec.width}x${sizeSpec.height}`,
                headline,
                subheadline
            );

            return NextResponse.json({
                success: true,
                data: {
                    action: 'prompt_ready',
                    prompt: promptData.editablePrompt,
                    dnaElements: promptData.dnaElements,
                    size: sizeSpec,
                    platform
                }
            });
        }

        // Step 2: Generate image with the (possibly edited) prompt
        if (action === 'generate_image') {
            const finalPrompt = customPrompt || generateImagePrompt(
                brandDNA,
                platform,
                `${sizeSpec.width}x${sizeSpec.height}`,
                headline,
                subheadline
            ).editablePrompt;

            const genAI = new GoogleGenerativeAI(geminiApiKey);

            let generatedImageUrl = null;

            try {
                // Try Gemini 2.0 with image generation
                const imageModel = genAI.getGenerativeModel({
                    model: 'gemini-2.0-flash-exp',
                    generationConfig: {
                        // @ts-ignore
                        responseModalities: ['image', 'text']
                    }
                });

                const imageResult = await imageModel.generateContent(finalPrompt);
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
                console.log('Direct image generation failed, trying alternative:', imgErr);
            }

            // If direct generation failed, return the prompt for external tools
            return NextResponse.json({
                success: true,
                data: {
                    action: 'image_ready',
                    imageUrl: generatedImageUrl,
                    prompt: finalPrompt,
                    size: sizeSpec,
                    platform,
                    // If no image, user can use this prompt in DALL-E/Midjourney
                    externalToolInstructions: !generatedImageUrl ? {
                        dallePrompt: finalPrompt,
                        midjourneyPrompt: `${finalPrompt} --ar ${sizeSpec.width}:${sizeSpec.height} --v 6`,
                        canvaPrompt: `Search for: ${brandDNA.industryCategory} advertisement ${brandDNA.toneOfVoice[0]}`
                    } : null
                }
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process request' },
            { status: 500 }
        );
    }
}
