'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, Search, Filter, Target, Zap, TrendingUp, TrendingDown,
    Play, Image as ImageIcon, ExternalLink, Download, ArrowLeft,
    Sparkles, AlertCircle, Check, RefreshCw, Loader2, Copy,
    ThumbsUp, ThumbsDown, MessageSquare, Share2
} from 'lucide-react';

// Mock competitor ads data
const MOCK_COMPETITOR_ADS = [
    {
        id: 'ad_1',
        competitor: 'DigitalMaster Pro',
        platform: 'facebook',
        format: 'video',
        startDate: '2026-01-10',
        headline: 'Tăng 300% doanh số với AI Marketing',
        description: 'Công cụ marketing tự động #1 Việt Nam. Hơn 10,000 doanh nghiệp tin tưởng.',
        cta: 'Đăng ký miễn phí',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        metrics: { likes: 1200, comments: 89, shares: 234 },
        status: 'active'
    },
    {
        id: 'ad_2',
        competitor: 'AdBoost Vietnam',
        platform: 'facebook',
        format: 'image',
        startDate: '2026-01-08',
        headline: 'Quảng cáo thông minh - Chi phí thấp nhất',
        description: 'Giảm 50% chi phí quảng cáo với AI tối ưu tự động. Không cần kỹ năng marketing.',
        cta: 'Dùng thử 7 ngày',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        metrics: { likes: 856, comments: 45, shares: 123 },
        status: 'active'
    },
    {
        id: 'ad_3',
        competitor: 'SocialAI Tools',
        platform: 'tiktok',
        format: 'video',
        startDate: '2026-01-12',
        headline: 'POV: Bạn vừa tìm ra công cụ viral content',
        description: 'AI tạo content viral trong 30 giây. Trend TikTok không còn khó!',
        cta: 'Xem demo',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
        metrics: { likes: 5600, comments: 234, shares: 890 },
        status: 'active'
    },
    {
        id: 'ad_4',
        competitor: 'MarketGenius',
        platform: 'google',
        format: 'text',
        startDate: '2026-01-05',
        headline: 'Marketing Automation | ROI 5x trong 30 ngày',
        description: 'Đã được 500+ agency tin dùng. Tích hợp Facebook, Google, TikTok.',
        cta: 'Tư vấn miễn phí',
        thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop',
        metrics: { likes: 0, comments: 0, shares: 0 },
        status: 'active'
    }
];

interface AdAnalysis {
    strengths: string[];
    weaknesses: string[];
    hookFormula: string;
    ctaEffectiveness: number;
    recommendations: string[];
}

export default function CompetitorSpyPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [selectedFormat, setSelectedFormat] = useState<string>('all');
    const [ads, setAds] = useState(MOCK_COMPETITOR_ADS);
    const [selectedAd, setSelectedAd] = useState<typeof MOCK_COMPETITOR_ADS[0] | null>(null);
    const [analysis, setAnalysis] = useState<AdAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        // Simulate search delay
        await new Promise(r => setTimeout(r, 1500));

        // Filter mock data based on query
        const filtered = MOCK_COMPETITOR_ADS.filter(ad =>
            ad.competitor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.headline.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setAds(filtered.length > 0 ? filtered : MOCK_COMPETITOR_ADS);
        setIsSearching(false);
    };

    const analyzeAd = async (ad: typeof MOCK_COMPETITOR_ADS[0]) => {
        setSelectedAd(ad);
        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const response = await fetch('/api/spy/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ad })
            });

            const result = await response.json();
            if (result.success) {
                setAnalysis(result.analysis);
            } else {
                // Fallback mock analysis
                setAnalysis({
                    strengths: [
                        'Headline sử dụng số cụ thể (300%) tạo credibility',
                        'Social proof mạnh với "10,000 doanh nghiệp"',
                        'CTA rõ ràng, giảm rào cản (miễn phí)'
                    ],
                    weaknesses: [
                        'Thiếu urgency/scarcity element',
                        'Không có testimonial cụ thể',
                        'Description chưa address pain point rõ'
                    ],
                    hookFormula: 'Number Hook + Social Proof',
                    ctaEffectiveness: 78,
                    recommendations: [
                        'Thêm deadline hoặc limited offer để tạo urgency',
                        'Dùng hook "Tại sao 10,000 doanh nghiệp..." thay vì chỉ mention số',
                        'A/B test với "Bắt đầu miễn phí" vs "Đăng ký miễn phí"'
                    ]
                });
            }
        } catch (err) {
            // Fallback
            setAnalysis({
                strengths: ['Headline gây chú ý', 'CTA rõ ràng'],
                weaknesses: ['Thiếu urgency', 'Copy chưa cá nhân hóa'],
                hookFormula: 'Benefit-First Hook',
                ctaEffectiveness: 72,
                recommendations: ['Test với số liệu cụ thể hơn', 'Thêm testimonial']
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const importToStrategy = () => {
        if (!selectedAd || !analysis) return;

        // Get existing competitors or create new array
        const existing = localStorage.getItem('kodaflow_competitors');
        const competitors = existing ? JSON.parse(existing) : [];

        // Add new competitor insight
        competitors.push({
            name: selectedAd.competitor,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            attackAngle: analysis.recommendations[0] || 'Tập trung vào điểm yếu đối thủ',
            opportunityScore: 100 - analysis.ctaEffectiveness,
            sourceAd: selectedAd.headline
        });

        localStorage.setItem('kodaflow_competitors', JSON.stringify(competitors));
        alert('✅ Đã import insights vào chiến dịch!');
    };

    const filteredAds = ads.filter(ad => {
        if (selectedPlatform !== 'all' && ad.platform !== selectedPlatform) return false;
        if (selectedFormat !== 'all' && ad.format !== selectedFormat) return false;
        return true;
    });

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'facebook': return 'bg-blue-500';
            case 'tiktok': return 'bg-pink-500';
            case 'google': return 'bg-green-500';
            case 'youtube': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Competitor Spy</h1>
                            <p className="text-xs text-white/50">Quét & phân tích ads đối thủ</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold">
                            🔥 PRO FEATURE
                        </span>
                        <button
                            onClick={() => window.location.href = '/app/campaign'}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Search className="text-purple-400" size={20} />
                        Tìm kiếm đối thủ
                    </h2>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nhập tên brand hoặc từ khóa..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Quét Ads
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-white/40" />
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                            >
                                <option value="all">Tất cả nền tảng</option>
                                <option value="facebook">Facebook</option>
                                <option value="tiktok">TikTok</option>
                                <option value="google">Google</option>
                                <option value="youtube">YouTube</option>
                            </select>
                        </div>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="all">Tất cả format</option>
                            <option value="video">Video</option>
                            <option value="image">Image</option>
                            <option value="text">Text</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ads Gallery */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Sparkles className="text-yellow-400" size={18} />
                            Ads đang chạy ({filteredAds.length})
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredAds.map((ad) => (
                                <motion.div
                                    key={ad.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => analyzeAd(ad)}
                                    className={`bg-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden cursor-pointer transition-all ${selectedAd?.id === ad.id ? 'border-purple-500' : 'border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-40">
                                        <img
                                            src={ad.thumbnail}
                                            alt={ad.headline}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 flex gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold text-white ${getPlatformColor(ad.platform)}`}>
                                                {ad.platform.toUpperCase()}
                                            </span>
                                            <span className="px-2 py-1 rounded-md text-xs bg-black/50 text-white">
                                                {ad.format === 'video' ? <Play size={12} className="inline" /> : <ImageIcon size={12} className="inline" />}
                                                {' '}{ad.format}
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 rounded-md text-xs bg-green-500/80 text-white">
                                                🟢 Active
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <p className="text-xs text-white/40 mb-1">{ad.competitor}</p>
                                        <h4 className="font-semibold mb-2 line-clamp-2">{ad.headline}</h4>
                                        <p className="text-sm text-white/60 line-clamp-2 mb-3">{ad.description}</p>

                                        {/* Metrics */}
                                        <div className="flex items-center gap-4 text-xs text-white/40">
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp size={12} /> {ad.metrics.likes.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare size={12} /> {ad.metrics.comments}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Share2 size={12} /> {ad.metrics.shares}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Analysis Panel */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Target className="text-cyan-400" size={18} />
                            AI Analysis
                        </h3>

                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24">
                            {!selectedAd ? (
                                <div className="text-center py-12 text-white/40">
                                    <Eye size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>Chọn một ad để phân tích</p>
                                </div>
                            ) : isAnalyzing ? (
                                <div className="text-center py-12">
                                    <Loader2 size={48} className="mx-auto mb-4 animate-spin text-purple-400" />
                                    <p className="text-white/60">AI đang phân tích...</p>
                                </div>
                            ) : analysis ? (
                                <div className="space-y-6">
                                    {/* Selected Ad Info */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <p className="text-xs text-white/40 mb-1">Đang phân tích</p>
                                        <p className="font-semibold">{selectedAd.headline}</p>
                                        <p className="text-xs text-purple-400 mt-1">{selectedAd.competitor}</p>
                                    </div>

                                    {/* CTA Effectiveness */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white/60">CTA Effectiveness</span>
                                            <span className="font-bold text-lg">{analysis.ctaEffectiveness}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${analysis.ctaEffectiveness >= 80 ? 'bg-green-500' :
                                                        analysis.ctaEffectiveness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${analysis.ctaEffectiveness}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Hook Formula */}
                                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                                        <span className="text-xs text-purple-400 block mb-1">Hook Formula</span>
                                        <p className="font-bold">{analysis.hookFormula}</p>
                                    </div>

                                    {/* Strengths */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1">
                                            <TrendingUp size={14} /> Điểm mạnh
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.strengths.map((s, i) => (
                                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                                            <TrendingDown size={14} /> Điểm yếu
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.weaknesses.map((w, i) => (
                                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Recommendations */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-1">
                                            <Zap size={14} /> Cách đánh bại
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.recommendations.map((r, i) => (
                                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                                    <Sparkles size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={importToStrategy}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Download size={16} />
                                            Import vào Chiến dịch
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
