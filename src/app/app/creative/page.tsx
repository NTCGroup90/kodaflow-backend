'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Video, Image as ImageIcon, Type, Layers, Play, Pause,
    Download, RefreshCw, Check, ChevronRight, ArrowLeft, Rocket,
    Sparkles, Wand2, Volume2, Music, Clock, Eye, Edit3, Copy,
    Square, Circle, Triangle, Loader2, ChevronDown, ChevronUp,
    Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut
} from 'lucide-react';

// ==================== TYPES ====================

interface VideoScene {
    sceneNumber: number;
    durationSeconds: number;
    visual: string;
    voiceover: string;
    textOverlay: string;
    musicNote: string;
    transition: string;
}

interface AdCopySet {
    headlines: string[];
    descriptions: string[];
    callToAction: string;
}

interface CampaignAngle {
    id: string;
    title: string;
    angleType: string;
}

interface CampaignData {
    angle: CampaignAngle;
    adCopy: AdCopySet;
    videoScript: {
        scenes: VideoScene[];
        duration: number;
        hook: string;
        callToAction: string;
        suggestedMusic: string;
    };
    landingPage: any;
}

interface BannerTemplate {
    id: string;
    name: string;
    width: number;
    height: number;
    platform: string;
}

const BANNER_TEMPLATES: BannerTemplate[] = [
    { id: 'fb_feed', name: 'Facebook Feed', width: 1200, height: 628, platform: 'facebook' },
    { id: 'fb_square', name: 'Facebook Square', width: 1080, height: 1080, platform: 'facebook' },
    { id: 'ig_story', name: 'Instagram Story', width: 1080, height: 1920, platform: 'instagram' },
    { id: 'google_display', name: 'Google Display', width: 300, height: 250, platform: 'google' }
];

// ==================== MAIN COMPONENT ====================

export default function CreativeStudioPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
    const [brandDNA, setBrandDNA] = useState<any>(null);
    const [assets, setAssets] = useState<any[]>([]);

    // Banner Editor State
    const [selectedTemplate, setSelectedTemplate] = useState<BannerTemplate>(BANNER_TEMPLATES[0]);
    const [editingText, setEditingText] = useState<string | null>(null);
    const [bannerHeadline, setBannerHeadline] = useState('');
    const [bannerSubheadline, setBannerSubheadline] = useState('');
    const [bannerCTA, setBannerCTA] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Video Preview State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentScene, setCurrentScene] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [expandedPanel, setExpandedPanel] = useState<'banner' | 'video' | null>(null);

    // Load campaign data on mount
    useEffect(() => {
        loadCampaignData();
    }, []);

    const loadCampaignData = () => {
        setIsLoading(true);
        try {
            const storedCampaign = localStorage.getItem('kodaflow_campaign');
            const storedDNA = localStorage.getItem('kodaflow_brand_dna');
            const storedAssets = localStorage.getItem('kodaflow_assets');

            if (!storedCampaign) {
                setError('Không tìm thấy dữ liệu chiến dịch. Vui lòng quay lại Campaign Architect.');
                setIsLoading(false);
                return;
            }

            const campaign = JSON.parse(storedCampaign);
            const dna = storedDNA ? JSON.parse(storedDNA) : null;
            const assetList = storedAssets ? JSON.parse(storedAssets) : [];

            setCampaignData(campaign);
            setBrandDNA(dna);
            setAssets(assetList);

            // Initialize banner text from ad copy
            if (campaign.adCopy) {
                setBannerHeadline(campaign.adCopy.headlines[0] || '');
                setBannerSubheadline(campaign.adCopy.descriptions[0] || '');
                setBannerCTA(campaign.adCopy.callToAction || 'Tìm hiểu ngay');
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Failed to load campaign data:', err);
            setError('Có lỗi khi tải dữ liệu');
            setIsLoading(false);
        }
    };

    // Video playback
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && campaignData?.videoScript) {
            const scenes = campaignData.videoScript.scenes;
            const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + 0.1;
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        return 0;
                    }

                    // Update current scene
                    let accum = 0;
                    for (let i = 0; i < scenes.length; i++) {
                        accum += scenes[i].durationSeconds;
                        if (next < accum) {
                            setCurrentScene(i);
                            break;
                        }
                    }

                    return next;
                });
            }, 100);
        }

        return () => clearInterval(interval);
    }, [isPlaying, campaignData]);

    const getTotalDuration = () => {
        if (!campaignData?.videoScript?.scenes) return 0;
        return campaignData.videoScript.scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSceneProgress = () => {
        if (!campaignData?.videoScript?.scenes) return 0;
        const scene = campaignData.videoScript.scenes[currentScene];
        if (!scene) return 0;

        let sceneStart = 0;
        for (let i = 0; i < currentScene; i++) {
            sceneStart += campaignData.videoScript.scenes[i].durationSeconds;
        }

        return ((currentTime - sceneStart) / scene.durationSeconds) * 100;
    };

    const handleExportBanner = () => {
        // In a real implementation, this would use Fabric.js to export
        alert('Banner exported! (Demo - Fabric.js integration would save actual image)');
    };

    const handleExportVideo = () => {
        // In a real implementation, this would use Canvas recording
        alert('Video exported! (Demo - Canvas recording would generate WebM/MP4)');
    };

    const handleConfirmAndLaunch = () => {
        // Save creative assets and navigate to Module 5
        localStorage.setItem('kodaflow_creatives', JSON.stringify({
            banner: {
                template: selectedTemplate,
                headline: bannerHeadline,
                subheadline: bannerSubheadline,
                cta: bannerCTA
            },
            video: campaignData?.videoScript
        }));
        window.location.href = '/app/launch';
    };

    // ==================== RENDER ====================

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Palette size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Đang tải Creative Studio...</h2>
                    <p className="text-white/60">Chuẩn bị công cụ sáng tạo</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <Palette className="text-red-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-red-400">Có lỗi xảy ra</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/app/campaign'}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold"
                    >
                        Quay lại Campaign Architect
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Creative Studio</h1>
                            <p className="text-xs text-white/50">Module 4 - Xưởng sáng tạo</p>
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
                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                        >
                            <Rocket size={16} /> Confirm & Launch
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Campaign Info Bar */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold">{campaignData?.angle?.title || 'Chiến dịch'}</h3>
                            <p className="text-sm text-white/50">{brandDNA?.brandName || 'Brand'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/60">
                        <span className="flex items-center gap-2">
                            <ImageIcon size={14} /> {assets.length} ảnh
                        </span>
                        <span className="flex items-center gap-2">
                            <Video size={14} /> {campaignData?.videoScript?.scenes?.length || 0} cảnh
                        </span>
                    </div>
                </div>

                {/* Main Content - Dual Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ==================== BANNER EDITOR PANEL ==================== */}
                    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden ${expandedPanel === 'banner' ? 'lg:col-span-2' : ''}`}>
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold flex items-center gap-2">
                                <ImageIcon className="text-purple-400" size={18} /> Banner Editor
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setExpandedPanel(expandedPanel === 'banner' ? null : 'banner')}
                                    className="p-2 hover:bg-white/10 rounded-lg"
                                >
                                    {expandedPanel === 'banner' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Template Selector */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {BANNER_TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedTemplate.id === template.id
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Canvas Preview */}
                        <div className="p-6">
                            <div
                                className="relative mx-auto bg-gradient-to-br from-[#1a1a2e] via-[#0d1117] to-[#1a1a2e] rounded-xl overflow-hidden border border-white/10"
                                style={{
                                    width: '100%',
                                    maxWidth: selectedTemplate.width > selectedTemplate.height ? '100%' : '300px',
                                    aspectRatio: `${selectedTemplate.width} / ${selectedTemplate.height}`
                                }}
                            >
                                {/* Banner Preview */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-center">
                                    {/* Headline */}
                                    <div
                                        className={`mb-4 cursor-pointer transition-all ${editingText === 'headline' ? 'ring-2 ring-cyan-500 rounded' : ''}`}
                                        onClick={() => setEditingText('headline')}
                                    >
                                        {editingText === 'headline' ? (
                                            <input
                                                type="text"
                                                value={bannerHeadline}
                                                onChange={(e) => setBannerHeadline(e.target.value)}
                                                onBlur={() => setEditingText(null)}
                                                autoFocus
                                                className="w-full bg-transparent text-2xl font-bold focus:outline-none"
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-bold group">
                                                {bannerHeadline || 'Click để thêm tiêu đề'}
                                                <Edit3 size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 text-cyan-400" />
                                            </h2>
                                        )}
                                    </div>

                                    {/* Subheadline */}
                                    <div
                                        className={`mb-6 cursor-pointer transition-all ${editingText === 'subheadline' ? 'ring-2 ring-cyan-500 rounded' : ''}`}
                                        onClick={() => setEditingText('subheadline')}
                                    >
                                        {editingText === 'subheadline' ? (
                                            <input
                                                type="text"
                                                value={bannerSubheadline}
                                                onChange={(e) => setBannerSubheadline(e.target.value)}
                                                onBlur={() => setEditingText(null)}
                                                autoFocus
                                                className="w-full bg-transparent text-white/70 focus:outline-none"
                                            />
                                        ) : (
                                            <p className="text-white/70 group">
                                                {bannerSubheadline || 'Click để thêm mô tả'}
                                                <Edit3 size={12} className="inline ml-2 opacity-0 group-hover:opacity-100 text-cyan-400" />
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <div
                                        className={`inline-block cursor-pointer ${editingText === 'cta' ? 'ring-2 ring-cyan-500 rounded' : ''}`}
                                        onClick={() => setEditingText('cta')}
                                    >
                                        {editingText === 'cta' ? (
                                            <input
                                                type="text"
                                                value={bannerCTA}
                                                onChange={(e) => setBannerCTA(e.target.value)}
                                                onBlur={() => setEditingText(null)}
                                                autoFocus
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-bold focus:outline-none"
                                            />
                                        ) : (
                                            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:shadow-lg transition-all">
                                                {bannerCTA || 'CTA Button'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Brand colors indicator */}
                                <div className="absolute bottom-4 right-4 flex gap-1">
                                    {(brandDNA?.brandColors || ['#00d4ff', '#a855f7']).slice(0, 3).map((color: string, i: number) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded-full border border-white/20"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Editor Tools */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">
                                        {selectedTemplate.width} × {selectedTemplate.height}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                                        <Copy size={14} /> A/B Variant
                                    </button>
                                    <button
                                        onClick={handleExportBanner}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-semibold flex items-center gap-2"
                                    >
                                        <Download size={14} /> Export PNG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==================== VIDEO PREVIEW PANEL ==================== */}
                    {expandedPanel !== 'banner' && (
                        <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden ${expandedPanel === 'video' ? 'lg:col-span-2' : ''}`}>
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Video className="text-pink-400" size={18} /> Video Shorts Preview
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">
                                        {formatTime(currentTime)} / {formatTime(getTotalDuration())}
                                    </span>
                                    <button
                                        onClick={() => setExpandedPanel(expandedPanel === 'video' ? null : 'video')}
                                        className="p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        {expandedPanel === 'video' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Video Player */}
                            <div className="p-6">
                                <div className="relative mx-auto bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] rounded-xl overflow-hidden border border-white/10"
                                    style={{ maxWidth: '280px', aspectRatio: '9/16' }}
                                >
                                    {/* Current Scene Display */}
                                    {campaignData?.videoScript?.scenes?.[currentScene] && (
                                        <motion.div
                                            key={currentScene}
                                            initial={{ opacity: 0, scale: 1 }}
                                            animate={{
                                                opacity: 1,
                                                scale: isPlaying ? 1.1 : 1,
                                                transition: { duration: campaignData.videoScript.scenes[currentScene].durationSeconds }
                                            }}
                                            className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50"
                                        >
                                            {/* Visual Description */}
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <p className="text-center text-white/40 text-sm">
                                                    {campaignData.videoScript.scenes[currentScene].visual}
                                                </p>
                                            </div>

                                            {/* Text Overlay */}
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="absolute bottom-20 left-4 right-4"
                                            >
                                                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4">
                                                    <p className="text-lg font-bold text-center">
                                                        {campaignData.videoScript.scenes[currentScene].textOverlay}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            {/* Scene Number */}
                                            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs">
                                                Scene {currentScene + 1}/{campaignData.videoScript.scenes.length}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Play Button Overlay */}
                                    {!isPlaying && (
                                        <button
                                            onClick={() => setIsPlaying(true)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-all"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                                <Play size={32} className="text-white ml-1" />
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Playback Controls */}
                                <div className="mt-4 space-y-3">
                                    {/* Progress Bar */}
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                                            style={{ width: `${(currentTime / getTotalDuration()) * 100}%` }}
                                        />
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => { setCurrentTime(0); setCurrentScene(0); }}
                                            className="p-2 hover:bg-white/10 rounded-lg"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center"
                                        >
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg">
                                            <Volume2 size={16} />
                                        </button>
                                    </div>

                                    {/* Scene Timeline */}
                                    <div className="flex gap-1">
                                        {campaignData?.videoScript?.scenes?.map((scene, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    let time = 0;
                                                    for (let j = 0; j < i; j++) {
                                                        time += campaignData.videoScript.scenes[j].durationSeconds;
                                                    }
                                                    setCurrentTime(time);
                                                    setCurrentScene(i);
                                                }}
                                                className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${currentScene === i
                                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                                                        : 'bg-white/10 hover:bg-white/20'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Export Button */}
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center justify-center gap-2">
                                        <Music size={14} /> Thêm nhạc
                                    </button>
                                    <button
                                        onClick={handleExportVideo}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> Export MP4
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scene Details */}
                {campaignData?.videoScript?.scenes && (
                    <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Layers className="text-cyan-400" size={18} /> Storyboard Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {campaignData.videoScript.scenes.map((scene, i) => (
                                <div
                                    key={i}
                                    className={`bg-black/30 rounded-xl p-4 border transition-all cursor-pointer ${currentScene === i ? 'border-cyan-500 ring-1 ring-cyan-500/30' : 'border-white/10 hover:border-white/30'
                                        }`}
                                    onClick={() => {
                                        let time = 0;
                                        for (let j = 0; j < i; j++) {
                                            time += campaignData.videoScript.scenes[j].durationSeconds;
                                        }
                                        setCurrentTime(time);
                                        setCurrentScene(i);
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-cyan-400">Scene {scene.sceneNumber}</span>
                                        <span className="text-xs text-white/40">{scene.durationSeconds}s</span>
                                    </div>
                                    <p className="text-sm font-medium mb-2 line-clamp-1">{scene.textOverlay}</p>
                                    <p className="text-xs text-white/50 line-clamp-2">{scene.visual}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Action Bar */}
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={() => window.location.href = '/app/campaign'}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Quay lại Campaign
                    </button>
                    <button
                        onClick={handleConfirmAndLaunch}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                    >
                        <Check size={18} /> Confirm & Move to Launch <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
}
