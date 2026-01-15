'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, DollarSign, Users, Target, Check, ChevronRight,
    ArrowLeft, Rocket, Loader2, Youtube, Facebook, AlertCircle,
    TrendingUp, Zap, Clock, Globe, Shield
} from 'lucide-react';

// TikTok icon
const TikTokIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
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

interface AdPlatform {
    id: string;
    name: string;
    icon: any;
    color: string;
    description: string;
    minBudget: number;
    recommended: boolean;
}

const AD_PLATFORMS: AdPlatform[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: Facebook, color: '#1877f2', description: 'Reach 2.9 tỷ người dùng, targeting chi tiết', minBudget: 100000, recommended: true },
    { id: 'tiktok', name: 'TikTok Ads', icon: TikTokIcon, color: '#00f2ea', description: 'Gen Z & Millennials, viral potential cao', minBudget: 200000, recommended: true },
    { id: 'youtube', name: 'YouTube Ads', icon: Youtube, color: '#ff0000', description: 'Video ads, pre-roll, remarketing', minBudget: 150000, recommended: false },
    { id: 'google', name: 'Google Ads', icon: GoogleIcon, color: '#4285f4', description: 'Search & Display Network toàn cầu', minBudget: 100000, recommended: false }
];

interface BudgetAllocation {
    platformId: string;
    percentage: number;
    dailyBudget: number;
}

export default function CampaignSetupPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [brandDNA, setBrandDNA] = useState<any>(null);
    const [campaignData, setCampaignData] = useState<any>(null);
    const [creativeData, setCreativeData] = useState<any>(null);

    // Setup state
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'tiktok']);
    const [totalDailyBudget, setTotalDailyBudget] = useState(500000);
    const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
    const [campaignDuration, setCampaignDuration] = useState(7);
    const [targetingMode, setTargetingMode] = useState<'auto' | 'manual'>('auto');

    // AI suggestions
    const [aiSuggestions, setAiSuggestions] = useState<any>(null);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

    // Load data
    useEffect(() => {
        const storedDNA = localStorage.getItem('kodaflow_brand_dna');
        const storedCampaign = localStorage.getItem('kodaflow_campaign');
        const storedCreatives = localStorage.getItem('kodaflow_creatives');

        if (storedDNA) setBrandDNA(JSON.parse(storedDNA));
        if (storedCampaign) setCampaignData(JSON.parse(storedCampaign));
        if (storedCreatives) setCreativeData(JSON.parse(storedCreatives));

        // Initialize budget allocations
        updateBudgetAllocations(['facebook', 'tiktok'], 500000);

        setIsLoading(false);
    }, []);

    // Update budget allocations when platforms change
    const updateBudgetAllocations = (platforms: string[], budget: number) => {
        if (platforms.length === 0) {
            setBudgetAllocations([]);
            return;
        }

        const perPlatform = Math.floor(100 / platforms.length);
        const remainder = 100 - (perPlatform * platforms.length);

        const allocations = platforms.map((platformId, index) => ({
            platformId,
            percentage: perPlatform + (index === 0 ? remainder : 0),
            dailyBudget: Math.floor(budget * (perPlatform + (index === 0 ? remainder : 0)) / 100)
        }));

        setBudgetAllocations(allocations);
    };

    const handlePlatformToggle = (platformId: string) => {
        const newPlatforms = selectedPlatforms.includes(platformId)
            ? selectedPlatforms.filter(p => p !== platformId)
            : [...selectedPlatforms, platformId];

        setSelectedPlatforms(newPlatforms);
        updateBudgetAllocations(newPlatforms, totalDailyBudget);
    };

    const handleBudgetChange = (value: number) => {
        setTotalDailyBudget(value);
        updateBudgetAllocations(selectedPlatforms, value);
    };

    const handleAllocationChange = (platformId: string, percentage: number) => {
        const newAllocations = budgetAllocations.map(a => {
            if (a.platformId === platformId) {
                return { ...a, percentage, dailyBudget: Math.floor(totalDailyBudget * percentage / 100) };
            }
            return a;
        });
        setBudgetAllocations(newAllocations);
    };

    // Generate AI suggestions based on DNA
    const generateAiSuggestions = async () => {
        if (!brandDNA) return;

        setIsGeneratingSuggestions(true);

        // Simulate AI suggestions based on DNA
        setTimeout(() => {
            setAiSuggestions({
                targetAudience: {
                    ageRange: '25-45',
                    gender: 'all',
                    interests: brandDNA.coreValues || ['technology', 'business'],
                    locations: ['Việt Nam'],
                    behaviors: ['Online shoppers', 'Early adopters']
                },
                budgetRecommendation: {
                    daily: 500000,
                    reason: 'Phù hợp với quy mô và mục tiêu của thương hiệu'
                },
                platformRecommendation: {
                    primary: 'facebook',
                    secondary: 'tiktok',
                    reason: 'Facebook cho reach rộng, TikTok cho viral content'
                },
                scheduleSuggestion: {
                    startTime: '18:00',
                    endTime: '23:00',
                    reason: 'Thời gian người dùng online nhiều nhất'
                }
            });
            setIsGeneratingSuggestions(false);
        }, 1500);
    };

    useEffect(() => {
        if (brandDNA && !aiSuggestions) {
            generateAiSuggestions();
        }
    }, [brandDNA]);

    const handleConfirmAndLaunch = () => {
        localStorage.setItem('kodaflow_setup', JSON.stringify({
            platforms: selectedPlatforms,
            totalDailyBudget,
            budgetAllocations,
            campaignDuration,
            targetingMode,
            aiSuggestions
        }));
        window.location.href = '/app/launch';
    };

    const primaryColor = brandDNA?.brandColors?.[0] || '#00d4ff';
    const secondaryColor = brandDNA?.brandColors?.[1] || '#a855f7';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
                            <Settings size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Bước 4: Cài đặt Chiến dịch</h1>
                            <p className="text-xs text-white/50">{brandDNA?.brandName || 'Module 4'} - Budget & Targeting</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = '/app/creative'} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                            <ArrowLeft size={14} /> Nội dung
                        </button>
                        <button
                            onClick={handleConfirmAndLaunch}
                            disabled={selectedPlatforms.length === 0}
                            className="px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                            <Rocket size={16} /> Chạy Ads
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Progress indicator */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    {['DNA', 'Chiến lược', 'Nội dung', 'Cài đặt', 'Chạy'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${i === 3 ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : i < 3 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}>
                                {i < 3 ? <Check size={14} className="inline mr-1" /> : null}
                                {step}
                            </div>
                            {i < 4 && <ChevronRight size={16} className="text-white/20" />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Platform Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Platform Selection */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-cyan-400" /> Chọn nền tảng quảng cáo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {AD_PLATFORMS.map(platform => (
                                    <div
                                        key={platform.id}
                                        onClick={() => handlePlatformToggle(platform.id)}
                                        className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${selectedPlatforms.includes(platform.id)
                                                ? 'bg-white/10'
                                                : 'border-white/10 hover:border-white/30 bg-black/20'
                                            }`}
                                        style={selectedPlatforms.includes(platform.id) ? { borderColor: platform.color } : {}}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: platform.color }}>
                                                    <platform.icon size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{platform.name}</p>
                                                    {platform.recommended && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Recommended</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlatforms.includes(platform.id) ? 'border-green-500 bg-green-500' : 'border-white/30'
                                                }`}>
                                                {selectedPlatforms.includes(platform.id) && <Check size={14} className="text-white" />}
                                            </div>
                                        </div>
                                        <p className="text-sm text-white/60">{platform.description}</p>
                                        <p className="text-xs text-white/40 mt-2">Ngân sách tối thiểu: {formatCurrency(platform.minBudget)}/ngày</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Budget Settings */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <DollarSign size={18} className="text-green-400" /> Ngân sách hàng ngày
                            </h3>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/60">Tổng ngân sách/ngày</span>
                                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>{formatCurrency(totalDailyBudget)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={100000}
                                    max={5000000}
                                    step={50000}
                                    value={totalDailyBudget}
                                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: primaryColor }}
                                />
                                <div className="flex justify-between text-xs text-white/40 mt-1">
                                    <span>100k</span>
                                    <span>5M</span>
                                </div>
                            </div>

                            {/* Budget Allocation */}
                            {budgetAllocations.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm text-white/60 mb-2">Phân bổ ngân sách:</p>
                                    {budgetAllocations.map(allocation => {
                                        const platform = AD_PLATFORMS.find(p => p.id === allocation.platformId);
                                        return (
                                            <div key={allocation.platformId} className="bg-black/30 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {platform && <platform.icon size={16} style={{ color: platform.color }} />}
                                                        <span>{platform?.name}</span>
                                                    </div>
                                                    <span className="font-semibold">{formatCurrency(allocation.dailyBudget)}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={10}
                                                    max={90}
                                                    value={allocation.percentage}
                                                    onChange={(e) => handleAllocationChange(allocation.platformId, Number(e.target.value))}
                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                    style={{ accentColor: platform?.color }}
                                                />
                                                <p className="text-xs text-white/40 mt-1">{allocation.percentage}%</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Campaign Duration */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/60 flex items-center gap-2"><Clock size={16} /> Thời gian chạy</span>
                                    <span className="font-bold">{campaignDuration} ngày</span>
                                </div>
                                <input
                                    type="range"
                                    min={3}
                                    max={30}
                                    value={campaignDuration}
                                    onChange={(e) => setCampaignDuration(Number(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: secondaryColor }}
                                />
                                <div className="mt-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <p className="text-sm text-purple-300">
                                        💰 Tổng chi phí dự kiến: <strong>{formatCurrency(totalDailyBudget * campaignDuration)}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - AI Suggestions */}
                    <div className="space-y-6">
                        {/* AI Targeting Suggestions */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-yellow-400" /> AI Đề xuất
                            </h3>

                            {isGeneratingSuggestions ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-400" />
                                    <p className="text-white/60 text-sm">Đang phân tích DNA...</p>
                                </div>
                            ) : aiSuggestions ? (
                                <div className="space-y-4">
                                    {/* Target Audience */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><Users size={12} /> Đối tượng mục tiêu</p>
                                        <p className="font-medium">Tuổi: {aiSuggestions.targetAudience.ageRange}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {aiSuggestions.targetAudience.interests.map((interest: string, i: number) => (
                                                <span key={i} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{interest}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Schedule */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><Clock size={12} /> Lịch chạy tối ưu</p>
                                        <p className="font-medium">{aiSuggestions.scheduleSuggestion.startTime} - {aiSuggestions.scheduleSuggestion.endTime}</p>
                                        <p className="text-xs text-white/50 mt-1">{aiSuggestions.scheduleSuggestion.reason}</p>
                                    </div>

                                    {/* Platform Recommendation */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><TrendingUp size={12} /> Platform ưu tiên</p>
                                        <p className="font-medium capitalize">{aiSuggestions.platformRecommendation.primary} + {aiSuggestions.platformRecommendation.secondary}</p>
                                        <p className="text-xs text-white/50 mt-1">{aiSuggestions.platformRecommendation.reason}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Assets Summary */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-green-400" /> Assets đã chuẩn bị
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                    <span>Video Scripts</span>
                                    <span className="text-green-400">{creativeData?.scripts?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                    <span>Image Briefs</span>
                                    <span className="text-green-400">{creativeData?.imageBriefs?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                    <span>Videos Uploaded</span>
                                    <span className={creativeData?.uploadedVideos?.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
                                        {creativeData?.uploadedVideos?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                                    <span>Images Uploaded</span>
                                    <span className={creativeData?.uploadedImages?.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
                                        {creativeData?.uploadedImages?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {(!creativeData?.uploadedVideos?.length && !creativeData?.uploadedImages?.length) && (
                                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <p className="text-sm text-yellow-300 flex items-center gap-2">
                                        <AlertCircle size={14} /> Chưa upload video/ảnh. Quay lại bước Nội dung để upload.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-8 flex justify-between">
                    <button onClick={() => window.location.href = '/app/creative'} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2">
                        <ArrowLeft size={18} /> Quay lại Nội dung
                    </button>
                    <button
                        onClick={handleConfirmAndLaunch}
                        disabled={selectedPlatforms.length === 0}
                        className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                        <Rocket size={18} /> Tiếp: Chạy Chiến dịch <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </main>
    );
}
