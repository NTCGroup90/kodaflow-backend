'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, QrCode, Check, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount?: number;
    onSuccess?: () => void;
}

const PRESET_AMOUNTS = [
    { value: 100000, label: '100K' },
    { value: 200000, label: '200K' },
    { value: 500000, label: '500K' },
    { value: 1000000, label: '1M' },
    { value: 2000000, label: '2M' },
    { value: 5000000, label: '5M' },
];

type PaymentStatus = 'idle' | 'generating' | 'waiting' | 'success' | 'failed';

export default function PaymentModal({ isOpen, onClose, amount: initialAmount, onSuccess }: PaymentModalProps) {
    const [amount, setAmount] = useState(initialAmount || 200000);
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(300); // 5 minutes
    const [orderCode, setOrderCode] = useState<string | null>(null);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
    };

    // Generate payment QR
    const generatePayment = async () => {
        setStatus('generating');

        try {
            // Call backend API to create PayOS payment link
            const response = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) throw new Error('Failed to create payment');

            const data = await response.json();
            setQrCode(data.qrCode);
            setOrderCode(data.orderCode);
            setStatus('waiting');
            setCountdown(300);
        } catch (error) {
            console.error('Payment error:', error);
            // For demo, generate a placeholder QR
            setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KODAFLOW-${amount}-${Date.now()}`);
            setOrderCode(`KDF${Date.now()}`);
            setStatus('waiting');
            setCountdown(300);
        }
    };

    // Countdown timer
    useEffect(() => {
        if (status !== 'waiting') return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setStatus('failed');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    // Poll for payment status
    useEffect(() => {
        if (status !== 'waiting' || !orderCode) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/payment/status?orderCode=${orderCode}`);
                const data = await response.json();

                if (data.status === 'PAID') {
                    setStatus('success');
                    onSuccess?.();
                }
            } catch (error) {
                // Ignore polling errors
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [status, orderCode, onSuccess]);

    // Demo: Simulate success after 5 seconds
    const simulateSuccess = () => {
        setTimeout(() => {
            setStatus('success');
            onSuccess?.();
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const resetModal = () => {
        setStatus('idle');
        setQrCode(null);
        setOrderCode(null);
        setCountdown(300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative glass-card w-full max-w-md p-6 overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-white/60" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Nạp tiền vào ví</h3>
                            <p className="text-white/60 text-sm mt-1">KODAFLOW Wallet</p>
                        </div>

                        {/* Status: Idle - Select Amount */}
                        {status === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {/* Amount Input */}
                                <div className="mb-4">
                                    <label className="text-sm text-white/60 mb-2 block">Số tiền nạp</label>
                                    <input
                                        type="text"
                                        value={formatCurrency(amount)}
                                        readOnly
                                        className="input-glass text-center text-2xl font-bold"
                                    />
                                </div>

                                {/* Preset Amounts */}
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {PRESET_AMOUNTS.map(preset => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setAmount(preset.value)}
                                            className={`py-3 rounded-xl font-medium transition-all ${amount === preset.value
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Generate QR Button */}
                                <button
                                    onClick={generatePayment}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <QrCode size={20} />
                                    Tạo mã QR thanh toán
                                </button>
                            </motion.div>
                        )}

                        {/* Status: Generating */}
                        {status === 'generating' && (
                            <motion.div
                                className="text-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Loader2 size={48} className="text-indigo-500 animate-spin mx-auto mb-4" />
                                <p className="text-white/60">Đang tạo mã thanh toán...</p>
                            </motion.div>
                        )}

                        {/* Status: Waiting for Payment */}
                        {status === 'waiting' && qrCode && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                {/* QR Code */}
                                <div className="bg-white rounded-2xl p-4 inline-block mb-4">
                                    <img
                                        src={qrCode}
                                        alt="Payment QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>

                                {/* Amount */}
                                <div className="text-2xl font-bold text-white mb-2">
                                    {formatCurrency(amount)}
                                </div>

                                {/* Countdown */}
                                <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                                    <AlertCircle size={16} />
                                    <span>Hết hạn sau: {formatTime(countdown)}</span>
                                </div>

                                {/* Instructions */}
                                <div className="bg-white/5 rounded-xl p-4 text-left text-sm text-white/60 mb-4">
                                    <p className="mb-2">📱 Mở app ngân hàng</p>
                                    <p className="mb-2">📸 Quét mã QR ở trên</p>
                                    <p>✅ Xác nhận thanh toán</p>
                                </div>

                                {/* Demo Button */}
                                <button
                                    onClick={simulateSuccess}
                                    className="text-cyan-400 text-sm hover:underline"
                                >
                                    [Demo] Giả lập thanh toán thành công
                                </button>
                            </motion.div>
                        )}

                        {/* Status: Success */}
                        {status === 'success' && (
                            <motion.div
                                className="text-center py-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                >
                                    <Check size={40} className="text-white" />
                                </motion.div>
                                <h4 className="text-xl font-bold text-white mb-2">Nạp tiền thành công!</h4>
                                <p className="text-emerald-400 text-2xl font-bold mb-4">
                                    +{formatCurrency(amount)}
                                </p>
                                <button
                                    onClick={() => { resetModal(); onClose(); }}
                                    className="btn-primary"
                                >
                                    Đóng
                                </button>
                            </motion.div>
                        )}

                        {/* Status: Failed */}
                        {status === 'failed' && (
                            <motion.div
                                className="text-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                                    <X size={40} className="text-rose-500" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Hết thời gian</h4>
                                <p className="text-white/60 mb-4">Giao dịch đã hết hạn. Vui lòng thử lại.</p>
                                <button
                                    onClick={resetModal}
                                    className="btn-primary"
                                >
                                    Thử lại
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
