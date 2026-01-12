// Gemini exports (Primary - Imagen 3)
export {
    generateImage,
    analyzeProductUrl,
    generateAdCopy,
    generateProductImage,
    generateAdBanner,
    generateMultipleVariants,
    generateBrandDNA,
    callGemini,
    type ImageGenerationOptions,
    type GeneratedImage,
    type ProductAnalysis,
    type AdCopy,
    type BrandDNA,
    type GeminiResponse,
} from './gemini';

// Replicate exports (Flux.1 - Alternative)
export {
    generateImage as generateImageReplicate,
    generateImageVariants,
    generateAdBanner as generateAdBannerReplicate,
    type ImageGenerationOptions as ReplicateImageOptions,
    type GeneratedImage as ReplicateGeneratedImage,
    type BannerOptions,
} from './replicate';

// JSON2Video exports
export * from './json2video';
