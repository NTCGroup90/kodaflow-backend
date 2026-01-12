import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { handleApiRequest, requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    return handleApiRequest(async () => {
        const user = await requireAuth();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = createAdminClient();

        const { data: transactions, count } = await supabase
            .from('credit_transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        return {
            transactions: transactions || [],
            total: count || 0,
            limit,
            offset,
        };
    });
}
