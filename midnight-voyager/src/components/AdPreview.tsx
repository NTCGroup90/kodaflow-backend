'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, ThumbsUp, MessageCircle, Share2, Play } from 'lucide-react';

interface AdPreviewProps {
    platform: 'google' | 'facebook' | 'youtube';
    productName?: string;
    productImage?: string;
    headline?: string;
    description?: string;
    price?: string;
}

export default function AdPreview({
    platform,
    productName = 'Sản phẩm mẫu',
    productImage = 'https://placehold.co/400x400/1a1a2e/6366f1?text=Product',
    headline = 'Khuyến mãi cực sốc - Giảm đến 50%!',
    description = 'Sản phẩm chất lượng cao, giao hàng nhanh toàn quốc. Đặt mua ngay hôm nay!',
    price = '299.000₫',
}: AdPreviewProps) {
    return (
        <motion.div
            className="glass-card p-4 md:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/60">Xem trước quảng cáo</span>
                <span className={`text-xs px-3 py-1 rounded-full ${platform === 'google' ? 'bg-blue-500/20 text-blue-400' :
                        platform === 'facebook' ? 'bg-indigo-500/20 text-indigo-400' :
                            'bg-red-500/20 text-red-400'
                    }`}>
                    {platform === 'google' ? 'Google Search' :
                        platform === 'facebook' ? 'Facebook Feed' :
                            'YouTube'}
                </span>
            </div>

            {/* Google Search Ad */}
            {platform === 'google' && (
                <div className="bg-white rounded-xl p-4 text-gray-900">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search size={14} className="text-gray-500" />
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-500">
                            {productName.toLowerCase().replace(/\s+/g, '+')}
                        </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">Quảng cáo</span>
                            <span>kodaflow.vn</span>
                        </div>
                        <h3 className="text-blue-700 font-medium hover:underline cursor-pointer mb-1">
                            {headline}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {description} Chỉ từ {price}
                        </p>
                    </div>
                </div>
            )}

            {/* Facebook Feed Ad */}
            {platform === 'facebook' && (
                <div className="bg-white rounded-xl overflow-hidden text-gray-900">
                    {/* Header */}
                    <div className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            K
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-sm">KODAFLOW Shop</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <span>Được tài trợ</span>
                                <span>·</span>
                                <span>🌍</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-3 pb-2">
                        <p className="text-sm mb-2">{headline}</p>
                    </div>

                    {/* Image */}
                    <div className="aspect-square bg-gray-100 relative">
                        <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <div className="text-white font-bold text-lg">{price}</div>
                        </div>
                    </div>

                    {/* Link Preview */}
                    <div className="bg-gray-100 p-3">
                        <div className="text-xs text-gray-500 uppercase">kodaflow.vn</div>
                        <div className="font-medium text-sm">{productName}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex border-t border-gray-200">
                        <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
                            <ThumbsUp size={18} />
                            <span className="text-sm">Thích</span>
                        </button>
                        <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
                            <MessageCircle size={18} />
                            <span className="text-sm">Bình luận</span>
                        </button>
                        <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
                            <Share2 size={18} />
                            <span className="text-sm">Chia sẻ</span>
                        </button>
                    </div>
                </div>
            )}

            {/* YouTube Ad */}
            {platform === 'youtube' && (
                <div className="bg-[#0f0f0f] rounded-xl overflow-hidden">
                    {/* Video Player */}
                    <div className="aspect-video bg-gray-900 relative">
                        <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                                <Play size={32} className="text-white ml-1" fill="white" />
                            </div>
                        </div>

                        {/* Ad Badge */}
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Quảng cáo
                        </div>

                        {/* Skip Button */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-3 py-1.5 rounded">
                            Bỏ qua sau 5s
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                        <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
                            <div>
                                <h3 className="text-white text-sm font-medium line-clamp-2">
                                    {headline}
                                </h3>
                                <div className="text-gray-400 text-xs mt-1">
                                    KODAFLOW Shop · Quảng cáo
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Hint */}
            <div className="text-center mt-4 text-xs text-white/40">
                💡 Nội dung sẽ được AI tự động tạo từ URL sản phẩm
            </div>
        </motion.div>
    );
}
