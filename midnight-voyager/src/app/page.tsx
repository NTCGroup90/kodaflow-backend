'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Link2, ArrowRight, Sparkles, Check } from 'lucide-react';
import BudgetSlider from '@/components/BudgetSlider';
import AdPreview from '@/components/AdPreview';
import PaymentModal from '@/components/PaymentModal';
import WalletWidget from '@/components/WalletWidget';

type Platform = 'google' | 'facebook' | 'youtube';

export default function Home() {
  const [productUrl, setProductUrl] = useState('');
  const [budget, setBudget] = useState(200000);
  const [platform, setPlatform] = useState<Platform>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(500000);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');

  const platforms: { id: Platform; label: string; icon: string }[] = [
    { id: 'google', label: 'Google', icon: '🔍' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
  ];

  const handleAnalyze = async () => {
    if (!productUrl) return;
    setIsLoading(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    setStep('preview');
  };

  const handleLaunchCampaign = async () => {
    if (walletBalance < budget) {
      setIsPaymentOpen(true);
      return;
    }

    setIsLoading(true);

    // Simulate campaign creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setWalletBalance(prev => prev - budget);
    setIsLoading(false);
    setStep('success');
  };

  const handlePaymentSuccess = () => {
    setWalletBalance(prev => prev + 500000);
    setIsPaymentOpen(false);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg bg-black/20 border-b border-white/5">
        <div className="container-main flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">KODAFLOW</span>
              <span className="text-xs text-white/40 ml-2">Marketing</span>
            </div>
          </div>

          <WalletWidget
            balance={walletBalance}
            onClick={() => setIsPaymentOpen(true)}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="container-main pt-24 pb-12">
        {/* Hero */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={16} />
            Powered by AI
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Quảng cáo{' '}
            <span className="gradient-text">Google & Facebook</span>
            <br />chỉ với một nút bấm
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Dán link sản phẩm → Kéo thanh ngân sách → Bấm chạy.
            AI sẽ tự động tạo nội dung và tối ưu quảng cáo cho bạn.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* URL Input */}
              <div className="glass-card p-6 md:p-8 mb-8">
                <label className="block text-sm text-white/60 mb-3">
                  Link sản phẩm (Shopee, Lazada, Tiki, Website...)
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Link2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="https://shopee.vn/san-pham-cua-ban"
                      className="input-glass pl-12 w-full"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={!productUrl || isLoading}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        Phân tích
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Platform Selection */}
              <div className="glass-card p-6 md:p-8 mb-8">
                <label className="block text-sm text-white/60 mb-4">
                  Chọn nền tảng quảng cáo
                </label>
                <div className="platform-toggle">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={platform === p.id ? 'active' : ''}
                    >
                      <span className="mr-2">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div className="glass-card p-6 md:p-8">
                <BudgetSlider
                  defaultValue={budget}
                  onChange={setBudget}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Left: Settings */}
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Cài đặt chiến dịch</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-white/60 block mb-2">Nền tảng</label>
                        <div className="platform-toggle">
                          {platforms.map(p => (
                            <button
                              key={p.id}
                              onClick={() => setPlatform(p.id)}
                              className={platform === p.id ? 'active' : ''}
                            >
                              {p.icon} {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-white/60 block mb-2">Ngân sách / ngày</label>
                        <div className="text-2xl font-bold gradient-text">
                          {new Intl.NumberFormat('vi-VN').format(budget)} ₫
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={isLoading}
                    className="btn-primary w-full text-lg py-5 flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang khởi tạo...
                      </>
                    ) : (
                      <>
                        <Zap size={24} />
                        Chạy chiến dịch ngay
                      </>
                    )}
                  </button>

                  {walletBalance < budget && (
                    <p className="text-amber-400 text-sm text-center">
                      ⚠️ Số dư không đủ. Vui lòng nạp thêm tiền.
                    </p>
                  )}

                  <button
                    onClick={() => setStep('input')}
                    className="text-white/40 text-sm hover:text-white transition-colors w-full text-center"
                  >
                    ← Quay lại chỉnh sửa
                  </button>
                </div>

                {/* Right: Preview */}
                <div>
                  <AdPreview
                    platform={platform}
                    productName="Sản phẩm từ URL của bạn"
                    headline="🔥 Flash Sale - Giảm sốc 50%!"
                    description="Sản phẩm chất lượng cao, miễn phí vận chuyển toàn quốc. Đặt mua ngay!"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="glass-card p-8 md:p-12">
                <motion.div
                  className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <Check size={48} className="text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  Chiến dịch đã được khởi tạo! 🎉
                </h2>

                <p className="text-white/60 mb-6">
                  Quảng cáo của bạn đang được AI tối ưu và sẽ bắt đầu chạy trong vài phút.
                </p>

                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/40">Nền tảng</div>
                      <div className="text-white font-medium capitalize">{platform}</div>
                    </div>
                    <div>
                      <div className="text-white/40">Ngân sách/ngày</div>
                      <div className="text-white font-medium">
                        {new Intl.NumberFormat('vi-VN').format(budget)} ₫
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStep('input');
                    setProductUrl('');
                  }}
                  className="btn-primary"
                >
                  Tạo chiến dịch mới
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </main>
  );
}
