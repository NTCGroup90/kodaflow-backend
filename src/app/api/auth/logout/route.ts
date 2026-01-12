import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleApiRequest, successResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }

        return { message: 'Logged out successfully' };
    });
}
