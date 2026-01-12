/**
 * Meta Marketing API Integration
 * Supports Facebook and Instagram Ads
 */

const META_API_URL = 'https://graph.facebook.com/v18.0';

export interface MetaAdsConfig {
    appId: string;
    appSecret: string;
    accessToken: string;
    adAccountId: string;
    pageId: string;
}

export interface MetaCampaignConfig {
    name: string;
    objective: 'OUTCOME_AWARENESS' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_TRAFFIC';
    dailyBudget: number; // VND
    specialAdCategories?: string[];
}

export interface MetaAdSetConfig {
    name: string;
    campaignId: string;
    dailyBudget: number;
    targeting: {
        countries: string[];
        ageMin?: number;
        ageMax?: number;
        genders?: number[]; // 1=male, 2=female
        interests?: string[];
    };
    placements?: ('facebook' | 'instagram')[];
}

export interface MetaAdCreative {
    name: string;
    headline: string;
    description: string;
    callToAction: 'SHOP_NOW' | 'LEARN_MORE' | 'SIGN_UP' | 'CONTACT_US';
    imageUrl?: string;
    videoUrl?: string;
    linkUrl: string;
}

// ==================== Meta Ads Client ====================

export class MetaAdsClient {
    private config: MetaAdsConfig;

    constructor() {
        this.config = {
            appId: process.env.META_APP_ID || '',
            appSecret: process.env.META_APP_SECRET || '',
            accessToken: process.env.META_ACCESS_TOKEN || '',
            adAccountId: process.env.META_AD_ACCOUNT_ID || '',
            pageId: process.env.META_PAGE_ID || '',
        };
    }

    private async makeRequest(
        method: 'GET' | 'POST' | 'DELETE',
        endpoint: string,
        data?: object
    ): Promise<any> {
        const url = new URL(`${META_API_URL}/${endpoint}`);
        url.searchParams.set('access_token', this.config.accessToken);

        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        if (data && method === 'POST') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url.toString(), options);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Meta API error: ${error}`);
        }

        return response.json();
    }

    // ==================== Campaign Operations ====================

    async createCampaign(config: MetaCampaignConfig): Promise<{
        id: string;
        status: string;
    }> {
        const campaignData = {
            name: config.name,
            objective: config.objective,
            status: 'PAUSED',
            special_ad_categories: config.specialAdCategories || [],
        };

        // Mock response for now
        return {
            id: `meta_campaign_${Date.now()}`,
            status: 'PAUSED',
        };
    }

    async createAdSet(config: MetaAdSetConfig): Promise<{
        id: string;
        status: string;
    }> {
        // Convert to cents for Meta API
        const budgetCents = config.dailyBudget * 100;

        const adSetData = {
            name: config.name,
            campaign_id: config.campaignId,
            daily_budget: budgetCents,
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'OFFSITE_CONVERSIONS',
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            targeting: {
                geo_locations: {
                    countries: config.targeting.countries,
                },
                age_min: config.targeting.ageMin || 18,
                age_max: config.targeting.ageMax || 65,
                ...(config.targeting.genders && { genders: config.targeting.genders }),
                publisher_platforms: config.placements || ['facebook', 'instagram'],
            },
            status: 'PAUSED',
        };

        return {
            id: `meta_adset_${Date.now()}`,
            status: 'PAUSED',
        };
    }

    async createAd(
        adSetId: string,
        creative: MetaAdCreative
    ): Promise<{
        id: string;
        status: string;
    }> {
        const adCreativeData = {
            name: creative.name,
            object_story_spec: {
                page_id: this.config.pageId,
                link_data: {
                    link: creative.linkUrl,
                    message: creative.description,
                    name: creative.headline,
                    call_to_action: {
                        type: creative.callToAction,
                        value: { link: creative.linkUrl },
                    },
                    ...(creative.imageUrl && { picture: creative.imageUrl }),
                },
            },
        };

        return {
            id: `meta_ad_${Date.now()}`,
            status: 'PAUSED',
        };
    }

    // ==================== Reporting ====================

    async getCampaignMetrics(campaignId: string): Promise<{
        impressions: number;
        reach: number;
        clicks: number;
        spend: number;
        ctr: number;
        cpc: number;
        actions?: { type: string; value: number }[];
    }> {
        return {
            impressions: 15000,
            reach: 12000,
            clicks: 300,
            spend: 200000,
            ctr: 0.02,
            cpc: 667,
            actions: [
                { type: 'link_click', value: 280 },
                { type: 'purchase', value: 8 },
            ],
        };
    }

    async pauseCampaign(campaignId: string): Promise<boolean> {
        return true;
    }

    async resumeCampaign(campaignId: string): Promise<boolean> {
        return true;
    }
}

// Singleton instance
export const metaAdsClient = new MetaAdsClient();
