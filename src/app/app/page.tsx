'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Link2, Brain, Target, Palette, Rocket,
    ChevronRight, ChevronLeft, Check, Upload,
    Zap, Image as ImageIcon, Video, Send, CreditCard, Loader2,
    Star, MessageSquare, AlertCircle, Type
} from 'lucide-react';


const MODULES = [
    { id: 1, name: 'Nhập liệu', icon: Link2, color: '#00d4ff' },
    { id: 2, name: 'Brand DNA', icon: Brain, color: '#a855f7' },
    { id: 3, name: 'Chiến lược', icon: Target, color: '#f97316' },
    { id: 4, name: 'Sáng tạo', icon: Palette, color: '#22c55e' },
    { id: 5, name: 'Triển khai', icon: Rocket, color: '#ef4444' },
];

export default function MarketingWorkflow() {
    const [currentModule, setCurrentModule] = useState(1);
    const [completedModules, setCompletedModules] = useState<number[]>([]);
    const [credits, setCredits] = useState(125);
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [productData, setProductData] = useState<any>(null);
    const [brandDNA, setBrandDNA] = useState<any>({
        slogan: '',
        mission: '',
        values: [],
        toneOfVoice: [],
        brandColors: ['#00d4ff', '#a855f7', '#f97316'],
        logo: null,
        fonts: [],
        aesthetics: [],
        painPoints: []
    });

    const goToModule = (moduleId: number) => {
        if (moduleId >= 1 && moduleId <= 5 && moduleId <= Math.max(...completedModules, 0) + 1) {
            setCurrentModule(moduleId);
        }
    };

    const completeModule = () => {
        if (!completedModules.includes(currentModule)) {
            setCompletedModules(prev => [...prev, currentModule]);
        }
        if (currentModule < 5) {
            setCurrentModule(currentModule + 1);
        }
    };

    // Actual URL analysis function
    const analyzeUrl = async () => {
        if (!url.trim()) {
            setAnalysisError('Vui lòng nhập URL sản phẩm');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError('');

        try {
            const response = await fetch('/api/ai/analyze-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });

            if (!response.ok) {
                throw new Error('Không thể phân tích URL. Vui lòng thử lại.');
            }

            const data = await response.json();
            setProductData(data);

            // Auto-fill Brand DNA from analysis
            if (data.brandDNA) {
                setBrandDNA({
                    slogan: data.brandDNA.slogan || data.productName || 'Không tìm thấy Slogan',
                    mission: data.brandDNA.mission || data.description || '',
                    values: data.brandDNA.values || [],
                    toneOfVoice: data.brandDNA.toneOfVoice || [],
                    aesthetics: data.brandDNA.aesthetics || [],
                    brandColors: data.brandDNA.brandColors || ['#000000', '#ffffff'],
                    logo: data.brandDNA.logo || data.images?.find((img: any) => typeof img === 'string' && img.toLowerCase().includes('logo')) || null,
                    fonts: data.brandDNA.fonts || [],
                    painPoints: data.brandDNA.painPoints || []
                });
            } else {
                setBrandDNA({
                    slogan: data.productName || 'Chưa có Slogan',
                    mission: data.description || '',
                    values: ['Chất lượng', 'Uy tín', 'Tận tâm'],
                    toneOfVoice: ['Chuyên nghiệp'],
                    brandColors: ['#00d4ff', '#a855f7'],
                    logo: null,
                    fonts: ['Inter', 'Arial'],
                    aesthetics: ['Hiện đại'],
                    painPoints: []
                });
            }

            completeModule();
        } catch (error: any) {
            setAnalysisError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#121218] text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-lg sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-cyan-400" size={24} />
                    <span className="text-xl font-bold text-cyan-400">KODAFLOW</span>
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded text-white">Marketing</span>
                </div>

                {/* Progress */}
                <nav className="flex items-center">
                    {MODULES.map((module, index) => {
                        const isActive = currentModule === module.id;
                        const isCompleted = completedModules.includes(module.id);
                        const Icon = module.icon;
                        return (
                            <React.Fragment key={module.id}>
                                {index > 0 && <div className={`w-6 h-0.5 ${isCompleted || isActive ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/10'}`} />}
                                <button
                                    onClick={() => goToModule(module.id)}
                                    className="flex flex-col items-center gap-1 px-2"
                                    style={{ opacity: module.id <= Math.max(...completedModules, 0) + 1 ? 1 : 0.4 }}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${isActive ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/30' :
                                            isCompleted ? 'border-green-500 bg-green-500 text-white' :
                                                'border-white/20 bg-white/5 text-white/50'
                                            }`}
                                    >
                                        {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                                    </div>
                                    <span className={`text-[10px] ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-white/40'}`}>
                                        {module.name}
                                    </span>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </nav>

                {/* Credits */}
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <CreditCard size={16} className="text-purple-400" />
                    <span className="font-bold text-cyan-400">{credits}</span>
                    <span className="text-xs text-white/50">Credits</span>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentModule}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Module 1 */}
                        {currentModule === 1 && (
                            <div className="text-center py-8">
                                <h1 className="text-3xl font-bold mb-2">🔗 Nhập URL sản phẩm</h1>
                                <p className="text-white/60 mb-8">Nhập URL để AI tự động phân tích thương hiệu</p>

                                <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-2">
                                        <Link2 className="text-white/40 ml-3" size={20} />
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://shopee.vn/san-pham..."
                                            className="flex-1 bg-transparent border-none text-white py-3 focus:outline-none"
                                            disabled={isAnalyzing}
                                        />
                                        <button
                                            onClick={analyzeUrl}
                                            disabled={isAnalyzing}
                                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Đang phân tích...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap size={18} />
                                                    Phân tích
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {analysisError && (
                                        <p className="text-red-400 text-sm mt-3">{analysisError}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 justify-center my-8 text-white/30">
                                    <div className="h-px flex-1 bg-white/10 max-w-32" />
                                    <span>hoặc</span>
                                    <div className="h-px flex-1 bg-white/10 max-w-32" />
                                </div>

                                <button onClick={completeModule} className="px-6 py-3 border border-white/20 rounded-xl text-white/60 hover:border-cyan-500 hover:text-cyan-400 transition-all">
                                    Bỏ qua, tạo DNA thủ công →
                                </button>
                            </div>
                        )}

                        {/* Module 2: Brand DNA */}
                        {currentModule === 2 && (
                            <div className="py-8 max-w-5xl mx-auto">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                        🧬 Brand DNA
                                    </h1>
                                    <p className="text-white/60">Hồ sơ thương hiệu của bạn (Có thể chỉnh sửa)</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Left Column: Strategy & Text */}
                                    <div className="lg:col-span-7 space-y-6">
                                        {/* Slogan */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-purple-400 mb-2">
                                                <Zap size={16} /> Tagline / Slogan
                                            </label>
                                            <input
                                                type="text"
                                                value={brandDNA.slogan}
                                                onChange={(e) => setBrandDNA({ ...brandDNA, slogan: e.target.value })}
                                                placeholder="Nhập slogan thương hiệu..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium text-white focus:border-purple-500 focus:outline-none placeholder:text-white/20"
                                            />
                                        </div>

                                        {/* Business Overview */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-2">
                                                <Target size={16} /> Tổng quan doanh nghiệp
                                            </label>
                                            <textarea
                                                value={brandDNA.mission || productData?.description || ''}
                                                onChange={(e) => setBrandDNA({ ...brandDNA, mission: e.target.value })}
                                                rows={3}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:border-blue-500 focus:outline-none"
                                                placeholder="Mô tả ngắn gọn về doanh nghiệp..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Brand Values */}
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-3">
                                                    <Star size={16} /> Giá trị cốt lõi
                                                </label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {brandDNA.values?.map((val: string, idx: number) => (
                                                        <span key={idx} className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                                                            {val}
                                                            <button onClick={() => {
                                                                const newVals = [...(brandDNA.values || [])];
                                                                newVals.splice(idx, 1);
                                                                setBrandDNA({ ...brandDNA, values: newVals });
                                                            }} className="hover:text-white">×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="+ Thêm giá trị (Enter)"
                                                    className="w-full bg-black/40 border-none text-sm text-white focus:ring-0 px-3 py-2 rounded-lg"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const val = e.currentTarget.value.trim();
                                                            if (val) {
                                                                setBrandDNA({ ...brandDNA, values: [...(brandDNA.values || []), val] });
                                                                e.currentTarget.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* Tone of Voice */}
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-pink-400 mb-3">
                                                    <MessageSquare size={16} /> Tone & Mood
                                                </label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {brandDNA.toneOfVoice?.map((val: string, idx: number) => (
                                                        <span key={idx} className="bg-pink-500/10 text-pink-300 border border-pink-500/20 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                                                            {val}
                                                            <button onClick={() => {
                                                                const newVals = [...(brandDNA.toneOfVoice || [])];
                                                                newVals.splice(idx, 1);
                                                                setBrandDNA({ ...brandDNA, toneOfVoice: newVals });
                                                            }} className="hover:text-white">×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="+ Thêm tone (Enter)"
                                                    className="w-full bg-black/40 border-none text-sm text-white focus:ring-0 px-3 py-2 rounded-lg"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const val = e.currentTarget.value.trim();
                                                            if (val) {
                                                                setBrandDNA({ ...brandDNA, toneOfVoice: [...(brandDNA.toneOfVoice || []), val] });
                                                                e.currentTarget.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Visuals & Assets */}
                                    <div className="lg:col-span-5 space-y-6">
                                        {/* Colors */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <label className="block text-sm font-semibold text-white/60 mb-3">Bảng màu (Brand Colors)</label>
                                            <div className="flex flex-wrap gap-3">
                                                {(brandDNA.brandColors || ['#000000', '#ffffff']).map((color: string, idx: number) => (
                                                    <div key={idx} className="relative group">
                                                        <input
                                                            type="color"
                                                            value={color}
                                                            onChange={(e) => {
                                                                const newColors = [...(brandDNA.brandColors || [])];
                                                                newColors[idx] = e.target.value;
                                                                setBrandDNA({ ...brandDNA, brandColors: newColors });
                                                            }}
                                                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white/20 p-0 overflow-hidden"
                                                        />
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => setBrandDNA({ ...brandDNA, brandColors: [...(brandDNA.brandColors || []), '#888888'] })}
                                                    className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fonts */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-yellow-400 mb-2">
                                                <Type size={16} /> Typography / Fonts
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {brandDNA.fonts?.map((font: string, idx: number) => (
                                                    <span key={idx} className="bg-yellow-500/10 text-yellow-200 border border-yellow-500/20 text-xs px-2 py-1 rounded-lg">
                                                        {font}
                                                    </span>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên font (VD: Inter, Roboto)..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-yellow-500 focus:outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value.trim();
                                                        if (val) {
                                                            setBrandDNA({ ...brandDNA, fonts: [...(brandDNA.fonts || []), val] });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Images Gallery */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-green-400">
                                                    <ImageIcon size={16} /> Hình ảnh / Logo
                                                </label>
                                                <button className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                                                    <Upload size={12} /> Upload
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                {/* Logo placeholder if detected */}
                                                {brandDNA.logo && (
                                                    <div className="aspect-square bg-white rounded-lg p-2 flex items-center justify-center relative border-2 border-green-500/50">
                                                        <img src={brandDNA.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                        <div className="absolute top-1 right-1 bg-green-500 text-black text-[8px] font-bold px-1 rounded">LOGO</div>
                                                    </div>
                                                )}

                                                {/* Product Images */}
                                                {(productData?.images || []).map((img: string, idx: number) => (
                                                    <div key={idx} className="aspect-square bg-black/50 rounded-lg overflow-hidden border border-white/10 relative group">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}

                                                {/* Fallback empty slots */}
                                                {(!productData?.images?.length && !brandDNA.logo) && (
                                                    <div className="col-span-3 text-center py-4 text-white/20 text-xs italic">
                                                        Chưa tìm thấy ảnh. Hãy upload thủ công.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button onClick={completeModule} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-600/20 transition-all border border-white/10">
                                        Xác nhận Brand DNA & Tiếp tục →
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* Module 3 */}
                        {currentModule === 3 && (
                            <div className="py-8">
                                <h1 className="text-3xl font-bold text-center mb-2">🎯 Chiến lược</h1>
                                <p className="text-white/60 text-center mb-8">AI đề xuất 3 góc tấn công</p>

                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <h3 className="text-orange-400 font-semibold mb-2">Góc tấn công {i}</h3>
                                            <p className="text-sm text-white/50 mb-4">Mô tả chiến lược #{i}</p>
                                            <div className="bg-black/30 rounded-lg p-3">
                                                <p className="font-medium text-sm">📢 Headline mẫu</p>
                                                <p className="text-xs text-white/50 mt-1">Mô tả ngắn gọn</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={completeModule} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold">
                                    Duyệt chiến lược →
                                </button>
                            </div>
                        )}

                        {/* Module 4 */}
                        {currentModule === 4 && (
                            <div className="py-8">
                                <h1 className="text-3xl font-bold text-center mb-2">🎨 Creative Studio</h1>
                                <p className="text-white/60 text-center mb-8">Tạo Banner và Video Shorts</p>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-green-500 transition-all cursor-pointer">
                                        <ImageIcon size={40} className="mx-auto mb-4 text-white/40" />
                                        <h3 className="font-semibold mb-2">Banner Editor</h3>
                                        <p className="text-sm text-white/50 mb-4">Chỉnh sửa với Fabric.js</p>
                                        <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs">Coming Soon</span>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                        <Video size={40} className="mx-auto mb-4 text-white/40" />
                                        <h3 className="font-semibold mb-2">Video Shorts</h3>
                                        <p className="text-sm text-white/50 mb-4">Tạo video AI tự động</p>
                                        <div className="space-y-2">
                                            <button className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                                🎬 FREE (3/tháng)
                                            </button>
                                            <button
                                                onClick={() => setCredits(c => c - 3)}
                                                className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-sm"
                                            >
                                                ⚡ AI Video (3 credits)
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={completeModule} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold">
                                    Xem thành phẩm →
                                </button>
                            </div>
                        )}

                        {/* Module 5 */}
                        {currentModule === 5 && (
                            <div className="py-8">
                                <h1 className="text-3xl font-bold text-center mb-2">🚀 Triển khai</h1>
                                <p className="text-white/60 text-center mb-8">Đẩy chiến dịch lên các nền tảng</p>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { name: 'Google Ads', icon: '🔍', type: 'Performance Max' },
                                        { name: 'Facebook/IG', icon: '📘', type: 'Reels & Stories' },
                                        { name: 'TikTok', icon: '🎵', type: 'Spark Ads' }
                                    ].map(ch => (
                                        <div key={ch.name} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                            <span className="text-3xl">{ch.icon}</span>
                                            <h3 className="font-semibold mt-3 mb-1">{ch.name}</h3>
                                            <span className="text-xs text-white/40">{ch.type}</span>
                                            <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-all">
                                                Kết nối
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={completeModule} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2">
                                    <Send size={20} />
                                    Triển khai chiến dịch
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-lg border-t border-white/5">
                <button
                    onClick={() => goToModule(currentModule - 1)}
                    disabled={currentModule === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                >
                    <ChevronLeft size={18} />
                    Quay lại
                </button>

                <span className="text-sm text-white/40">Module {currentModule} / 5</span>

                <button
                    onClick={completeModule}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                    {currentModule === 5 ? 'Hoàn tất' : 'Tiếp tục'}
                    <ChevronRight size={18} />
                </button>
            </footer>
        </main>
    );
}
