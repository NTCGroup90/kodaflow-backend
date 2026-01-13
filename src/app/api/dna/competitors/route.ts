/**
 * Competitor Analysis API
 * POST /api/dna/competitors
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeCompetitors, CompetitorAnalysis } from '@/lib/ai/brand-dna';

export interface CompetitorResponse {
    success: boolean;
    data?: {
        competitors: CompetitorAnalysis[];
        analyzedAt: string;
    };
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { brandName, industryCategory, businessSummary } = body;

        if (!brandName || !industryCategory) {
            return NextResponse.json({
                success: false,
                error: 'Vui lòng cung cấp tên thương hiệu và ngành hàng'
            }, { status: 400 });
        }

        console.log('[API] Competitor Analysis started for:', brandName);

        const competitors = await analyzeCompetitors(brandName, industryCategory, businessSummary || '');

        const response: CompetitorResponse = {
            success: true,
            data: {
                competitors,
                analyzedAt: new Date().toISOString()
            }
        };

        console.log('[API] Found', competitors.length, 'competitors');

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('[API] Competitor Analysis error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Có lỗi xảy ra khi phân tích đối thủ'
        }, { status: 500 });
    }
}
