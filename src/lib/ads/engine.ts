import { GoogleAdsClient, CampaignConfig as GoogleCampaignConfig, AdGroupConfig as GoogleAdGroupConfig, AdCreative as GoogleAdCreative } from './google';
import { MetaAdsClient, MetaCampaignConfig, MetaAdSetConfig, MetaAdCreative } from './meta';
import { TikTokAdsClient, TikTokCampaignConfig, TikTokAdGroupConfig, TikTokAdCreative } from './tiktok';

// Unified Types
export interface UnifiedCampaignConfig {
    name: string;
    dailyBudget: number; // VND
    startDate?: string;
    endDate?: string;
    objective: 'CONVERSIONS' | 'TRAFFIC' | 'BRAND_AWARENESS' | 'LEADS' | 'SALES';
    targetLocations: string[]; // ['VN', 'US']
    targetAgeRange?: string; // '18-24' or similar
    targetGender?: 'MALE' | 'FEMALE' | 'ALL';
    // Pro Mode
    keywords?: string[];
    negativeKeywords?: string[];
    bidCap?: number;
    optimizationRules?: WinLossRule[];
}

export interface WinLossRule {
    id: string;
    name: string;
    metric: 'CPA' | 'ROAS' | 'SPEND' | 'CTR';
    operator: '>' | '<';
    threshold: number;
    action: 'PAUSE_CAMPAIGN' | 'PAUSE_ADSET' | 'INCREASE_BUDGET' | 'DECREASE_BID';
    actionValue?: number; // e.g. increase by 20%
}

export interface UnifiedAdCreative {
    headline: string; // Primary headline
    bodyText: string; // Primary text/description
    callToAction: string;
    finalUrl: string;
    imageUrls: string[]; // For display/feed ads
    videoUrl?: string; // For video ads
}

export interface UnifiedCampaignResult {
    platform: 'google' | 'facebook' | 'tiktok';
    campaignId: string;
    status: string;
    metrics?: {
        impressions: number;
        clicks: number;
        spend: number;
        conversions: number;
    };
}

export class AdsEngine {
    private googleClient: GoogleAdsClient;
    private metaClient: MetaAdsClient;
    private tiktokClient: TikTokAdsClient;

    constructor() {
        this.googleClient = new GoogleAdsClient();
        this.metaClient = new MetaAdsClient();
        this.tiktokClient = new TikTokAdsClient();
    }

    /**
     * Launch a campaign across a specific platform
     */
    async launchCampaign(
        platform: 'google' | 'facebook' | 'tiktok',
        config: UnifiedCampaignConfig,
        creative: UnifiedAdCreative
    ): Promise<UnifiedCampaignResult> {
        console.log(`[AdsEngine] Launching campaign on ${platform}: ${config.name}`);

        try {
            switch (platform) {
                case 'google':
                    return await this.launchGoogleCampaign(config, creative);
                case 'facebook':
                    return await this.launchMetaCampaign(config, creative);
                case 'tiktok':
                    return await this.launchTikTokCampaign(config, creative);
                default:
                    throw new Error(`Unsupported platform: ${platform}`);
            }
        } catch (error: any) {
            console.error(`[AdsEngine] Failed to launch on ${platform}:`, error);
            throw new Error(`Campaign launch failed: ${error.message}`);
        }
    }

    private async launchGoogleCampaign(config: UnifiedCampaignConfig, creative: UnifiedAdCreative): Promise<UnifiedCampaignResult> {
        // 1. Create Campaign
        const campaignConfig: GoogleCampaignConfig = {
            name: config.name,
            dailyBudget: config.dailyBudget,
            objective: this.mapObjectiveToGoogle(config.objective),
            startDate: config.startDate,
            endDate: config.endDate,
            channelType: 'SEARCH' // Default to Search for MVP
        };

        const campaign = await this.googleClient.createCampaign(campaignConfig);

        // 2. Create Ad Group
        const adGroupConfig: GoogleAdGroupConfig = {
            name: `${config.name} - AdGroup`,
            campaignId: campaign.id,
            cpcBidMicros: config.bidCap ? config.bidCap * 1_000_000 : undefined,
            targeting: {
                locations: config.targetLocations,
                ageRange: config.targetAgeRange,
                gender: config.targetGender,
                keywords: config.keywords,
                negativeKeywords: config.negativeKeywords
            }
        };

        const adGroup = await this.googleClient.createAdGroup(adGroupConfig);

        // 3. Create Ad
        const adCreative: GoogleAdCreative = {
            headlines: [creative.headline, 'Khuyến mãi đặc biệt', 'Mua ngay hôm nay'], // Google needs multiple
            descriptions: [creative.bodyText, 'Chất lượng đảm bảo. Giao hàng miễn phí.'],
            finalUrl: creative.finalUrl,
            imageUrls: creative.imageUrls
        };

        await this.googleClient.createResponsiveSearchAd(adGroup.id, adCreative);

        return {
            platform: 'google',
            campaignId: campaign.id,
            status: campaign.status,
            metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
        };
    }

    private async launchMetaCampaign(config: UnifiedCampaignConfig, creative: UnifiedAdCreative): Promise<UnifiedCampaignResult> {
        // 1. Create Campaign
        const campaignConfig: MetaCampaignConfig = {
            name: config.name,
            objective: this.mapObjectiveToMeta(config.objective),
            dailyBudget: config.dailyBudget
        };
        const campaign = await this.metaClient.createCampaign(campaignConfig);

        // 2. Create Ad Set
        const adSetConfig: MetaAdSetConfig = {
            name: `${config.name} - AdSet`,
            campaignId: campaign.id,
            dailyBudget: config.dailyBudget, // AdSet budget
            targeting: {
                countries: config.targetLocations
            }
        };
        const adSet = await this.metaClient.createAdSet(adSetConfig);

        // 3. Create Ad
        const adCreative: MetaAdCreative = {
            name: `${config.name} - Ad`,
            headline: creative.headline,
            description: creative.bodyText,
            callToAction: 'SHOP_NOW',
            linkUrl: creative.finalUrl,
            imageUrl: creative.imageUrls[0]
        };
        await this.metaClient.createAd(adSet.id, adCreative);

        return {
            platform: 'facebook',
            campaignId: campaign.id,
            status: 'PAUSED', // Meta/FB defaults to paused usually
            metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
        };
    }

    private async launchTikTokCampaign(config: UnifiedCampaignConfig, creative: UnifiedAdCreative): Promise<UnifiedCampaignResult> {
        // 1. Create Campaign
        const campaignConfig: TikTokCampaignConfig = {
            name: config.name,
            objective: this.mapObjectiveToTikTok(config.objective),
            budgetMode: 'BUDGET_MODE_DAY',
            budget: config.dailyBudget
        };
        const campaign = await this.tiktokClient.createCampaign(campaignConfig);

        // 2. Create Ad Group
        const adGroupConfig: TikTokAdGroupConfig = {
            name: `${config.name} - AdGroup`,
            campaignId: campaign.campaignId,
            placementType: 'PLACEMENT_TYPE_AUTOMATIC',
            budget: config.dailyBudget,
            scheduleType: 'SCHEDULE_FROM_NOW',
            targeting: {
                locations: config.targetLocations
            }
        };
        const adGroup = await this.tiktokClient.createAdGroup(adGroupConfig);

        // 3. Create Ad (Requires video)
        if (!creative.videoUrl) {
            // For MVP, if no video, we skip or mock. Real scenarios require video upload.
            console.warn('[AdsEngine] TikTok requires videoUrl. Using placeholder logic.');
        }

        const adCreative: TikTokAdCreative = {
            videoId: 'placeholder_video_id', // Would be from uploadVideo
            displayName: config.name,
            text: creative.bodyText,
            callToAction: 'SHOP_NOW',
            landingPageUrl: creative.finalUrl
        };
        await this.tiktokClient.createAd(adGroup.adGroupId, adCreative);

        return {
            platform: 'tiktok',
            campaignId: campaign.campaignId,
            status: 'PAUSED',
            metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
        };
    }

    // === Helpers for Enum Mapping ===

    private mapObjectiveToGoogle(obj: UnifiedCampaignConfig['objective']): GoogleCampaignConfig['objective'] {
        switch (obj) {
            case 'CONVERSIONS': return 'CONVERSIONS';
            case 'TRAFFIC': return 'CLICKS'; // Approx
            default: return 'CONVERSIONS';
        }
    }

    private mapObjectiveToMeta(obj: UnifiedCampaignConfig['objective']): MetaCampaignConfig['objective'] {
        switch (obj) {
            case 'CONVERSIONS':
            case 'SALES': return 'OUTCOME_SALES';
            case 'TRAFFIC': return 'OUTCOME_TRAFFIC';
            case 'LEADS': return 'OUTCOME_LEADS';
            default: return 'OUTCOME_AWARENESS';
        }
    }

    private mapObjectiveToTikTok(obj: UnifiedCampaignConfig['objective']): TikTokCampaignConfig['objective'] {
        switch (obj) {
            case 'CONVERSIONS': return 'CONVERSIONS';
            case 'TRAFFIC': return 'TRAFFIC';
            case 'BRAND_AWARENESS': return 'REACH';
            default: return 'CONVERSIONS';
        }
    }
    // === Optimization Engine (The "Winning" Logic) ===

    /**
     * Analyze campaign performance and apply Win/Loss rules
     * This ensures we kill bad ads and scale good ones
     */
    async checkOptimizationRules(
        campaignResult: UnifiedCampaignResult,
        rules: WinLossRule[]
    ): Promise<string[]> {
        const logs: string[] = [];
        const { metrics } = campaignResult;

        if (!metrics || !rules || rules.length === 0) return logs;

        for (const rule of rules) {
            let metricValue = 0;
            switch (rule.metric) {
                case 'CPA': metricValue = metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0; break;
                case 'ROAS': metricValue = metrics.spend > 0 ? (metrics.conversions * 500000) / metrics.spend : 0; break;
                case 'CTR': metricValue = (metrics.clicks / metrics.impressions) * 100; break;
                case 'SPEND': metricValue = metrics.spend; break;
            }

            // Skip if not enough data
            if (metrics.impressions < 1000 && rule.metric === 'CTR') continue;
            if (metrics.spend < 50000 && rule.metric !== 'CTR') continue;

            const isTriggered = rule.operator === '>' ? metricValue > rule.threshold : metricValue < rule.threshold;

            if (isTriggered) {
                const logMsg = `[Optimizer] Rule triggered: ${rule.metric} (${metricValue.toFixed(2)}) ${rule.operator} ${rule.threshold} -> Action: ${rule.action}`;
                console.log(logMsg);
                logs.push(logMsg);

                // Execute Action (Mock for now, would call API in real life)
                await this.executeOptimizationAction(campaignResult, rule);
            }
        }

        return logs;
    }

    private async executeOptimizationAction(campaign: UnifiedCampaignResult, rule: WinLossRule) {
        // In a real scenario, this would call the respective Platform API
        // e.g., this.metaClient.pauseCampaign(campaign.campaignId)
        console.log(`[AdsEngine] Executing ${rule.action} on ${campaign.platform} campaign ${campaign.campaignId}`);

        // Placeholder for API calls
        if (rule.action === 'PAUSE_CAMPAIGN') {
            // await this.getPlatformClient(campaign.platform).pauseCampaign(campaign.campaignId);
        }
    }
}

// Export singleton
export const adsEngine = new AdsEngine();
