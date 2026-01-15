'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shuffle, Zap, Download, Copy, Check, RefreshCw, Loader2,
    ArrowLeft, FileText, Sparkles, Target, Grid, List,
    Facebook, Youtube, ChevronRight, Play
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

interface Variation {
    id: string;
    type: 'headline' | 'description';
    text: string;
    variant: string;
    selected: boolean;
}

interface AdCombination {
    id: string;
    headline: string;
    description: string;
    headlineVariant: string;
    descriptionVariant: string;
}

export default function DynamicCreativePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [campaign, setCampaign] = useState<any>(null);
    const [brandDNA, setBrandDNA] = useState<any>(null);

    const [headlines, setHeadlines] = useState<Variation[]>([]);
    const [descriptions, setDescriptions] = useState<Variation[]>([]);
    const [combinations, setCombinations] = useState<AdCombination[]>([]);
    const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set());

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [exportPlatform, setExportPlatform] = useState<'facebook' | 'google' | 'tiktok'>('facebook');

    // Load campaign data
    useEffect(() => {
        const storedCampaign = localStorage.getItem('kodaflow_campaign');
        const storedDNA = localStorage.getItem('kodaflow_brand_dna');

        if (storedCampaign) setCampaign(JSON.parse(storedCampaign));
        if (storedDNA) setBrandDNA(JSON.parse(storedDNA));

        setIsLoading(false);
    }, []);

    // Generate variations
    const generateVariations = async () => {
        if (!campaign?.adCopy) return;

        setIsGenerating(true);

        try {
            const response = await fetch('/api/creative/dynamic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adCopy: campaign.adCopy,
                    brandDNA,
                    angle: campaign.angle
                })
            });

            const result = await response.json();

            if (result.success) {
                setHeadlines(result.headlines.map((h: any, i: number) => ({
                    id: `h_${i}`,
                    type: 'headline',
                    text: h.text,
                    variant: h.variant,
                    selected: true
                })));
                setDescriptions(result.descriptions.map((d: any, i: number) => ({
                    id: `d_${i}`,
                    type: 'description',
                    text: d.text,
                    variant: d.variant,
                    selected: true
                })));
            } else {
                // Fallback
                generateFallbackVariations();
            }
        } catch (err) {
            generateFallbackVariations();
        } finally {
            setIsGenerating(false);
        }
    };

    const generateFallbackVariations = () => {
        const baseHeadlines = campaign?.adCopy?.headlines || ['Khám phá ngay', 'Đừng bỏ lỡ'];
        const baseDescriptions = campaign?.adCopy?.descriptions || ['Giải pháp tốt nhất'];

        const variants = ['Original', 'Urgency', 'Emotional', 'Question', 'Number'];

        setHeadlines([
            { id: 'h_0', type: 'headline', text: baseHeadlines[0], variant: 'Original', selected: true },
            { id: 'h_1', type: 'headline', text: `🔥 ${baseHeadlines[0]} - Chỉ hôm nay!`, variant: 'Urgency', selected: true },
            { id: 'h_2', type: 'headline', text: `Bạn xứng đáng ${baseHeadlines[0]?.toLowerCase()}`, variant: 'Emotional', selected: true },
            { id: 'h_3', type: 'headline', text: `Tại sao ${baseHeadlines[0]?.toLowerCase()}?`, variant: 'Question', selected: true },
            { id: 'h_4', type: 'headline', text: `3 lý do để ${baseHeadlines[0]?.toLowerCase()}`, variant: 'Number', selected: true }
        ]);

        setDescriptions([
            { id: 'd_0', type: 'description', text: baseDescriptions[0], variant: 'Original', selected: true },
            { id: 'd_1', type: 'description', text: `⚡ ${baseDescriptions[0]} - Ưu đãi kết thúc sớm!`, variant: 'Urgency', selected: true },
            { id: 'd_2', type: 'description', text: `Hàng nghìn người đã chọn: ${baseDescriptions[0]?.toLowerCase()}`, variant: 'Social Proof', selected: true }
        ]);
    };

    // Generate combinations when variations change
    useEffect(() => {
        if (headlines.length === 0 || descriptions.length === 0) return;

        const selectedHeadlines = headlines.filter(h => h.selected);
        const selectedDescriptions = descriptions.filter(d => d.selected);

        const combos: AdCombination[] = [];
        selectedHeadlines.forEach(h => {
            selectedDescriptions.forEach(d => {
                combos.push({
                    id: `${h.id}_${d.id}`,
                    headline: h.text,
                    description: d.text,
                    headlineVariant: h.variant,
                    descriptionVariant: d.variant
                });
            });
        });

        setCombinations(combos);
        setSelectedCombos(new Set(combos.map(c => c.id)));
    }, [headlines, descriptions]);

    const toggleVariation = (id: string, type: 'headline' | 'description') => {
        if (type === 'headline') {
            setHeadlines(prev => prev.map(h =>
                h.id === id ? { ...h, selected: !h.selected } : h
            ));
        } else {
            setDescriptions(prev => prev.map(d =>
                d.id === id ? { ...d, selected: !d.selected } : d
            ));
        }
    };

    const toggleCombo = (id: string) => {
        setSelectedCombos(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllCombos = () => {
        setSelectedCombos(new Set(combinations.map(c => c.id)));
    };

    const deselectAllCombos = () => {
        setSelectedCombos(new Set());
    };

    // Export to CSV
    const exportToCSV = () => {
        const selected = combinations.filter(c => selectedCombos.has(c.id));

        let csv = '';
        let filename = '';

        switch (exportPlatform) {
            case 'facebook':
                csv = 'Headline,Description,Final URL,Image\n';
                selected.forEach(c => {
                    csv += `"${c.headline}","${c.description}","https://example.com",""\n`;
                });
                filename = 'facebook_ads_bulk.csv';
                break;
            case 'google':
                csv = 'Headline 1,Headline 2,Headline 3,Description 1,Description 2,Final URL\n';
                selected.forEach(c => {
                    csv += `"${c.headline}","${c.headline}","","${c.description}","","https://example.com"\n`;
                });
                filename = 'google_ads_bulk.csv';
                break;
            case 'tiktok':
                csv = 'Ad Name,Caption,Landing Page URL\n';
                selected.forEach((c, i) => {
                    csv += `"Ad ${i + 1}","${c.headline} ${c.description}","https://example.com"\n`;
                });
                filename = 'tiktok_ads_bulk.csv';
                break;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const getVariantColor = (variant: string) => {
        switch (variant) {
            case 'Original': return 'bg-gray-500/20 text-gray-400';
            case 'Urgency': return 'bg-red-500/20 text-red-400';
            case 'Emotional': return 'bg-pink-500/20 text-pink-400';
            case 'Question': return 'bg-blue-500/20 text-blue-400';
            case 'Number': return 'bg-green-500/20 text-green-400';
            case 'Social Proof': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-purple-500/20 text-purple-400';
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Shuffle size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Dynamic Creative</h1>
                            <p className="text-xs text-white/50">Tạo biến thể A/B testing tự động</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold">
                            🔥 PRO FEATURE
                        </span>
                        <button
                            onClick={() => window.location.href = '/app/creative'}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {!campaign ? (
                    <div className="text-center py-20">
                        <Shuffle size={64} className="mx-auto mb-6 text-white/20" />
                        <h2 className="text-2xl font-bold mb-4">Chưa có dữ liệu chiến dịch</h2>
                        <p className="text-white/60 mb-8">Vui lòng hoàn thành Campaign Architect trước</p>
                        <button
                            onClick={() => window.location.href = '/app/campaign'}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold"
                        >
                            Đến Campaign Architect
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Generate Button */}
                        {headlines.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                                    <Sparkles size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-4">Tạo biến thể Dynamic Creative</h2>
                                <p className="text-white/60 mb-8 max-w-md mx-auto">
                                    AI sẽ tạo 5+ biến thể headline và 3+ biến thể description để A/B test hiệu quả nhất
                                </p>
                                <button
                                    onClick={generateVariations}
                                    disabled={isGenerating}
                                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <Shuffle size={24} />
                                            Tạo biến thể
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {headlines.length > 0 && (
                            <>
                                {/* Variations Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Headlines */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <Zap className="text-yellow-400" size={18} />
                                            Headlines ({headlines.filter(h => h.selected).length}/{headlines.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {headlines.map(h => (
                                                <div
                                                    key={h.id}
                                                    onClick={() => toggleVariation(h.id, 'headline')}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all ${h.selected
                                                            ? 'bg-cyan-500/10 border border-cyan-500/30'
                                                            : 'bg-black/30 border border-white/10 opacity-50'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <span className={`text-xs px-2 py-1 rounded-md ${getVariantColor(h.variant)}`}>
                                                                {h.variant}
                                                            </span>
                                                            <p className="mt-2 font-medium">{h.text}</p>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${h.selected ? 'bg-cyan-500' : 'bg-white/10'
                                                            }`}>
                                                            {h.selected && <Check size={14} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Descriptions */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <FileText className="text-blue-400" size={18} />
                                            Descriptions ({descriptions.filter(d => d.selected).length}/{descriptions.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {descriptions.map(d => (
                                                <div
                                                    key={d.id}
                                                    onClick={() => toggleVariation(d.id, 'description')}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all ${d.selected
                                                            ? 'bg-blue-500/10 border border-blue-500/30'
                                                            : 'bg-black/30 border border-white/10 opacity-50'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <span className={`text-xs px-2 py-1 rounded-md ${getVariantColor(d.variant)}`}>
                                                                {d.variant}
                                                            </span>
                                                            <p className="mt-2 text-sm text-white/80">{d.text}</p>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${d.selected ? 'bg-blue-500' : 'bg-white/10'
                                                            }`}>
                                                            {d.selected && <Check size={14} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Combinations Matrix */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <Grid className="text-purple-400" size={18} />
                                                A/B Testing Matrix ({selectedCombos.size}/{combinations.length} combinations)
                                            </h3>
                                            <p className="text-sm text-white/50 mt-1">
                                                Chọn các combination để export
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={selectAllCombos} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
                                                Chọn tất cả
                                            </button>
                                            <button onClick={deselectAllCombos} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
                                                Bỏ chọn
                                            </button>
                                            <button
                                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"
                                            >
                                                {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={viewMode === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                        : 'space-y-3'
                                    }>
                                        {combinations.map(combo => (
                                            <motion.div
                                                key={combo.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => toggleCombo(combo.id)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all ${selectedCombos.has(combo.id)
                                                        ? 'bg-purple-500/10 border border-purple-500/30'
                                                        : 'bg-black/30 border border-white/10 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex gap-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${getVariantColor(combo.headlineVariant)}`}>
                                                            {combo.headlineVariant}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${getVariantColor(combo.descriptionVariant)}`}>
                                                            {combo.descriptionVariant}
                                                        </span>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedCombos.has(combo.id) ? 'bg-purple-500' : 'bg-white/10'
                                                        }`}>
                                                        {selectedCombos.has(combo.id) && <Check size={12} />}
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-sm mb-1 line-clamp-2">{combo.headline}</p>
                                                <p className="text-xs text-white/60 line-clamp-2">{combo.description}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Export Section */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-6">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Download className="text-green-400" size={18} />
                                        Export CSV cho Bulk Upload
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        <span className="text-sm text-white/60">Chọn nền tảng:</span>
                                        {[
                                            { id: 'facebook', icon: Facebook, label: 'Facebook Ads' },
                                            { id: 'google', icon: GoogleIcon, label: 'Google Ads' },
                                            { id: 'tiktok', icon: TikTokIcon, label: 'TikTok Ads' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setExportPlatform(p.id as any)}
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${exportPlatform === p.id
                                                        ? 'bg-white/20 border border-white/30'
                                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <p.icon size={16} />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-white/60">
                                            {selectedCombos.size} combinations sẽ được export
                                        </p>
                                        <button
                                            onClick={exportToCSV}
                                            disabled={selectedCombos.size === 0}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            <Download size={18} />
                                            Download CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Regenerate */}
                                <div className="text-center mt-8">
                                    <button
                                        onClick={generateVariations}
                                        disabled={isGenerating}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm flex items-center gap-2 mx-auto"
                                    >
                                        <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                                        Tạo lại biến thể
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
