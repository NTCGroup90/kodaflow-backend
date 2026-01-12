import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import {
    handleApiRequest,
    successResponse,
    errorResponse,
    validateRequired,
    validateEmail,
    ValidationError
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        const body = await request.json();

        // Validate required fields
        validateRequired(body, ['email', 'password']);

        const { email, password, fullName } = body;

        // Validate email format
        if (!validateEmail(email)) {
            throw new ValidationError({ email: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 6) {
            throw new ValidationError({ password: 'Password must be at least 6 characters' });
        }

        // Create user with Supabase Admin client
        const supabase = createAdminClient();

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for now
            user_metadata: {
                full_name: fullName || '',
                role: 'user',
            },
        });

        if (error) {
            if (error.message.includes('already registered')) {
                throw new ValidationError({ email: 'Email already registered' });
            }
            throw new Error(error.message);
        }

        // Create user profile in database
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: fullName || '',
                created_at: new Date().toISOString(),
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail signup if profile creation fails
        }

        // Initialize wallet with 0 credits
        const { error: walletError } = await supabase
            .from('user_wallets')
            .insert({
                user_id: data.user.id,
                credits: 0,
                total_purchased: 0,
                total_used: 0,
            });

        if (walletError) {
            console.error('Wallet creation error:', walletError);
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: fullName || '',
            },
            message: 'Account created successfully',
        };
    });
}
