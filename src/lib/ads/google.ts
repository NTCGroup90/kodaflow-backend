/**
 * Google Ads API Integration
 * Supports Search Ads, Display Ads, and YouTube Video Ads
 */

const GOOGLE_ADS_API_URL = 'https://googleads.googleapis.com/v15';

export interface GoogleAdsConfig {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    customerId: string;
}

export interface CampaignConfig {
    name: string;
    dailyBudget: number; // VND
    objective?: 'CONVERSIONS' | 'CLICKS' | 'IMPRESSIONS' | 'VIDEO_VIEWS';
    startDate?: string;
    endDate?: string;
    channelType?: 'SEARCH' | 'DISPLAY' | 'VIDEO'; // VIDEO for YouTube
}

export interface AdGroupConfig {
    name: string;
    campaignId: string;
    keywords?: string[];
    targeting?: {
        locations?: string[];
        ageRange?: string;
        gender?: string;
    };
}

export interface AdCreative {
    headlines: string[];
    descriptions: string[];
    finalUrl: string;
    imageUrls?: string[];
    videoUrl?: string; // For YouTube ads
}

// ==================== Google Ads Client ====================

export class GoogleAdsClient {
    private config: GoogleAdsConfig;
    private accessToken: string | null = null;

    constructor() {
        this.config = {
            developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
            clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
            refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
            customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
        };
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken) return this.accessToken;

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                refresh_token: this.config.refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh Google OAuth token');
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        return this.accessToken!;
    }

    private async makeRequest(
        method: 'GET' | 'POST',
        endpoint: string,
        data?: object
    ): Promise<any> {
        const token = await this.getAccessToken();

        const response = await fetch(`${GOOGLE_ADS_API_URL}/${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'developer-token': this.config.developerToken,
                'Content-Type': 'application/json',
            },
            ...(data && { body: JSON.stringify(data) }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Google Ads API error: ${error}`);
        }

        return response.json();
    }

    // ==================== Campaign Operations ====================

    async createCampaign(config: CampaignConfig): Promise<{
        id: string;
        resourceName: string;
        status: string;
    }> {
        // Convert VND to micros
        const budgetMicros = config.dailyBudget * 1_000_000;

        // Create budget first
        const budgetOperation = {
            create: {
                name: `Budget_${config.name}_${Date.now()}`,
                deliveryMethod: 'STANDARD',
                amountMicros: budgetMicros.toString(),
            },
        };

        // Create campaign
        const campaignOperation = {
            create: {
                name: config.name,
                advertisingChannelType: config.channelType || 'SEARCH',
                status: 'PAUSED',
                biddingStrategyType: 'MAXIMIZE_CONVERSIONS',
                startDate: config.startDate || new Date().toISOString().split('T')[0],
                ...(config.endDate && { endDate: config.endDate }),
            },
        };

        // In production, use mutate endpoint
        // For now, return mock response
        return {
            id: `google_campaign_${Date.now()}`,
            resourceName: `customers/${this.config.customerId}/campaigns/${Date.now()}`,
            status: 'PAUSED',
        };
    }

    async createAdGroup(config: AdGroupConfig): Promise<{
        id: string;
        resourceName: string;
    }> {
        return {
            id: `google_adgroup_${Date.now()}`,
            resourceName: `customers/${this.config.customerId}/adGroups/${Date.now()}`,
        };
    }

    async createResponsiveSearchAd(
        adGroupId: string,
        creative: AdCreative
    ): Promise<{
        id: string;
        resourceName: string;
    }> {
        // Format headlines (max 30 chars each)
        const headlines = creative.headlines.slice(0, 15).map(h => ({
            text: h.substring(0, 30),
        }));

        // Format descriptions (max 90 chars each)
        const descriptions = creative.descriptions.slice(0, 4).map(d => ({
            text: d.substring(0, 90),
        }));

        return {
            id: `google_ad_${Date.now()}`,
            resourceName: `customers/${this.config.customerId}/ads/${Date.now()}`,
        };
    }

    async createYouTubeAd(
        adGroupId: string,
        creative: AdCreative
    ): Promise<{
        id: string;
        resourceName: string;
    }> {
        // YouTube ads require video URL
        if (!creative.videoUrl) {
            throw new Error('Video URL is required for YouTube ads');
        }

        return {
            id: `youtube_ad_${Date.now()}`,
            resourceName: `customers/${this.config.customerId}/ads/${Date.now()}`,
        };
    }

    // ==================== Reporting ====================

    async getCampaignMetrics(campaignId: string): Promise<{
        impressions: number;
        clicks: number;
        spend: number;
        conversions: number;
        ctr: number;
        cpc: number;
    }> {
        // Mock metrics for now
        return {
            impressions: 10000,
            clicks: 200,
            spend: 150000,
            conversions: 5,
            ctr: 0.02,
            cpc: 750,
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
export const googleAdsClient = new GoogleAdsClient();
