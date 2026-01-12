import { NextRequest } from 'next/server';
import { analyzeProductUrl, generateAdCopy, generateBrandDNA } from '@/lib/ai/gemini';
import {
    handleApiRequest,
    // requireAuth,
    validateRequired,
    validateUrl,
    ValidationError
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        // Temporarily disabled auth for testing
        // await requireAuth();


        const body = await request.json();
        validateRequired(body, ['url']);

        const { url } = body;

        if (!validateUrl(url)) {
            throw new ValidationError({ url: 'Invalid URL format' });
        }

        // Analyze product from URL
        const product = await analyzeProductUrl(url);

        // Generate ad copy suggestions
        const adCopy = await generateAdCopy(product);

        // Generate brand DNA suggestions
        const brandDNA = await generateBrandDNA(product);

        return {
            product,
            adCopy,
            brandDNA,
        };
    });
}
