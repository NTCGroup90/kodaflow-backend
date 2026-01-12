'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown } from 'lucide-react';

interface WalletWidgetProps {
    balance: number;
    onClick?: () => void;
}

export default function WalletWidget({ balance, onClick }: WalletWidgetProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${Math.round(value / 1000)}K`;
        }
        return value.toString();
    };

    return (
        <motion.button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Wallet size={16} className="text-white" />
            </div>
            <div className="text-left">
                <div className="text-xs text-white/50">Số dư</div>
                <div className="text-sm font-bold text-white">{formatCurrency(balance)} ₫</div>
            </div>
            <ChevronDown size={16} className="text-white/40" />
        </motion.button>
    );
}
