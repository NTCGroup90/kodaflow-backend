'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';

interface BudgetSliderProps {
    min?: number;
    max?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
}

const BUDGET_MILESTONES = [
    { value: 50000, label: '50K', description: 'Khởi động' },
    { value: 200000, label: '200K', description: 'Phổ biến ⭐' },
    { value: 500000, label: '500K', description: 'Tăng tốc' },
    { value: 1000000, label: '1M', description: 'Chuyên nghiệp' },
    { value: 3000000, label: '3M', description: 'Scale up' },
    { value: 5000000, label: '5M', description: 'Doanh nghiệp' },
    { value: 10000000, label: '10M', description: 'Maximum' },
];

// Estimated results based on budget (rough estimates for Vietnam market)
const getEstimatedResults = (budget: number) => {
    const cpc = 2000; // Avg cost per click VND
    const ctr = 0.02; // 2% click through rate
    const impressions = Math.round((budget / cpc) / ctr);
    const clicks = Math.round(budget / cpc);
    const conversions = Math.round(clicks * 0.03); // 3% conversion rate

    return { impressions, clicks, conversions };
};

const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

const formatFullCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};

export default function BudgetSlider({
    min = 50000,
    max = 10000000,
    defaultValue = 200000,
    onChange
}: BudgetSliderProps) {
    const [value, setValue] = useState(defaultValue);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Spring animation for smooth value changes
    const springValue = useSpring(value, { stiffness: 300, damping: 30 });

    // Calculate percentage for slider position
    const percentage = ((value - min) / (max - min)) * 100;

    // Get gradient color based on percentage
    const getTrackColor = () => {
        if (percentage < 30) return 'from-emerald-500 to-cyan-500';
        if (percentage < 60) return 'from-cyan-500 to-amber-500';
        return 'from-amber-500 to-rose-500';
    };

    // Handle slider interaction
    const handleSliderChange = useCallback((clientX: number) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newValue = Math.round(min + (percent / 100) * (max - min));

        // Snap to milestones if close enough
        const snapThreshold = (max - min) * 0.02; // 2% threshold
        for (const milestone of BUDGET_MILESTONES) {
            if (Math.abs(newValue - milestone.value) < snapThreshold) {
                setValue(milestone.value);
                onChange?.(milestone.value);
                // Haptic feedback simulation
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
                return;
            }
        }

        setValue(newValue);
        onChange?.(newValue);
    }, [min, max, onChange]);

    // Mouse/Touch event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleSliderChange(e.clientX);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            handleSliderChange(e.clientX);
        }
    }, [isDragging, handleSliderChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleSliderChange(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) {
            handleSliderChange(e.touches[0].clientX);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const estimates = getEstimatedResults(value);
    const activeMilestone = BUDGET_MILESTONES.find(m => m.value === value);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Budget Display */}
            <div className="text-center mb-8">
                <motion.div
                    className="text-sm text-white/60 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Ngân sách hàng ngày
                </motion.div>
                <motion.div
                    className="text-5xl md:text-6xl font-bold gradient-text"
                    key={value}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    {formatFullCurrency(value)}
                </motion.div>
                <AnimatePresence mode="wait">
                    {activeMilestone && (
                        <motion.div
                            key={activeMilestone.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-lg text-cyan-400 mt-2 font-medium"
                        >
                            {activeMilestone.description}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Slider Track */}
            <div
                ref={sliderRef}
                className="relative h-3 rounded-full bg-white/10 cursor-pointer mb-6 touch-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsDragging(false)}
            >
                {/* Filled Track with Gradient */}
                <motion.div
                    className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${getTrackColor()}`}
                    style={{ width: `${percentage}%` }}
                    initial={false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Glow Effect */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full pointer-events-none"
                    style={{
                        left: `calc(${percentage}% - 16px)`,
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)',
                        filter: 'blur(8px)'
                    }}
                    animate={{
                        scale: isDragging ? 1.5 : 1,
                        opacity: isDragging ? 1 : 0.6
                    }}
                />

                {/* Thumb */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${percentage}% - 14px)` }}
                    animate={{
                        scale: isDragging ? 1.2 : 1,
                        boxShadow: isDragging
                            ? '0 0 20px rgba(99, 102, 241, 0.8), 0 4px 15px rgba(0,0,0,0.3)'
                            : '0 4px 15px rgba(0,0,0,0.3)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                </motion.div>

                {/* Milestone Markers */}
                {BUDGET_MILESTONES.map((milestone) => {
                    const pos = ((milestone.value - min) / (max - min)) * 100;
                    const isActive = value >= milestone.value;
                    return (
                        <div
                            key={milestone.value}
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300"
                            style={{
                                left: `calc(${pos}% - 4px)`,
                                background: isActive ? 'white' : 'rgba(255,255,255,0.3)'
                            }}
                        />
                    );
                })}
            </div>

            {/* Milestone Labels */}
            <div className="flex justify-between text-xs text-white/40 mb-8 px-1">
                {BUDGET_MILESTONES.filter((_, i) => i % 2 === 0 || i === BUDGET_MILESTONES.length - 1).map((milestone) => (
                    <button
                        key={milestone.value}
                        onClick={() => {
                            setValue(milestone.value);
                            onChange?.(milestone.value);
                        }}
                        className={`transition-colors hover:text-white ${value === milestone.value ? 'text-cyan-400 font-medium' : ''}`}
                    >
                        {milestone.label}
                    </button>
                ))}
            </div>

            {/* Estimated Results */}
            <motion.div
                className="glass-card p-6"
                layout
            >
                <div className="text-sm text-white/60 mb-4 text-center">Ước tính kết quả / ngày</div>
                <div className="grid grid-cols-3 gap-4">
                    <motion.div
                        className="text-center"
                        key={`imp-${estimates.impressions}`}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                            {estimates.impressions.toLocaleString()}
                        </div>
                        <div className="text-xs text-white/50 mt-1">Lượt hiển thị</div>
                    </motion.div>
                    <motion.div
                        className="text-center"
                        key={`click-${estimates.clicks}`}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-indigo-400">
                            {estimates.clicks.toLocaleString()}
                        </div>
                        <div className="text-xs text-white/50 mt-1">Lượt click</div>
                    </motion.div>
                    <motion.div
                        className="text-center"
                        key={`conv-${estimates.conversions}`}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                            {estimates.conversions.toLocaleString()}
                        </div>
                        <div className="text-xs text-white/50 mt-1">Chuyển đổi</div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
