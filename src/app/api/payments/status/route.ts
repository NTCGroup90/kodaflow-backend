import { NextRequest } from 'next/server';
import { paymentHandler } from '@/lib/payments';
import { handleApiRequest, requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    return handleApiRequest(async () => {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const orderCode = searchParams.get('orderCode');

        if (!orderCode) {
            throw new Error('Order code is required');
        }

        const status = await paymentHandler.checkPaymentStatus(orderCode);

        return status;
    });
}
