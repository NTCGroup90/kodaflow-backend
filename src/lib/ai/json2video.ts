/**
 * JSON2Video API Integration
 * Automated video generation from JSON templates
 */

const JSON2VIDEO_API_URL = 'https://api.json2video.com/v2';

export interface VideoScene {
    duration: number;
    elements: VideoElement[];
    transition?: {
        type: 'fade' | 'slide' | 'zoom';
        duration: number;
    };
}

export interface VideoElement {
    type: 'image' | 'text' | 'video' | 'audio';
    src?: string;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    style?: Record<string, any>;
    start?: number;
    duration?: number;
    position?: {
        x: number | string;
        y: number | string;
    };
}

export interface VideoTemplate {
    projectId: string;
    resolution: '1080p' | '720p' | '4k';
    fps: 30 | 60;
    scenes: VideoScene[];
    audio?: {
        src: string;
        volume: number;
    };
}

export interface VideoJob {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    error?: string;
}

// ==================== API Functions ====================

export async function createVideo(template: VideoTemplate): Promise<VideoJob> {
    const apiKey = process.env.JSON2VIDEO_API_KEY;

    if (!apiKey) {
        throw new Error('JSON2VIDEO_API_KEY is not configured');
    }

    const response = await fetch(`${JSON2VIDEO_API_URL}/movies`, {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project: template.projectId,
            resolution: template.resolution,
            fps: template.fps,
            scenes: template.scenes,
            ...(template.audio && { audio: template.audio }),
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`JSON2Video API error: ${error}`);
    }

    const data = await response.json();

    return {
        jobId: data.project,
        status: 'queued',
    };
}

export async function getVideoStatus(jobId: string): Promise<VideoJob> {
    const apiKey = process.env.JSON2VIDEO_API_KEY;

    if (!apiKey) {
        throw new Error('JSON2VIDEO_API_KEY is not configured');
    }

    const response = await fetch(`${JSON2VIDEO_API_URL}/movies/${jobId}`, {
        headers: {
            'x-api-key': apiKey,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`JSON2Video API error: ${error}`);
    }

    const data = await response.json();

    return {
        jobId: data.project,
        status: data.status === 'done' ? 'completed' :
            data.status === 'error' ? 'failed' :
                'processing',
        videoUrl: data.url,
        error: data.error,
    };
}

// ==================== Video Templates ====================

export function createProductShowcaseVideo(options: {
    productName: string;
    images: string[];
    headline: string;
    price: string;
    callToAction: string;
    duration?: number;
}): VideoTemplate {
    const sceneDuration = (options.duration || 15) / Math.max(options.images.length, 3);

    const scenes: VideoScene[] = [
        // Intro scene
        {
            duration: 2,
            elements: [
                {
                    type: 'text',
                    text: options.headline,
                    style: {
                        fontSize: 48,
                        fontWeight: 'bold',
                        color: '#ffffff',
                        textAlign: 'center',
                    },
                    position: { x: 'center', y: 'center' },
                },
            ],
            transition: { type: 'fade', duration: 0.5 },
        },
        // Product images
        ...options.images.slice(0, 5).map((image) => ({
            duration: sceneDuration,
            elements: [
                {
                    type: 'image' as const,
                    src: image,
                    style: {
                        objectFit: 'cover',
                    },
                },
                {
                    type: 'text' as const,
                    text: options.productName,
                    style: {
                        fontSize: 24,
                        color: '#ffffff',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: 10,
                    },
                    position: { x: 20, y: 'bottom' },
                },
            ],
            transition: { type: 'slide' as const, duration: 0.3 },
        })),
        // CTA scene
        {
            duration: 3,
            elements: [
                {
                    type: 'text',
                    text: options.price,
                    style: {
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: '#00F0FF',
                    },
                    position: { x: 'center', y: 200 },
                },
                {
                    type: 'text',
                    text: options.callToAction,
                    style: {
                        fontSize: 36,
                        color: '#ffffff',
                        backgroundColor: '#A100FF',
                        padding: 20,
                        borderRadius: 10,
                    },
                    position: { x: 'center', y: 'center' },
                },
            ],
        },
    ];

    return {
        projectId: `product_${Date.now()}`,
        resolution: '1080p',
        fps: 30,
        scenes,
    };
}

export function createTestimonialVideo(options: {
    customerName: string;
    customerPhoto?: string;
    testimonialText: string;
    rating: number;
    brandLogo?: string;
}): VideoTemplate {
    return {
        projectId: `testimonial_${Date.now()}`,
        resolution: '1080p',
        fps: 30,
        scenes: [
            {
                duration: 5,
                elements: [
                    ...(options.customerPhoto ? [{
                        type: 'image' as const,
                        src: options.customerPhoto,
                        style: {
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                        },
                        position: { x: 'center', y: 100 },
                    }] : []),
                    {
                        type: 'text',
                        text: options.customerName,
                        style: {
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: '#ffffff',
                        },
                        position: { x: 'center', y: 220 },
                    },
                    {
                        type: 'text',
                        text: '⭐'.repeat(options.rating),
                        style: {
                            fontSize: 24,
                        },
                        position: { x: 'center', y: 260 },
                    },
                    {
                        type: 'text',
                        text: `"${options.testimonialText}"`,
                        style: {
                            fontSize: 20,
                            color: '#cccccc',
                            textAlign: 'center',
                            maxWidth: 800,
                        },
                        position: { x: 'center', y: 'center' },
                    },
                ],
            },
        ],
    };
}
