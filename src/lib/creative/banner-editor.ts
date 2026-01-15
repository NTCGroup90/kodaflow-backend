/**
 * Banner Editor - Fabric.js Integration
 * Generates ad banners with editable text and images
 */

export interface BannerTemplate {
    id: string;
    name: string;
    platform: 'facebook' | 'instagram' | 'google';
    width: number;
    height: number;
    aspectRatio: string;
}

export interface BannerElement {
    id: string;
    type: 'text' | 'image' | 'shape';
    x: number;
    y: number;
    width?: number;
    height?: number;
    content?: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    imageUrl?: string;
}

export interface BannerDesign {
    id: string;
    templateId: string;
    template: BannerTemplate;
    backgroundColor: string;
    backgroundGradient?: string;
    elements: BannerElement[];
    brandColors: string[];
    createdAt: Date;
}

// Pre-defined templates for different ad platforms
export const BANNER_TEMPLATES: BannerTemplate[] = [
    {
        id: 'fb_feed',
        name: 'Facebook Feed',
        platform: 'facebook',
        width: 1200,
        height: 628,
        aspectRatio: '1.91:1'
    },
    {
        id: 'fb_square',
        name: 'Facebook Square',
        platform: 'facebook',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1'
    },
    {
        id: 'ig_story',
        name: 'Instagram Story',
        platform: 'instagram',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16'
    },
    {
        id: 'ig_reels',
        name: 'Instagram Reels',
        platform: 'instagram',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16'
    },
    {
        id: 'google_display',
        name: 'Google Display',
        platform: 'google',
        width: 300,
        height: 250,
        aspectRatio: '6:5'
    },
    {
        id: 'google_leaderboard',
        name: 'Google Leaderboard',
        platform: 'google',
        width: 728,
        height: 90,
        aspectRatio: '8:1'
    }
];

/**
 * Generate Fabric.js canvas configuration for a banner template
 */
export function generateBannerConfig(
    template: BannerTemplate,
    headline: string,
    subheadline: string,
    cta: string,
    brandColors: string[],
    productImageUrl?: string
): object {
    const primaryColor = brandColors[0] || '#00d4ff';
    const secondaryColor = brandColors[1] || '#a855f7';

    // Calculate element positions based on template size
    const padding = Math.min(template.width, template.height) * 0.05;
    const headlineFontSize = Math.min(template.width, template.height) * 0.08;
    const subheadlineFontSize = headlineFontSize * 0.5;
    const ctaFontSize = headlineFontSize * 0.4;

    const config = {
        version: '7.0.0',
        objects: [
            // Background gradient
            {
                type: 'rect',
                originX: 'left',
                originY: 'top',
                left: 0,
                top: 0,
                width: template.width,
                height: template.height,
                fill: {
                    type: 'linear',
                    coords: { x1: 0, y1: 0, x2: template.width, y2: template.height },
                    colorStops: [
                        { offset: 0, color: '#0a0a0f' },
                        { offset: 0.5, color: '#1a1a2e' },
                        { offset: 1, color: '#0a0a0f' }
                    ]
                },
                selectable: false
            },
            // Headline text
            {
                type: 'textbox',
                originX: 'left',
                originY: 'top',
                left: padding,
                top: template.height * 0.3,
                width: template.width - padding * 2,
                text: headline,
                fontSize: headlineFontSize,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fill: '#ffffff',
                textAlign: 'left',
                lineHeight: 1.2,
                id: 'headline'
            },
            // Subheadline
            {
                type: 'textbox',
                originX: 'left',
                originY: 'top',
                left: padding,
                top: template.height * 0.5,
                width: template.width - padding * 2,
                text: subheadline,
                fontSize: subheadlineFontSize,
                fontFamily: 'Inter, sans-serif',
                fill: 'rgba(255,255,255,0.7)',
                textAlign: 'left',
                id: 'subheadline'
            },
            // CTA Button background
            {
                type: 'rect',
                originX: 'left',
                originY: 'top',
                left: padding,
                top: template.height * 0.7,
                width: template.width * 0.4,
                height: ctaFontSize * 2.5,
                rx: ctaFontSize * 0.5,
                ry: ctaFontSize * 0.5,
                fill: {
                    type: 'linear',
                    coords: { x1: 0, y1: 0, x2: template.width * 0.4, y2: 0 },
                    colorStops: [
                        { offset: 0, color: primaryColor },
                        { offset: 1, color: secondaryColor }
                    ]
                },
                id: 'cta_bg'
            },
            // CTA Text
            {
                type: 'text',
                originX: 'center',
                originY: 'center',
                left: padding + template.width * 0.2,
                top: template.height * 0.7 + ctaFontSize * 1.25,
                text: cta,
                fontSize: ctaFontSize,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fill: '#ffffff',
                id: 'cta_text'
            }
        ],
        background: '#0a0a0f'
    };

    // Add product image if provided
    if (productImageUrl) {
        config.objects.splice(1, 0, {
            type: 'image',
            originX: 'right',
            originY: 'center',
            left: template.width - padding,
            top: template.height * 0.5,
            src: productImageUrl,
            scaleX: 0.5,
            scaleY: 0.5,
            id: 'product_image'
        } as any);
    }

    return config;
}

/**
 * Create banner design from campaign data
 */
export function createBannerDesign(
    templateId: string,
    headline: string,
    subheadline: string,
    cta: string,
    brandColors: string[]
): BannerDesign {
    const template = BANNER_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
        throw new Error(`Template ${templateId} not found`);
    }

    return {
        id: `banner_${Date.now()}`,
        templateId,
        template,
        backgroundColor: '#0a0a0f',
        backgroundGradient: `linear-gradient(135deg, ${brandColors[0] || '#0a0a0f'} 0%, #0a0a0f 100%)`,
        elements: [
            {
                id: 'headline',
                type: 'text',
                x: template.width * 0.05,
                y: template.height * 0.3,
                content: headline,
                fontSize: Math.min(template.width, template.height) * 0.08,
                fontFamily: 'Inter',
                fill: '#ffffff'
            },
            {
                id: 'subheadline',
                type: 'text',
                x: template.width * 0.05,
                y: template.height * 0.5,
                content: subheadline,
                fontSize: Math.min(template.width, template.height) * 0.04,
                fontFamily: 'Inter',
                fill: 'rgba(255,255,255,0.7)'
            },
            {
                id: 'cta',
                type: 'text',
                x: template.width * 0.05,
                y: template.height * 0.75,
                content: cta,
                fontSize: Math.min(template.width, template.height) * 0.035,
                fontFamily: 'Inter',
                fill: '#ffffff'
            }
        ],
        brandColors,
        createdAt: new Date()
    };
}

/**
 * Generate A/B variants of a banner design
 */
export function generateABVariants(design: BannerDesign): BannerDesign[] {
    const variantA = { ...design, id: `${design.id}_A` };

    // Variant B: Different color scheme and layout
    const variantB: BannerDesign = {
        ...design,
        id: `${design.id}_B`,
        backgroundColor: design.brandColors[1] || '#1a1a2e',
        elements: design.elements.map(el => ({
            ...el,
            // Shift positions slightly for variant
            y: el.type === 'text' ? el.y * 0.9 : el.y
        }))
    };

    return [variantA, variantB];
}

export default {
    BANNER_TEMPLATES,
    generateBannerConfig,
    createBannerDesign,
    generateABVariants
};
