'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

// ==================== ICONS (Minimal Set) ====================
const IconPlay = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const IconArrow = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconZap = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

const IconBot = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <circle cx="9" cy="14" r="2" fill="currentColor" />
        <circle cx="15" cy="14" r="2" fill="currentColor" />
        <path d="M12 2v4M8 8V6M16 8V6" />
    </svg>
);

// ==================== AUTOMATION WORKFLOW NODES ====================
const WORKFLOW_NODES = [
    { id: 1, label: 'URL', emoji: '🔗', angle: 0 },
    { id: 2, label: 'AI Scan', emoji: '🧠', angle: 45 },
    { id: 3, label: 'Content', emoji: '✍️', angle: 90 },
    { id: 4, label: 'Design', emoji: '🎨', angle: 135 },
    { id: 5, label: 'Video', emoji: '🎬', angle: 180 },
    { id: 6, label: 'Deploy', emoji: '🚀', angle: 225 },
    { id: 7, label: 'Optimize', emoji: '📊', angle: 270 },
    { id: 8, label: 'Scale', emoji: '💰', angle: 315 },
];

// ==================== FLOATING PARTICLE ====================
function FloatingParticle({ delay = 0, size = 4 }: { delay?: number; size?: number }) {
    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                width: size,
                height: size,
                background: 'rgba(0, 240, 255, 0.6)',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
            }}
            initial={{
                x: Math.random() * 100 + '%',
                y: '110%',
                opacity: 0
            }}
            animate={{
                y: '-10%',
                opacity: [0, 1, 1, 0],
            }}
            transition={{
                duration: 8 + Math.random() * 4,
                delay: delay,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    );
}

// ==================== AURORA BACKGROUND ====================
function AuroraBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Main aurora gradients */}
            <motion.div
                className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 120,
                    repeat: Infinity,
                    ease: 'linear',
                }}
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(120, 0, 255, 0.12) 0%, transparent 50%),
                        radial-gradient(ellipse 70% 50% at 50% 80%, rgba(0, 180, 255, 0.1) 0%, transparent 50%)
                    `,
                }}
            />

            {/* Flowing aurora ribbons */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
                style={{
                    background: `
                        linear-gradient(135deg, 
                            transparent 0%, 
                            rgba(0, 240, 255, 0.03) 20%, 
                            transparent 40%,
                            rgba(120, 0, 255, 0.03) 60%,
                            transparent 80%,
                            rgba(0, 200, 255, 0.02) 100%
                        )
                    `,
                    backgroundSize: '400% 400%',
                }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <FloatingParticle key={i} delay={i * 0.5} size={2 + Math.random() * 4} />
            ))}

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 240, 255, 0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 240, 255, 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '100px 100px',
                }}
            />
        </div>
    );
}

// ==================== ORBITAL AUTOMATION RING ====================
function AutomationOrbit({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
    const [activeNode, setActiveNode] = useState(0);
    const [completedNodes, setCompletedNodes] = useState<number[]>([]);

    useEffect(() => {
        if (!isActive) {
            setActiveNode(0);
            setCompletedNodes([]);
            return;
        }

        const interval = setInterval(() => {
            setActiveNode(prev => {
                const next = prev + 1;
                if (next <= WORKFLOW_NODES.length) {
                    setCompletedNodes(nodes => [...nodes, prev]);
                    if (next === WORKFLOW_NODES.length) {
                        onComplete?.();
                    }
                    return next;
                }
                return prev;
            });
        }, 600);

        return () => clearInterval(interval);
    }, [isActive, onComplete]);

    const radius = 180;

    return (
        <div className="relative w-[400px] h-[400px]">
            {/* Orbital track */}
            <motion.div
                className="absolute inset-0 rounded-full border"
                style={{
                    borderColor: 'rgba(0, 240, 255, 0.1)',
                }}
                animate={{
                    boxShadow: isActive
                        ? ['0 0 30px rgba(0, 240, 255, 0.1)', '0 0 60px rgba(0, 240, 255, 0.2)', '0 0 30px rgba(0, 240, 255, 0.1)']
                        : '0 0 0px transparent',
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Progress arc */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.1)"
                    strokeWidth="2"
                />
                <motion.circle
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke="url(#orbitGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * radius}
                    initial={{ strokeDashoffset: 2 * Math.PI * radius }}
                    animate={{
                        strokeDashoffset: 2 * Math.PI * radius * (1 - completedNodes.length / WORKFLOW_NODES.length)
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <defs>
                    <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00F0FF" />
                        <stop offset="50%" stopColor="#A100FF" />
                        <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Workflow nodes */}
            {WORKFLOW_NODES.map((node, index) => {
                const angle = (node.angle - 90) * (Math.PI / 180);
                const x = 200 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);
                const isNodeActive = activeNode === index + 1;
                const isCompleted = completedNodes.includes(index + 1);

                return (
                    <motion.div
                        key={node.id}
                        className="absolute flex flex-col items-center gap-1"
                        style={{
                            left: x - 30,
                            top: y - 30,
                            width: 60,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: isActive ? 1 : 0.3,
                            scale: isNodeActive ? 1.2 : 1,
                        }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <motion.div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                            style={{
                                background: isCompleted
                                    ? 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)'
                                    : isNodeActive
                                        ? 'rgba(0, 240, 255, 0.3)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                border: isNodeActive
                                    ? '2px solid #00F0FF'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: isNodeActive
                                    ? '0 0 30px rgba(0, 240, 255, 0.5)'
                                    : isCompleted
                                        ? '0 0 20px rgba(0, 240, 255, 0.3)'
                                        : 'none',
                            }}
                            animate={isNodeActive ? {
                                scale: [1, 1.1, 1],
                            } : {}}
                            transition={{ duration: 0.5, repeat: isNodeActive ? Infinity : 0 }}
                        >
                            {isCompleted ? <IconCheck /> : node.emoji}
                        </motion.div>
                        <span className="text-[10px] text-white/60 font-medium">{node.label}</span>
                    </motion.div>
                );
            })}

            {/* Center hub */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(120, 0, 255, 0.1) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                }}
                animate={{
                    boxShadow: isActive
                        ? ['0 0 40px rgba(0, 240, 255, 0.2)', '0 0 80px rgba(120, 0, 255, 0.3)', '0 0 40px rgba(0, 240, 255, 0.2)']
                        : '0 0 20px rgba(0, 240, 255, 0.1)',
                }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <motion.div
                    animate={isActive ? { rotate: 360 } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="text-cyan-400"
                >
                    <IconBot />
                </motion.div>
            </motion.div>
        </div>
    );
}

// ==================== AUTOMATION MAGIC BUTTON ====================
function MagicButton({ onClick, isProcessing, isComplete }: {
    onClick: () => void;
    isProcessing: boolean;
    isComplete: boolean;
}) {
    return (
        <motion.button
            onClick={onClick}
            disabled={isProcessing}
            className="relative group"
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
        >
            {/* Outer glow ring */}
            <motion.div
                className="absolute -inset-4 rounded-3xl"
                animate={{
                    boxShadow: isComplete
                        ? '0 0 60px rgba(34, 197, 94, 0.4)'
                        : isProcessing
                            ? ['0 0 40px rgba(0, 240, 255, 0.3)', '0 0 80px rgba(120, 0, 255, 0.4)', '0 0 40px rgba(0, 240, 255, 0.3)']
                            : '0 0 30px rgba(0, 240, 255, 0.2)',
                    opacity: isProcessing ? 1 : 0.7,
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Button body */}
            <div
                className="relative px-12 py-6 rounded-2xl font-bold text-xl overflow-hidden"
                style={{
                    background: isComplete
                        ? 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
                        : 'linear-gradient(135deg, #00F0FF 0%, #A100FF 50%, #00D4FF 100%)',
                    color: isComplete ? '#fff' : '#000',
                }}
            >
                {/* Shimmer effect */}
                {!isComplete && (
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)',
                        }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                )}

                <span className="relative flex items-center gap-3">
                    {isComplete ? (
                        <>
                            <IconCheck />
                            Hoàn tất!
                        </>
                    ) : isProcessing ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <IconZap />
                            </motion.div>
                            Đang tự động hóa...
                        </>
                    ) : (
                        <>
                            <IconZap />
                            1 Click Automation
                        </>
                    )}
                </span>
            </div>

            {/* Subtitle */}
            <motion.p
                className="absolute -bottom-8 left-0 right-0 text-center text-xs text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {isComplete ? '8 công đoạn hoàn thành' : isProcessing ? 'AI đang xử lý...' : 'Chỉ cần 1 click duy nhất'}
            </motion.p>
        </motion.button>
    );
}

// ==================== FEATURE PILL ====================
function FeaturePill({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
            }}
        >
            {children}
        </motion.div>
    );
}

// ==================== STAT COUNTER ====================
function StatCounter({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
    return (
        <div className="text-center">
            <motion.div
                className="text-4xl md:text-5xl font-bold"
                style={{
                    background: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {value}{suffix}
            </motion.div>
            <div className="text-white/40 text-sm mt-1">{label}</div>
        </div>
    );
}

// ==================== PRICING CARD ====================
function PricingCard({
    name,
    price,
    note,
    features,
    popular = false,
    cta
}: {
    name: string;
    price: string;
    note: string;
    features: string[];
    popular?: boolean;
    cta: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="relative p-8 rounded-3xl h-full"
            style={{
                background: popular
                    ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(120, 0, 255, 0.08) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                border: popular
                    ? '1px solid rgba(0, 240, 255, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
            }}
        >
            {popular && (
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                    style={{
                        background: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)',
                        color: '#000',
                    }}
                >
                    Phổ biến nhất
                </div>
            )}

            <h3 className="text-xl font-bold mb-2">{name}</h3>
            <div className="mb-6">
                <span className="text-4xl font-bold">{price}</span>
                <span className="text-white/40">{note}</span>
            </div>

            <ul className="space-y-3 mb-8">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="text-cyan-400"><IconCheck /></span>
                        {f}
                    </li>
                ))}
            </ul>

            <button
                className="w-full py-4 rounded-xl font-semibold transition-all"
                style={{
                    background: popular
                        ? 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                    color: popular ? '#000' : '#fff',
                    border: popular ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                {cta}
            </button>
        </motion.div>
    );
}

// ==================== MAIN COMPONENT ====================
export default function LandingPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleStartAutomation = () => {
        if (isProcessing || isComplete) return;
        setIsProcessing(true);
    };

    const handleAutomationComplete = () => {
        setIsComplete(true);
        setIsProcessing(false);
    };

    const PRICING = [
        {
            name: 'Starter',
            price: 'Miễn phí',
            note: ' mãi mãi',
            features: ['3 chiến dịch/tháng', '1 nền tảng quảng cáo', 'AI content cơ bản', 'Email support'],
            cta: 'Bắt đầu ngay',
            popular: false
        },
        {
            name: 'Pro',
            price: '499K',
            note: ' /tháng',
            features: ['Unlimited chiến dịch', '3 nền tảng', 'AI nâng cao + Video', '50 credits/tháng', 'Priority support'],
            cta: 'Dùng thử 14 ngày',
            popular: true
        },
        {
            name: 'Agency',
            price: '1.99M',
            note: ' /tháng',
            features: ['Tất cả Pro', '10 thương hiệu', '200 credits/tháng', 'White-label', 'API access'],
            cta: 'Liên hệ',
            popular: false
        },
    ];

    return (
        <main className="min-h-screen text-white overflow-hidden relative" style={{ background: '#050508' }}>
            {/* Aurora Background */}
            <AuroraBackground />

            {/* Cursor spotlight */}
            <motion.div
                className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.04) 0%, transparent 60%)',
                    left: mousePos.x - 300,
                    top: mousePos.y - 300,
                }}
            />

            {/* ===== HEADER ===== */}
            <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(5, 5, 8, 0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-black"
                            style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                        >
                            <IconZap />
                        </div>
                        <span className="text-xl font-bold tracking-tight">KODAFLOW</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
                        <a href="#how" className="hover:text-white transition">Cách hoạt động</a>
                        <a href="#pricing" className="hover:text-white transition">Bảng giá</a>
                    </nav>

                    <Link
                        href="/app"
                        className="px-5 py-2.5 rounded-xl font-medium text-sm text-black hover:opacity-90 transition"
                        style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                    >
                        Vào App →
                    </Link>
                </div>
            </header>

            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 px-6">
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {/* Trust badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                        style={{
                            background: 'rgba(0, 240, 255, 0.05)',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                        }}
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-cyan-400">573+ doanh nghiệp Việt tin dùng</span>
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.9] tracking-tight"
                    >
                        <span className="block text-white/20 text-2xl md:text-3xl font-normal tracking-widest mb-4">
                            AUTOMATION 100%
                        </span>
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 50%, #00D4FF 100%)' }}
                        >
                            Marketing
                        </span>
                        <br />
                        <span className="text-white">tự vận hành</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12"
                    >
                        Dán link sản phẩm → AI tự động tạo content, banner, video
                        <br className="hidden md:block" />
                        và chạy quảng cáo 24/7. <span className="text-white/60">Bạn không cần làm gì thêm.</span>
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-3 mb-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FeaturePill delay={0.4}>🔗 1 URL input</FeaturePill>
                        <FeaturePill delay={0.5}>🧠 8 AI modules</FeaturePill>
                        <FeaturePill delay={0.6}>⚡ 24/7 automation</FeaturePill>
                        <FeaturePill delay={0.7}>📈 Auto-optimize</FeaturePill>
                    </motion.div>

                    {/* Automation visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="relative flex flex-col items-center"
                    >
                        <AutomationOrbit
                            isActive={isProcessing || isComplete}
                            onComplete={handleAutomationComplete}
                        />

                        <div className="mt-12">
                            <MagicButton
                                onClick={handleStartAutomation}
                                isProcessing={isProcessing}
                                isComplete={isComplete}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="py-20 border-y" style={{ borderColor: 'rgba(255, 255, 255, 0.03)', background: 'rgba(0, 240, 255, 0.01)' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        <StatCounter value="12,847" suffix="+" label="Chiến dịch tạo ra" />
                        <StatCounter value="98" suffix="%" label="Thời gian tiết kiệm" />
                        <StatCounter value="3.2" suffix="x" label="ROI trung bình" />
                        <StatCounter value="5" label="Phút / chiến dịch" />
                    </motion.div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how" className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="text-white/30">Đơn giản đến</span>{' '}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                            >
                                không tưởng
                            </span>
                        </h2>
                        <p className="text-white/40 text-lg">3 bước. 5 phút. Xong.</p>
                    </motion.div>

                    <div className="space-y-8">
                        {[
                            { step: '01', title: 'Dán URL sản phẩm', desc: 'Từ Shopee, Lazada, website của bạn...', icon: '🔗' },
                            { step: '02', title: 'Chọn ngân sách', desc: 'Kéo slider, AI làm tất cả còn lại', icon: '💰' },
                            { step: '03', title: 'Thu tiền', desc: 'Ads chạy 24/7, tự optimize, tự scale', icon: '🚀' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-6 p-6 rounded-2xl group hover:bg-white/[0.02] transition-colors"
                                style={{ border: '1px solid rgba(255, 255, 255, 0.03)' }}
                            >
                                <span className="text-5xl">{item.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: 'rgba(0, 240, 255, 0.5)' }}
                                        >
                                            {item.step}
                                        </span>
                                        <h3 className="text-xl font-semibold">{item.title}</h3>
                                    </div>
                                    <p className="text-white/40">{item.desc}</p>
                                </div>
                                <motion.div
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    whileHover={{ x: 5 }}
                                >
                                    <IconArrow />
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section id="pricing" className="py-32 px-6" style={{ background: 'rgba(120, 0, 255, 0.02)' }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Bảng giá{' '}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                            >
                                minh bạch
                            </span>
                        </h2>
                        <p className="text-white/40 text-lg">Bắt đầu miễn phí. Nâng cấp khi cần.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {PRICING.map((tier, i) => (
                            <PricingCard key={i} {...tier} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-16 rounded-[3rem] overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(120, 0, 255, 0.05) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        {/* Glow */}
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
                            style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, transparent 60%)' }}
                        />

                        <h2 className="relative text-3xl md:text-4xl font-bold mb-6">
                            Sẵn sàng để{' '}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                            >
                                tự động hóa 100%?
                            </span>
                        </h2>
                        <p className="relative text-white/40 mb-10">
                            Tham gia cùng 573+ doanh nghiệp đang scale với KODAFLOW
                        </p>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/app"
                                className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-black"
                                style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                            >
                                Bắt đầu miễn phí ngay
                                <IconArrow />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-12 px-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-black"
                            style={{ background: 'linear-gradient(135deg, #00F0FF 0%, #A100FF 100%)' }}
                        >
                            <IconZap />
                        </div>
                        <span className="font-bold">KODAFLOW</span>
                        <span className="text-xs text-white/20">© 2024</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-white/30">
                        <a href="#" className="hover:text-white transition">Điều khoản</a>
                        <a href="#" className="hover:text-white transition">Bảo mật</a>
                        <a href="#" className="hover:text-white transition">Liên hệ</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
