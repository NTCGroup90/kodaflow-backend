'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Video, Image as ImageIcon, Upload, Download, Check, ChevronRight,
    ArrowLeft, Rocket, Sparkles, FileVideo, Copy, Loader2, X, AlertCircle,
    Youtube, Facebook, Maximize2, Edit3, Zap, Target, TrendingUp
} from 'lucide-react';

// Platform types - Removed Instagram
type Platform = 'tiktok' | 'youtube_shorts' | 'youtube_preroll' | 'facebook_reels' | 'facebook_feed';

interface ViralVideoScript {
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
        emotionalTrigger: string;
        transition: string;
    }>;
    aiVideoPrompt: string;
    suggestedMusic: string;
    captionText: string;
    hashtagSuggestions: string[];
    conversionTips: string[];
    hookType: string;
    estimatedCTR: string;
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

// TikTok icon component
const TikTokIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

// Google icon
const GoogleIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const PLATFORMS: { id: Platform; name: string; icon: any; color: string; needsVideo: boolean; needsImage: boolean }[] = [
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: '#00f2ea', needsVideo: true, needsImage: false },
    { id: 'youtube_shorts', name: 'YT Shorts', icon: Youtube, color: '#ff0000', needsVideo: true, needsImage: false },
    { id: 'youtube_preroll', name: 'YT Pre-roll', icon: Youtube, color: '#ff0000', needsVideo: true, needsImage: true },
    { id: 'facebook_reels', name: 'FB Reels', icon: Facebook, color: '#1877f2', needsVideo: true, needsImage: false },
    { id: 'facebook_feed', name: 'FB Feed', icon: Facebook, color: '#1877f2', needsVideo: true, needsImage: true }
];

// Image sizes by platform
const IMAGE_SIZES = {
    facebook: [
        { id: 'fb_feed', name: 'Facebook Feed', width: 1200, height: 628 },
        { id: 'fb_square', name: 'Facebook Square', width: 1080, height: 1080 }
    ],
    youtube: [
        { id: 'yt_thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720 }
    ],
    google_display: [
        { id: 'gdn_medium', name: 'Medium Rectangle', width: 300, height: 250 },
        { id: 'gdn_leaderboard', name: 'Leaderboard', width: 728, height: 90 },
        { id: 'gdn_skyscraper', name: 'Wide Skyscraper', width: 160, height: 600 },
        { id: 'gdn_large', name: 'Large Rectangle', width: 336, height: 280 }
    ]
};

const VIDEO_SPECS: Record<Platform, { aspectRatio: string; minDuration: number; maxDuration: number; resolution: string }> = {
    tiktok: { aspectRatio: '9:16', minDuration: 5, maxDuration: 60, resolution: '720x1280' },
    youtube_shorts: { aspectRatio: '9:16', minDuration: 15, maxDuration: 60, resolution: '720x1280' },
    youtube_preroll: { aspectRatio: '16:9', minDuration: 6, maxDuration: 180, resolution: '1920x1080' },
    facebook_reels: { aspectRatio: '9:16', minDuration: 15, maxDuration: 90, resolution: '720x1280' },
    facebook_feed: { aspectRatio: '1:1 / 4:5', minDuration: 1, maxDuration: 240, resolution: '720p' }
};

export default function CreativeStudioPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [brandDNA, setBrandDNA] = useState<any>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['tiktok', 'facebook_reels']);
    const [activeTab, setActiveTab] = useState<'scripts' | 'images' | 'uploads'>('scripts');

    // Scripts state
    const [scripts, setScripts] = useState<ViralVideoScript[]>([]);
    const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
    const [activeScriptPlatform, setActiveScriptPlatform] = useState<Platform | null>(null);

    // Image state - with editable prompts
    const [selectedImagePlatform, setSelectedImagePlatform] = useState<'facebook' | 'youtube' | 'google_display'>('facebook');
    const [selectedImageSize, setSelectedImageSize] = useState('fb_feed');
    const [imagePrompt, setImagePrompt] = useState('');
    const [isPromptReady, setIsPromptReady] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [externalPrompts, setExternalPrompts] = useState<any>(null);

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

    // Generate viral scripts
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
                        productDescription: brandDNA.productDescription || brandDNA.tagline,
                        coreValues: brandDNA.coreValues || [],
                        targetAudience: brandDNA.targetAudience || '',
                        painPoints: brandDNA.painPoints || [],
                        uniqueSellingPoints: brandDNA.uniqueSellingPoints || [],
                        toneOfVoice: brandDNA.toneOfVoice || [],
                        industryCategory: brandDNA.industryCategory || '',
                        brandColors: brandDNA.brandColors || [],
                        competitorWeaknesses: brandDNA.competitorWeaknesses || []
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

    // Step 1: Generate editable prompt
    const handleGeneratePrompt = async () => {
        if (!brandDNA) return;

        setIsGeneratingPrompt(true);
        setIsPromptReady(false);
        setGeneratedImage(null);

        try {
            const response = await fetch('/api/creative/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_prompt',
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
                    platform: selectedImagePlatform,
                    sizeId: selectedImageSize
                })
            });

            const result = await response.json();
            if (result.success) {
                setImagePrompt(result.data.prompt);
                setIsPromptReady(true);
            }
        } catch (error) {
            console.error('Error generating prompt:', error);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    // Step 2: Generate image with (edited) prompt
    const handleGenerateImage = async () => {
        if (!brandDNA || !imagePrompt) return;

        setIsGeneratingImage(true);

        try {
            const response = await fetch('/api/creative/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_image',
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
                    platform: selectedImagePlatform,
                    sizeId: selectedImageSize,
                    customPrompt: imagePrompt
                })
            });

            const result = await response.json();
            if (result.success) {
                if (result.data.imageUrl) {
                    setGeneratedImage(result.data.imageUrl);
                }
                if (result.data.externalToolInstructions) {
                    setExternalPrompts(result.data.externalToolInstructions);
                }
            }
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsGeneratingImage(false);
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

            if (video.duration < specs.minDuration) {
                errors.push(`Video quá ngắn! Tối thiểu ${specs.minDuration}s`);
            }
            if (video.duration > specs.maxDuration) {
                errors.push(`Video quá dài! Tối đa ${specs.maxDuration}s`);
            }

            const ratio = video.videoWidth / video.videoHeight;
            if (uploadPlatform === 'youtube_preroll') {
                if (Math.abs(ratio - 16 / 9) > 0.1) errors.push('Cần tỉ lệ 16:9');
            } else if (['tiktok', 'youtube_shorts', 'facebook_reels'].includes(uploadPlatform)) {
                if (Math.abs(ratio - 9 / 16) > 0.1) errors.push('Cần tỉ lệ 9:16 (dọc)');
            }

            setUploadedVideos(prev => [...prev.filter(v => v.platform !== uploadPlatform), {
                platform: uploadPlatform,
                file,
                url: URL.createObjectURL(file),
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                isValid: errors.length === 0,
                errors
            }]);
        };

        video.src = URL.createObjectURL(file);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const primaryColor = brandDNA?.brandColors?.[0] || '#00d4ff';
    const secondaryColor = brandDNA?.brandColors?.[1] || '#a855f7';

    const handleConfirmAndLaunch = () => {
        localStorage.setItem('kodaflow_creatives', JSON.stringify({
            scripts,
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
                            <h1 className="text-lg font-bold">Creative Studio Pro</h1>
                            <p className="text-xs text-white/50">{brandDNA?.brandName || 'Module 4'} - Viral Content</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = '/app/campaign'} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                            <ArrowLeft size={14} /> Campaign
                        </button>
                        <button onClick={handleConfirmAndLaunch} className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                            <Rocket size={16} /> Launch
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Asset Requirements Overview */}
                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl border border-white/10 p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Target size={18} className="text-cyan-400" /> Nguyên liệu cần chuẩn bị
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TikTokIcon size={16} />
                                <span className="font-medium">TikTok</span>
                            </div>
                            <p className="text-xs text-white/60">Video 9:16, 9-60s<br />❌ Không cần ảnh</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Youtube size={16} className="text-red-500" />
                                <span className="font-medium">YouTube</span>
                            </div>
                            <p className="text-xs text-white/60">Video 9:16 hoặc 16:9<br />✅ Thumbnail 1280x720</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Facebook size={16} className="text-blue-500" />
                                <span className="font-medium">Facebook</span>
                            </div>
                            <p className="text-xs text-white/60">Video + ảnh<br />✅ 1200x628, 1080x1080</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <GoogleIcon size={16} />
                                <span className="font-medium">Google Display</span>
                            </div>
                            <p className="text-xs text-white/60">❌ Không cần video<br />✅ 300x250, 728x90, 160x600</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'scripts', label: 'Kịch bản Viral', icon: Zap },
                        { id: 'images', label: 'Tạo Ảnh Ads', icon: ImageIcon },
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

                <AnimatePresence mode="wait">
                    {/* ==================== VIRAL SCRIPTS TAB ==================== */}
                    {activeTab === 'scripts' && (
                        <motion.div key="scripts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-green-400" /> Chọn platform cần kịch bản
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => setSelectedPlatforms(prev =>
                                                prev.includes(platform.id) ? prev.filter(p => p !== platform.id) : [...prev, platform.id]
                                            )}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all border ${selectedPlatforms.includes(platform.id) ? 'border-transparent text-white' : 'border-white/10 text-white/60 hover:border-white/30'
                                                }`}
                                            style={selectedPlatforms.includes(platform.id) ? { background: platform.color } : {}}
                                        >
                                            {typeof platform.icon === 'function' ? <platform.icon size={16} /> : <platform.icon size={16} />}
                                            {platform.name}
                                            {selectedPlatforms.includes(platform.id) && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleGenerateScripts}
                                    disabled={isGeneratingScripts || selectedPlatforms.length === 0}
                                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    {isGeneratingScripts ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                                    Tạo kịch bản VIRAL
                                </button>
                            </div>

                            {/* Generated Scripts */}
                            {scripts.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                    <div className="flex border-b border-white/10 overflow-x-auto">
                                        {scripts.map(script => {
                                            const platform = PLATFORMS.find(p => p.id === script.platform);
                                            return (
                                                <button
                                                    key={script.platform}
                                                    onClick={() => setActiveScriptPlatform(script.platform as Platform)}
                                                    className={`px-4 py-3 flex items-center gap-2 whitespace-nowrap ${activeScriptPlatform === script.platform ? 'bg-white/10 border-b-2' : 'text-white/60 hover:text-white'
                                                        }`}
                                                    style={activeScriptPlatform === script.platform ? { borderColor: platform?.color } : {}}
                                                >
                                                    {platform && <platform.icon size={16} />}
                                                    {platform?.name}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {scripts.find(s => s.platform === activeScriptPlatform) && (
                                        <div className="p-6">
                                            {(() => {
                                                const script = scripts.find(s => s.platform === activeScriptPlatform)!;
                                                return (
                                                    <div className="space-y-6">
                                                        {/* Script Stats */}
                                                        <div className="flex flex-wrap gap-4 text-sm">
                                                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                                                                🎯 Hook: {script.hookType}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-full ${script.estimatedCTR === 'High' ? 'bg-green-500/20 text-green-400' :
                                                                    script.estimatedCTR === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                        'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                📈 CTR: {script.estimatedCTR}
                                                            </span>
                                                            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                                                                ⏱️ {script.duration}
                                                            </span>
                                                            <span className="px-3 py-1 rounded-full bg-white/10">
                                                                📐 {script.aspectRatio}
                                                            </span>
                                                        </div>

                                                        {/* Scenes */}
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold">📋 Kịch bản từng cảnh</h4>
                                                            {script.scenes?.map((scene, i) => (
                                                                <div key={i} className="bg-black/30 rounded-xl p-4 border-l-4" style={{ borderColor: scene.type === 'hook' ? '#ff0000' : scene.type === 'cta' ? '#00ff00' : '#ffffff30' }}>
                                                                    <div className="flex items-center gap-3 mb-3">
                                                                        <span className="text-xs px-2 py-1 rounded-full bg-white/10">{scene.timeRange}</span>
                                                                        <span className="text-sm font-medium capitalize px-2 py-1 rounded-full" style={{ background: scene.type === 'hook' ? '#ff000030' : scene.type === 'cta' ? '#00ff0030' : '#ffffff10' }}>
                                                                            {scene.type}
                                                                        </span>
                                                                        {scene.emotionalTrigger && (
                                                                            <span className="text-xs text-white/50">💭 {scene.emotionalTrigger}</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-white/80 mb-2">🎬 <strong>Visual:</strong> {scene.visual}</p>
                                                                    <p className="text-cyan-400 mb-2">🎤 <strong>Voiceover:</strong> "{scene.voiceover}"</p>
                                                                    <p className="text-yellow-400 text-sm">📝 <strong>Text:</strong> {scene.textOverlay}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* AI Video Prompt */}
                                                        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-4 border border-purple-500/20">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold">🤖 Prompt cho AI Video (Veo 3/Kling/Runway)</h4>
                                                                <button onClick={() => copyToClipboard(script.aiVideoPrompt)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-1">
                                                                    <Copy size={12} /> Copy
                                                                </button>
                                                            </div>
                                                            <p className="text-white/70 text-sm">{script.aiVideoPrompt}</p>
                                                        </div>

                                                        {/* Caption & Hashtags */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="bg-black/30 rounded-xl p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-semibold">📝 Caption</h4>
                                                                    <button onClick={() => copyToClipboard(script.captionText)} className="p-1 bg-white/10 hover:bg-white/20 rounded">
                                                                        <Copy size={12} />
                                                                    </button>
                                                                </div>
                                                                <p className="text-white/70 text-sm">{script.captionText}</p>
                                                            </div>
                                                            <div className="bg-black/30 rounded-xl p-4">
                                                                <h4 className="font-semibold mb-2"># Hashtags</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {script.hashtagSuggestions?.map((tag, i) => (
                                                                        <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full text-cyan-400">#{tag}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Conversion Tips */}
                                                        {script.conversionTips && (
                                                            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                                                <h4 className="font-semibold text-green-400 mb-2">💡 Tips tăng Conversion</h4>
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

                    {/* ==================== IMAGES TAB ==================== */}
                    {activeTab === 'images' && (
                        <motion.div key="images" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Tạo Ảnh Quảng Cáo từ DNA</h3>

                                {/* Platform Selection */}
                                <div className="mb-4">
                                    <label className="text-sm text-white/60 mb-2 block">Chọn platform</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'facebook', name: 'Facebook', icon: Facebook },
                                            { id: 'youtube', name: 'YouTube', icon: Youtube },
                                            { id: 'google_display', name: 'Google Display', icon: GoogleIcon }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedImagePlatform(p.id as any);
                                                    setSelectedImageSize(IMAGE_SIZES[p.id as keyof typeof IMAGE_SIZES][0].id);
                                                    setIsPromptReady(false);
                                                    setGeneratedImage(null);
                                                }}
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selectedImagePlatform === p.id ? 'text-white' : 'bg-white/5 text-white/60'
                                                    }`}
                                                style={selectedImagePlatform === p.id ? { background: primaryColor } : {}}
                                            >
                                                {typeof p.icon === 'function' ? <p.icon size={16} /> : <p.icon size={16} />}
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Size Selection */}
                                <div className="mb-4">
                                    <label className="text-sm text-white/60 mb-2 block">Chọn kích thước</label>
                                    <div className="flex flex-wrap gap-2">
                                        {IMAGE_SIZES[selectedImagePlatform]?.map(size => (
                                            <button
                                                key={size.id}
                                                onClick={() => {
                                                    setSelectedImageSize(size.id);
                                                    setIsPromptReady(false);
                                                    setGeneratedImage(null);
                                                }}
                                                className={`px-3 py-2 rounded-lg text-sm ${selectedImageSize === size.id ? 'text-white' : 'bg-white/5 text-white/60'
                                                    }`}
                                                style={selectedImageSize === size.id ? { background: secondaryColor } : {}}
                                            >
                                                {size.name} ({size.width}x{size.height})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 1: Generate Prompt */}
                                {!isPromptReady && (
                                    <button
                                        onClick={handleGeneratePrompt}
                                        disabled={isGeneratingPrompt}
                                        className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                    >
                                        {isGeneratingPrompt ? <Loader2 className="animate-spin" size={18} /> : <Edit3 size={18} />}
                                        Bước 1: Tạo Prompt từ DNA
                                    </button>
                                )}

                                {/* Step 2: Edit Prompt & Generate */}
                                {isPromptReady && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-white/60 mb-2 block flex items-center gap-2">
                                                <Edit3 size={14} /> Chỉnh sửa prompt (nếu cần)
                                            </label>
                                            <textarea
                                                value={imagePrompt}
                                                onChange={(e) => setImagePrompt(e.target.value)}
                                                rows={8}
                                                className="w-full bg-black/30 rounded-xl p-4 text-sm text-white/80 border border-white/10 focus:border-cyan-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateImage}
                                            disabled={isGeneratingImage}
                                            className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                        >
                                            {isGeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                            Bước 2: Tạo Ảnh
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Generated Image or External Prompts */}
                            {(generatedImage || externalPrompts) && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h4 className="font-bold mb-4">Kết quả</h4>

                                    {generatedImage ? (
                                        <img src={generatedImage} alt="Generated" className="rounded-xl max-w-full mb-4" />
                                    ) : externalPrompts && (
                                        <div className="space-y-4">
                                            <p className="text-white/60 text-sm mb-4">
                                                ⚠️ Gemini không thể tạo ảnh trực tiếp. Sử dụng prompt dưới đây với các tool khác:
                                            </p>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <strong>DALL-E / ChatGPT</strong>
                                                    <button onClick={() => copyToClipboard(externalPrompts.dallePrompt)} className="px-3 py-1 bg-white/10 rounded text-sm">Copy</button>
                                                </div>
                                                <p className="text-xs text-white/60">{externalPrompts.dallePrompt?.slice(0, 200)}...</p>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <strong>Midjourney</strong>
                                                    <button onClick={() => copyToClipboard(externalPrompts.midjourneyPrompt)} className="px-3 py-1 bg-white/10 rounded text-sm">Copy</button>
                                                </div>
                                                <p className="text-xs text-white/60">{externalPrompts.midjourneyPrompt?.slice(0, 200)}...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== UPLOADS TAB ==================== */}
                    {activeTab === 'uploads' && (
                        <motion.div key="uploads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Upload Video theo Platform</h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                                    {PLATFORMS.filter(p => p.needsVideo).map(platform => {
                                        const specs = VIDEO_SPECS[platform.id];
                                        const uploaded = uploadedVideos.find(v => v.platform === platform.id);

                                        return (
                                            <div
                                                key={platform.id}
                                                className={`rounded-xl p-4 border cursor-pointer transition-all ${uploadPlatform === platform.id ? 'border-2' : 'border-white/10 hover:border-white/30'
                                                    } ${uploaded ? (uploaded.isValid ? 'bg-green-500/10' : 'bg-red-500/10') : 'bg-black/30'}`}
                                                style={uploadPlatform === platform.id ? { borderColor: platform.color } : {}}
                                                onClick={() => setUploadPlatform(platform.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <platform.icon size={18} style={{ color: platform.color }} />
                                                    <span className="font-medium text-sm">{platform.name}</span>
                                                    {uploaded && (uploaded.isValid ? <Check size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />)}
                                                </div>
                                                <div className="text-xs text-white/50 space-y-1">
                                                    <p>📐 {specs.aspectRatio}</p>
                                                    <p>⏱️ {specs.minDuration}-{specs.maxDuration}s</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div
                                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                                    <Upload size={40} className="mx-auto mb-4 text-white/40" />
                                    <p className="text-white/60">
                                        Upload video cho <strong style={{ color: PLATFORMS.find(p => p.id === uploadPlatform)?.color }}>{PLATFORMS.find(p => p.id === uploadPlatform)?.name}</strong>
                                    </p>
                                </div>
                            </div>

                            {uploadedVideos.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h4 className="font-bold mb-4">Video đã upload</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {uploadedVideos.map((video, i) => {
                                            const platform = PLATFORMS.find(p => p.id === video.platform);
                                            return (
                                                <div key={i} className={`rounded-xl p-4 border ${video.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {platform && <platform.icon size={18} style={{ color: platform.color }} />}
                                                        <span className="font-medium">{platform?.name}</span>
                                                        {video.isValid ? <Check size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                                                    </div>
                                                    <video src={video.url} className="w-full rounded-lg mb-2" style={{ maxHeight: '200px' }} controls />
                                                    <div className="text-xs text-white/50">{video.width}x{video.height} • {Math.round(video.duration)}s</div>
                                                    {!video.isValid && <div className="mt-2 text-xs text-red-400">⚠️ {video.errors.join(', ')}</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Action */}
                <div className="mt-8 flex justify-between">
                    <button onClick={() => window.location.href = '/app/campaign'} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2">
                        <ArrowLeft size={18} /> Quay lại
                    </button>
                    <button onClick={handleConfirmAndLaunch} className="px-8 py-3 rounded-xl font-bold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                        <Check size={18} /> Xác nhận & Tiếp tục <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
}
