import { NextRequest } from 'next/server';
import { paymentHandler } from '@/lib/payments';
import { createAdminClient } from '@/lib/supabase';
import {
    handleApiRequest,
    requireAuth,
    validateRequired
} from '@/lib/api-helpers';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Credit packages
const PACKAGES = {
    starter: { credits: 50, price: 99000, name: 'Starter' },
    pro: { credits: 150, price: 249000, name: 'Pro' },
    business: { credits: 500, price: 699000, name: 'Business' },
};

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        const user = await requireAuth();

        const body = await request.json();
        validateRequired(body, ['packageId']);

        const { packageId } = body;
        const pkg = PACKAGES[packageId as keyof typeof PACKAGES];

        if (!pkg) {
            throw new Error('Invalid package');
        }

        // Create pending transaction in database
        const supabase = createAdminClient();
        const orderCode = `KDF${Date.now()}`;

        await supabase.from('credit_transactions').insert({
            user_id: user.id,
            type: 'purchase',
            amount: pkg.credits,
            description: `Purchase ${pkg.name} package`,
            related_resource_id: orderCode,
            status: 'pending',
        });

        // Create PayOS payment link
        const payment = await paymentHandler.createPayment({
            userId: user.id,
            amount: pkg.price,
            packageName: pkg.name,
            baseUrl: BASE_URL,
        });

        return {
            orderCode: payment.orderCode,
            checkoutUrl: payment.checkoutUrl,
            qrCode: payment.qrCode,
            amount: pkg.price,
            credits: pkg.credits,
            expiresAt: payment.expiresAt,
        };
    });
}
