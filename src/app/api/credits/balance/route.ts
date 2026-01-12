import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { handleApiRequest, requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    return handleApiRequest(async () => {
        const user = await requireAuth();

        const supabase = createAdminClient();

        const { data: wallet } = await supabase
            .from('user_wallets')
            .select('credits, total_purchased, total_used')
            .eq('user_id', user.id)
            .single();

        return {
            credits: wallet?.credits || 0,
            totalPurchased: wallet?.total_purchased || 0,
            totalUsed: wallet?.total_used || 0,
        };
    });
}
