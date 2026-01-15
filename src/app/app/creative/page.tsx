'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Video, Image as ImageIcon, Upload, Download, Check, ChevronRight,
    ArrowLeft, Rocket, Sparkles, FileVideo, Copy, Loader2, X, AlertCircle,
    Youtube, Facebook, Instagram, Maximize2, Minimize2, RefreshCw, Eye
} from 'lucide-react';

// Platform types
type Platform = 'tiktok' | 'youtube_shorts' | 'youtube_preroll' | 'facebook_reels' | 'facebook_feed' | 'instagram_reels';

interface VideoScript {
    platform: string;
    duration: string;
    aspectRatio: string;
    scenes: Array<{
        timeRange: string;
        type: string;
        duration: number;
        visual: string;
        voiceover: string;
        textOverlay: string;
        transition: string;
    }>;
    aiPrompt: string;
    suggestedMusic: string;
    captionText: string;
    conversionTips: string[];
}

interface UploadedVideo {
    platform: Platform;
    file: File;
    url: string;
    duration: number;
    width: number;
    height: number;
    isValid: boolean;
    errors: string[];
}

const PLATFORMS: { id: Platform; name: string; icon: any; color: string }[] = [
    { id: 'tiktok', name: 'TikTok', icon: Video, color: '#00f2ea' },
    { id: 'youtube_shorts', name: 'YT Shorts', icon: Youtube, color: '#ff0000' },
    { id: 'youtube_preroll', name: 'YT Pre-roll', icon: Youtube, color: '#ff0000' },
    { id: 'facebook_reels', name: 'FB Reels', icon: Facebook, color: '#1877f2' },
    { id: 'facebook_feed', name: 'FB Feed', icon: Facebook, color: '#1877f2' },
    { id: 'instagram_reels', name: 'IG Reels', icon: Instagram, color: '#e4405f' }
];

const VIDEO_SPECS: Record<Platform, { aspectRatio: string; minDuration: number; maxDuration: number; resolution: string }> = {
    tiktok: { aspectRatio: '9:16', minDuration: 5, maxDuration: 60, resolution: '720x1280' },
    youtube_shorts: { aspectRatio: '9:16', minDuration: 15, maxDuration: 60, resolution: '720x1280' },
    youtube_preroll: { aspectRatio: '16:9', minDuration: 6, maxDuration: 180, resolution: '1920x1080' },
    facebook_reels: { aspectRatio: '9:16', minDuration: 15, maxDuration: 90, resolution: '720x1280' },
    facebook_feed: { aspectRatio: '1:1 / 4:5', minDuration: 1, maxDuration: 240, resolution: '720p' },
    instagram_reels: { aspectRatio: '9:16', minDuration: 15, maxDuration: 90, resolution: '720x1280' }
};

export default function CreativeStudioPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [brandDNA, setBrandDNA] = useState<any>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['tiktok', 'facebook_reels']);
    const [activeTab, setActiveTab] = useState<'scripts' | 'banners' | 'uploads'>('scripts');

    // Scripts state
    const [scripts, setScripts] = useState<VideoScript[]>([]);
    const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
    const [activeScriptPlatform, setActiveScriptPlatform] = useState<Platform | null>(null);

    // Banner state
    const [bannerData, setBannerData] = useState<any>(null);
    const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
    const [selectedBannerSize, setSelectedBannerSize] = useState('fb_feed');

    // Upload state
    const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadPlatform, setUploadPlatform] = useState<Platform>('tiktok');

    // Load brand DNA
    useEffect(() => {
        const storedDNA = localStorage.getItem('kodaflow_brand_dna');
        if (storedDNA) {
            setBrandDNA(JSON.parse(storedDNA));
        }
        setIsLoading(false);
    }, []);

    // Generate scripts for selected platforms
    const handleGenerateScripts = async () => {
        if (!brandDNA) return;

        setIsGeneratingScripts(true);
        try {
            const response = await fetch('/api/creative/generate-scripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandDNA: {
                        brandName: brandDNA.brandName,
                        selectedTagline: brandDNA.selectedTagline || brandDNA.tagline,
                        coreValues: brandDNA.coreValues || [],
                        targetAudience: brandDNA.targetAudience || '',
                        painPoints: brandDNA.painPoints || [],
                        uniqueSellingPoints: brandDNA.uniqueSellingPoints || [],
                        toneOfVoice: brandDNA.toneOfVoice || [],
                        industryCategory: brandDNA.industryCategory || '',
                        brandColors: brandDNA.brandColors || []
                    },
                    platforms: selectedPlatforms
                })
            });

            const result = await response.json();
            if (result.success) {
                setScripts(result.data.scripts);
                if (result.data.scripts.length > 0) {
                    setActiveScriptPlatform(result.data.scripts[0].platform as Platform);
                }
            }
        } catch (error) {
            console.error('Error generating scripts:', error);
        } finally {
            setIsGeneratingScripts(false);
        }
    };

    // Generate banner
    const handleGenerateBanner = async () => {
        if (!brandDNA) return;

        setIsGeneratingBanner(true);
        try {
            const response = await fetch('/api/creative/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'banner',
                    brandDNA: {
                        brandName: brandDNA.brandName,
                        tagline: brandDNA.selectedTagline || brandDNA.tagline,
                        brandColors: brandDNA.brandColors || [],
                        coreValues: brandDNA.coreValues || [],
                        industryCategory: brandDNA.industryCategory || '',
                        toneOfVoice: brandDNA.toneOfVoice || []
                    },
                    platform: selectedBannerSize
                })
            });

            const result = await response.json();
            if (result.success) {
                setBannerData(result.data);
            }
        } catch (error) {
            console.error('Error generating banner:', error);
        } finally {
            setIsGeneratingBanner(false);
        }
    };

    // Handle video upload
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);

            const specs = VIDEO_SPECS[uploadPlatform];
            const errors: string[] = [];

            // Validate duration
            if (video.duration < specs.minDuration) {
                errors.push(`Video quá ngắn. Tối thiểu ${specs.minDuration}s`);
            }
            if (video.duration > specs.maxDuration) {
                errors.push(`Video quá dài. Tối đa ${specs.maxDuration}s`);
            }

            // Validate aspect ratio
            const ratio = video.videoWidth / video.videoHeight;
            if (uploadPlatform === 'youtube_preroll') {
                if (Math.abs(ratio - 16 / 9) > 0.1) {
                    errors.push('Video phải có tỉ lệ 16:9');
                }
            } else if (['tiktok', 'youtube_shorts', 'facebook_reels', 'instagram_reels'].includes(uploadPlatform)) {
                if (Math.abs(ratio - 9 / 16) > 0.1) {
                    errors.push('Video phải có tỉ lệ 9:16 (dọc)');
                }
            }

            const uploadedVideo: UploadedVideo = {
                platform: uploadPlatform,
                file,
                url: URL.createObjectURL(file),
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                isValid: errors.length === 0,
                errors
            };

            setUploadedVideos(prev => [...prev.filter(v => v.platform !== uploadPlatform), uploadedVideo]);
        };

        video.src = URL.createObjectURL(file);
    };

    // Copy prompt to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Get brand colors
    const primaryColor = brandDNA?.brandColors?.[0] || '#00d4ff';
    const secondaryColor = brandDNA?.brandColors?.[1] || '#a855f7';

    // Save and continue
    const handleConfirmAndLaunch = () => {
        localStorage.setItem('kodaflow_creatives', JSON.stringify({
            scripts,
            bannerData,
            uploadedVideos: uploadedVideos.map(v => ({
                platform: v.platform,
                fileName: v.file.name,
                duration: v.duration,
                isValid: v.isValid
            }))
        }));
        window.location.href = '/app/launch';
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: primaryColor }} />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                            <Palette size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Creative Studio 2.0</h1>
                            <p className="text-xs text-white/50">{brandDNA?.brandName || 'Module 4'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/app/campaign'}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> Campaign
                        </button>
                        <button
                            onClick={handleConfirmAndLaunch}
                            className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                            <Rocket size={16} /> Confirm & Launch
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'scripts', label: 'Kịch bản Video', icon: FileVideo },
                        { id: 'banners', label: 'Banner & Logo', icon: ImageIcon },
                        { id: 'uploads', label: 'Upload Video', icon: Upload }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === tab.id ? 'text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            style={activeTab === tab.id ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` } : {}}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* Scripts Tab */}
                    {activeTab === 'scripts' && (
                        <motion.div
                            key="scripts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Platform Selection */}
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Chọn nền tảng quảng cáo</h3>
                                <div className="flex flex-wrap gap-3">
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => {
                                                setSelectedPlatforms(prev =>
                                                    prev.includes(platform.id)
                                                        ? prev.filter(p => p !== platform.id)
                                                        : [...prev, platform.id]
                                                );
                                            }}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all border ${selectedPlatforms.includes(platform.id)
                                                    ? 'border-transparent text-white'
                                                    : 'border-white/10 text-white/60 hover:border-white/30'
                                                }`}
                                            style={selectedPlatforms.includes(platform.id) ? { background: platform.color } : {}}
                                        >
                                            <platform.icon size={16} />
                                            {platform.name}
                                            {selectedPlatforms.includes(platform.id) && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleGenerateScripts}
                                    disabled={isGeneratingScripts || selectedPlatforms.length === 0}
                                    className="mt-4 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    {isGeneratingScripts ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    Tạo kịch bản chuyển đổi cao
                                </button>
                            </div>

                            {/* Generated Scripts */}
                            {scripts.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                    {/* Script Platform Tabs */}
                                    <div className="flex border-b border-white/10 overflow-x-auto">
                                        {scripts.map(script => {
                                            const platform = PLATFORMS.find(p => p.id === script.platform);
                                            return (
                                                <button
                                                    key={script.platform}
                                                    onClick={() => setActiveScriptPlatform(script.platform as Platform)}
                                                    className={`px-4 py-3 flex items-center gap-2 whitespace-nowrap transition-all ${activeScriptPlatform === script.platform
                                                            ? 'bg-white/10 border-b-2'
                                                            : 'text-white/60 hover:text-white'
                                                        }`}
                                                    style={activeScriptPlatform === script.platform ? { borderColor: platform?.color } : {}}
                                                >
                                                    {platform && <platform.icon size={16} style={{ color: platform.color }} />}
                                                    {platform?.name}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Active Script Content */}
                                    {scripts.find(s => s.platform === activeScriptPlatform) && (
                                        <div className="p-6">
                                            {(() => {
                                                const script = scripts.find(s => s.platform === activeScriptPlatform)!;
                                                return (
                                                    <div className="space-y-6">
                                                        {/* Specs */}
                                                        <div className="flex gap-4 text-sm text-white/60">
                                                            <span>⏱️ {script.duration}</span>
                                                            <span>📐 {script.aspectRatio}</span>
                                                            <span>🎵 {script.suggestedMusic}</span>
                                                        </div>

                                                        {/* Scenes */}
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold">Kịch bản từng cảnh</h4>
                                                            {script.scenes?.map((scene, i) => (
                                                                <div key={i} className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: primaryColor }}>
                                                                            {scene.timeRange}
                                                                        </span>
                                                                        <span className="text-sm font-medium capitalize">{scene.type}</span>
                                                                    </div>
                                                                    <p className="text-white/80 mb-2">🎬 {scene.visual}</p>
                                                                    <p className="text-white/60 text-sm mb-2">🎤 "{scene.voiceover}"</p>
                                                                    <p className="text-cyan-400 text-sm">📝 {scene.textOverlay}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* AI Prompt */}
                                                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold">🤖 Prompt cho AI Video (Veo 3/Kling/Runway)</h4>
                                                                <button
                                                                    onClick={() => copyToClipboard(script.aiPrompt)}
                                                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-1"
                                                                >
                                                                    <Copy size={12} /> Copy
                                                                </button>
                                                            </div>
                                                            <p className="text-white/70 text-sm">{script.aiPrompt}</p>
                                                        </div>

                                                        {/* Caption */}
                                                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold">📝 Caption đầy đủ</h4>
                                                                <button
                                                                    onClick={() => copyToClipboard(script.captionText)}
                                                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-1"
                                                                >
                                                                    <Copy size={12} /> Copy
                                                                </button>
                                                            </div>
                                                            <p className="text-white/70 text-sm">{script.captionText}</p>
                                                        </div>

                                                        {/* Conversion Tips */}
                                                        {script.conversionTips && (
                                                            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                                                <h4 className="font-semibold text-green-400 mb-2">💡 Tips tăng conversion</h4>
                                                                <ul className="space-y-1">
                                                                    {script.conversionTips.map((tip, i) => (
                                                                        <li key={i} className="text-sm text-white/70">• {tip}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Banners Tab */}
                    {activeTab === 'banners' && (
                        <motion.div
                            key="banners"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Tạo Banner với AI</h3>

                                {/* Size Selection */}
                                <div className="flex gap-2 mb-4">
                                    {[
                                        { id: 'fb_feed', name: 'FB Feed (1200x628)' },
                                        { id: 'fb_square', name: 'Square (1080x1080)' },
                                        { id: 'ig_story', name: 'Story (1080x1920)' }
                                    ].map(size => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedBannerSize(size.id)}
                                            className={`px-4 py-2 rounded-lg text-sm ${selectedBannerSize === size.id ? 'text-white' : 'bg-white/5 text-white/60'
                                                }`}
                                            style={selectedBannerSize === size.id ? { background: primaryColor } : {}}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleGenerateBanner}
                                    disabled={isGeneratingBanner}
                                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    {isGeneratingBanner ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    Generate Banner
                                </button>
                            </div>

                            {/* Generated Banner */}
                            {bannerData && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h4 className="font-bold mb-4">Banner Design</h4>

                                    {bannerData.generatedImageUrl ? (
                                        <img src={bannerData.generatedImageUrl} alt="Generated Banner" className="rounded-xl max-w-full" />
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <p><strong>Headline:</strong> {bannerData.headline}</p>
                                                <p><strong>Subheadline:</strong> {bannerData.subheadline}</p>
                                                <p><strong>CTA:</strong> {bannerData.ctaText}</p>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <strong>Image Prompt (dùng cho DALL-E/Midjourney):</strong>
                                                    <button
                                                        onClick={() => copyToClipboard(bannerData.imagePrompt)}
                                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-1"
                                                    >
                                                        <Copy size={12} /> Copy
                                                    </button>
                                                </div>
                                                <p className="text-white/70 text-sm">{bannerData.imagePrompt}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Uploads Tab */}
                    {activeTab === 'uploads' && (
                        <motion.div
                            key="uploads"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Upload Video theo Platform</h3>

                                {/* Platform Selection for Upload */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {PLATFORMS.map(platform => {
                                        const specs = VIDEO_SPECS[platform.id];
                                        const uploaded = uploadedVideos.find(v => v.platform === platform.id);

                                        return (
                                            <div
                                                key={platform.id}
                                                className={`rounded-xl p-4 border cursor-pointer transition-all ${uploadPlatform === platform.id
                                                        ? 'border-2'
                                                        : 'border-white/10 hover:border-white/30'
                                                    } ${uploaded ? (uploaded.isValid ? 'bg-green-500/10' : 'bg-red-500/10') : 'bg-black/30'}`}
                                                style={uploadPlatform === platform.id ? { borderColor: platform.color } : {}}
                                                onClick={() => setUploadPlatform(platform.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <platform.icon size={18} style={{ color: platform.color }} />
                                                    <span className="font-medium">{platform.name}</span>
                                                    {uploaded && (
                                                        uploaded.isValid
                                                            ? <Check size={14} className="text-green-400" />
                                                            : <AlertCircle size={14} className="text-red-400" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-white/50 space-y-1">
                                                    <p>📐 {specs.aspectRatio}</p>
                                                    <p>⏱️ {specs.minDuration}-{specs.maxDuration}s</p>
                                                    <p>📺 {specs.resolution}</p>
                                                </div>
                                                {uploaded && !uploaded.isValid && (
                                                    <div className="mt-2 text-xs text-red-400">
                                                        {uploaded.errors.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Upload Area */}
                                <div
                                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-all cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                    />
                                    <Upload size={40} className="mx-auto mb-4 text-white/40" />
                                    <p className="text-white/60 mb-2">
                                        Kéo thả hoặc click để upload video cho <strong style={{ color: PLATFORMS.find(p => p.id === uploadPlatform)?.color }}>
                                            {PLATFORMS.find(p => p.id === uploadPlatform)?.name}
                                        </strong>
                                    </p>
                                    <p className="text-xs text-white/40">
                                        {VIDEO_SPECS[uploadPlatform].aspectRatio} • {VIDEO_SPECS[uploadPlatform].minDuration}-{VIDEO_SPECS[uploadPlatform].maxDuration}s
                                    </p>
                                </div>
                            </div>

                            {/* Uploaded Videos Preview */}
                            {uploadedVideos.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h4 className="font-bold mb-4">Video đã upload</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {uploadedVideos.map((video, i) => (
                                            <div key={i} className={`rounded-xl p-4 border ${video.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {(() => {
                                                        const platform = PLATFORMS.find(p => p.id === video.platform);
                                                        return platform && <platform.icon size={18} style={{ color: platform.color }} />;
                                                    })()}
                                                    <span className="font-medium">{PLATFORMS.find(p => p.id === video.platform)?.name}</span>
                                                    {video.isValid ? <Check size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                                                </div>
                                                <video src={video.url} className="w-full rounded-lg mb-2" style={{ maxHeight: '200px' }} controls />
                                                <div className="text-xs text-white/50">
                                                    {video.width}x{video.height} • {Math.round(video.duration)}s
                                                </div>
                                                {!video.isValid && (
                                                    <div className="mt-2 text-xs text-red-400">
                                                        ⚠️ {video.errors.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Action */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => window.location.href = '/app/campaign'}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Quay lại
                    </button>
                    <button
                        onClick={handleConfirmAndLaunch}
                        className="px-8 py-3 rounded-xl font-bold flex items-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                        <Check size={18} /> Xác nhận & Tiếp tục <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
}
