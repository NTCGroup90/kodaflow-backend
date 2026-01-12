// Gemini exports (Primary - Imagen 3)
export {
    generateImage,
    analyzeProductUrl,
    generateAdContent,
    type ImageGenerationOptions,
    type GeneratedImage,
    type ProductAnalysis,
    type AdCopyOptions,
    type GeneratedAdCopy,
} from './gemini';

// Replicate exports (Flux.1 - Alternative)
export {
    generateImage as generateImageReplicate,
    generateImageVariants,
    generateAdBanner,
    type ImageGenerationOptions as ReplicateImageOptions,
    type GeneratedImage as ReplicateGeneratedImage,
    type BannerOptions,
} from './replicate';

// JSON2Video exports
export * from './json2video';
