import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from './supabase';

// ==================== Response Helpers ====================

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(
        { success: true, data },
        { status }
    );
}

export function errorResponse(message: string, status = 400, code?: string) {
    return NextResponse.json(
        {
            success: false,
            error: { message, code: code || 'ERROR' }
        },
        { status }
    );
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function notFoundResponse(message = 'Not found') {
    return errorResponse(message, 404, 'NOT_FOUND');
}

export function validationErrorResponse(errors: Record<string, string>) {
    return NextResponse.json(
        {
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors
            }
        },
        { status: 422 }
    );
}

// ==================== Auth Middleware ====================

export interface AuthenticatedUser {
    id: string;
    email: string;
    role?: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email!,
            role: user.user_metadata?.role,
        };
    } catch {
        return null;
    }
}

export async function requireAuth(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser();

    if (!user) {
        throw new AuthError('Unauthorized');
    }

    return user;
}

// ==================== Error Classes ====================

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export class ValidationError extends Error {
    public errors: Record<string, string>;

    constructor(errors: Record<string, string>) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

// ==================== API Handler Wrapper ====================

type ApiHandler<T> = () => Promise<T>;

export async function handleApiRequest<T>(
    handler: ApiHandler<T>
): Promise<NextResponse> {
    try {
        const result = await handler();
        return successResponse(result);
    } catch (error) {
        console.error('API Error:', error);

        if (error instanceof AuthError) {
            return unauthorizedResponse(error.message);
        }

        if (error instanceof ValidationError) {
            return validationErrorResponse(error.errors);
        }

        if (error instanceof NotFoundError) {
            return notFoundResponse(error.message);
        }

        const message = error instanceof Error ? error.message : 'Internal server error';
        return errorResponse(message, 500, 'INTERNAL_ERROR');
    }
}

// ==================== Validation Helpers ====================

export function validateRequired(
    data: Record<string, unknown>,
    fields: string[]
): void {
    const errors: Record<string, string> = {};

    for (const field of fields) {
        if (!data[field]) {
            errors[field] = `${field} is required`;
        }
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError(errors);
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
