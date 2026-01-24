'use server';

import { NextResponse } from 'next/server';

/**
 * API Endpoint to check which ads platforms have credentials configured
 * Returns connection status for each platform
 */
export async function GET() {
    const connections = {
        facebook: {
            connected: !!(
                process.env.META_ACCESS_TOKEN &&
                process.env.META_AD_ACCOUNT_ID &&
                process.env.META_APP_ID
            ),
            accountId: process.env.META_AD_ACCOUNT_ID ? `act_***${process.env.META_AD_ACCOUNT_ID.slice(-4)}` : null
        },
        tiktok: {
            connected: !!(
                process.env.TIKTOK_ADS_ACCESS_TOKEN &&
                process.env.TIKTOK_ADS_ADVERTISER_ID
            ),
            accountId: process.env.TIKTOK_ADS_ADVERTISER_ID ? `***${process.env.TIKTOK_ADS_ADVERTISER_ID.slice(-4)}` : null
        },
        google: {
            connected: !!(
                process.env.GOOGLE_ADS_REFRESH_TOKEN &&
                process.env.GOOGLE_ADS_CUSTOMER_ID &&
                process.env.GOOGLE_ADS_CLIENT_ID
            ),
            accountId: process.env.GOOGLE_ADS_CUSTOMER_ID ? `***${process.env.GOOGLE_ADS_CUSTOMER_ID.slice(-4)}` : null
        },
        youtube: {
            connected: !!(
                process.env.GOOGLE_ADS_REFRESH_TOKEN &&
                process.env.GOOGLE_ADS_CUSTOMER_ID
            ),
            accountId: process.env.GOOGLE_ADS_CUSTOMER_ID ? `***${process.env.GOOGLE_ADS_CUSTOMER_ID.slice(-4)}` : null
        }
    };

    return NextResponse.json(connections);
}
