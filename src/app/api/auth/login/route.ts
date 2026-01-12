import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
    handleApiRequest,
    validateRequired,
    validateEmail,
    ValidationError
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        const body = await request.json();

        // Validate required fields
        validateRequired(body, ['email', 'password']);

        const { email, password } = body;

        // Validate email format
        if (!validateEmail(email)) {
            throw new ValidationError({ email: 'Invalid email format' });
        }

        // Sign in with Supabase
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new ValidationError({
                credentials: 'Invalid email or password'
            });
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name || '',
            },
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
            },
        };
    });
}
