/**
 * Video Renderer - CSS Animations & Canvas Recording
 * Creates video shorts from storyboard scenes
 */

export interface VideoScene {
    sceneNumber: number;
    durationSeconds: number;
    visual: string;
    voiceover: string;
    textOverlay: string;
    musicNote: string;
    transition: string;
    imageUrl?: string;
}

export interface VideoComposition {
    id: string;
    title: string;
    duration: number;
    width: number;
    height: number;
    fps: number;
    scenes: VideoScene[];
    backgroundColor: string;
    brandColors: string[];
    musicUrl?: string;
    voiceoverUrl?: string;
}

export type AnimationType =
    | 'zoom-in'
    | 'zoom-out'
    | 'pan-left'
    | 'pan-right'
    | 'fade-in'
    | 'fade-out'
    | 'slide-up'
    | 'slide-down'
    | 'typewriter'
    | 'bounce';

export interface AnimationConfig {
    type: AnimationType;
    duration: number;
    delay: number;
    easing: string;
}

// Video format presets
export const VIDEO_PRESETS = {
    tiktok: { width: 1080, height: 1920, fps: 30 },
    reels: { width: 1080, height: 1920, fps: 30 },
    youtube_shorts: { width: 1080, height: 1920, fps: 30 },
    story: { width: 1080, height: 1920, fps: 30 },
    feed: { width: 1080, height: 1080, fps: 30 }
};

/**
 * Generate CSS keyframes for Ken Burns effect
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateKenBurnsCSS(type: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right', _duration: number): string {
    const animations: Record<string, string> = {
        'zoom-in': `
            @keyframes kenBurnsZoomIn {
                0% { transform: scale(1) translate(0, 0); }
                100% { transform: scale(1.2) translate(0, 0); }
            }
        `,
        'zoom-out': `
            @keyframes kenBurnsZoomOut {
                0% { transform: scale(1.2) translate(0, 0); }
                100% { transform: scale(1) translate(0, 0); }
            }
        `,
        'pan-left': `
            @keyframes kenBurnsPanLeft {
                0% { transform: scale(1.1) translate(5%, 0); }
                100% { transform: scale(1.1) translate(-5%, 0); }
            }
        `,
        'pan-right': `
            @keyframes kenBurnsPanRight {
                0% { transform: scale(1.1) translate(-5%, 0); }
                100% { transform: scale(1.1) translate(5%, 0); }
            }
        `
    };

    return animations[type] || animations['zoom-in'];
}

/**
 * Generate CSS for text overlay animations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateTextAnimationCSS(type: AnimationType, _duration: number = 0.5): string {
    const animations: Record<string, string> = {
        'fade-in': `
            @keyframes textFadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
        `,
        'slide-up': `
            @keyframes textSlideUp {
                0% { opacity: 0; transform: translateY(30px); }
                100% { opacity: 1; transform: translateY(0); }
            }
        `,
        'slide-down': `
            @keyframes textSlideDown {
                0% { opacity: 0; transform: translateY(-30px); }
                100% { opacity: 1; transform: translateY(0); }
            }
        `,
        'typewriter': `
            @keyframes typewriter {
                from { width: 0; }
                to { width: 100%; }
            }
        `,
        'bounce': `
            @keyframes textBounce {
                0% { opacity: 0; transform: scale(0.3); }
                50% { opacity: 1; transform: scale(1.1); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); }
            }
        `
    };

    return animations[type] || animations['fade-in'];
}

/**
 * Create video composition from campaign data
 */
export function createVideoComposition(
    scenes: VideoScene[],
    brandColors: string[],
    format: keyof typeof VIDEO_PRESETS = 'reels'
): VideoComposition {
    const preset = VIDEO_PRESETS[format];
    const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

    return {
        id: `video_${Date.now()}`,
        title: 'Ad Video',
        duration: totalDuration,
        width: preset.width,
        height: preset.height,
        fps: preset.fps,
        scenes,
        backgroundColor: '#0a0a0f',
        brandColors
    };
}

/**
 * Generate scene timeline data for video player
 */
export function generateSceneTimeline(scenes: VideoScene[]): Array<{
    sceneNumber: number;
    startTime: number;
    endTime: number;
    duration: number;
}> {
    let currentTime = 0;

    return scenes.map(scene => {
        const timeline = {
            sceneNumber: scene.sceneNumber,
            startTime: currentTime,
            endTime: currentTime + scene.durationSeconds,
            duration: scene.durationSeconds
        };
        currentTime += scene.durationSeconds;
        return timeline;
    });
}

/**
 * Generate animation sequence for a single scene
 */
export function generateSceneAnimations(scene: VideoScene, index: number): AnimationConfig[] {
    const baseDelay = 0;
    const animations: AnimationConfig[] = [];

    // Background image Ken Burns effect
    const kenBurnsTypes: AnimationType[] = ['zoom-in', 'zoom-out', 'pan-left', 'pan-right'];
    animations.push({
        type: kenBurnsTypes[index % kenBurnsTypes.length],
        duration: scene.durationSeconds,
        delay: baseDelay,
        easing: 'ease-in-out'
    });

    // Text overlay animation
    const textAnimations: AnimationType[] = ['slide-up', 'fade-in', 'bounce', 'slide-down'];
    animations.push({
        type: textAnimations[index % textAnimations.length],
        duration: 0.5,
        delay: baseDelay + 0.2,
        easing: 'ease-out'
    });

    return animations;
}

/**
 * Generate React component structure for video preview
 */
export function generateVideoPreviewComponent(composition: VideoComposition): string {
    const sceneTimeline = generateSceneTimeline(composition.scenes);

    return JSON.stringify({
        composition,
        timeline: sceneTimeline,
        totalDuration: composition.duration,
        currentScene: 0,
        isPlaying: false
    }, null, 2);
}

/**
 * Create exportable video data structure for Canvas recording
 */
export function createExportData(composition: VideoComposition): object {
    return {
        id: composition.id,
        format: 'webm',
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        duration: composition.duration,
        scenes: composition.scenes.map((scene, idx) => ({
            ...scene,
            animations: generateSceneAnimations(scene, idx),
            timeline: generateSceneTimeline(composition.scenes)[idx]
        })),
        backgroundColor: composition.backgroundColor,
        brandColors: composition.brandColors
    };
}

/**
 * Calculate optimal transition between scenes
 */
export function getTransitionEffect(fromScene: VideoScene, toScene: VideoScene): string {
    const transitions = ['crossfade', 'slide-left', 'zoom-out', 'glitch'];
    const hash = (fromScene.sceneNumber + toScene.sceneNumber) % transitions.length;
    return transitions[hash];
}

const VideoRenderer = {
    VIDEO_PRESETS,
    generateKenBurnsCSS,
    generateTextAnimationCSS,
    createVideoComposition,
    generateSceneTimeline,
    generateSceneAnimations,
    createExportData
};

export default VideoRenderer;
