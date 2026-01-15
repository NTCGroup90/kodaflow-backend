/**
 * Campaign Generation API
 * POST /api/campaign/generate
 * Generates full campaign package with 3 angles, ad copy, video scripts, landing pages
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    generateFullCampaignPackage,
    generateCampaignAngles,
    BrandDNAInput,
    CompetitorInput
} from '@/lib/ai/campaign-strategist';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { brandDNA, competitors, options } = body;

        console.log('[API] Campaign generation started for:', brandDNA?.brandName);

        // Validate input
        if (!brandDNA || !brandDNA.brandName) {
            return NextResponse.json({
                success: false,
                error: 'Brand DNA is required'
            }, { status: 400 });
        }

        // Convert to expected format
        const brandInput: BrandDNAInput = {
            brandName: brandDNA.brandName || '',
            tagline: brandDNA.selectedTagline || brandDNA.taglineSuggestions?.[0] || '',
            businessSummary: brandDNA.businessSummary || '',
            coreValues: brandDNA.coreValues || [],
            toneOfVoice: brandDNA.toneOfVoice || [],
            targetAudience: brandDNA.targetAudience || '',
            painPoints: brandDNA.painPoints || [],
            uniqueSellingPoints: brandDNA.uniqueSellingPoints || [],
            industryCategory: brandDNA.industryCategory || '',
            brandColors: brandDNA.brandColors || ['#00d4ff', '#a855f7']
        };

        // Convert competitors
        const competitorInputs: CompetitorInput[] = (competitors || []).map((c: any) => ({
            name: c.name || '',
            strengths: c.strengths || [],
            weaknesses: c.weaknesses || [],
            attackAngle: c.attackAngle || '',
            opportunityScore: c.opportunityScore || 5
        }));

        // Generate full campaign package
        const campaignPackage = await generateFullCampaignPackage(
            brandInput,
            competitorInputs
        );

        console.log('[API] Campaign generation complete:', campaignPackage.id);

        return NextResponse.json({
            success: true,
            data: campaignPackage
        });

    } catch (error: any) {
        console.error('[API] Campaign generation failed:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Campaign generation failed'
        }, { status: 500 });
    }
}
