import { NextRequest } from 'next/server';
import {
    generateImage,
    generateProductImage,
    generateAdBanner,
    generateMultipleVariants
} from '@/lib/ai/gemini';
import {
    handleApiRequest,
    requireAuth,
    validateRequired
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        await requireAuth();

        const body = await request.json();
        validateRequired(body, ['prompt']);

        const {
            prompt,
            aspectRatio = '1:1',
            style = 'product',
            type = 'single',
            numberOfImages = 1,
        } = body;

        if (type === 'variants') {
            // Generate multiple style variants
            const images = await generateMultipleVariants(prompt, numberOfImages);
            return { images };
        }

        if (type === 'banner') {
            // Generate ad banner
            const { productName, headline } = body;
            const image = await generateAdBanner({
                productName: productName || prompt,
                headline: headline || '',
                aspectRatio,
            });
            return { image };
        }

        if (type === 'product') {
            // Generate product image
            const image = await generateProductImage(prompt, body.description);
            return { image };
        }

        // Default: single image generation with Imagen 3
        const images = await generateImage({
            prompt,
            aspectRatio,
            style,
            numberOfImages: 1,
        });

        return { image: images[0] };
    });
}
