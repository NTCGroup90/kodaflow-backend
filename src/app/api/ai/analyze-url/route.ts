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

        console.log('--- START ANALYSIS ---');
        console.log('Analyzing URL:', url);

        // Analyze product from URL
        console.log('1. Calling analyzeProductUrl...');
        let product;
        try {
            product = await analyzeProductUrl(url);
            console.log('Product analysis result:', product);
        } catch (e) {
            console.error('ERROR in analyzeProductUrl:', e);
            throw e;
        }

        // Generate ad copy suggestions
        console.log('2. Calling generateAdCopy...');
        let adCopy;
        try {
            adCopy = await generateAdCopy(product);
            console.log('Ad copy generated.');
        } catch (e) {
            console.error('ERROR in generateAdCopy:', e);
            // Don't crash if ad copy fails
            adCopy = null;
        }

        // Generate brand DNA suggestions
        console.log('3. Calling generateBrandDNA...');
        let brandDNA;
        try {
            brandDNA = await generateBrandDNA(product);
            console.log('Brand DNA generated:', brandDNA);
        } catch (e) {
            console.error('ERROR in generateBrandDNA:', e);
            brandDNA = null;
        }

        console.log('--- END ANALYSIS ---');

        return {
            product,
            adCopy,
            brandDNA,
        };

    });
}
