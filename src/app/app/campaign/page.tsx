'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Target, Zap, Heart, Users, ChevronRight,
    Check, Edit3, RefreshCw, Loader2, Play, FileText,
    Layout, TrendingUp, Clock, Volume2, Type, Image as ImageIcon,
    ChevronDown, ChevronUp, Save, ArrowLeft, Rocket
} from 'lucide-react';
import ProNav from '@/components/ProNav';

// ==================== TYPES ====================

interface CampaignAngle {
    id: string;
    angleNumber: 1 | 2 | 3;
    angleType: 'usp_focus' | 'social_proof' | 'emotion_story';
    title: string;
    description: string;
    targetEmotion: string;
    keyMessage: string;
    aiPredictScore: number;
    basedOnWeakness?: string;
}

interface AdCopySet {
    angleId: string;
    headlines: string[];
    descriptions: string[];
    callToAction: string;
    platform: string;
}

interface VideoScene {
    sceneNumber: number;
    durationSeconds: number;
    visual: string;
    voiceover: string;
    textOverlay: string;
    musicNote: string;
    transition: string;
}

interface VideoScriptFull {
    angleId: string;
    duration: 15 | 30;
    format: string;
    hook: string;
    scenes: VideoScene[];
    callToAction: string;
    suggestedMusic: string;
    overallMood: string;
}

interface LandingPageStructure {
    angleId: string;
    header: any;
    hero: any;
    features: any[];
    socialProof: any;
    cta: any;
}

interface CampaignPackage {
    id: string;
    brandName: string;
    createdAt: Date;
    angles: CampaignAngle[];
    adCopies: AdCopySet[];
    videoScripts: VideoScriptFull[];
    landingPages: LandingPageStructure[];
    status: string;
}

type Step = 'loading' | 'select_angle' | 'ad_copy' | 'video_script' | 'landing_page' | 'complete';

// ==================== MAIN COMPONENT ====================

export default function CampaignArchitectPage() {
    const [step, setStep] = useState<Step>('loading');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Streaming progress state
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('Khởi tạo...');
    const [progressPhase, setProgressPhase] = useState('init');

    const [campaignPackage, setCampaignPackage] = useState<CampaignPackage | null>(null);
    const [selectedAngle, setSelectedAngle] = useState<CampaignAngle | null>(null);
    const [selectedAdCopy, setSelectedAdCopy] = useState<AdCopySet | null>(null);
    const [selectedVideoScript, setSelectedVideoScript] = useState<VideoScriptFull | null>(null);
    const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPageStructure | null>(null);

    // Editing states
    const [editingHeadline, setEditingHeadline] = useState<number | null>(null);
    const [editingDescription, setEditingDescription] = useState<number | null>(null);
    const [editingScene, setEditingScene] = useState<number | null>(null);
    const [expandedScene, setExpandedScene] = useState<number | null>(null);

    // Load campaign data on mount
    useEffect(() => {
        loadCampaignData();
    }, []);

    const loadCampaignData = async () => {
        setIsLoading(true);
        setError('');
        setProgress(0);
        setProgressMessage('Khởi tạo chiến dịch...');
        setProgressPhase('init');

        try {
            // Get brand DNA from localStorage (passed from DNA page)
            const storedDNA = localStorage.getItem('kodaflow_brand_dna');
            const storedCompetitors = localStorage.getItem('kodaflow_competitors');

            if (!storedDNA) {
                setError('Không tìm thấy Brand DNA. Vui lòng quay lại bước phân tích.');
                setIsLoading(false);
                return;
            }

            const brandDNA = JSON.parse(storedDNA);
            const competitors = storedCompetitors ? JSON.parse(storedCompetitors) : [];

            // Use streaming API for real-time progress
            const response = await fetch('/api/campaign/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandDNA, competitors })
            });

            if (!response.ok) {
                throw new Error('Failed to start campaign generation');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            if (!reader) {
                throw new Error('Could not read response stream');
            }

            // Read SSE stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            switch (data.type) {
                                case 'progress':
                                    setProgress(data.progress);
                                    setProgressMessage(data.message);
                                    setProgressPhase(data.phase);
                                    break;
                                case 'complete':
                                    if (data.success && data.data) {
                                        setCampaignPackage(data.data);
                                        setStep('select_angle');
                                    }
                                    break;
                                case 'error':
                                    throw new Error(data.error || 'Campaign generation failed');
                            }
                        } catch (parseErr) {
                            console.warn('Failed to parse SSE data:', parseErr);
                        }
                    }
                }
            }

        } catch (err: any) {
            console.error('Campaign load error:', err);
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const selectAngle = (angle: CampaignAngle) => {
        setSelectedAngle(angle);

        // Find corresponding ad copy, video script, landing page
        const adCopy = campaignPackage?.adCopies.find(ac => ac.angleId === angle.id);
        const videoScript = campaignPackage?.videoScripts.find(vs => vs.angleId === angle.id);
        const landingPage = campaignPackage?.landingPages.find(lp => lp.angleId === angle.id);

        setSelectedAdCopy(adCopy || null);
        setSelectedVideoScript(videoScript || null);
        setSelectedLandingPage(landingPage || null);

        setStep('ad_copy');
    };

    const updateHeadline = (index: number, value: string) => {
        if (!selectedAdCopy) return;
        const newHeadlines = [...selectedAdCopy.headlines];
        newHeadlines[index] = value;
        setSelectedAdCopy({ ...selectedAdCopy, headlines: newHeadlines });
    };

    const updateDescription = (index: number, value: string) => {
        if (!selectedAdCopy) return;
        const newDescriptions = [...selectedAdCopy.descriptions];
        newDescriptions[index] = value;
        setSelectedAdCopy({ ...selectedAdCopy, descriptions: newDescriptions });
    };

    const updateScene = (sceneIndex: number, field: keyof VideoScene, value: string | number) => {
        if (!selectedVideoScript) return;
        const newScenes = [...selectedVideoScript.scenes];
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], [field]: value };
        setSelectedVideoScript({ ...selectedVideoScript, scenes: newScenes });
    };

    const getAngleIcon = (type: string) => {
        switch (type) {
            case 'usp_focus': return <Zap className="text-yellow-400" size={24} />;
            case 'social_proof': return <Users className="text-blue-400" size={24} />;
            case 'emotion_story': return <Heart className="text-pink-400" size={24} />;
            default: return <Target className="text-cyan-400" size={24} />;
        }
    };

    const getAngleColor = (type: string) => {
        switch (type) {
            case 'usp_focus': return 'from-yellow-500 to-orange-500';
            case 'social_proof': return 'from-blue-500 to-cyan-500';
            case 'emotion_story': return 'from-pink-500 to-purple-500';
            default: return 'from-cyan-500 to-purple-500';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-400 bg-green-500/20 border-green-500/30';
        if (score >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    };

    const getPhaseIcon = (phase: string) => {
        switch (phase) {
            case 'angles': return <Target className="text-orange-400" size={20} />;
            case 'adcopy': return <FileText className="text-yellow-400" size={20} />;
            case 'video': return <Play className="text-pink-400" size={20} />;
            case 'landing': return <Layout className="text-cyan-400" size={20} />;
            case 'complete': return <Check className="text-green-400" size={20} />;
            default: return <Loader2 className="animate-spin text-white/60" size={20} />;
        }
    };

    // ==================== RENDER ====================

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Target size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Campaign Architect</h1>
                            <p className="text-xs text-white/50">Module 3 - Kiến trúc sư chiến dịch</p>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2">
                        {['Góc tấn công', 'Ad Copy', 'Video Script', 'Landing Page'].map((label, i) => {
                            const stepMap: Step[] = ['select_angle', 'ad_copy', 'video_script', 'landing_page'];
                            const currentIdx = stepMap.indexOf(step);
                            const isActive = i === currentIdx;
                            const isPast = i < currentIdx;
                            return (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isPast ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                                            'bg-white/10 text-white/40'
                                        }`}>
                                        {isPast ? <Check size={14} /> : i + 1}
                                    </div>
                                    {i < 3 && <div className={`w-8 h-0.5 ${isPast ? 'bg-green-500' : 'bg-white/10'}`} />}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <ProNav currentPage="campaign" />
                        <button
                            onClick={() => window.location.href = '/app/dna'}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> Quay lại DNA
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ==================== LOADING WITH PROGRESS ==================== */}
                    {step === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            {error ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                                        <Target className="text-red-400" size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-red-400">Có lỗi xảy ra</h2>
                                    <p className="text-white/60 mb-6">{error}</p>
                                    <button
                                        onClick={() => window.location.href = '/app/dna'}
                                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold"
                                    >
                                        Quay lại Brand DNA
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Animated Icon */}
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-6 relative">
                                        {getPhaseIcon(progressPhase)}
                                        {/* Spinning ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/50 animate-spin" />
                                    </div>

                                    <h2 className="text-2xl font-bold mb-2">Đang xây dựng chiến dịch</h2>
                                    <p className="text-white/60 mb-8">{progressMessage}</p>

                                    {/* Progress Bar */}
                                    <div className="w-full max-w-md mb-6">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-white/40">Tiến độ</span>
                                            <span className="font-bold text-orange-400">{progress}%</span>
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Phase indicators */}
                                    <div className="flex gap-6 text-sm">
                                        {[
                                            { id: 'angles', label: 'Góc tấn công', icon: Target },
                                            { id: 'adcopy', label: 'Ad Copy', icon: FileText },
                                            { id: 'video', label: 'Video Script', icon: Play },
                                            { id: 'landing', label: 'Landing Page', icon: Layout }
                                        ].map(({ id, label, icon: Icon }) => {
                                            const phases = ['init', 'angles', 'adcopy', 'video', 'landing', 'complete'];
                                            const currentPhaseIdx = phases.indexOf(progressPhase);
                                            const thisPhaseIdx = phases.indexOf(id);
                                            const isActive = progressPhase === id;
                                            const isDone = currentPhaseIdx > thisPhaseIdx;

                                            return (
                                                <div key={id} className={`flex items-center gap-2 transition-all ${isActive ? 'text-orange-400' : isDone ? 'text-green-400' : 'text-white/30'}`}>
                                                    {isDone ? (
                                                        <Check size={16} />
                                                    ) : isActive ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Icon size={16} />
                                                    )}
                                                    <span>{label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ==================== SELECT ANGLE ==================== */}
                    {step === 'select_angle' && campaignPackage && (
                        <motion.div
                            key="select_angle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                                    Chọn Góc Tấn Công
                                </h2>
                                <p className="text-white/60">
                                    AI đã phân tích và đề xuất 3 chiến lược. Chọn góc phù hợp nhất với mục tiêu của bạn.
                                </p>
                            </div>

                            {/* Campaign Angle Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {campaignPackage.angles.map((angle) => (
                                    <motion.div
                                        key={angle.id}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        onClick={() => selectAngle(angle)}
                                        className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden cursor-pointer group hover:border-white/30 transition-all`}
                                    >
                                        {/* Gradient top bar */}
                                        <div className={`h-2 bg-gradient-to-r ${getAngleColor(angle.angleType)}`} />

                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAngleColor(angle.angleType)} flex items-center justify-center`}>
                                                        {getAngleIcon(angle.angleType)}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-white/40">Góc {angle.angleNumber}</span>
                                                        <h3 className="font-bold text-lg">{angle.title}</h3>
                                                    </div>
                                                </div>

                                                {/* AI Score Badge */}
                                                <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center gap-1 ${getScoreColor(angle.aiPredictScore)}`}>
                                                    <TrendingUp size={14} />
                                                    {angle.aiPredictScore}%
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-white/70 text-sm mb-4">{angle.description}</p>

                                            {/* Key Message */}
                                            <div className="bg-black/30 rounded-xl p-4 mb-4">
                                                <span className="text-xs text-white/40 block mb-1">Thông điệp chính</span>
                                                <p className="font-medium text-white/90">"{angle.keyMessage}"</p>
                                            </div>

                                            {/* Meta info */}
                                            <div className="flex items-center gap-4 text-xs text-white/40">
                                                <span className="flex items-center gap-1">
                                                    <Heart size={12} /> {angle.targetEmotion}
                                                </span>
                                                {angle.basedOnWeakness && (
                                                    <span className="flex items-center gap-1">
                                                        <Target size={12} /> Khai thác điểm yếu
                                                    </span>
                                                )}
                                            </div>

                                            {/* Hover CTA */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                                <button className={`w-full py-3 bg-gradient-to-r ${getAngleColor(angle.angleType)} rounded-xl font-semibold flex items-center justify-center gap-2`}>
                                                    Chọn góc này <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Regenerate button */}
                            <div className="text-center">
                                <button
                                    onClick={loadCampaignData}
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                    Tạo lại các góc tấn công
                                </button>
                            </div>
                        </motion.div>
                    )}


                    {/* ==================== AD COPY ==================== */}
                    {step === 'ad_copy' && selectedAngle && selectedAdCopy && (
                        <motion.div
                            key="ad_copy"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <FileText className="text-orange-400" /> Ad Copy
                                    </h2>
                                    <p className="text-white/60 text-sm">
                                        Góc "{selectedAngle.title}" - 5 Headlines + 3 Descriptions
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-lg border ${getScoreColor(selectedAngle.aiPredictScore)}`}>
                                    AI Score: {selectedAngle.aiPredictScore}%
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Headlines */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Zap className="text-yellow-400" size={18} /> Headlines (5)
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedAdCopy.headlines.map((headline, i) => (
                                            <div key={i} className="group relative">
                                                {editingHeadline === i ? (
                                                    <input
                                                        type="text"
                                                        value={headline}
                                                        onChange={(e) => updateHeadline(i, e.target.value)}
                                                        onBlur={() => setEditingHeadline(null)}
                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingHeadline(null)}
                                                        autoFocus
                                                        className="w-full bg-black/40 border border-cyan-500 rounded-xl px-4 py-3 focus:outline-none"
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={() => setEditingHeadline(i)}
                                                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/30 transition-all flex items-center justify-between"
                                                    >
                                                        <span>{headline}</span>
                                                        <Edit3 size={14} className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                )}
                                                <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs text-white/30">
                                                    {i + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Descriptions */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Type className="text-blue-400" size={18} /> Descriptions (3)
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedAdCopy.descriptions.map((desc, i) => (
                                            <div key={i} className="group relative">
                                                {editingDescription === i ? (
                                                    <textarea
                                                        value={desc}
                                                        onChange={(e) => updateDescription(i, e.target.value)}
                                                        onBlur={() => setEditingDescription(null)}
                                                        autoFocus
                                                        rows={2}
                                                        className="w-full bg-black/40 border border-cyan-500 rounded-xl px-4 py-3 focus:outline-none resize-none"
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={() => setEditingDescription(i)}
                                                        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/30 transition-all flex items-start justify-between gap-2"
                                                    >
                                                        <span className="text-white/80">{desc}</span>
                                                        <Edit3 size={14} className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-6 pt-4 border-t border-white/10">
                                        <span className="text-xs text-white/40 block mb-2">Call to Action</span>
                                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl px-4 py-3 font-semibold text-orange-300">
                                            {selectedAdCopy.callToAction}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep('select_angle')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                                >
                                    ← Chọn góc khác
                                </button>
                                <button
                                    onClick={() => setStep('video_script')}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                                >
                                    Tiếp: Video Script <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== VIDEO SCRIPT ==================== */}
                    {step === 'video_script' && selectedAngle && selectedVideoScript && (
                        <motion.div
                            key="video_script"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Play className="text-pink-400" /> Video Script
                                    </h2>
                                    <p className="text-white/60 text-sm">
                                        Kịch bản {selectedVideoScript.duration}s - {selectedVideoScript.scenes.length} cảnh
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-white/40 flex items-center gap-2">
                                        <Clock size={14} /> {selectedVideoScript.duration}s
                                    </span>
                                    <span className="text-sm text-white/40">{selectedVideoScript.format}</span>
                                </div>
                            </div>

                            {/* Hook */}
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 mb-6">
                                <h3 className="font-bold text-pink-400 mb-2 flex items-center gap-2">
                                    <Sparkles size={16} /> HOOK (Câu mở đầu thu hút)
                                </h3>
                                <p className="text-lg font-medium">"{selectedVideoScript.hook}"</p>
                            </div>

                            {/* Storyboard */}
                            <div className="space-y-4 mb-8">
                                {selectedVideoScript.scenes.map((scene, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                                    >
                                        {/* Scene Header */}
                                        <div
                                            onClick={() => setExpandedScene(expandedScene === i ? null : i)}
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-bold">
                                                    {scene.sceneNumber}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-white/40">Scene {scene.sceneNumber}</span>
                                                    <p className="font-medium text-sm line-clamp-1">{scene.textOverlay}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-white/40">{scene.durationSeconds}s</span>
                                                {expandedScene === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>

                                        {/* Expanded Scene Details */}
                                        <AnimatePresence>
                                            {expandedScene === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/10"
                                                >
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {/* Visual */}
                                                        <div className="bg-black/30 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-2">
                                                                <ImageIcon size={12} /> VISUAL
                                                            </div>
                                                            <p className="text-sm text-white/70">{scene.visual}</p>
                                                        </div>

                                                        {/* Voiceover */}
                                                        <div className="bg-black/30 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-2">
                                                                <Volume2 size={12} /> VOICEOVER
                                                            </div>
                                                            <p className="text-sm text-white/70">"{scene.voiceover}"</p>
                                                        </div>

                                                        {/* Text Overlay */}
                                                        <div className="bg-black/30 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold mb-2">
                                                                <Type size={12} /> TEXT OVERLAY
                                                            </div>
                                                            <p className="text-sm font-bold text-white">{scene.textOverlay}</p>
                                                        </div>

                                                        {/* Music & Transition */}
                                                        <div className="bg-black/30 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-2">
                                                                <Sparkles size={12} /> MUSIC & TRANSITION
                                                            </div>
                                                            <p className="text-sm text-white/70">{scene.musicNote}</p>
                                                            <p className="text-xs text-white/40 mt-1">→ {scene.transition}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            {/* CTA & Music */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <span className="text-xs text-white/40">Call to Action</span>
                                    <p className="font-semibold text-orange-400">{selectedVideoScript.callToAction}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4">
                                    <span className="text-xs text-white/40">Suggested Music</span>
                                    <p className="font-semibold text-purple-400">{selectedVideoScript.suggestedMusic}</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep('ad_copy')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                                >
                                    ← Ad Copy
                                </button>
                                <button
                                    onClick={() => setStep('landing_page')}
                                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                                >
                                    Tiếp: Landing Page <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== LANDING PAGE ==================== */}
                    {step === 'landing_page' && selectedAngle && selectedLandingPage && (
                        <motion.div
                            key="landing_page"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Layout className="text-cyan-400" /> Landing Page Structure
                                    </h2>
                                    <p className="text-white/60 text-sm">
                                        Cấu trúc trang đích đồng bộ với chiến dịch
                                    </p>
                                </div>
                            </div>

                            {/* Landing Page Preview */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden mb-8">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 border-b border-white/10">
                                    <span className="text-xs text-white/40 block mb-2">HEADER</span>
                                    <h3 className="text-xl font-bold">{selectedLandingPage.header.headline}</h3>
                                    <p className="text-white/60">{selectedLandingPage.header.subheadline}</p>
                                </div>

                                {/* Hero Section */}
                                <div className="p-6 border-b border-white/10">
                                    <span className="text-xs text-cyan-400 block mb-2">HERO SECTION</span>
                                    <h2 className="text-2xl font-bold mb-2">{selectedLandingPage.hero.mainHeadline}</h2>
                                    <p className="text-white/70 mb-4">{selectedLandingPage.hero.subHeadline}</p>
                                    <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold">
                                        {selectedLandingPage.hero.ctaButton}
                                    </button>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {selectedLandingPage.hero.trustBadges?.map((badge: string, i: number) => (
                                            <span key={i} className="text-xs bg-white/10 px-3 py-1 rounded-full">{badge}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="p-6 border-b border-white/10">
                                    <span className="text-xs text-green-400 block mb-4">FEATURES</span>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {selectedLandingPage.features?.map((feature: any, i: number) => (
                                            <div key={i} className="bg-black/30 rounded-xl p-4 text-center">
                                                <span className="text-2xl block mb-2">{feature.icon}</span>
                                                <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                                                <p className="text-xs text-white/50">{feature.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Proof */}
                                <div className="p-6 border-b border-white/10">
                                    <span className="text-xs text-yellow-400 block mb-4">SOCIAL PROOF</span>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {selectedLandingPage.socialProof?.stats?.map((stat: any, i: number) => (
                                            <div key={i} className="text-center">
                                                <div className="text-2xl font-bold text-cyan-400">{stat.number}</div>
                                                <div className="text-xs text-white/50">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Final CTA */}
                                <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                                    <span className="text-xs text-orange-400 block mb-2">FINAL CTA</span>
                                    <h3 className="text-xl font-bold mb-2">{selectedLandingPage.cta?.headline}</h3>
                                    <p className="text-white/70 mb-4">{selectedLandingPage.cta?.subheadline}</p>
                                    <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold text-lg">
                                        {selectedLandingPage.cta?.buttonText}
                                    </button>
                                    {selectedLandingPage.cta?.guarantee && (
                                        <p className="text-sm text-white/50 mt-3">{selectedLandingPage.cta.guarantee}</p>
                                    )}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep('video_script')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                                >
                                    ← Video Script
                                </button>
                                <button
                                    onClick={() => setStep('complete')}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                                >
                                    <Check size={18} /> Hoàn tất chiến dịch
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== COMPLETE ==================== */}
                    {step === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                                <Check size={48} />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">🎉 Chiến dịch đã sẵn sàng!</h2>
                            <p className="text-white/60 mb-8 max-w-md mx-auto">
                                Góc tấn công "{selectedAngle?.title}" đã được thiết lập hoàn chỉnh với Ad Copy, Video Script và Landing Page.
                            </p>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setStep('select_angle')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                                >
                                    <RefreshCw size={18} /> Chỉnh sửa lại
                                </button>
                                <button
                                    onClick={() => {
                                        // Save to localStorage and go to creative studio
                                        localStorage.setItem('kodaflow_campaign', JSON.stringify({
                                            angle: selectedAngle,
                                            adCopy: selectedAdCopy,
                                            videoScript: selectedVideoScript,
                                            landingPage: selectedLandingPage
                                        }));
                                        // Navigate to Module 4: Creative Studio
                                        window.location.href = '/app/creative';
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                                >
                                    <Rocket size={18} /> 🎨 Đến Creative Studio
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
