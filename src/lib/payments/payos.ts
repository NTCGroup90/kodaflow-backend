/**
 * PayOS Payment Integration
 * Vietnamese payment gateway with VietQR support
 */

import crypto from 'crypto';

const PAYOS_API_URL = 'https://api-merchant.payos.vn';

export interface PayOSConfig {
    clientId: string;
    apiKey: string;
    checksumKey: string;
}

export interface PaymentLink {
    orderCode: string;
    amount: number;
    checkoutUrl: string;
    qrCode: string;
    expiresAt: string;
}

export interface PaymentStatus {
    orderCode: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
    amount: number;
    paidAt?: string;
}

export interface WebhookPayload {
    code: string;
    desc: string;
    success: boolean;
    data: {
        orderCode: number;
        amount: number;
        description: string;
        accountNumber: string;
        reference: string;
        transactionDateTime: string;
        paymentLinkId: string;
    };
    signature: string;
}

// ==================== PayOS Client ====================

export class PayOSClient {
    private config: PayOSConfig;

    constructor() {
        this.config = {
            clientId: process.env.PAYOS_CLIENT_ID || '',
            apiKey: process.env.PAYOS_API_KEY || '',
            checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
        };
    }

    private generateSignature(data: Record<string, string | number | boolean>): string {
        const sortedKeys = Object.keys(data).sort();
        const signData = sortedKeys.map(k => `${k}=${data[k]}`).join('&');

        return crypto
            .createHmac('sha256', this.config.checksumKey)
            .update(signData)
            .digest('hex');
    }

    verifyWebhookSignature(data: Record<string, string | number | boolean>, signature: string): boolean {
        const expectedSignature = this.generateSignature(data);
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(signature)
        );
    }

    async createPaymentLink(options: {
        orderCode: string;
        amount: number;
        description: string;
        returnUrl: string;
        cancelUrl: string;
    }): Promise<PaymentLink> {
        const orderCodeNum = parseInt(options.orderCode.replace(/\D/g, ''));

        const payload: Record<string, string | number> = {
            orderCode: orderCodeNum,
            amount: options.amount,
            description: options.description,
            returnUrl: options.returnUrl,
            cancelUrl: options.cancelUrl,
        };

        payload.signature = this.generateSignature(payload);

        const response = await fetch(`${PAYOS_API_URL}/v2/payment-requests`, {
            method: 'POST',
            headers: {
                'x-client-id': this.config.clientId,
                'x-api-key': this.config.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`PayOS API error: ${error}`);
        }

        const result = await response.json();

        if (result.code !== '00') {
            throw new Error(`PayOS error: ${result.desc}`);
        }

        return {
            orderCode: options.orderCode,
            amount: options.amount,
            checkoutUrl: result.data.checkoutUrl,
            qrCode: result.data.qrCode,
            expiresAt: result.data.expiredAt || '',
        };
    }

    async getPaymentStatus(orderCode: string): Promise<PaymentStatus> {
        const orderCodeNum = parseInt(orderCode.replace(/\D/g, ''));

        const response = await fetch(
            `${PAYOS_API_URL}/v2/payment-requests/${orderCodeNum}`,
            {
                headers: {
                    'x-client-id': this.config.clientId,
                    'x-api-key': this.config.apiKey,
                },
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`PayOS API error: ${error}`);
        }

        const result = await response.json();
        const data = result.data || {};

        return {
            orderCode,
            status: data.status || 'PENDING',
            amount: data.amount || 0,
            paidAt: data.paidAt,
        };
    }
}

// ==================== Payment Handler ====================

export class PaymentHandler {
    private payos: PayOSClient;

    constructor() {
        this.payos = new PayOSClient();
    }

    generateOrderCode(): string {
        const timestamp = Date.now();
        return `KDF${timestamp}`;
    }

    async createPayment(options: {
        userId: string;
        amount: number;
        packageName?: string;
        baseUrl: string;
    }): Promise<PaymentLink> {
        const orderCode = this.generateOrderCode();

        const paymentLink = await this.payos.createPaymentLink({
            orderCode,
            amount: options.amount,
            description: `Nap credits KODAFLOW - ${options.packageName || options.amount.toLocaleString()} VND`,
            returnUrl: `${options.baseUrl}/payment/success?orderCode=${orderCode}`,
            cancelUrl: `${options.baseUrl}/payment/cancel?orderCode=${orderCode}`,
        });

        return paymentLink;
    }

    async handleWebhook(payload: WebhookPayload): Promise<{
        success: boolean;
        orderCode: string;
        amount: number;
    }> {
        // Verify signature
        if (!this.payos.verifyWebhookSignature(payload.data, payload.signature)) {
            throw new Error('Invalid webhook signature');
        }

        if (!payload.success) {
            return {
                success: false,
                orderCode: `KDF${payload.data.orderCode}`,
                amount: payload.data.amount,
            };
        }

        // Payment successful
        return {
            success: true,
            orderCode: `KDF${payload.data.orderCode}`,
            amount: payload.data.amount,
        };
    }

    async checkPaymentStatus(orderCode: string): Promise<PaymentStatus> {
        return this.payos.getPaymentStatus(orderCode);
    }
}

// Singleton instances
export const payosClient = new PayOSClient();
export const paymentHandler = new PaymentHandler();
