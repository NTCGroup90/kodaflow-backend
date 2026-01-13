'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Link2, Brain, Target, Palette, Rocket,
    ChevronRight, ChevronLeft, Check, Upload,
    Zap, Image as ImageIcon, Video, Send, CreditCard, Loader2,
    Star, MessageSquare, AlertCircle
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
    const [brandDNA, setBrandDNA] = useState({
        slogan: '',
        primaryColor: '#00d4ff',
        secondaryColor: '#a855f7',
        accentColor: '#f97316',
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
                    slogan: data.brandDNA.slogan || data.productName || '',
                    primaryColor: data.brandDNA.brandColors?.[0] || '#00d4ff',
                    secondaryColor: data.brandDNA.brandColors?.[1] || '#a855f7',
                    accentColor: data.brandDNA.brandColors?.[2] || '#f97316',
                });
            } else {
                setBrandDNA({
                    slogan: data.productName || '',
                    primaryColor: '#00d4ff',
                    secondaryColor: '#a855f7',
                    accentColor: '#f97316',
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

                        {/* Module 2 */}
                        {currentModule === 2 && (
                            <div className="py-8">
                                <h1 className="text-3xl font-bold text-center mb-2">🧬 Brand DNA</h1>
                                <p className="text-white/60 text-center mb-8">Xây dựng hồ sơ thương hiệu</p>

                                {productData && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                                        <p className="text-green-400 text-sm">✅ Đã phân tích: <strong>{productData.productName || url}</strong></p>
                                        {productData.description && (
                                            <p className="text-white/60 text-sm mt-2">{productData.description}</p>
                                        )}
                                    </div>
                                )}

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                                    {/* Slogan & Overview */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-2">{brandDNA.slogan || productData?.brandDNA?.slogan || "No Slogan Detected"}</h3>
                                            <p className="text-white/60 text-sm italic">{productData?.brandDNA?.mission || "Mission statement will appear here."}</p>
                                        </div>

                                        {productData?.brandDNA && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                                                {/* Brand Values */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-purple-400 mb-3">
                                                        <Star size={14} /> Giá trị cốt lõi
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {productData.brandDNA.values?.map((val: string, idx: number) => (
                                                            <span key={idx} className="bg-purple-500/10 text-purple-200 border border-purple-500/20 text-xs px-3 py-1 rounded-full">
                                                                {val}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tone of Voice */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-cyan-400 mb-3">
                                                        <MessageSquare size={14} /> Giọng văn (Tone)
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {productData.brandDNA.toneOfVoice?.map((tone: string, idx: number) => (
                                                            <span key={idx} className="bg-cyan-500/10 text-cyan-200 border border-cyan-500/20 text-xs px-3 py-1 rounded-full">
                                                                {tone}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Aesthetics */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-pink-400 mb-3">
                                                        <Palette size={14} /> Phong cách (Aesthetic)
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {productData.brandDNA.aesthetics?.map((style: string, idx: number) => (
                                                            <span key={idx} className="bg-pink-500/10 text-pink-200 border border-pink-500/20 text-xs px-3 py-1 rounded-full">
                                                                {style}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pain Points */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-3">
                                                        <AlertCircle size={14} /> Vấn đề giải quyết
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {productData.brandDNA.painPoints?.map((point: string, idx: number) => (
                                                            <span key={idx} className="bg-red-500/10 text-red-200 border border-red-500/20 text-xs px-3 py-1 rounded-full">
                                                                {point}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Color Palette */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-3">Bảng màu thương hiệu</label>
                                        <div className="flex gap-4">
                                            {productData?.brandDNA?.brandColors?.map((color: string, idx: number) => (
                                                <div key={idx} className="group relative">
                                                    <div
                                                        className="w-12 h-12 rounded-full border border-white/20 shadow-lg"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/60 bg-black/50 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {color}
                                                    </span>
                                                </div>
                                            ))}
                                            {/* Fallback inputs if no colors */}
                                            {!productData?.brandDNA?.brandColors && ['primaryColor', 'secondaryColor', 'accentColor'].map((key, i) => (
                                                <input
                                                    key={key}
                                                    type="color"
                                                    value={(brandDNA as any)[key]}
                                                    onChange={(e) => setBrandDNA({ ...brandDNA, [key]: e.target.value })}
                                                    className="w-12 h-12 rounded-full cursor-pointer border-none p-0 overflow-hidden"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={completeModule} className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                                        Hoàn tất Brand DNA →
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
