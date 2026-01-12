import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    const checks = {
        database: await checkDatabase(),
        gemini: checkEnvVar('GEMINI_API_KEY'),
        replicate: checkEnvVar('REPLICATE_API_TOKEN'),
        json2video: checkEnvVar('JSON2VIDEO_API_KEY'),
        payos: checkEnvVar('PAYOS_API_KEY'),
    };

    const allHealthy = Object.values(checks).every(c => c.status === 'ok');

    return successResponse({
        status: allHealthy ? 'healthy' : 'degraded',
        service: 'kodaflow-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        checks,
    });
}

function checkEnvVar(name: string): { status: string; configured: boolean } {
    const configured = !!process.env[name];
    return {
        status: configured ? 'ok' : 'missing',
        configured,
    };
}

async function checkDatabase(): Promise<{ status: string; message: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return { status: 'missing', message: 'Supabase not configured' };
        }

        // Simple ping check
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
            },
        });

        return response.ok
            ? { status: 'ok', message: 'Connected' }
            : { status: 'error', message: 'Connection failed' };
    } catch (error) {
        return { status: 'error', message: 'Connection error' };
    }
}
