'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Link2, Brain, Target, Palette, Image as ImageIcon,
    Zap, Users, Shield, Eye, Upload, RefreshCw, ChevronRight,
    Check, X, Plus, Trash2, Star, MessageSquare, Loader2,
    Building2, Lightbulb, Crosshair, TrendingUp, AlertTriangle
} from 'lucide-react';

// ==================== TYPES ====================

interface BrandDNA {
    brandName: string;
    taglineSuggestions: string[];
    selectedTagline: string;
    coreValues: string[];
    brandAesthetic: string[];
    brandColors: string[];
    typography: { heading: string; body: string };
    businessSummary: string;
    toneOfVoice: string[];
    targetAudience: string;
    painPoints: string[];
    uniqueSellingPoints: string[];
    industryCategory: string;
}

interface ScrapedAsset {
    url: string;
    type: 'product' | 'lifestyle' | 'studio' | 'branding' | 'unknown';
    alt?: string;
    isSelected?: boolean;
}

interface Competitor {
    name: string;
    url: string;
    logoUrl?: string;
    productsServices: string;
    marketingAngle: string;
    targetAudience: string;
    strengths: string[];
    weaknesses: string[];
    attackAngle: string;
    opportunityScore: number;
}

type Step = 'input' | 'analyzing' | 'identity' | 'assets' | 'competitors' | 'complete';

// ==================== MAIN COMPONENT ====================

export default function BrandDNAPage() {
    // State
    const [step, setStep] = useState<Step>('input');
    const [url, setUrl] = useState('');
    const [textInput, setTextInput] = useState('');
    const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [brandDNA, setBrandDNA] = useState<BrandDNA>({
        brandName: '',
        taglineSuggestions: [],
        selectedTagline: '',
        coreValues: [],
        brandAesthetic: [],
        brandColors: ['#00d4ff', '#a855f7', '#f97316', '#22c55e', '#ef4444'],
        typography: { heading: 'Inter', body: 'Inter' },
        businessSummary: '',
        toneOfVoice: [],
        targetAudience: '',
        painPoints: [],
        uniqueSellingPoints: [],
        industryCategory: ''
    });

    const [assets, setAssets] = useState<ScrapedAsset[]>([]);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [competitorsLoading, setCompetitorsLoading] = useState(false);

    // ==================== HANDLERS ====================

    const handleAnalyze = async () => {
        if (inputMode === 'url' && !url.trim()) {
            setError('Vui lòng nhập URL');
            return;
        }
        if (inputMode === 'text' && !textInput.trim()) {
            setError('Vui lòng nhập mô tả doanh nghiệp');
            return;
        }

        setIsLoading(true);
        setError('');
        setStep('analyzing');

        try {
            const response = await fetch('/api/dna/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: inputMode === 'url' ? url.trim() : null,
                    textInput: inputMode === 'text' ? textInput.trim() : null
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Phân tích thất bại');
            }

            // Populate state from API response
            const dna = result.data.brandDNA;
            setBrandDNA({
                brandName: dna.brandName || '',
                taglineSuggestions: dna.taglineSuggestions || [],
                selectedTagline: dna.taglineSuggestions?.[0] || '',
                coreValues: dna.coreValues || [],
                brandAesthetic: dna.brandAesthetic || [],
                brandColors: dna.brandColors || ['#00d4ff', '#a855f7', '#f97316'],
                typography: dna.typography || { heading: 'Inter', body: 'Inter' },
                businessSummary: dna.businessSummary || '',
                toneOfVoice: dna.toneOfVoice || [],
                targetAudience: dna.targetAudience || '',
                painPoints: dna.painPoints || [],
                uniqueSellingPoints: dna.uniqueSellingPoints || [],
                industryCategory: dna.industryCategory || ''
            });

            setAssets(result.data.assets.map((a: ScrapedAsset) => ({ ...a, isSelected: false })));
            setStep('identity');

        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
            setStep('input');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadCompetitors = async () => {
        setCompetitorsLoading(true);
        try {
            const response = await fetch('/api/dna/competitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName: brandDNA.brandName,
                    industryCategory: brandDNA.industryCategory,
                    businessSummary: brandDNA.businessSummary
                })
            });

            const result = await response.json();
            if (result.success) {
                setCompetitors(result.data.competitors);
            }
        } catch (err) {
            console.error('Failed to load competitors:', err);
        } finally {
            setCompetitorsLoading(false);
        }
    };

    const addTag = (field: 'coreValues' | 'brandAesthetic' | 'toneOfVoice' | 'painPoints' | 'uniqueSellingPoints', value: string) => {
        if (value.trim() && !brandDNA[field].includes(value.trim())) {
            setBrandDNA(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
        }
    };

    const removeTag = (field: 'coreValues' | 'brandAesthetic' | 'toneOfVoice' | 'painPoints' | 'uniqueSellingPoints', index: number) => {
        setBrandDNA(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const toggleAssetSelection = (index: number) => {
        setAssets(prev => prev.map((asset, i) =>
            i === index ? { ...asset, isSelected: !asset.isSelected } : asset
        ));
    };

    // ==================== RENDER ====================

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Brand DNA & Intelligence</h1>
                            <p className="text-xs text-white/50">Powered by KODAFLOW AI</p>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2">
                        {['Input', 'Identity', 'Assets', 'Competitors'].map((label, i) => {
                            const stepMap: Step[] = ['input', 'identity', 'assets', 'competitors'];
                            const isActive = step === stepMap[i] || step === 'analyzing';
                            const isPast = stepMap.indexOf(step as Step) > i;
                            return (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isPast ? 'bg-green-500 text-white' :
                                        isActive ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' :
                                            'bg-white/10 text-white/40'
                                        }`}>
                                        {isPast ? <Check size={14} /> : i + 1}
                                    </div>
                                    {i < 3 && <div className={`w-8 h-0.5 ${isPast ? 'bg-green-500' : 'bg-white/10'}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ==================== STEP: INPUT ==================== */}
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                    Khám phá DNA Thương Hiệu
                                </h2>
                                <p className="text-white/60">
                                    AI sẽ phân tích sâu và trích xuất bản sắc thương hiệu của bạn
                                </p>
                            </div>

                            {/* Input Mode Tabs */}
                            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setInputMode('url')}
                                    className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${inputMode === 'url'
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    <Link2 size={18} /> Nhập URL
                                </button>
                                <button
                                    onClick={() => setInputMode('text')}
                                    className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${inputMode === 'text'
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    <MessageSquare size={18} /> Mô tả thủ công
                                </button>
                            </div>

                            {/* Input Fields */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                                {inputMode === 'url' ? (
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">
                                            Website / Shopee / Lazada / Fanpage
                                        </label>
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-lg focus:border-cyan-500 focus:outline-none placeholder:text-white/20"
                                        />
                                        <p className="text-xs text-white/40 mt-2">
                                            AI sẽ quét các trang /about, /products, /contact để phân tích sâu
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">
                                            Mô tả doanh nghiệp của bạn
                                        </label>
                                        <textarea
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder="VD: Chúng tôi là công ty chuyên cung cấp giải pháp marketing AI cho doanh nghiệp vừa và nhỏ tại Việt Nam..."
                                            rows={5}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:border-cyan-500 focus:outline-none placeholder:text-white/20 resize-none"
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Đang phân tích...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Phân tích Brand DNA
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== STEP: ANALYZING ==================== */}
                    {step === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-6 animate-pulse">
                                <Brain size={40} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Đang quét & phân tích...</h2>
                            <p className="text-white/60 mb-8">AI đang trích xuất DNA thương hiệu của bạn</p>
                            <div className="flex gap-8 text-sm text-white/40">
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> Quét website
                                </span>
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> Phân tích nội dung
                                </span>
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> Trích xuất màu sắc
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== STEP: IDENTITY ==================== */}
                    {step === 'identity' && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Building2 className="text-cyan-400" />
                                        Business Identity
                                    </h2>
                                    <p className="text-white/60 text-sm">Chỉnh sửa và hoàn thiện DNA thương hiệu</p>
                                </div>
                                <button
                                    onClick={() => { setStep('input'); }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                                >
                                    <RefreshCw size={14} /> Tái thiết DNA
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Column 1: Core Info */}
                                <div className="space-y-4">
                                    {/* Brand Name */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-3">
                                            <Sparkles size={14} /> Tên Thương Hiệu
                                        </label>
                                        <input
                                            type="text"
                                            value={brandDNA.brandName}
                                            onChange={(e) => setBrandDNA(prev => ({ ...prev, brandName: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold focus:border-cyan-500 focus:outline-none"
                                        />
                                    </div>

                                    {/* Tagline Selection */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-purple-400 mb-3">
                                            <Lightbulb size={14} /> Tagline (Chọn hoặc sửa)
                                        </label>
                                        <div className="space-y-2 mb-3">
                                            {brandDNA.taglineSuggestions.map((tag, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setBrandDNA(prev => ({ ...prev, selectedTagline: tag }))}
                                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${brandDNA.selectedTagline === tag
                                                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                                                        : 'bg-black/20 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    "{tag}"
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            value={brandDNA.selectedTagline}
                                            onChange={(e) => setBrandDNA(prev => ({ ...prev, selectedTagline: e.target.value }))}
                                            placeholder="Hoặc nhập tagline của bạn..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    {/* Industry */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-yellow-400 mb-3">
                                            <Target size={14} /> Ngành hàng
                                        </label>
                                        <input
                                            type="text"
                                            value={brandDNA.industryCategory}
                                            onChange={(e) => setBrandDNA(prev => ({ ...prev, industryCategory: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-yellow-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Column 2: Strategic */}
                                <div className="space-y-4">
                                    {/* Business Summary */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3">
                                            <Building2 size={14} /> Tổng quan doanh nghiệp
                                        </label>
                                        <textarea
                                            value={brandDNA.businessSummary}
                                            onChange={(e) => setBrandDNA(prev => ({ ...prev, businessSummary: e.target.value }))}
                                            rows={4}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Core Values */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-green-400 mb-3">
                                            <Star size={14} /> Giá trị cốt lõi
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {brandDNA.coreValues.map((val, i) => (
                                                <span key={i} className="bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                                                    {val}
                                                    <button onClick={() => removeTag('coreValues', i)} className="hover:text-white ml-1">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="+ Thêm giá trị (Enter)"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addTag('coreValues', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Tone of Voice */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-pink-400 mb-3">
                                            <MessageSquare size={14} /> Tone of Voice
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {brandDNA.toneOfVoice.map((val, i) => (
                                                <span key={i} className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                                                    {val}
                                                    <button onClick={() => removeTag('toneOfVoice', i)} className="hover:text-white ml-1">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="+ Thêm tone (Enter)"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addTag('toneOfVoice', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Column 3: Visual */}
                                <div className="space-y-4">
                                    {/* Brand Colors */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-orange-400 mb-3">
                                            <Palette size={14} /> Brand Colors
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {brandDNA.brandColors.map((color, i) => (
                                                <div key={i} className="relative group">
                                                    <input
                                                        type="color"
                                                        value={color}
                                                        onChange={(e) => {
                                                            const newColors = [...brandDNA.brandColors];
                                                            newColors[i] = e.target.value;
                                                            setBrandDNA(prev => ({ ...prev, brandColors: newColors }));
                                                        }}
                                                        className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white/20"
                                                    />
                                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white/50">
                                                        {color}
                                                    </span>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setBrandDNA(prev => ({ ...prev, brandColors: [...prev.brandColors, '#888888'] }))}
                                                className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Typography */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-3">
                                            Typography
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-white/40">Heading</span>
                                                <input
                                                    type="text"
                                                    value={brandDNA.typography.heading}
                                                    onChange={(e) => setBrandDNA(prev => ({ ...prev, typography: { ...prev.typography, heading: e.target.value } }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs text-white/40">Body</span>
                                                <input
                                                    type="text"
                                                    value={brandDNA.typography.body}
                                                    onChange={(e) => setBrandDNA(prev => ({ ...prev, typography: { ...prev.typography, body: e.target.value } }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brand Aesthetic */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-indigo-400 mb-3">
                                            <Eye size={14} /> Brand Aesthetic
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {brandDNA.brandAesthetic.map((val, i) => (
                                                <span key={i} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                                                    {val}
                                                    <button onClick={() => removeTag('brandAesthetic', i)} className="hover:text-white ml-1">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="+ Thêm style (Enter)"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addTag('brandAesthetic', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setStep('assets')}
                                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                                >
                                    Tiếp theo: Visual Assets <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== STEP: ASSETS ==================== */}
                    {step === 'assets' && (
                        <motion.div
                            key="assets"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <ImageIcon className="text-green-400" />
                                        Visual Asset Hub
                                    </h2>
                                    <p className="text-white/60 text-sm">Chọn ảnh nguyên liệu cho chiến dịch (tối đa 10)</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
                                        <Upload size={14} /> Upload
                                    </button>
                                    <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg text-sm flex items-center gap-2">
                                        <Sparkles size={14} /> AI Generate
                                    </button>
                                </div>
                            </div>

                            {/* Asset Grid */}
                            {assets.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {assets.map((asset, i) => (
                                        <div
                                            key={i}
                                            onClick={() => toggleAssetSelection(i)}
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${asset.isSelected
                                                ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            <img src={asset.url} alt={asset.alt || ''} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${asset.isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                                <Check className="text-cyan-400" size={32} />
                                            </div>
                                            <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded ${asset.type === 'product' ? 'bg-blue-500' :
                                                asset.type === 'branding' ? 'bg-purple-500' :
                                                    asset.type === 'lifestyle' ? 'bg-green-500' : 'bg-gray-500'
                                                }`}>
                                                {asset.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
                                    <ImageIcon className="mx-auto text-white/20 mb-4" size={48} />
                                    <p className="text-white/40">Không tìm thấy ảnh phù hợp từ URL</p>
                                    <button className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-sm">
                                        Upload từ máy tính
                                    </button>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setStep('identity')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                                >
                                    ← Quay lại
                                </button>
                                <button
                                    onClick={() => { setStep('competitors'); handleLoadCompetitors(); }}
                                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                                >
                                    Tiếp theo: Competitor SpyWar <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== STEP: COMPETITORS ==================== */}
                    {step === 'competitors' && (
                        <motion.div
                            key="competitors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Crosshair className="text-red-400" />
                                        Competitor SpyWar
                                    </h2>
                                    <p className="text-white/60 text-sm">Phân tích đối thủ và tìm góc tấn công</p>
                                </div>
                                <button
                                    onClick={handleLoadCompetitors}
                                    disabled={competitorsLoading}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                                >
                                    <RefreshCw size={14} className={competitorsLoading ? 'animate-spin' : ''} />
                                    Phân tích lại
                                </button>
                            </div>

                            {competitorsLoading ? (
                                <div className="text-center py-20">
                                    <Loader2 className="mx-auto animate-spin text-cyan-400 mb-4" size={48} />
                                    <p className="text-white/60">Đang phân tích đối thủ cạnh tranh...</p>
                                </div>
                            ) : competitors.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {competitors.map((comp, i) => (
                                        <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                                            <div className="p-5 border-b border-white/10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold">
                                                        {comp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">{comp.name}</h3>
                                                        <a href={comp.url} target="_blank" className="text-xs text-cyan-400 hover:underline">{comp.url}</a>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs bg-white/10 px-2 py-1 rounded">Cơ hội: {comp.opportunityScore}/10</span>
                                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500" style={{ width: `${comp.opportunityScore * 10}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <h4 className="text-xs text-green-400 font-semibold mb-1 flex items-center gap-1">
                                                        <TrendingUp size={12} /> Điểm mạnh
                                                    </h4>
                                                    <ul className="text-sm text-white/70 space-y-1">
                                                        {comp.strengths.map((s, j) => (
                                                            <li key={j} className="flex items-start gap-2">
                                                                <Check size={12} className="text-green-400 mt-1 flex-shrink-0" />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs text-red-400 font-semibold mb-1 flex items-center gap-1">
                                                        <AlertTriangle size={12} /> Điểm yếu
                                                    </h4>
                                                    <ul className="text-sm text-white/70 space-y-1">
                                                        {comp.weaknesses.map((w, j) => (
                                                            <li key={j} className="flex items-start gap-2">
                                                                <X size={12} className="text-red-400 mt-1 flex-shrink-0" />
                                                                {w}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
                                                    <h4 className="text-xs text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                                        <Crosshair size={12} /> GÓC TẤN CÔNG
                                                    </h4>
                                                    <p className="text-sm font-medium">{comp.attackAngle}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
                                    <Users className="mx-auto text-white/20 mb-4" size={48} />
                                    <p className="text-white/40">Chưa có dữ liệu đối thủ</p>
                                    <button onClick={handleLoadCompetitors} className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-sm">
                                        Phân tích ngay
                                    </button>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setStep('assets')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold flex items-center gap-2"
                                >
                                    ← Quay lại
                                </button>
                                <button
                                    onClick={() => setStep('complete')}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                                >
                                    Hoàn tất Brand DNA <Check size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ==================== STEP: COMPLETE ==================== */}
                    {step === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                                <Check size={48} />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Brand DNA Hoàn Tất!</h2>
                            <p className="text-white/60 mb-8">Bạn đã sẵn sàng tạo chiến dịch marketing với AI</p>

                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 max-w-2xl mx-auto mb-8">
                                <h3 className="font-bold text-xl mb-4">{brandDNA.brandName}</h3>
                                <p className="text-lg text-cyan-400 italic mb-4">"{brandDNA.selectedTagline}"</p>
                                <div className="flex justify-center gap-2 mb-4">
                                    {brandDNA.brandColors.slice(0, 5).map((c, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {brandDNA.coreValues.slice(0, 5).map((v, i) => (
                                        <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-sm">{v}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setStep('identity')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold"
                                >
                                    Chỉnh sửa DNA
                                </button>
                                <button
                                    onClick={() => {
                                        // Save Brand DNA to localStorage for Campaign Architect
                                        localStorage.setItem('kodaflow_brand_dna', JSON.stringify(brandDNA));
                                        localStorage.setItem('kodaflow_competitors', JSON.stringify(competitors));
                                        localStorage.setItem('kodaflow_assets', JSON.stringify(assets.filter(a => a.isSelected)));
                                        // Navigate to Campaign Architect
                                        window.location.href = '/app/campaign';
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                                >
                                    🎯 Tiếp: Campaign Architect →
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
