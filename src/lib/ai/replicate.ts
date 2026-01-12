/**
 * Replicate API Integration
 * Uses Flux.1 Schnell for fast image generation
 */

const REPLICATE_API_URL = 'https://api.replicate.com/v1';

export interface ImageGenerationOptions {
    prompt: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    numOutputs?: number;
    style?: 'product' | 'lifestyle' | 'minimalist' | 'vibrant' | 'premium';
}

export interface GeneratedImage {
    url: string;
    prompt: string;
    createdAt: string;
}

// ==================== Style Prompts ====================

const STYLE_PROMPTS: Record<string, string> = {
    product: 'professional product photography, white background, studio lighting, high quality, 4k',
    lifestyle: 'lifestyle shot, modern interior, warm natural lighting, cozy atmosphere',
    minimalist: 'minimalist design, clean aesthetic, soft gradient background, elegant',
    vibrant: 'vibrant colors, dynamic composition, eye-catching, bold design',
    premium: 'premium luxury feel, dark background, dramatic lighting, sophisticated',
};

// ==================== Core API Functions ====================

export async function generateImage(
    options: ImageGenerationOptions
): Promise<GeneratedImage> {
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    // Build enhanced prompt with style
    const stylePrompt = options.style ? STYLE_PROMPTS[options.style] : '';
    const fullPrompt = `${options.prompt}, ${stylePrompt}`.trim();

    // Create prediction
    const createResponse = await fetch(`${REPLICATE_API_URL}/predictions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Flux.1 Schnell model (fastest)
            version: 'black-forest-labs/flux-schnell',
            input: {
                prompt: fullPrompt,
                num_outputs: options.numOutputs || 1,
                aspect_ratio: options.aspectRatio || '1:1',
                output_format: 'webp',
                output_quality: 90,
            },
        }),
    });

    if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Replicate API error: ${error}`);
    }

    const prediction = await createResponse.json();
    const predictionId = prediction.id;

    // Poll for completion (max 60 seconds)
    for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(
            `${REPLICATE_API_URL}/predictions/${predictionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            }
        );

        const statusData = await statusResponse.json();

        if (statusData.status === 'succeeded') {
            return {
                url: statusData.output[0],
                prompt: fullPrompt,
                createdAt: new Date().toISOString(),
            };
        }

        if (statusData.status === 'failed') {
            throw new Error(`Image generation failed: ${statusData.error}`);
        }
    }

    throw new Error('Image generation timeout');
}

// ==================== Batch Generation ====================

export async function generateImageVariants(
    basePrompt: string,
    count: number = 5
): Promise<GeneratedImage[]> {
    const styles: Array<keyof typeof STYLE_PROMPTS> = [
        'product',
        'lifestyle',
        'minimalist',
        'vibrant',
        'premium',
    ];

    const results: GeneratedImage[] = [];

    for (let i = 0; i < Math.min(count, styles.length); i++) {
        try {
            const image = await generateImage({
                prompt: basePrompt,
                style: styles[i] as any,
                aspectRatio: '1:1',
            });
            results.push(image);
        } catch (error) {
            console.error(`Failed to generate variant ${i}:`, error);
        }
    }

    return results;
}

// ==================== Banner Generation ====================

export interface BannerOptions {
    productName: string;
    headline: string;
    aspectRatio: '16:9' | '1:1' | '9:16';
    style?: 'modern' | 'classic' | 'bold';
}

export async function generateAdBanner(
    options: BannerOptions
): Promise<GeneratedImage> {
    const styleMap = {
        modern: 'modern minimalist design, clean typography, subtle gradients',
        classic: 'elegant classic design, refined typography, timeless aesthetic',
        bold: 'bold vibrant design, strong colors, impactful typography',
    };

    const prompt = `
    Professional advertising banner for "${options.productName}",
    headline text "${options.headline}",
    ${styleMap[options.style || 'modern']},
    commercial quality, marketing material, high resolution
  `.replace(/\s+/g, ' ').trim();

    return generateImage({
        prompt,
        aspectRatio: options.aspectRatio,
        style: 'premium',
    });
}
