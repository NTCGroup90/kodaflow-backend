import { createBrowserClient } from '@supabase/ssr';

// Browser client for client-side components
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// For backward compatibility
export const supabase = typeof window !== 'undefined'
    ? createClient()
    : null;
