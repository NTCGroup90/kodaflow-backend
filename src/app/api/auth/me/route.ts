import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase';
import { handleApiRequest, requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    return handleApiRequest(async () => {
        const user = await requireAuth();

        // Get full profile from database
        const supabase = createAdminClient();

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Get wallet balance
        const { data: wallet } = await supabase
            .from('user_wallets')
            .select('credits, total_purchased, total_used')
            .eq('user_id', user.id)
            .single();

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: profile?.full_name || '',
                avatarUrl: profile?.avatar_url || null,
                createdAt: profile?.created_at,
            },
            wallet: wallet || { credits: 0, total_purchased: 0, total_used: 0 },
        };
    });
}
