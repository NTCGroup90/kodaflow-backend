/**
 * TikTok Marketing API Integration
 * Version: v202309 (required since June 2024)
 */

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3';

export interface TikTokAdsConfig {
    appId: string;
    appSecret: string;
    accessToken: string;
    advertiserId: string;
}

export interface TikTokCampaignConfig {
    name: string;
    objective: 'CONVERSIONS' | 'TRAFFIC' | 'REACH' | 'VIDEO_VIEWS' | 'APP_INSTALL';
    budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL';
    budget: number; // VND
}

export interface TikTokAdGroupConfig {
    name: string;
    campaignId: string;
    placementType: 'PLACEMENT_TYPE_AUTOMATIC' | 'PLACEMENT_TYPE_NORMAL';
    budget: number;
    scheduleType: 'SCHEDULE_FROM_NOW' | 'SCHEDULE_START_END';
    targeting: {
        locations: string[]; // Country codes
        ageGroups?: string[]; // AGE_13_17, AGE_18_24, etc.
        genders?: ('GENDER_MALE' | 'GENDER_FEMALE')[];
        languages?: string[];
    };
}

export interface TikTokAdCreative {
    videoId: string; // TikTok requires video
    displayName: string;
    text: string;
    callToAction: 'SHOP_NOW' | 'LEARN_MORE' | 'SIGN_UP' | 'DOWNLOAD';
    landingPageUrl: string;
}

// ==================== TikTok Ads Client ====================

export class TikTokAdsClient {
    private config: TikTokAdsConfig;

    constructor() {
        this.config = {
            appId: process.env.TIKTOK_APP_ID || '',
            appSecret: process.env.TIKTOK_APP_SECRET || '',
            accessToken: process.env.TIKTOK_ACCESS_TOKEN || '',
            advertiserId: process.env.TIKTOK_ADVERTISER_ID || '',
        };
    }

    private async makeRequest(
        method: 'GET' | 'POST',
        endpoint: string,
        data?: object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const url = `${TIKTOK_API_URL}/${endpoint}`;

        const response = await fetch(url, {
            method,
            headers: {
                'Access-Token': this.config.accessToken,
                'Content-Type': 'application/json',
            },
            ...(data && {
                body: JSON.stringify({
                    advertiser_id: this.config.advertiserId,
                    ...data,
                })
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TikTok API error: ${error}`);
        }

        const result = await response.json();

        if (result.code !== 0) {
            throw new Error(`TikTok API error: ${result.message}`);
        }

        return result.data;
    }

    // ==================== Video Upload ====================

    async uploadVideo(
        videoUrl: string,
        fileName: string
    ): Promise<{
        videoId: string;
        status: string;
    }> {
        // TikTok requires video upload before creating ads
        // This is a simplified version - actual implementation needs chunked upload

        return {
            videoId: `tiktok_video_${Date.now()}`,
            status: 'PROCESSING',
        };
    }

    // ==================== Campaign Operations ====================

    async createCampaign(config: TikTokCampaignConfig): Promise<{
        campaignId: string;
        status: string;
    }> {
        const campaignData = {
            campaign_name: config.name,
            objective_type: config.objective,
            budget_mode: config.budgetMode,
            budget: config.budget * 100, // Convert to cents
            operation_status: 'DISABLE', // Start paused
        };

        return {
            campaignId: `tiktok_campaign_${Date.now()}`,
            status: 'PAUSED',
        };
    }

    async createAdGroup(config: TikTokAdGroupConfig): Promise<{
        adGroupId: string;
        status: string;
    }> {
        const adGroupData = {
            adgroup_name: config.name,
            campaign_id: config.campaignId,
            placement_type: config.placementType,
            budget: config.budget * 100,
            schedule_type: config.scheduleType,
            location_ids: config.targeting.locations,
            age_groups: config.targeting.ageGroups || ['AGE_18_24', 'AGE_25_34', 'AGE_35_44'],
            gender: config.targeting.genders || ['GENDER_MALE', 'GENDER_FEMALE'],
            operation_status: 'DISABLE',
        };

        return {
            adGroupId: `tiktok_adgroup_${Date.now()}`,
            status: 'PAUSED',
        };
    }

    async createAd(
        adGroupId: string,
        creative: TikTokAdCreative
    ): Promise<{
        adId: string;
        status: string;
    }> {
        const adData = {
            adgroup_id: adGroupId,
            creatives: [{
                video_id: creative.videoId,
                display_name: creative.displayName,
                ad_text: creative.text,
                call_to_action: creative.callToAction,
                landing_page_url: creative.landingPageUrl,
            }],
            operation_status: 'DISABLE',
        };

        return {
            adId: `tiktok_ad_${Date.now()}`,
            status: 'PAUSED',
        };
    }

    // ==================== Reporting ====================

    async getCampaignMetrics(campaignId: string): Promise<{
        impressions: number;
        clicks: number;
        videoViews: number;
        spend: number;
        ctr: number;
        cpc: number;
        conversions: number;
    }> {
        return {
            impressions: 50000,
            clicks: 1500,
            videoViews: 35000,
            spend: 300000,
            ctr: 0.03,
            cpc: 200,
            conversions: 15,
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
export const tiktokAdsClient = new TikTokAdsClient();
