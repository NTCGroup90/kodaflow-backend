import { NextRequest, NextResponse } from 'next/server';
import { generatePlatformScripts, Platform, BrandDNA } from '@/lib/creative/script-generator';

// API to generate platform-specific video scripts

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { brandDNA, platforms } = body as {
            brandDNA: BrandDNA;
            platforms: Platform[];
        };

        if (!brandDNA) {
            return NextResponse.json(
                { success: false, error: 'Brand DNA is required' },
                { status: 400 }
            );
        }

        if (!platforms || platforms.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one platform is required' },
                { status: 400 }
            );
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json(
                { success: false, error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const scripts = await generatePlatformScripts(brandDNA, platforms, geminiApiKey);

        return NextResponse.json({
            success: true,
            data: {
                scripts,
                brandName: brandDNA.brandName,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Script generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate scripts' },
            { status: 500 }
        );
    }
}
