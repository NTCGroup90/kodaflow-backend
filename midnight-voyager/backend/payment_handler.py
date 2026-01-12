"""
Payment Handler - PayOS Integration
Xử lý thanh toán qua PayOS và VietQR
"""

import os
import hmac
import hashlib
import json
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import httpx


# ============== Data Models ==============

class PaymentLink(BaseModel):
    """Thông tin link thanh toán"""
    order_code: str
    amount: int
    checkout_url: str
    qr_code: str
    expires_at: str


class PaymentStatus(BaseModel):
    """Trạng thái thanh toán"""
    order_code: str
    status: str  # PENDING, PAID, CANCELLED
    amount: int
    paid_at: Optional[str] = None


class WebhookPayload(BaseModel):
    """Payload từ PayOS webhook"""
    code: str
    desc: str
    success: bool
    data: dict
    signature: str


# ============== PayOS Client ==============

class PayOSClient:
    """
    Client để tương tác với PayOS API
    https://payos.vn/docs/api/
    """
    
    def __init__(self):
        self.client_id = os.getenv("PAYOS_CLIENT_ID", "")
        self.api_key = os.getenv("PAYOS_API_KEY", "")
        self.checksum_key = os.getenv("PAYOS_CHECKSUM_KEY", "")
        
        self.base_url = "https://api-merchant.payos.vn"
    
    def _generate_signature(self, data: dict) -> str:
        """
        Tạo signature cho request theo chuẩn PayOS
        Sort keys alphabetically -> Join values -> HMAC-SHA256
        """
        sorted_keys = sorted(data.keys())
        sign_data = "&".join([f"{k}={data[k]}" for k in sorted_keys])
        
        signature = hmac.new(
            self.checksum_key.encode(),
            sign_data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def verify_webhook_signature(self, payload: dict, signature: str) -> bool:
        """Xác thực signature từ webhook"""
        expected_signature = self._generate_signature(payload)
        return hmac.compare_digest(expected_signature, signature)
    
    async def create_payment_link(
        self,
        order_code: str,
        amount: int,
        description: str,
        return_url: str,
        cancel_url: str
    ) -> PaymentLink:
        """
        Tạo link thanh toán mới
        
        Args:
            order_code: Mã đơn hàng unique
            amount: Số tiền (VND)
            description: Mô tả đơn hàng
            return_url: URL redirect sau khi thanh toán thành công
            cancel_url: URL redirect khi hủy thanh toán
        """
        
        payload = {
            "orderCode": int(order_code.replace("KDF", "")),
            "amount": amount,
            "description": description,
            "returnUrl": return_url,
            "cancelUrl": cancel_url,
        }
        
        # Add signature
        payload["signature"] = self._generate_signature(payload)
        
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v2/payment-requests",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                raise ValueError(f"PayOS API error: {response.text}")
            
            result = response.json()
            
            if result.get("code") != "00":
                raise ValueError(f"PayOS error: {result.get('desc')}")
            
            data = result["data"]
            
            return PaymentLink(
                order_code=order_code,
                amount=amount,
                checkout_url=data["checkoutUrl"],
                qr_code=data["qrCode"],
                expires_at=data.get("expiredAt", "")
            )
    
    async def get_payment_status(self, order_code: str) -> PaymentStatus:
        """Kiểm tra trạng thái thanh toán"""
        
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key
        }
        
        order_id = int(order_code.replace("KDF", ""))
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v2/payment-requests/{order_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                raise ValueError(f"PayOS API error: {response.text}")
            
            result = response.json()
            data = result.get("data", {})
            
            return PaymentStatus(
                order_code=order_code,
                status=data.get("status", "PENDING"),
                amount=data.get("amount", 0),
                paid_at=data.get("paidAt")
            )


# ============== Wallet Service ==============

class WalletService:
    """
    Service quản lý ví tiền của user
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    async def get_balance(self, user_id: str) -> float:
        """Lấy số dư ví"""
        # In production, query from database
        # result = await self.db.fetchone(
        #     "SELECT balance FROM wallets WHERE user_id = $1",
        #     user_id
        # )
        return 0.0
    
    async def add_credits(self, user_id: str, amount: float, order_code: str) -> float:
        """
        Cộng tiền vào ví sau khi thanh toán thành công
        
        1. Kiểm tra transaction chưa xử lý
        2. Cập nhật balance
        3. Ghi log transaction
        """
        
        # Check if transaction already processed
        # existing = await self.db.fetchone(
        #     "SELECT id FROM transactions WHERE order_code = $1 AND status = 'COMPLETED'",
        #     order_code
        # )
        # if existing:
        #     raise ValueError("Transaction already processed")
        
        # Update wallet balance
        # await self.db.execute(
        #     "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2",
        #     amount, user_id
        # )
        
        # Record transaction
        # await self.db.execute(
        #     """INSERT INTO transactions 
        #        (user_id, order_code, amount, type, status, completed_at)
        #        VALUES ($1, $2, $3, 'DEPOSIT', 'COMPLETED', NOW())""",
        #     user_id, order_code, amount
        # )
        
        # Return new balance
        return await self.get_balance(user_id) + amount
    
    async def deduct_credits(self, user_id: str, amount: float, campaign_id: str) -> bool:
        """
        Trừ tiền khi tạo chiến dịch
        
        1. Kiểm tra số dư
        2. Trừ tiền
        3. Ghi log
        """
        
        balance = await self.get_balance(user_id)
        
        if balance < amount:
            raise ValueError("Insufficient balance")
        
        # Deduct from wallet
        # await self.db.execute(
        #     "UPDATE wallets SET balance = balance - $1 WHERE user_id = $2",
        #     amount, user_id
        # )
        
        # Record spend transaction
        # await self.db.execute(
        #     """INSERT INTO transactions 
        #        (user_id, amount, type, status, campaign_id, completed_at)
        #        VALUES ($1, $2, 'SPEND', 'COMPLETED', $3, NOW())""",
        #     user_id, amount, campaign_id
        # )
        
        return True


# ============== Payment Handler ==============

class PaymentHandler:
    """
    Handler chính cho payment flow
    """
    
    def __init__(self):
        self.payos = PayOSClient()
        self.wallet = None  # WalletService(db)
    
    def generate_order_code(self) -> str:
        """Tạo mã đơn hàng unique"""
        timestamp = int(datetime.now().timestamp() * 1000)
        return f"KDF{timestamp}"
    
    async def create_payment(
        self,
        user_id: str,
        amount: int,
        base_url: str
    ) -> PaymentLink:
        """
        Tạo payment link cho user
        
        1. Generate order code
        2. Create PayOS payment link
        3. Save pending transaction
        4. Return QR code
        """
        
        order_code = self.generate_order_code()
        
        # Save pending transaction to DB
        # await db.execute(
        #     """INSERT INTO transactions 
        #        (user_id, order_code, amount, type, status)
        #        VALUES ($1, $2, $3, 'DEPOSIT', 'PENDING')""",
        #     user_id, order_code, amount
        # )
        
        # Create PayOS payment
        payment_link = await self.payos.create_payment_link(
            order_code=order_code,
            amount=amount,
            description=f"Nap tien KODAFLOW - {amount:,} VND",
            return_url=f"{base_url}/payment/success?orderCode={order_code}",
            cancel_url=f"{base_url}/payment/cancel?orderCode={order_code}"
        )
        
        return payment_link
    
    async def handle_webhook(self, payload: WebhookPayload) -> bool:
        """
        Xử lý webhook từ PayOS khi thanh toán hoàn tất
        
        1. Verify signature
        2. Check transaction exists
        3. Update wallet balance
        4. Mark transaction completed
        5. Notify user (via WebSocket/Telegram)
        """
        
        # Verify signature
        if not self.payos.verify_webhook_signature(
            payload.data, 
            payload.signature
        ):
            raise ValueError("Invalid webhook signature")
        
        if not payload.success:
            return False
        
        order_code = payload.data.get("orderCode")
        amount = payload.data.get("amount", 0)
        
        # Get user_id from transaction
        # transaction = await db.fetchone(
        #     "SELECT user_id FROM transactions WHERE order_code = $1",
        #     f"KDF{order_code}"
        # )
        
        # Add credits to wallet
        # await self.wallet.add_credits(
        #     transaction["user_id"],
        #     amount,
        #     f"KDF{order_code}"
        # )
        
        # Notify user via WebSocket
        # await websocket_manager.send_to_user(
        #     transaction["user_id"],
        #     {"type": "payment_success", "amount": amount}
        # )
        
        return True
    
    async def check_payment_status(self, order_code: str) -> PaymentStatus:
        """Kiểm tra trạng thái thanh toán"""
        return await self.payos.get_payment_status(order_code)


# ============== Test ==============

if __name__ == "__main__":
    import asyncio
    
    async def test():
        handler = PaymentHandler()
        
        # Test create payment
        payment = await handler.create_payment(
            user_id="user123",
            amount=200000,
            base_url="https://kodaflow.vn"
        )
        
        print(f"Payment created: {payment}")
    
    asyncio.run(test())
