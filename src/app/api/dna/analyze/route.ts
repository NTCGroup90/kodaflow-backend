/**
 * Brand DNA Analysis API
 * POST /api/dna/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBrandDNA, scrapeVisualAssets, BrandDNA, ScrapedAsset } from '@/lib/ai/brand-dna';

export interface DNAAnalysisResponse {
    success: boolean;
    data?: {
        brandDNA: BrandDNA;
        assets: ScrapedAsset[];
        analyzedAt: string;
    };
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, textInput } = body;

        if (!url && !textInput) {
            return NextResponse.json({
                success: false,
                error: 'Vui lòng cung cấp URL hoặc mô tả doanh nghiệp'
            }, { status: 400 });
        }

        console.log('[API] DNA Analysis started for:', url || 'text input');

        // Parallel execution for speed
        const [brandDNA, assets] = await Promise.all([
            analyzeBrandDNA(url || `https://placeholder.com?desc=${encodeURIComponent(textInput)}`),
            url ? scrapeVisualAssets(url) : Promise.resolve([])
        ]);

        const response: DNAAnalysisResponse = {
            success: true,
            data: {
                brandDNA,
                assets,
                analyzedAt: new Date().toISOString()
            }
        };

        console.log('[API] DNA Analysis complete:', brandDNA.brandName);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('[API] DNA Analysis error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Có lỗi xảy ra khi phân tích'
        }, { status: 500 });
    }
}
