'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Video, Image as ImageIcon, Upload, Download, Check, ChevronRight,
    ArrowLeft, Rocket, Sparkles, FileVideo, Copy, Loader2, X, AlertCircle,
    Youtube, Facebook, Maximize2, Edit3, Zap, Target, TrendingUp, ImagePlus
} from 'lucide-react';
import ProNav from '@/components/ProNav';

const Typer = ({ text, speed = 20 }: { text: string; speed?: number }) => {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        setDisplayed('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayed(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <span>{displayed}<span className="animate-pulse text-cyan-400">|</span></span>;
};

const CopyBtn = ({ text, className = '' }: { text: string; className?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm flex items-center gap-1 transition-colors ${className}`}
        >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

// Platform types - Removed Instagram
type Platform = 'tiktok' | 'youtube_shorts' | 'youtube_preroll' | 'facebook_reels' | 'facebook_feed';
type ImagePlatform = 'facebook' | 'youtube' | 'google_display';

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

interface UploadedImage {
    platform: ImagePlatform;
    sizeId: string;
    sizeName: string;
    file: File;
    url: string;
    width: number;
    height: number;
    isValid: boolean;
    errors: string[];
}

interface ImageBrief {
    platform: ImagePlatform;
    sizeId: string;
    sizeName: string;
    prompt: string;
    dimensions: { width: number; height: number };
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

const IMAGE_PLATFORMS: { id: ImagePlatform; name: string; icon: any; color: string }[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: Facebook, color: '#1877f2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff0000' },
    { id: 'google_display', name: 'Google Display', icon: GoogleIcon, color: '#4285f4' }
];

// Image sizes by platform
const IMAGE_SIZES: Record<ImagePlatform, { id: string; name: string; width: number; height: number }[]> = {
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
    const [campaignData, setCampaignData] = useState<any>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['tiktok', 'facebook_reels']);
    const [activeTab, setActiveTab] = useState<'scripts' | 'image_briefs' | 'upload_videos' | 'upload_images'>('scripts');

    // Scripts state
    const [scripts, setScripts] = useState<ViralVideoScript[]>([]);
    const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
    const [activeScriptPlatform, setActiveScriptPlatform] = useState<Platform | null>(null);

    // Image briefs state
    const [imageBriefs, setImageBriefs] = useState<ImageBrief[]>([]);
    const [isGeneratingBriefs, setIsGeneratingBriefs] = useState(false);
    const [selectedImagePlatforms, setSelectedImagePlatforms] = useState<ImagePlatform[]>(['facebook', 'google_display']);

    // Upload state
    const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [uploadPlatform, setUploadPlatform] = useState<Platform>('tiktok');
    const [uploadImagePlatform, setUploadImagePlatform] = useState<ImagePlatform>('facebook');
    const [uploadImageSize, setUploadImageSize] = useState('fb_feed');

    // Load brand DNA and campaign data
    useEffect(() => {
        const storedDNA = localStorage.getItem('kodaflow_brand_dna');
        const storedCampaign = localStorage.getItem('kodaflow_campaign');

        if (storedDNA) {
            setBrandDNA(JSON.parse(storedDNA));
        }
        if (storedCampaign) {
            setCampaignData(JSON.parse(storedCampaign));
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

    // Generate image briefs
    const handleGenerateImageBriefs = async () => {
        if (!brandDNA) return;

        setIsGeneratingBriefs(true);
        const briefs: ImageBrief[] = [];

        for (const platform of selectedImagePlatforms) {
            const sizes = IMAGE_SIZES[platform];
            for (const size of sizes) {
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
                            platform,
                            sizeId: size.id
                        })
                    });

                    const result = await response.json();
                    if (result.success) {
                        briefs.push({
                            platform,
                            sizeId: size.id,
                            sizeName: size.name,
                            prompt: result.data.prompt,
                            dimensions: { width: size.width, height: size.height }
                        });
                    }
                } catch (error) {
                    console.error(`Error generating brief for ${size.name}:`, error);
                }
            }
        }

        setImageBriefs(briefs);
        setIsGeneratingBriefs(false);
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

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            const sizeSpec = IMAGE_SIZES[uploadImagePlatform].find(s => s.id === uploadImageSize);
            const errors: string[] = [];

            if (sizeSpec) {
                // Allow 10% tolerance
                const widthDiff = Math.abs(img.width - sizeSpec.width) / sizeSpec.width;
                const heightDiff = Math.abs(img.height - sizeSpec.height) / sizeSpec.height;

                if (widthDiff > 0.1 || heightDiff > 0.1) {
                    errors.push(`Kích thước không đúng! Cần ${sizeSpec.width}x${sizeSpec.height}, bạn upload ${img.width}x${img.height}`);
                }
            }

            setUploadedImages(prev => [...prev.filter(i => !(i.platform === uploadImagePlatform && i.sizeId === uploadImageSize)), {
                platform: uploadImagePlatform,
                sizeId: uploadImageSize,
                sizeName: sizeSpec?.name || '',
                file,
                url: URL.createObjectURL(file),
                width: img.width,
                height: img.height,
                isValid: errors.length === 0,
                errors
            }]);
        };

        img.src = URL.createObjectURL(file);
    };



    const primaryColor = brandDNA?.brandColors?.[0] || '#00d4ff';
    const secondaryColor = brandDNA?.brandColors?.[1] || '#a855f7';

    const handleConfirmAndContinue = () => {
        localStorage.setItem('kodaflow_creatives', JSON.stringify({
            scripts,
            imageBriefs,
            uploadedVideos: uploadedVideos.map(v => ({
                platform: v.platform,
                fileName: v.file.name,
                duration: v.duration,
                isValid: v.isValid
            })),
            uploadedImages: uploadedImages.map(i => ({
                platform: i.platform,
                sizeId: i.sizeId,
                sizeName: i.sizeName,
                fileName: i.file.name,
                isValid: i.isValid
            }))
        }));
        window.location.href = '/app/setup';
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
                            <h1 className="text-lg font-bold">Bước 3: Tạo Nội Dung</h1>
                            <p className="text-xs text-white/50">{brandDNA?.brandName || 'Module 3'} - Kịch bản & Ảnh</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ProNav currentPage="creative" />
                        <button onClick={() => window.location.href = '/app/campaign'} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                            <ArrowLeft size={14} /> Chiến lược
                        </button>
                        <button onClick={handleConfirmAndContinue} className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                            <Rocket size={16} /> Cài đặt Ads
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Progress indicator */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    {['DNA', 'Chiến lược', 'Nội dung', 'Cài đặt', 'Chạy'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${i === 2 ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : i < 2 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}>
                                {i < 2 ? <Check size={14} className="inline mr-1" /> : null}
                                {step}
                            </div>
                            {i < 4 && <ChevronRight size={16} className="text-white/20" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { id: 'scripts', label: 'Kịch bản Video', icon: Zap },
                        { id: 'image_briefs', label: 'Brief Ảnh', icon: Edit3 },
                        { id: 'upload_videos', label: 'Upload Video', icon: Video },
                        { id: 'upload_images', label: 'Upload Ảnh', icon: ImagePlus }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === tab.id ? 'text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                            style={activeTab === tab.id ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` } : {}}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ==================== SCRIPTS TAB ==================== */}
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
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all border ${selectedPlatforms.includes(platform.id) ? 'border-transparent text-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}
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
                                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    {isGeneratingScripts ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                                    Tạo kịch bản VIRAL
                                </button>
                            </div>

                            {/* Scripts display - simplified */}
                            {scripts.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                    <div className="flex border-b border-white/10 overflow-x-auto">
                                        {scripts.map(script => {
                                            const platform = PLATFORMS.find(p => p.id === script.platform);
                                            return (
                                                <button
                                                    key={script.platform}
                                                    onClick={() => setActiveScriptPlatform(script.platform as Platform)}
                                                    className={`px-4 py-3 flex items-center gap-2 whitespace-nowrap ${activeScriptPlatform === script.platform ? 'bg-white/10 border-b-2' : 'text-white/60 hover:text-white'}`}
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
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap gap-3 text-sm">
                                                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">🎯 Hook: {script.hookType}</span>
                                                            <span className={`px-3 py-1 rounded-full ${script.estimatedCTR === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                📈 CTR: {script.estimatedCTR}
                                                            </span>
                                                        </div>

                                                        {script.scenes?.map((scene, i) => (
                                                            <div key={i} className="bg-black/30 rounded-xl p-4 border-l-4" style={{ borderColor: scene.type === 'hook' ? '#ff0000' : scene.type === 'cta' ? '#00ff00' : '#ffffff30' }}>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-white/10">{scene.timeRange}</span>
                                                                    <span className="text-sm font-medium capitalize">{scene.type}</span>
                                                                </div>
                                                                <p className="text-cyan-400 mb-1">🎤 "<Typer text={scene.voiceover} speed={15} />"</p>
                                                                <p className="text-yellow-400 text-sm mb-3">📝 {scene.textOverlay}</p>

                                                                {/* Video Prompt Display */}
                                                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                                        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">🎥 AI Video Prompt ({scene.duration}s)</span>
                                                                        <CopyBtn text={scene.visual} />
                                                                    </div>
                                                                    <p className="text-white/60 text-xs italic font-mono">{scene.visual}</p>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <strong>🤖 Prompt cho AI Video (Full)</strong>
                                                                <CopyBtn text={script.aiVideoPrompt} />
                                                            </div>
                                                            <p className="text-white/70 text-sm">{script.aiVideoPrompt}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== IMAGE BRIEFS TAB ==================== */}
                    {activeTab === 'image_briefs' && (
                        <motion.div key="image_briefs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Chọn platform cần ảnh quảng cáo</h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {IMAGE_PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => setSelectedImagePlatforms(prev =>
                                                prev.includes(platform.id) ? prev.filter(p => p !== platform.id) : [...prev, platform.id]
                                            )}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all border ${selectedImagePlatforms.includes(platform.id) ? 'border-transparent text-white' : 'border-white/10 text-white/60'}`}
                                            style={selectedImagePlatforms.includes(platform.id) ? { background: platform.color } : {}}
                                        >
                                            {typeof platform.icon === 'function' ? <platform.icon size={16} /> : <platform.icon size={16} />}
                                            {platform.name}
                                            {selectedImagePlatforms.includes(platform.id) && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleGenerateImageBriefs}
                                    disabled={isGeneratingBriefs || selectedImagePlatforms.length === 0}
                                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                                >
                                    {isGeneratingBriefs ? <Loader2 className="animate-spin" size={18} /> : <Edit3 size={18} />}
                                    Tạo Brief Ảnh từ DNA
                                </button>
                            </div>

                            {/* Image briefs display */}
                            {imageBriefs.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {imageBriefs.map((brief, i) => {
                                        const platform = IMAGE_PLATFORMS.find(p => p.id === brief.platform);
                                        return (
                                            <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    {platform && (typeof platform.icon === 'function' ? <platform.icon size={18} /> : <platform.icon size={18} style={{ color: platform.color }} />)}
                                                    <span className="font-semibold">{brief.sizeName}</span>
                                                    <span className="text-xs text-white/40">{brief.dimensions.width}x{brief.dimensions.height}</span>
                                                </div>
                                                <textarea
                                                    value={brief.prompt}
                                                    onChange={(e) => {
                                                        const newBriefs = [...imageBriefs];
                                                        newBriefs[i].prompt = e.target.value;
                                                        setImageBriefs(newBriefs);
                                                    }}
                                                    rows={5}
                                                    className="w-full bg-black/30 rounded-lg p-3 text-sm text-white/80 border border-white/10 focus:border-cyan-500 focus:outline-none"
                                                />
                                                <div className="mt-2 flex justify-end">
                                                    <CopyBtn text={brief.prompt} className="mt-2" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== UPLOAD VIDEOS TAB ==================== */}
                    {activeTab === 'upload_videos' && (
                        <motion.div key="upload_videos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Upload Video đã tạo</h3>
                                <p className="text-white/60 text-sm mb-4">Sau khi tạo video bằng CapCut, Veo 3, Kling... hãy upload lên đây</p>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                    {PLATFORMS.filter(p => p.needsVideo).map(platform => {
                                        const specs = VIDEO_SPECS[platform.id];
                                        const uploaded = uploadedVideos.find(v => v.platform === platform.id);

                                        return (
                                            <div
                                                key={platform.id}
                                                className={`rounded-xl p-3 border cursor-pointer transition-all ${uploadPlatform === platform.id ? 'border-2' : 'border-white/10'} ${uploaded ? (uploaded.isValid ? 'bg-green-500/10' : 'bg-red-500/10') : 'bg-black/30'}`}
                                                style={uploadPlatform === platform.id ? { borderColor: platform.color } : {}}
                                                onClick={() => setUploadPlatform(platform.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <platform.icon size={16} style={{ color: platform.color }} />
                                                    <span className="text-sm font-medium">{platform.name}</span>
                                                    {uploaded && (uploaded.isValid ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-red-400" />)}
                                                </div>
                                                <p className="text-xs text-white/40">{specs.aspectRatio} • {specs.minDuration}-{specs.maxDuration}s</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                                    <Upload size={32} className="mx-auto mb-2 text-white/40" />
                                    <p className="text-white/60">
                                        Upload video cho <strong style={{ color: PLATFORMS.find(p => p.id === uploadPlatform)?.color }}>{PLATFORMS.find(p => p.id === uploadPlatform)?.name}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Uploaded videos */}
                            {uploadedVideos.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h4 className="font-bold mb-4">Video đã upload ({uploadedVideos.length})</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {uploadedVideos.map((video, i) => {
                                            const platform = PLATFORMS.find(p => p.id === video.platform);
                                            return (
                                                <div key={i} className={`rounded-xl p-4 border ${video.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {platform && <platform.icon size={16} style={{ color: platform.color }} />}
                                                        <span className="font-medium">{platform?.name}</span>
                                                        {video.isValid ? <Check size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                                                    </div>
                                                    <video src={video.url} className="w-full rounded-lg mb-2" style={{ maxHeight: '150px' }} controls />
                                                    <p className="text-xs text-white/50">{Math.round(video.duration)}s • {video.width}x{video.height}</p>
                                                    {!video.isValid && <p className="text-xs text-red-400 mt-1">⚠️ {video.errors.join(', ')}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== UPLOAD IMAGES TAB ==================== */}
                    {activeTab === 'upload_images' && (
                        <motion.div key="upload_images" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="font-bold mb-4">Upload Ảnh đã tạo</h3>
                                <p className="text-white/60 text-sm mb-4">Sau khi tạo ảnh bằng Canva, DALL-E, Midjourney... hãy upload lên đây</p>

                                {/* Platform selection */}
                                <div className="flex gap-2 mb-4">
                                    {IMAGE_PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => {
                                                setUploadImagePlatform(platform.id);
                                                setUploadImageSize(IMAGE_SIZES[platform.id][0].id);
                                            }}
                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploadImagePlatform === platform.id ? 'text-white' : 'bg-white/5 text-white/60'}`}
                                            style={uploadImagePlatform === platform.id ? { background: platform.color } : {}}
                                        >
                                            {typeof platform.icon === 'function' ? <platform.icon size={16} /> : <platform.icon size={16} />}
                                            {platform.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Size selection */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {IMAGE_SIZES[uploadImagePlatform].map(size => {
                                        const uploaded = uploadedImages.find(i => i.platform === uploadImagePlatform && i.sizeId === size.id);
                                        return (
                                            <button
                                                key={size.id}
                                                onClick={() => setUploadImageSize(size.id)}
                                                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${uploadImageSize === size.id ? 'text-white' : 'bg-white/5 text-white/60'}`}
                                                style={uploadImageSize === size.id ? { background: secondaryColor } : {}}
                                            >
                                                {size.name} ({size.width}x{size.height})
                                                {uploaded && (uploaded.isValid ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-red-400" />)}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                    <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <ImagePlus size={32} className="mx-auto mb-2 text-white/40" />
                                    <p className="text-white/60">
                                        Upload ảnh <strong>{IMAGE_SIZES[uploadImagePlatform].find(s => s.id === uploadImageSize)?.name}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Uploaded images */}
                            {uploadedImages.length > 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h4 className="font-bold mb-4">Ảnh đã upload ({uploadedImages.length})</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {uploadedImages.map((image, i) => {
                                            const platform = IMAGE_PLATFORMS.find(p => p.id === image.platform);
                                            return (
                                                <div key={i} className={`rounded-xl p-3 border ${image.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {platform && (typeof platform.icon === 'function' ? <platform.icon size={14} /> : <platform.icon size={14} style={{ color: platform.color }} />)}
                                                        <span className="text-sm font-medium">{image.sizeName}</span>
                                                        {image.isValid ? <Check size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400" />}
                                                    </div>
                                                    <img src={image.url} alt={image.sizeName} className="w-full rounded-lg mb-2 object-cover" style={{ maxHeight: '120px' }} />
                                                    <p className="text-xs text-white/50">{image.width}x{image.height}</p>
                                                    {!image.isValid && <p className="text-xs text-red-400 mt-1">⚠️ {image.errors.join(', ')}</p>}
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
                        <ArrowLeft size={18} /> Quay lại Chiến lược
                    </button>
                    <button onClick={handleConfirmAndContinue} className="px-8 py-3 rounded-xl font-bold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                        <Check size={18} /> Tiếp: Cài đặt Ads <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
}
