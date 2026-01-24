'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, DollarSign, Users, Target, Check, ChevronRight,
    ArrowLeft, Rocket, Loader2, Youtube, Facebook, AlertCircle,
    TrendingUp, Zap, Clock, Globe, Shield, Link2, Eye, MousePointer,
    ShoppingCart, Percent, BarChart3, Layers, ChevronDown
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
    avgCPC: number;      // VND
    avgCPM: number;      // VND per 1000 impressions
    avgCTR: number;      // %
    avgConvRate: number; // %
    recommended: boolean;
}

const AD_PLATFORMS: AdPlatform[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: Facebook, color: '#1877f2', description: 'Reach 2.9 tỷ người dùng, targeting chi tiết', minBudget: 100000, avgCPC: 3000, avgCPM: 45000, avgCTR: 1.5, avgConvRate: 2.5, recommended: true },
    { id: 'tiktok', name: 'TikTok Ads', icon: TikTokIcon, color: '#00f2ea', description: 'Gen Z & Millennials, viral potential cao', minBudget: 200000, avgCPC: 2500, avgCPM: 35000, avgCTR: 2.2, avgConvRate: 1.8, recommended: true },
    { id: 'youtube', name: 'YouTube Ads', icon: Youtube, color: '#ff0000', description: 'Video ads, pre-roll, remarketing', minBudget: 150000, avgCPC: 4000, avgCPM: 55000, avgCTR: 1.2, avgConvRate: 2.0, recommended: false },
    { id: 'google', name: 'Google Ads', icon: GoogleIcon, color: '#4285f4', description: 'Search & Display Network toàn cầu', minBudget: 100000, avgCPC: 5000, avgCPM: 25000, avgCTR: 3.5, avgConvRate: 4.0, recommended: false }
];

interface BudgetAllocation {
    platformId: string;
    percentage: number;
    dailyBudget: number;
}

interface BudgetProjection {
    platformId: string;
    impressions: number;
    reach: number;
    clicks: number;
    conversions: number;
    cpc: number;
    cpa: number;
}

type BiddingStrategy = 'maximize_conversions' | 'lowest_cost' | 'target_roas';

const BIDDING_STRATEGIES = [
    { id: 'maximize_conversions', name: 'Tối ưu đơn hàng', description: 'AI tự động tối ưu để đạt nhiều đơn nhất', icon: ShoppingCart, recommended: true },
    { id: 'lowest_cost', name: 'Tiết kiệm chi phí', description: 'Kiểm soát giá mỗi đơn không quá cao', icon: DollarSign, recommended: false },
    { id: 'target_roas', name: 'Mục tiêu ROAS', description: 'Đặt ROAS mong muốn, AI tối ưu theo', icon: TrendingUp, recommended: false }
];

// ==================== BUDGET INTELLIGENCE ====================

function calculateBudgetProjections(
    dailyBudget: number,
    allocations: BudgetAllocation[],
    platforms: AdPlatform[]
): BudgetProjection[] {
    return allocations.map(allocation => {
        const platform = platforms.find(p => p.id === allocation.platformId);
        if (!platform) return null;

        const budget = allocation.dailyBudget;

        // Calculate based on platform averages
        const impressions = Math.floor((budget / platform.avgCPM) * 1000);
        const reach = Math.floor(impressions * 0.7); // ~70% unique reach
        const clicks = Math.floor(impressions * (platform.avgCTR / 100));
        const conversions = Math.floor(clicks * (platform.avgConvRate / 100));
        const cpc = clicks > 0 ? Math.floor(budget / clicks) : platform.avgCPC;
        const cpa = conversions > 0 ? Math.floor(budget / conversions) : 0;

        return {
            platformId: allocation.platformId,
            impressions,
            reach,
            clicks,
            conversions,
            cpc,
            cpa
        };
    }).filter(Boolean) as BudgetProjection[];
}

function generateSmartAllocation(
    selectedPlatforms: string[],
    brandDNA: any,
    competitors: any[]
): Record<string, number> {
    // Default allocation based on industry best practices
    const defaultAllocations: Record<string, number> = {
        facebook: 40,
        tiktok: 30,
        google: 20,
        youtube: 10
    };

    // Adjust based on target audience
    const targetAudience = brandDNA?.targetAudience || '';
    if (targetAudience.toLowerCase().includes('trẻ') || targetAudience.toLowerCase().includes('gen z')) {
        defaultAllocations.tiktok = 45;
        defaultAllocations.facebook = 35;
    }

    // Adjust based on industry
    const industry = brandDNA?.industryCategory || '';
    if (industry.toLowerCase().includes('ecommerce') || industry.toLowerCase().includes('shop')) {
        defaultAllocations.facebook = 45;
        defaultAllocations.google = 35;
    }

    // Filter and normalize
    const total = selectedPlatforms.reduce((sum, p) => sum + (defaultAllocations[p] || 10), 0);
    const normalized: Record<string, number> = {};
    selectedPlatforms.forEach(p => {
        normalized[p] = Math.round((defaultAllocations[p] || 10) / total * 100);
    });

    return normalized;
}

function generateUTMParams(brandName: string, platform: string, campaign: string): string {
    const sanitized = (str: string) => str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return `utm_source=${sanitized(platform)}&utm_medium=cpc&utm_campaign=${sanitized(campaign)}&utm_content=${sanitized(brandName)}`;
}

// ==================== MAIN COMPONENT ====================

export default function CampaignSetupPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [brandDNA, setBrandDNA] = useState<any>(null);
    const [campaignData, setCampaignData] = useState<any>(null);
    const [creativeData, setCreativeData] = useState<any>(null);
    const [competitors, setCompetitors] = useState<any[]>([]);

    // Setup state
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'tiktok']);
    const [totalDailyBudget, setTotalDailyBudget] = useState(500000);
    const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
    const [campaignDuration, setCampaignDuration] = useState(7);
    const [biddingStrategy, setBiddingStrategy] = useState<BiddingStrategy>('maximize_conversions');
    const [targetROAS, setTargetROAS] = useState(3);

    // Targeting state from DNA
    const [targetAge, setTargetAge] = useState('25-45');
    const [targetGender, setTargetGender] = useState('all');
    const [targetLocations, setTargetLocations] = useState<string[]>(['Việt Nam']);
    const [targetInterests, setTargetInterests] = useState<string[]>([]);
    // Pro Mode State
    const [isProMode, setIsProMode] = useState(false);
    const [keywords, setKeywords] = useState('');
    const [negativeKeywords, setNegativeKeywords] = useState('');
    const [bidCap, setBidCap] = useState<number>(0);
    const [winLossRules, setWinLossRules] = useState<any[]>([
        { id: 'rule_1', name: 'Cắt lỗ', metric: 'ROAS', operator: '<', threshold: 1.5, action: 'PAUSE_ADSET', active: true },
        { id: 'rule_2', name: 'Scale', metric: 'ROAS', operator: '>', threshold: 4.0, action: 'INCREASE_BUDGET', active: true }
    ]);

    // Keyword Intelligence State
    const [suggestedKeywords, setSuggestedKeywords] = useState<{ keyword: string; volume: number; cpc: number; competition: 'Low' | 'Medium' | 'High'; selected: boolean }[]>([
        { keyword: 'tăng view youtube', volume: 12100, cpc: 2500, competition: 'Medium', selected: true },
        { keyword: 'mua sub youtube', volume: 8200, cpc: 3200, competition: 'High', selected: true },
        { keyword: 'bật kiếm tiền youtube', volume: 5400, cpc: 1800, competition: 'Low', selected: true },
        { keyword: 'smm panel việt nam', volume: 3600, cpc: 2100, competition: 'Medium', selected: false },
        { keyword: 'tăng like facebook', volume: 9800, cpc: 2800, competition: 'High', selected: false }
    ]);

    // Advanced Placements State
    const [placements, setPlacements] = useState({
        devices: { mobile: true, desktop: true, tablet: false },
        facebook: { feed: true, stories: true, reels: true, messenger: false, audienceNetwork: false },
        schedule: { allDay: true, startHour: 8, endHour: 22 }
    });

    // A/B Testing State
    const [abTestEnabled, setAbTestEnabled] = useState(false);
    const [abVariants, setAbVariants] = useState([
        { id: 'A', headline: '', isControl: true },
        { id: 'B', headline: '', isControl: false }
    ]);
    const [abBudget, setAbBudget] = useState(100000);
    const [abDuration, setAbDuration] = useState(3);
    const [abWinnerMetric, setAbWinnerMetric] = useState<'CTR' | 'CPA' | 'ROAS'>('CPA');

    // Account connection state
    const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({
        facebook: false,
        tiktok: false,
        google: false,
        youtube: false
    });

    const [expandedSection, setExpandedSection] = useState<string | null>('budget');

    // Load data
    // Update budget allocations
    const updateBudgetAllocations = React.useCallback((platforms: string[], budget: number, smartAlloc?: Record<string, number>) => {
        if (platforms.length === 0) {
            setBudgetAllocations([]);
            return;
        }

        const allocation = smartAlloc || generateSmartAllocation(platforms, brandDNA, competitors);

        const allocations = platforms.map(platformId => ({
            platformId,
            percentage: allocation[platformId] || Math.floor(100 / platforms.length),
            dailyBudget: Math.floor(budget * (allocation[platformId] || Math.floor(100 / platforms.length)) / 100)
        }));

        setBudgetAllocations(allocations);
    }, [brandDNA, competitors]);

    // Load data
    useEffect(() => {
        const storedDNA = localStorage.getItem('kodaflow_brand_dna');
        const storedCampaign = localStorage.getItem('kodaflow_campaign');
        const storedCreatives = localStorage.getItem('kodaflow_creatives');
        const storedCompetitors = localStorage.getItem('kodaflow_competitors');

        if (storedDNA) {
            const dna = JSON.parse(storedDNA);
            setBrandDNA(dna);

            // Extract targeting from DNA
            if (dna.targetAudience) {
                // Parse age from target audience text
                const ageMatch = dna.targetAudience.match(/(\d+)[-–](\d+)/);
                if (ageMatch) setTargetAge(`${ageMatch[1]}-${ageMatch[2]}`);
            }
            if (dna.coreValues) setTargetInterests(dna.coreValues.slice(0, 5));
        }
        if (storedCampaign) setCampaignData(JSON.parse(storedCampaign));
        if (storedCreatives) setCreativeData(JSON.parse(storedCreatives));
        if (storedCompetitors) setCompetitors(JSON.parse(storedCompetitors));

        // Initialize with smart allocation
        if (storedDNA) {
            const dna = JSON.parse(storedDNA);
            const smartAlloc = generateSmartAllocation(['facebook', 'tiktok'], dna, []);
            updateBudgetAllocations(['facebook', 'tiktok'], 500000, smartAlloc);
        } else {
            const smartAlloc = generateSmartAllocation(['facebook', 'tiktok'], null, []);
            updateBudgetAllocations(['facebook', 'tiktok'], 500000, smartAlloc);
        }

        setIsLoading(false);
    }, [updateBudgetAllocations]);

    const handlePlatformToggle = (platformId: string) => {
        const newPlatforms = selectedPlatforms.includes(platformId)
            ? selectedPlatforms.filter(p => p !== platformId)
            : [...selectedPlatforms, platformId];

        setSelectedPlatforms(newPlatforms);
        const smartAlloc = generateSmartAllocation(newPlatforms, brandDNA, competitors);
        updateBudgetAllocations(newPlatforms, totalDailyBudget, smartAlloc);
    };

    const handleBudgetChange = (value: number) => {
        setTotalDailyBudget(value);
        const smartAlloc = generateSmartAllocation(selectedPlatforms, brandDNA, competitors);
        updateBudgetAllocations(selectedPlatforms, value, smartAlloc);
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

    // Calculate projections
    const projections = useMemo(() =>
        calculateBudgetProjections(totalDailyBudget, budgetAllocations, AD_PLATFORMS),
        [totalDailyBudget, budgetAllocations]
    );

    const totalProjections = useMemo(() => projections.reduce((acc, p) => ({
        impressions: acc.impressions + p.impressions,
        reach: acc.reach + p.reach,
        clicks: acc.clicks + p.clicks,
        conversions: acc.conversions + p.conversions
    }), { impressions: 0, reach: 0, clicks: 0, conversions: 0 }), [projections]);

    // UTM params
    const utmParams = useMemo(() => {
        return selectedPlatforms.map(p => ({
            platform: p,
            params: generateUTMParams(brandDNA?.brandName || 'brand', p, campaignData?.angle?.title || 'campaign')
        }));
    }, [brandDNA, campaignData, selectedPlatforms]);

    const handleConfirmAndLaunch = () => {
        localStorage.setItem('kodaflow_setup', JSON.stringify({
            platforms: selectedPlatforms,
            totalDailyBudget,
            budgetAllocations,
            campaignDuration,
            biddingStrategy,
            targetROAS,
            targeting: {
                age: targetAge,
                gender: targetGender,
                locations: targetLocations,
                interests: targetInterests
            },
            proMode: isProMode ? {
                keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                negativeKeywords: negativeKeywords.split(',').map(k => k.trim()).filter(Boolean),
                bidCap,
                optimizationRules: winLossRules.filter(r => r.active)
            } : null,
            utmParams,
            projections: totalProjections,
            connectedAccounts
        }));
        window.location.href = '/app/launch';
    };

    const primaryColor = brandDNA?.brandColors?.[0] || '#00d4ff';
    const secondaryColor = brandDNA?.brandColors?.[1] || '#a855f7';

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
    };

    const formatNumber = (value: number) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toString();
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
                            <p className="text-xs text-white/50">{brandDNA?.brandName || 'Module 4'} - Budget Intelligence</p>
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

                {/* ==================== AI PROJECTIONS SUMMARY ==================== */}
                <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-green-500/10 rounded-2xl border border-purple-500/20 p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-yellow-400" /> AI Dự báo kết quả với {formatCurrency(totalDailyBudget)}/ngày
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <Eye size={24} className="mx-auto mb-2 text-blue-400" />
                            <p className="text-2xl font-bold">{formatNumber(totalProjections.impressions)}</p>
                            <p className="text-xs text-white/50">Lượt hiển thị/ngày</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <Users size={24} className="mx-auto mb-2 text-green-400" />
                            <p className="text-2xl font-bold">{formatNumber(totalProjections.reach)}</p>
                            <p className="text-xs text-white/50">Người tiếp cận</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <MousePointer size={24} className="mx-auto mb-2 text-cyan-400" />
                            <p className="text-2xl font-bold">{formatNumber(totalProjections.clicks)}</p>
                            <p className="text-xs text-white/50">Clicks dự kiến</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 text-center">
                            <ShoppingCart size={24} className="mx-auto mb-2 text-orange-400" />
                            <p className="text-2xl font-bold">{totalProjections.conversions}</p>
                            <p className="text-xs text-white/50">Đơn hàng dự kiến</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Settings */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ==================== PLATFORM SELECTION ==================== */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => setExpandedSection(expandedSection === 'platforms' ? null : 'platforms')}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5"
                            >
                                <h3 className="font-bold flex items-center gap-2">
                                    <Globe size={18} className="text-cyan-400" /> Chọn nền tảng quảng cáo
                                </h3>
                                <ChevronDown size={18} className={`transition-transform ${expandedSection === 'platforms' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {expandedSection === 'platforms' && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                <p className="text-xs text-white/50">CPC: {formatCurrency(platform.avgCPC)}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlatforms.includes(platform.id) ? 'border-green-500 bg-green-500' : 'border-white/30'
                                                            }`}>
                                                            {selectedPlatforms.includes(platform.id) && <Check size={14} className="text-white" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ==================== BUDGET INTELLIGENCE ==================== */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => setExpandedSection(expandedSection === 'budget' ? null : 'budget')}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5"
                            >
                                <h3 className="font-bold flex items-center gap-2">
                                    <DollarSign size={18} className="text-green-400" /> Budget Intelligence
                                </h3>
                                <ChevronDown size={18} className={`transition-transform ${expandedSection === 'budget' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {expandedSection === 'budget' && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 space-y-6">
                                            {/* Budget Slider */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-white/60">Ngân sách hàng ngày</span>
                                                    <span className="text-3xl font-bold" style={{ color: primaryColor }}>{formatCurrency(totalDailyBudget)}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={100000}
                                                    max={10000000}
                                                    step={50000}
                                                    value={totalDailyBudget}
                                                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                                                    className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                    style={{ accentColor: primaryColor }}
                                                />
                                                <div className="flex justify-between text-xs text-white/40 mt-1">
                                                    <span>100K</span>
                                                    <span>10M</span>
                                                </div>
                                            </div>

                                            {/* Smart Allocation */}
                                            <div>
                                                <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
                                                    <Layers size={14} /> Smart Allocation (AI đề xuất)
                                                </p>
                                                <div className="space-y-3">
                                                    {budgetAllocations.map(allocation => {
                                                        const platform = AD_PLATFORMS.find(p => p.id === allocation.platformId);
                                                        const projection = projections.find(p => p.platformId === allocation.platformId);
                                                        return (
                                                            <div key={allocation.platformId} className="bg-black/30 rounded-xl p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {platform && <platform.icon size={16} style={{ color: platform.color }} />}
                                                                        <span className="font-medium">{platform?.name}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="font-bold">{formatCurrency(allocation.dailyBudget)}</span>
                                                                        <span className="text-white/40 text-sm ml-2">({allocation.percentage}%)</span>
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min={10}
                                                                    max={80}
                                                                    value={allocation.percentage}
                                                                    onChange={(e) => handleAllocationChange(allocation.platformId, Number(e.target.value))}
                                                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mb-2"
                                                                    style={{ accentColor: platform?.color }}
                                                                />
                                                                {/* Mini projections */}
                                                                {projection && (
                                                                    <div className="flex gap-4 text-xs text-white/50">
                                                                        <span>👁️ {formatNumber(projection.impressions)}</span>
                                                                        <span>👆 {projection.clicks} clicks</span>
                                                                        <span>🛒 {projection.conversions} đơn</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Campaign Duration */}
                                            <div className="pt-4 border-t border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white/60 flex items-center gap-2"><Clock size={16} /> Thời gian chạy</span>
                                                    <span className="font-bold text-xl">{campaignDuration} ngày</span>
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
                                                <div className="mt-3 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
                                                    <div className="flex justify-between items-center">
                                                        <span>💰 Tổng chi phí dự kiến</span>
                                                        <span className="text-xl font-bold" style={{ color: primaryColor }}>
                                                            {formatCurrency(totalDailyBudget * campaignDuration)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm text-white/50 mt-1">
                                                        <span>📦 Dự kiến đơn hàng</span>
                                                        <span>{totalProjections.conversions * campaignDuration} đơn</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ==================== BIDDING STRATEGY ==================== */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => setExpandedSection(expandedSection === 'bidding' ? null : 'bidding')}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5"
                            >
                                <h3 className="font-bold flex items-center gap-2">
                                    <BarChart3 size={18} className="text-purple-400" /> Chiến lược đấu thầu
                                </h3>
                                <ChevronDown size={18} className={`transition-transform ${expandedSection === 'bidding' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {expandedSection === 'bidding' && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 space-y-3">
                                            {BIDDING_STRATEGIES.map(strategy => (
                                                <div
                                                    key={strategy.id}
                                                    onClick={() => setBiddingStrategy(strategy.id as BiddingStrategy)}
                                                    className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${biddingStrategy === strategy.id
                                                        ? 'border-purple-500 bg-purple-500/10'
                                                        : 'border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${biddingStrategy === strategy.id ? 'bg-purple-500' : 'bg-white/10'
                                                            }`}>
                                                            <strategy.icon size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold">{strategy.name}</p>
                                                                {strategy.recommended && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Khuyên dùng</span>}
                                                            </div>
                                                            <p className="text-xs text-white/50">{strategy.description}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 ${biddingStrategy === strategy.id ? 'border-purple-500 bg-purple-500' : 'border-white/30'
                                                            }`}>
                                                            {biddingStrategy === strategy.id && <Check size={12} className="text-white m-0.5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {biddingStrategy === 'target_roas' && (
                                                <div className="mt-4 p-4 bg-black/30 rounded-xl">
                                                    <label className="text-sm text-white/60 mb-2 block">ROAS mục tiêu</label>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min={1}
                                                            max={10}
                                                            step={0.5}
                                                            value={targetROAS}
                                                            onChange={(e) => setTargetROAS(Number(e.target.value))}
                                                            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-xl font-bold w-16 text-right">{targetROAS}x</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ==================== TARGETING ==================== */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => setExpandedSection(expandedSection === 'targeting' ? null : 'targeting')}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5"
                            >
                                <h3 className="font-bold flex items-center gap-2">
                                    <Target size={18} className="text-orange-400" /> Đối tượng mục tiêu (từ DNA)
                                </h3>
                                <ChevronDown size={18} className={`transition-transform ${expandedSection === 'targeting' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {expandedSection === 'targeting' && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <label className="text-xs text-white/40 block mb-2">Độ tuổi</label>
                                                <select
                                                    value={targetAge}
                                                    onChange={(e) => setTargetAge(e.target.value)}
                                                    className="w-full bg-white/10 rounded-lg px-3 py-2 text-white"
                                                >
                                                    <option value="18-24">18-24 tuổi</option>
                                                    <option value="25-34">25-34 tuổi</option>
                                                    <option value="25-45">25-45 tuổi</option>
                                                    <option value="35-54">35-54 tuổi</option>
                                                    <option value="55+">55+ tuổi</option>
                                                </select>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <label className="text-xs text-white/40 block mb-2">Giới tính</label>
                                                <select
                                                    value={targetGender}
                                                    onChange={(e) => setTargetGender(e.target.value)}
                                                    className="w-full bg-white/10 rounded-lg px-3 py-2 text-white"
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="male">Nam</option>
                                                    <option value="female">Nữ</option>
                                                </select>
                                            </div>
                                            <div className="bg-black/30 rounded-xl p-4 md:col-span-2">
                                                <label className="text-xs text-white/40 block mb-2">Sở thích (từ Core Values)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {targetInterests.map((interest, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{interest}</span>
                                                    ))}
                                                    {targetInterests.length === 0 && <span className="text-white/40 text-sm">Chưa có dữ liệu từ DNA</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ==================== UTM & TRACKING ==================== */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => setExpandedSection(expandedSection === 'tracking' ? null : 'tracking')}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5"
                            >
                                <h3 className="font-bold flex items-center gap-2">
                                    <Link2 size={18} className="text-cyan-400" /> UTM & Tracking
                                </h3>
                                <ChevronDown size={18} className={`transition-transform ${expandedSection === 'tracking' ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {expandedSection === 'tracking' && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 space-y-3">
                                            <p className="text-sm text-white/60">UTM Parameters tự động cho mỗi platform:</p>
                                            {utmParams.map(utm => {
                                                const platform = AD_PLATFORMS.find(p => p.id === utm.platform);
                                                return (
                                                    <div key={utm.platform} className="bg-black/30 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {platform && <platform.icon size={14} style={{ color: platform.color }} />}
                                                            <span className="font-medium text-sm">{platform?.name}</span>
                                                        </div>
                                                        <code className="text-xs text-cyan-400 break-all">?{utm.params}</code>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ==================== PRO MODE SETTINGS ==================== */}
                        <div className={`rounded-2xl border overflow-hidden transition-all ${isProMode ? 'bg-white/5 border-purple-500/50' : 'bg-transparent border-transparent'}`}>
                            <button
                                onClick={() => setIsProMode(!isProMode)}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 rounded-2xl border border-white/10"
                            >
                                <h3 className="font-bold flex items-center gap-2">
                                    <Zap size={18} className={isProMode ? 'text-yellow-400' : 'text-white/40'} />
                                    {isProMode ? 'Pro Mode: ĐANG BẬT' : 'Bật chế độ chuyên gia (Pro Mode)'}
                                </h3>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isProMode ? 'bg-purple-600' : 'bg-white/10'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isProMode ? 'translate-x-6' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProMode && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 space-y-6 border-t border-white/10 mt-4">

                                            {/* Keywords */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                                        <Target size={14} className="text-blue-400" /> Từ khóa mục tiêu (Google/TikTok)
                                                    </label>
                                                    <textarea
                                                        value={keywords}
                                                        onChange={(e) => setKeywords(e.target.value)}
                                                        placeholder="Nhập từ khóa, phân cách bằng dấu phẩy..."
                                                        className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                                        <Shield size={14} className="text-red-400" /> Từ khóa phủ định (Exclusions)
                                                    </label>
                                                    <textarea
                                                        value={negativeKeywords}
                                                        onChange={(e) => setNegativeKeywords(e.target.value)}
                                                        placeholder="Nhập từ khóa muốn loại trừ..."
                                                        className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-sm focus:border-red-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Bid Cap */}
                                            <div className="bg-black/30 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-sm font-medium">Giới hạn giá thầu (Bid Cap)</label>
                                                    <span className="text-xs text-white/50">Để 0 nếu muốn Auto</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <DollarSign size={16} className="text-green-400" />
                                                    <input
                                                        type="number"
                                                        value={bidCap}
                                                        onChange={(e) => setBidCap(Number(e.target.value))}
                                                        className="bg-transparent border-b border-white/20 py-1 w-32 focus:border-green-500 outline-none font-bold"
                                                    />
                                                    <span className="text-sm text-white/50">VND</span>
                                                </div>
                                            </div>

                                            {/* Win/Loss Rules */}
                                            <div>
                                                <h4 className="font-bold flex items-center gap-2 mb-3">
                                                    <TrendingUp size={16} className="text-cyan-400" /> Quy tắc Win/Loss (Automation)
                                                </h4>
                                                <div className="space-y-3">
                                                    {winLossRules.map((rule, idx) => (
                                                        <div key={rule.id} className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rule.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/30'}`}>
                                                                    <Settings size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{rule.name}</p>
                                                                    <p className="text-xs text-white/50">
                                                                        Nếu {rule.metric} {rule.operator} {rule.threshold} ➔ {rule.action}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const newRules = [...winLossRules];
                                                                        newRules[idx].active = !newRules[idx].active;
                                                                        setWinLossRules(newRules);
                                                                    }}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${rule.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}
                                                                >
                                                                    {rule.active ? 'ON' : 'OFF'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button className="w-full py-2 border border-dashed border-white/20 rounded-xl text-xs text-white/40 hover:text-white hover:border-white/40 transition-colors">
                                                        + Thêm quy tắc mới
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ==================== KEYWORD INTELLIGENCE ==================== */}
                                            <div className="pt-6 border-t border-white/10">
                                                <h4 className="font-bold flex items-center gap-2 mb-3">
                                                    <Target size={16} className="text-blue-400" /> Keyword Intelligence
                                                </h4>
                                                <p className="text-xs text-white/50 mb-3">AI đề xuất từ khóa dựa trên Brand DNA và ngành hàng</p>
                                                <div className="bg-black/30 rounded-xl overflow-hidden">
                                                    <div className="grid grid-cols-5 gap-2 p-3 border-b border-white/10 text-xs font-medium text-white/60">
                                                        <span className="col-span-2">Từ khóa</span>
                                                        <span className="text-center">Volume</span>
                                                        <span className="text-center">CPC</span>
                                                        <span className="text-center">Cạnh tranh</span>
                                                    </div>
                                                    {suggestedKeywords.map((kw, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => {
                                                                const newKws = [...suggestedKeywords];
                                                                newKws[idx].selected = !newKws[idx].selected;
                                                                setSuggestedKeywords(newKws);
                                                            }}
                                                            className={`grid grid-cols-5 gap-2 p-3 items-center text-sm cursor-pointer transition-colors ${kw.selected ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                                                        >
                                                            <div className="col-span-2 flex items-center gap-2">
                                                                <div className={`w-4 h-4 rounded border ${kw.selected ? 'bg-blue-500 border-blue-500' : 'border-white/30'} flex items-center justify-center`}>
                                                                    {kw.selected && <Check size={10} className="text-white" />}
                                                                </div>
                                                                <span className={kw.selected ? 'text-white' : 'text-white/60'}>{kw.keyword}</span>
                                                            </div>
                                                            <span className="text-center text-white/80">{(kw.volume / 1000).toFixed(1)}K</span>
                                                            <span className="text-center text-green-400">{formatCurrency(kw.cpc)}</span>
                                                            <span className={`text-center text-xs px-2 py-1 rounded-full ${kw.competition === 'Low' ? 'bg-green-500/20 text-green-400' : kw.competition === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {kw.competition}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-white/40 mt-2">
                                                    ✓ {suggestedKeywords.filter(k => k.selected).length} từ khóa đã chọn
                                                </p>
                                            </div>

                                            {/* ==================== ADVANCED PLACEMENTS ==================== */}
                                            <div className="pt-6 border-t border-white/10">
                                                <h4 className="font-bold flex items-center gap-2 mb-3">
                                                    <Layers size={16} className="text-purple-400" /> Advanced Placements
                                                </h4>

                                                {/* Devices */}
                                                <div className="mb-4">
                                                    <p className="text-xs text-white/50 mb-2">Thiết bị hiển thị</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(placements.devices).map(([device, enabled]) => (
                                                            <button
                                                                key={device}
                                                                onClick={() => setPlacements(prev => ({ ...prev, devices: { ...prev.devices, [device]: !enabled } }))}
                                                                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${enabled ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                                            >
                                                                {enabled && <Check size={12} />}
                                                                {device === 'mobile' ? '📱 Mobile' : device === 'desktop' ? '🖥️ Desktop' : '📟 Tablet'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Facebook Placements */}
                                                {selectedPlatforms.includes('facebook') && (
                                                    <div className="mb-4">
                                                        <p className="text-xs text-white/50 mb-2">Facebook Placements</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(placements.facebook).map(([placement, enabled]) => (
                                                                <button
                                                                    key={placement}
                                                                    onClick={() => setPlacements(prev => ({ ...prev, facebook: { ...prev.facebook, [placement]: !enabled } }))}
                                                                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${enabled ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-white/5 text-white/40 border border-white/10'}`}
                                                                >
                                                                    {enabled && <Check size={12} />}
                                                                    {placement === 'feed' ? 'Feed' : placement === 'stories' ? 'Stories' : placement === 'reels' ? 'Reels' : placement === 'messenger' ? 'Messenger' : 'Audience Network'}
                                                                    {placement === 'audienceNetwork' && <span className="text-xs text-red-400 ml-1">(bot risk)</span>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Schedule */}
                                                <div>
                                                    <p className="text-xs text-white/50 mb-2">Lịch chạy quảng cáo</p>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => setPlacements(prev => ({ ...prev, schedule: { ...prev.schedule, allDay: true } }))}
                                                            className={`px-3 py-1 rounded-full text-sm ${placements.schedule.allDay ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}
                                                        >
                                                            🕐 Cả ngày
                                                        </button>
                                                        <button
                                                            onClick={() => setPlacements(prev => ({ ...prev, schedule: { ...prev.schedule, allDay: false } }))}
                                                            className={`px-3 py-1 rounded-full text-sm ${!placements.schedule.allDay ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/40'}`}
                                                        >
                                                            ⏰ Tùy chỉnh
                                                        </button>
                                                        {!placements.schedule.allDay && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={23}
                                                                    value={placements.schedule.startHour}
                                                                    onChange={(e) => setPlacements(prev => ({ ...prev, schedule: { ...prev.schedule, startHour: Number(e.target.value) } }))}
                                                                    className="w-14 bg-black/30 border border-white/10 rounded px-2 py-1 text-center"
                                                                />
                                                                <span>-</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={23}
                                                                    value={placements.schedule.endHour}
                                                                    onChange={(e) => setPlacements(prev => ({ ...prev, schedule: { ...prev.schedule, endHour: Number(e.target.value) } }))}
                                                                    className="w-14 bg-black/30 border border-white/10 rounded px-2 py-1 text-center"
                                                                />
                                                                <span className="text-white/40">giờ</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!placements.schedule.allDay && (
                                                        <p className="text-xs text-cyan-400 mt-2">💡 AI Insight: Peak hours cho ngành của bạn: 19h-21h</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ==================== A/B TESTING ==================== */}
                                            <div className="pt-6 border-t border-white/10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-bold flex items-center gap-2">
                                                        <BarChart3 size={16} className="text-green-400" /> A/B Testing
                                                    </h4>
                                                    <button
                                                        onClick={() => setAbTestEnabled(!abTestEnabled)}
                                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${abTestEnabled ? 'bg-green-600' : 'bg-white/10'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${abTestEnabled ? 'translate-x-6' : ''}`} />
                                                    </button>
                                                </div>

                                                {abTestEnabled && (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {abVariants.map((variant, idx) => (
                                                                <div key={variant.id} className={`bg-black/30 rounded-xl p-4 border ${variant.isControl ? 'border-blue-500/30' : 'border-orange-500/30'}`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className={`text-sm font-bold ${variant.isControl ? 'text-blue-400' : 'text-orange-400'}`}>
                                                                            Variant {variant.id} {variant.isControl && '(Control)'}
                                                                        </span>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={variant.headline}
                                                                        onChange={(e) => {
                                                                            const newVariants = [...abVariants];
                                                                            newVariants[idx].headline = e.target.value;
                                                                            setAbVariants(newVariants);
                                                                        }}
                                                                        placeholder={variant.isControl ? 'Headline gốc...' : 'Headline thử nghiệm...'}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="text-xs text-white/50 block mb-1">Budget Test</label>
                                                                <input
                                                                    type="number"
                                                                    value={abBudget}
                                                                    onChange={(e) => setAbBudget(Number(e.target.value))}
                                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-white/50 block mb-1">Thời gian (ngày)</label>
                                                                <input
                                                                    type="number"
                                                                    value={abDuration}
                                                                    onChange={(e) => setAbDuration(Number(e.target.value))}
                                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-white/50 block mb-1">Metric Winner</label>
                                                                <select
                                                                    value={abWinnerMetric}
                                                                    onChange={(e) => setAbWinnerMetric(e.target.value as any)}
                                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                                >
                                                                    <option value="CTR">CTR cao nhất</option>
                                                                    <option value="CPA">CPA thấp nhất</option>
                                                                    <option value="ROAS">ROAS cao nhất</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Account Connection */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-green-400" /> Kết nối tài khoản Ads
                            </h3>
                            <div className="space-y-3">
                                {selectedPlatforms.map(platformId => {
                                    const platform = AD_PLATFORMS.find(p => p.id === platformId);
                                    return (
                                        <div
                                            key={platformId}
                                            className={`rounded-xl p-4 border cursor-pointer transition-all ${connectedAccounts[platformId] ? 'bg-green-500/10 border-green-500/30' : 'bg-black/30 border-white/10 hover:border-white/30'
                                                }`}
                                            onClick={() => setConnectedAccounts(prev => ({ ...prev, [platformId]: !prev[platformId] }))}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {platform && <platform.icon size={20} style={{ color: platform.color }} />}
                                                    <span className="font-medium">{platform?.name}</span>
                                                </div>
                                                {connectedAccounts[platformId] ? (
                                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">✓ Đã kết nối</span>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 bg-white/10 text-white/50 rounded-full">Click để kết nối</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {Object.values(connectedAccounts).filter(Boolean).length < selectedPlatforms.length && (
                                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <p className="text-sm text-yellow-300 flex items-center gap-2">
                                        <AlertCircle size={14} /> Vui lòng kết nối tất cả tài khoản trước khi chạy
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pre-launch Checklist */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="font-bold mb-4">✅ Checklist trước khi chạy</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Chọn nền tảng', done: selectedPlatforms.length > 0 },
                                    { label: 'Thiết lập ngân sách', done: totalDailyBudget >= 100000 },
                                    { label: 'Chọn chiến lược đấu thầu', done: !!biddingStrategy },
                                    { label: 'Upload creatives', done: creativeData?.uploadedVideos?.length > 0 || creativeData?.uploadedImages?.length > 0 },
                                    { label: 'Kết nối tài khoản Ads', done: Object.values(connectedAccounts).filter(Boolean).length === selectedPlatforms.length }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-white/10'}`}>
                                            {item.done && <Check size={12} />}
                                        </div>
                                        <span className={item.done ? 'text-white' : 'text-white/50'}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assets Summary */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="font-bold mb-4">📦 Assets đã chuẩn bị</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                                    <span>Video Scripts</span>
                                    <span className="text-green-400">{creativeData?.scripts?.length || 0}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                                    <span>Image Briefs</span>
                                    <span className="text-green-400">{creativeData?.imageBriefs?.length || 0}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                                    <span>Videos Uploaded</span>
                                    <span className={creativeData?.uploadedVideos?.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
                                        {creativeData?.uploadedVideos?.length || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between p-2 bg-black/30 rounded-lg">
                                    <span>Images Uploaded</span>
                                    <span className={creativeData?.uploadedImages?.length > 0 ? 'text-green-400' : 'text-yellow-400'}>
                                        {creativeData?.uploadedImages?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                {/* Bottom Action */}
                < div className="mt-8 flex justify-between" >
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
                </div >
            </div >
        </main >
    );
}
