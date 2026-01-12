import { NextRequest } from 'next/server';
import { paymentHandler, type WebhookPayload } from '@/lib/payments';
import { createAdminClient } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as WebhookPayload;

        // Process webhook
        const result = await paymentHandler.handleWebhook(payload);

        if (!result.success) {
            return successResponse({ received: true, processed: false });
        }

        // Update database
        const supabase = createAdminClient();

        // Get transaction
        const { data: transaction } = await supabase
            .from('credit_transactions')
            .select('*, user_id')
            .eq('related_resource_id', result.orderCode)
            .eq('status', 'pending')
            .single();

        if (!transaction) {
            console.error('Transaction not found:', result.orderCode);
            return successResponse({ received: true, processed: false });
        }

        // Update transaction status
        await supabase
            .from('credit_transactions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', transaction.id);

        // Add credits to wallet
        await supabase.rpc('add_credits', {
            p_user_id: transaction.user_id,
            p_amount: transaction.amount,
        });

        return successResponse({ received: true, processed: true });
    } catch (error) {
        console.error('Webhook error:', error);
        // Always return 200 to prevent retries
        return successResponse({ received: true, error: 'Processing failed' });
    }
}
