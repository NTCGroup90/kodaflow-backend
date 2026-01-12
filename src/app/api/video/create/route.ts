import { NextRequest } from 'next/server';
import {
    createVideo,
    createProductShowcaseVideo,
    createTestimonialVideo
} from '@/lib/ai/json2video';
import {
    handleApiRequest,
    requireAuth,
    validateRequired
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        await requireAuth();

        const body = await request.json();
        validateRequired(body, ['template']);

        const { template, data } = body;

        let videoTemplate;

        switch (template) {
            case 'product_showcase':
                validateRequired(data, ['productName', 'images', 'headline', 'price', 'callToAction']);
                videoTemplate = createProductShowcaseVideo({
                    productName: data.productName,
                    images: data.images,
                    headline: data.headline,
                    price: data.price,
                    callToAction: data.callToAction,
                    duration: data.duration || 15,
                });
                break;

            case 'testimonial':
                validateRequired(data, ['customerName', 'testimonialText', 'rating']);
                videoTemplate = createTestimonialVideo({
                    customerName: data.customerName,
                    customerPhoto: data.customerPhoto,
                    testimonialText: data.testimonialText,
                    rating: data.rating,
                    brandLogo: data.brandLogo,
                });
                break;

            default:
                throw new Error(`Unknown template: ${template}`);
        }

        const job = await createVideo(videoTemplate);

        return { job };
    });
}
