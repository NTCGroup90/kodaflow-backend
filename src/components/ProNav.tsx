'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Eye, Shuffle, Zap, ChevronDown, Crown,
    Target, FileText, Play, Rocket
} from 'lucide-react';
import Link from 'next/link';

interface ProNavProps {
    currentPage?: string;
}

const PRO_FEATURES = [
    {
        id: 'spy',
        name: 'Competitor Spy',
        nameVi: 'Quét Đối Thủ',
        icon: Eye,
        href: '/app/spy',
        color: 'from-purple-500 to-pink-500',
        description: 'Phân tích ads đối thủ với AI'
    },
    {
        id: 'dynamic',
        name: 'Dynamic Creative',
        nameVi: 'A/B Testing',
        icon: Shuffle,
        href: '/app/dynamic',
        color: 'from-cyan-500 to-blue-500',
        description: 'Tạo biến thể quảng cáo tự động'
    }
];

const WORKFLOW_STEPS = [
    { id: 'dna', name: 'Brand DNA', icon: Target, href: '/app/dna' },
    { id: 'campaign', name: 'Campaign', icon: FileText, href: '/app/campaign' },
    { id: 'creative', name: 'Creative', icon: Play, href: '/app/creative' },
    { id: 'setup', name: 'Setup', icon: Zap, href: '/app/setup' },
    { id: 'launch', name: 'Launch', icon: Rocket, href: '/app/launch' }
];

export default function ProNav({ currentPage }: ProNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Pro Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl hover:border-yellow-500/50 transition-all"
            >
                <Crown className="text-yellow-400" size={16} />
                <span className="font-semibold text-yellow-400">Pro Tools</span>
                <ChevronDown
                    size={14}
                    className={`text-yellow-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Pro Features Section */}
                            <div className="p-4 border-b border-white/10">
                                <p className="text-xs text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                                    <Sparkles size={12} /> PRO FEATURES
                                </p>
                                <div className="space-y-2">
                                    {PRO_FEATURES.map((feature) => (
                                        <Link
                                            key={feature.id}
                                            href={feature.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`block p-3 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-10 hover:bg-opacity-20 transition-all group`}
                                            style={{ background: `linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                                                    <feature.icon size={18} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{feature.nameVi}</p>
                                                    <p className="text-xs text-white/50">{feature.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Workflow Steps */}
                            <div className="p-4">
                                <p className="text-xs text-white/40 font-semibold mb-3">WORKFLOW</p>
                                <div className="flex flex-wrap gap-2">
                                    {WORKFLOW_STEPS.map((step) => (
                                        <Link
                                            key={step.id}
                                            href={step.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${currentPage === step.id
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <step.icon size={12} />
                                            {step.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
