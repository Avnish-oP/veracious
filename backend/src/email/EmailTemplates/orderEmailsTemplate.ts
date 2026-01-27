// Order Email Templates

interface OrderItem {
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  configuration?: {
    lensType?: string;
    lensPrice?: number;
  };
}

interface OrderData {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
  userName?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const getStatusEmoji = (status: string): string => {
  const emojis: Record<string, string> = {
    PROCESSING: '📦',
    SHIPPED: '🚚',
    DELIVERED: '✅',
    CANCELLED: '❌',
    RETURNED: '↩️',
  };
  return emojis[status] || '📋';
};

const getStatusMessage = (status: string): string => {
  const messages: Record<string, string> = {
    PROCESSING: 'Your order is being prepared and will be shipped soon.',
    SHIPPED: 'Your order is on its way! You can expect delivery soon.',
    DELIVERED: 'Your order has been delivered. We hope you love your purchase!',
    CANCELLED: 'Your order has been cancelled. If you have any questions, please contact support.',
    RETURNED: 'We have received your return request. Our team will process it shortly.',
  };
  return messages[status] || 'Your order status has been updated.';
};

export const orderConfirmationTemplate = (order: OrderData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 24px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .checkmark {
            font-size: 48px;
            margin-bottom: 12px;
        }
        .content {
            padding: 32px 24px;
        }
        .order-id {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-bottom: 24px;
        }
        .order-id span {
            color: #92400e;
            font-weight: 600;
            font-size: 14px;
        }
        .order-id strong {
            display: block;
            color: #78350f;
            font-size: 18px;
            margin-top: 4px;
            font-family: monospace;
        }
        .section-title {
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            margin: 24px 0 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f3f4f6;
        }
        .item {
            display: flex;
            padding: 16px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            background: #f3f4f6;
            object-fit: cover;
            margin-right: 16px;
        }
        .item-details {
            flex: 1;
        }
        .item-name {
            color: #1f2937;
            font-weight: 500;
            margin: 0 0 4px;
        }
        .item-meta {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        .item-price {
            color: #1f2937;
            font-weight: 600;
            text-align: right;
        }
        .summary {
            background: #f9fafb;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            color: #4b5563;
        }
        .summary-row.total {
            border-top: 2px solid #e5e7eb;
            margin-top: 8px;
            padding-top: 16px;
            color: #1f2937;
            font-weight: 600;
            font-size: 18px;
        }
        .summary-row.discount {
            color: #059669;
        }
        .address-box {
            background: #f9fafb;
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
        }
        .address-box p {
            margin: 0;
            color: #4b5563;
            line-height: 1.8;
        }
        .cta-button {
            display: block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 32px 0;
        }
        .footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #d97706;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="checkmark">✓</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for shopping with Veracious${order.userName ? `, ${order.userName}` : ''}!</p>
        </div>
        
        <div class="content">
            <div class="order-id">
                <span>ORDER NUMBER</span>
                <strong>#${order.id}</strong>
            </div>

            <div class="section-title">Order Items</div>
            ${order.items.map(item => `
                <div class="item">
                    <img class="item-image" src="${item.productImage || 'https://via.placeholder.com/60x60?text=Product'}" alt="${item.productName}" />
                    <div class="item-details">
                        <p class="item-name">${item.productName}</p>
                        <p class="item-meta">Qty: ${item.quantity}${item.configuration?.lensType ? ` • Lens: ${item.configuration.lensType}` : ''}</p>
                    </div>
                    <div class="item-price">${formatCurrency(item.price * item.quantity + (item.configuration?.lensPrice || 0))}</div>
                </div>
            `).join('')}

            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${formatCurrency(order.totalAmount)}</span>
                </div>
                ${order.discount > 0 ? `
                <div class="summary-row discount">
                    <span>Discount</span>
                    <span>-${formatCurrency(order.discount)}</span>
                </div>
                ` : ''}
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>FREE</span>
                </div>
                <div class="summary-row total">
                    <span>Total Paid</span>
                    <span>${formatCurrency(order.finalAmount)}</span>
                </div>
            </div>

            ${order.address ? `
            <div class="section-title">Shipping Address</div>
            <div class="address-box">
                <p>
                    ${order.address.line1}<br/>
                    ${order.address.line2 ? order.address.line2 + '<br/>' : ''}
                    ${order.address.city}, ${order.address.state} ${order.address.postal}<br/>
                    ${order.address.country}
                </p>
            </div>
            ` : ''}

            <a href="${process.env.FRONTEND_URL}/orders" class="cta-button">
                Track Your Order →
            </a>
        </div>

        <div class="footer">
            <p>Questions? Contact us at <a href="mailto:cs@otticamart.com">cs@otticamart.com</a></p>
            <p>&copy; ${new Date().getFullYear()} Veracious. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const orderStatusUpdateTemplate = (order: { id: string; userName?: string }, status: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Status Update</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 24px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .status-emoji {
            font-size: 48px;
            margin-bottom: 12px;
        }
        .content {
            padding: 32px 24px;
            text-align: center;
        }
        .order-id {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .order-id strong {
            color: #374151;
            font-family: monospace;
        }
        .status-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 18px;
            margin: 16px 0;
        }
        .status-message {
            color: #4b5563;
            font-size: 16px;
            max-width: 400px;
            margin: 24px auto;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
        }
        .footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #d97706;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status-emoji">${getStatusEmoji(status)}</div>
            <h1>Order Update</h1>
        </div>
        
        <div class="content">
            <p class="order-id">Order <strong>#${order.id}</strong></p>
            
            <p>Hi${order.userName ? ` ${order.userName}` : ''},</p>
            
            <div class="status-badge">${status.replace('_', ' ')}</div>
            
            <p class="status-message">${getStatusMessage(status)}</p>

            <a href="${process.env.FRONTEND_URL}/orders" class="cta-button">
                View Order Details →
            </a>
        </div>

        <div class="footer">
            <p>Questions? Contact us at <a href="mailto:cs@otticamart.com">cs@otticamart.com</a></p>
            <p>&copy; ${new Date().getFullYear()} Veracious. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
