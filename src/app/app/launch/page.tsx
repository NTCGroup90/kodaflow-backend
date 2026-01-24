'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, Play, Pause, TrendingUp, TrendingDown, DollarSign, Users,
    Eye, MousePointer, ShoppingCart, ArrowLeft, Check, RefreshCw,
    Loader2, Youtube, Facebook, AlertCircle, Zap, Target, BarChart3,
    ChevronRight, Bell, Settings
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

interface CampaignMetrics {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    conversions: number;
    cpc: number;
    roas: number;
    healthScore?: number;
    optimizationLogs?: string[];
}

type CampaignStatus = 'active' | 'paused' | 'pending' | 'learning';

interface PlatformCampaign {
    platformId: string;
    platformName: string;
    status: CampaignStatus;
    dailyBudget: number;
    metrics: CampaignMetrics;
    trend: 'up' | 'down' | 'stable';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLATFORM_ICONS: Record<string, React.ComponentType<any>> = {
    facebook: Facebook,
    tiktok: TikTokIcon,
    youtube: Youtube,
    google: GoogleIcon
};

const PLATFORM_COLORS: Record<string, string> = {
    facebook: '#1877f2',
    tiktok: '#00f2ea',
    youtube: '#ff0000',
    google: '#4285f4'
};

export default function LaunchPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [brandDNA, setBrandDNA] = useState<any>(null);
    const [setupData, setSetupData] = useState<any>(null);

    // Campaign state
    const [isLaunched, setIsLaunched] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [campaigns, setCampaigns] = useState<PlatformCampaign[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // KODA Optimizer
    const [optimizerEnabled, setOptimizerEnabled] = useState(true);
    const [optimizerLogs, setOptimizerLogs] = useState<string[]>([]);

    // Deployment Logs
    const [launchLogs, setLaunchLogs] = useState<{ time: string, message: string, type: 'info' | 'success' | 'error' }[]>([]);

    // Load data
    useEffect(() => {
        const storedDNA = localStorage.getItem('kodaflow_brand_dna');
        const storedSetup = localStorage.getItem('kodaflow_setup');

        if (storedDNA) setBrandDNA(JSON.parse(storedDNA));
        if (storedSetup) setSetupData(JSON.parse(storedSetup));

        setIsLoading(false);
    }, []);

    // Simulate campaign launch
    // Simulate campaign launch
    const handleLaunch = async () => {
        if (!setupData) return;

        setIsLaunching(true);
        setLaunchLogs([]);

        const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
            const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 999);
            setLaunchLogs(prev => [...prev, { time, message: msg, type }]);
            // Auto scroll
            const consoleEl = document.getElementById('deploy-console');
            if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight;
        };

        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

        // Sequence
        addLog('Initializing KODA Deployment Agent v2.4...', 'info');
        await sleep(600);
        addLog('Verifying brand_dna signature...', 'info');
        await sleep(400);
        addLog('Signature verified. Access granted.', 'success');
        await sleep(300);

        for (const platform of (setupData.platforms || ['facebook', 'tiktok'])) {
            addLog(`Connecting to ${platform.toUpperCase()} Graph API...`, 'info');
            await sleep(800);
            addLog(`Authentication successful (Token: ************)`, 'success');
            await sleep(400);
            addLog(`Uploading creative assets to ${platform} CDN...`, 'info');
            await sleep(1200);
            addLog(`Assets optimized: 1080p, High Bitrate`, 'success');
            await sleep(500);
            addLog(`Configuring AdSets: ${platform}_lookalike_1pct`, 'info');
            await sleep(600);
            addLog(`Bid Strategy: Cost Cap @ Automatic`, 'info');
            await sleep(300);
            addLog(`Targeting: Vietnam, 18-45, Interests matched`, 'success');
            await sleep(500);
        }

        addLog('Running final pre-flight checks...', 'info');
        await sleep(1000);
        addLog('ALL SYSTEMS GO.', 'success');
        addLog('LAUNCHING CAMPAIGNS...', 'success');
        await sleep(1500);

        // Create initial campaign states
        const initialCampaigns: PlatformCampaign[] = setupData.budgetAllocations.map((allocation: any) => ({
            platformId: allocation.platformId,
            platformName: allocation.platformId.charAt(0).toUpperCase() + allocation.platformId.slice(1),
            status: 'learning' as const,
            dailyBudget: allocation.dailyBudget,
            metrics: {
                impressions: 0,
                clicks: 0,
                ctr: 0,
                spend: 0,
                conversions: 0,
                cpc: 0,
                roas: 0,
                healthScore: 100,
                optimizationLogs: []
            },
            trend: 'stable' as const
        }));

        setCampaigns(initialCampaigns);
        setIsLaunched(true);
        setIsLaunching(false);
        setLastUpdated(new Date());

        // Start simulating metrics updates
        startMetricsSimulation(initialCampaigns);
    };

    // Simulate real-time metrics
    const startMetricsSimulation = (initialCampaigns: PlatformCampaign[]) => {
        let currentCampaigns = [...initialCampaigns];

        const interval = setInterval(() => {
            currentCampaigns = currentCampaigns.map(campaign => {
                const impressionIncrease = Math.floor(Math.random() * 500) + 100;
                const clickRate = 0.02 + Math.random() * 0.03;
                const newClicks = Math.floor(impressionIncrease * clickRate);
                const cpcBase = campaign.platformId === 'tiktok' ? 2000 : campaign.platformId === 'facebook' ? 3000 : 4000;
                const newSpend = newClicks * (cpcBase + Math.random() * 1000);
                const conversionRate = 0.02 + Math.random() * 0.03;
                const newConversions = Math.floor(newClicks * conversionRate);

                const totalImpressions = campaign.metrics.impressions + impressionIncrease;
                const totalClicks = campaign.metrics.clicks + newClicks;
                const totalSpend = campaign.metrics.spend + newSpend;
                const totalConversions = campaign.metrics.conversions + newConversions;

                // KODA Optimizer logic
                const ctr = (totalClicks / totalImpressions) * 100;
                let newStatus: CampaignStatus = 'active';
                if (ctr < 1 && totalImpressions > 1000) {
                    newStatus = 'paused';
                }

                if (newStatus === 'paused' && campaign.status !== 'paused' && optimizerEnabled) {
                    setOptimizerLogs(prev => [...prev, `⚠️ ${campaign.platformName}: CTR thấp (${ctr.toFixed(2)}%), tự động tạm dừng`]);
                }

                return {
                    ...campaign,
                    status: optimizerEnabled ? newStatus : (campaign.status === 'learning' ? 'active' : campaign.status),
                    metrics: {
                        impressions: totalImpressions,
                        clicks: totalClicks,
                        ctr,
                        spend: totalSpend,
                        conversions: totalConversions,
                        cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
                        roas: totalSpend > 0 ? (totalConversions * 500000) / totalSpend : 0
                    },
                    trend: ctr > 2 ? 'up' : ctr < 1.5 ? 'down' : 'stable'
                };
            });

            setCampaigns([...currentCampaigns]);
            setLastUpdated(new Date());
        }, 5000);

        return () => clearInterval(interval);
    };

    const toggleCampaignStatus = (platformId: string) => {
        setCampaigns(prev => prev.map(c => {
            if (c.platformId === platformId) {
                const newStatus: CampaignStatus = c.status === 'active' ? 'paused' : 'active';
                setOptimizerLogs(logs => [...logs, `${newStatus === 'active' ? '▶️' : '⏸️'} ${c.platformName}: ${newStatus === 'active' ? 'Đã bật' : 'Đã tắt'} thủ công`]);
                return { ...c, status: newStatus };
            }
            return c;
        }));
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

    // Calculate totals
    const totals = campaigns.reduce((acc, c) => ({
        impressions: acc.impressions + c.metrics.impressions,
        clicks: acc.clicks + c.metrics.clicks,
        spend: acc.spend + c.metrics.spend,
        conversions: acc.conversions + c.metrics.conversions
    }), { impressions: 0, clicks: 0, spend: 0, conversions: 0 });

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
                            <Rocket size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Bước 5: Chạy & Theo dõi</h1>
                            <p className="text-xs text-white/50">{brandDNA?.brandName || 'Module 5'} - KODA Optimizer</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isLaunched && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm text-green-400">Live</span>
                            </div>
                        )}
                        <button onClick={() => window.location.href = '/app/setup'} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                            <ArrowLeft size={14} /> Cài đặt
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Progress indicator */}
                <div className="mb-6 flex items-center justify-center gap-2">
                    {['DNA', 'Chiến lược', 'Nội dung', 'Cài đặt', 'Chạy'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${i === 4 ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                                <Check size={14} className="inline mr-1" />
                                {step}
                            </div>
                            {i < 4 && <ChevronRight size={16} className="text-green-500" />}
                        </React.Fragment>
                    ))}
                </div>

                {!isLaunched ? (
                    /* Pre-launch screen */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto text-center py-12"
                    >
                        <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                            <Rocket size={48} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Sẵn sàng khởi chạy!</h2>
                        <p className="text-white/60 mb-8">
                            Tất cả đã được chuẩn bị. Bấm nút bên dưới để bắt đầu chạy quảng cáo trên các nền tảng đã chọn.
                        </p>

                        {/* Summary */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8 text-left">
                            <h3 className="font-bold mb-4">Tóm tắt chiến dịch:</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/30 rounded-xl p-4">
                                    <p className="text-white/40 text-sm">Nền tảng</p>
                                    <p className="font-semibold">{setupData?.platforms?.join(', ') || 'N/A'}</p>
                                </div>
                                <div className="bg-black/30 rounded-xl p-4">
                                    <p className="text-white/40 text-sm">Ngân sách/ngày</p>
                                    <p className="font-semibold">{formatCurrency(setupData?.totalDailyBudget || 0)}</p>
                                </div>
                                <div className="bg-black/30 rounded-xl p-4">
                                    <p className="text-white/40 text-sm">Thời gian chạy</p>
                                    <p className="font-semibold">{setupData?.campaignDuration || 7} ngày</p>
                                </div>
                                <div className="bg-black/30 rounded-xl p-4">
                                    <p className="text-white/40 text-sm">Tổng chi phí dự kiến</p>
                                    <p className="font-semibold">{formatCurrency((setupData?.totalDailyBudget || 0) * (setupData?.campaignDuration || 7))}</p>
                                </div>
                            </div>
                        </div>

                        {/* Console Log Overlay */}
                        {isLaunching && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full max-w-2xl bg-[#0a0a0f] border border-green-500/30 rounded-xl overflow-hidden font-mono text-xs md:text-sm shadow-2xl shadow-green-500/10"
                                >
                                    {/* Terminal Header */}
                                    <div className="bg-[#1a1a1f] px-4 py-2 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                        <div className="text-white/40">koda_deploy_cli_v2.4.0</div>
                                    </div>

                                    {/* Terminal Body */}
                                    <div className="p-6 h-80 overflow-y-auto space-y-2 font-mono" id="deploy-console">
                                        {launchLogs.map((log, i) => (
                                            <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-400'}`}>
                                                <span className="text-white/30">[{log.time}]</span>
                                                <span>
                                                    <span className="opacity-50 mr-2">{'>'}</span>
                                                    {log.message}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="animate-pulse text-green-500">_</div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        <button
                            onClick={handleLaunch}
                            disabled={isLaunching}
                            className="px-12 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 mx-auto disabled:opacity-70 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                            <Rocket size={24} />
                            🚀 KHỞI CHẠY NGAY
                        </button>
                    </motion.div>
                ) : (
                    /* Live Dashboard */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Total Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 p-5">
                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                    <Eye size={18} />
                                    <span className="text-sm">Impressions</span>
                                </div>
                                <p className="text-2xl font-bold">{formatNumber(totals.impressions)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 p-5">
                                <div className="flex items-center gap-2 text-green-400 mb-2">
                                    <MousePointer size={18} />
                                    <span className="text-sm">Clicks</span>
                                </div>
                                <p className="text-2xl font-bold">{formatNumber(totals.clicks)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-5">
                                <div className="flex items-center gap-2 text-purple-400 mb-2">
                                    <DollarSign size={18} />
                                    <span className="text-sm">Chi tiêu</span>
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(totals.spend)}</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-5">
                                <div className="flex items-center gap-2 text-orange-400 mb-2">
                                    <ShoppingCart size={18} />
                                    <span className="text-sm">Conversions</span>
                                </div>
                                <p className="text-2xl font-bold">{totals.conversions}</p>
                            </div>
                        </div>

                        {/* Platform Campaigns */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <BarChart3 size={18} className="text-cyan-400" />
                                    Chiến dịch theo nền tảng
                                </h3>
                                {lastUpdated && (
                                    <span className="text-xs text-white/40 flex items-center gap-1">
                                        <RefreshCw size={12} className="animate-spin" />
                                        Cập nhật: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>

                            <div className="divide-y divide-white/5">
                                {campaigns.map(campaign => {
                                    const Icon = PLATFORM_ICONS[campaign.platformId] || Target;
                                    const color = PLATFORM_COLORS[campaign.platformId] || '#ffffff';

                                    return (
                                        <div key={campaign.platformId} className="p-5 hover:bg-white/5 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color }}>
                                                        <Icon size={20} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{campaign.platformName} Ads</p>
                                                        <p className="text-xs text-white/40">{formatCurrency(campaign.dailyBudget)}/ngày</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        campaign.status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {campaign.status === 'active' ? '🟢 Active' :
                                                            campaign.status === 'learning' ? '🟡 Learning' : '🔴 Paused'}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleCampaignStatus(campaign.platformId)}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                                                    >
                                                        {campaign.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="bg-black/30 rounded-lg p-3">
                                                    <p className="text-xs text-white/40">Impressions</p>
                                                    <p className="font-semibold">{formatNumber(campaign.metrics.impressions)}</p>
                                                </div>
                                                <div className="bg-black/30 rounded-lg p-3">
                                                    <p className="text-xs text-white/40">CTR</p>
                                                    <p className={`font-semibold flex items-center gap-1 ${campaign.trend === 'up' ? 'text-green-400' :
                                                        campaign.trend === 'down' ? 'text-red-400' : ''
                                                        }`}>
                                                        {campaign.metrics.ctr.toFixed(2)}%
                                                        {campaign.trend === 'up' && <TrendingUp size={14} />}
                                                        {campaign.trend === 'down' && <TrendingDown size={14} />}
                                                    </p>
                                                </div>
                                                <div className="bg-black/30 rounded-lg p-3">
                                                    <p className="text-xs text-white/40">CPC</p>
                                                    <p className="font-semibold">{formatCurrency(campaign.metrics.cpc)}</p>
                                                </div>
                                                <div className="bg-black/30 rounded-lg p-3">
                                                    <p className="text-xs text-white/40">ROAS</p>
                                                    <p className={`font-semibold ${campaign.metrics.roas > 1 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {campaign.metrics.roas.toFixed(2)}x
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Optimization Panel */}
                                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-black/20 rounded-lg p-3">
                                                    <p className="text-xs text-white/50 mb-2 flex items-center gap-2">
                                                        <TrendingUp size={12} className="text-green-400" /> Optimization Rules (Active)
                                                    </p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-white/70">Win Rule: ROAS &gt; 3.0</span>
                                                            <span className="text-green-400">Scale Budget (+20%)</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-white/70">Loss Rule: CPA &gt; 1.5x</span>
                                                            <span className="text-red-400 font-bold">KILL ADSET</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-black/20 rounded-lg p-3">
                                                    <p className="text-xs text-white/50 mb-2 flex items-center gap-2">
                                                        <AlertCircle size={12} className="text-yellow-400" /> Recent Optimizations
                                                    </p>
                                                    <div className="space-y-1 max-h-16 overflow-y-auto">
                                                        {optimizerEnabled && campaign.status !== 'active' && (
                                                            <p className="text-xs text-white/60 font-mono">⚠️ Auto-paused due to low CTR</p>
                                                        )}
                                                        {(!optimizerEnabled || campaign.status === 'active') && (
                                                            <p className="text-xs text-white/40 italic">Running optimally...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* KODA Optimizer */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Zap size={18} className="text-yellow-400" />
                                    KODA Optimizer
                                </h3>
                                <button
                                    onClick={() => setOptimizerEnabled(!optimizerEnabled)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${optimizerEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
                                        }`}
                                >
                                    {optimizerEnabled ? '✅ Đang bật' : '⭕ Đang tắt'}
                                </button>
                            </div>
                            <p className="text-white/60 text-sm mb-4">
                                Tự động tối ưu ngân sách và tạm dừng quảng cáo không hiệu quả.
                            </p>

                            {optimizerLogs.length > 0 && (
                                <div className="bg-black/30 rounded-xl p-4 max-h-40 overflow-y-auto">
                                    {optimizerLogs.map((log, i) => (
                                        <p key={i} className="text-xs text-white/70 py-1">{log}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Bottom Action */}
                <div className="mt-8 flex justify-between">
                    <button onClick={() => window.location.href = '/app/setup'} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2">
                        <ArrowLeft size={18} /> Quay lại Cài đặt
                    </button>
                    {isLaunched && (
                        <button onClick={() => window.location.href = '/app/dna'} className="px-8 py-3 rounded-xl font-bold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                            <Rocket size={18} /> Tạo chiến dịch mới
                        </button>
                    )}
                </div>
            </div>
        </main >
    );
}
