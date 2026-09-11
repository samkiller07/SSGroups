import nodemailer from 'nodemailer';
import { Order, OrderItem, BrandConfig } from '@/types';
import { BRANDS } from '@/config/brands';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Create reusable SMTP transporter
function getTransporter() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const rawPort = (process.env.SMTP_PORT || '465').trim();
  const port = parseInt(rawPort, 10) || 465;
  const user = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const pass = (process.env.SMTP_PASSWORD || '').trim().replace(/^["']|["']$/g, '');

  if (!user || !pass) {
    console.warn('[Email] SMTP credentials not configured (SMTP_USER or SMTP_PASSWORD missing in environment)');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
    connectionTimeout: 12000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Generate responsive, self-contained HTML email for order confirmation
 */
export function generateOrderConfirmationEmailHtml(order: Order, brand: BrandConfig): string {
  const brandColor = brand.theme.primaryColor || '#06B6D4';
  const items = order.items || [];
  const formattedDate = new Date(order.confirmedAt || order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 500;">
          ${escapeHtml(item.productName)}
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Unit: ${escapeHtml(item.unitType)} (${item.unitValue})</div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; text-align: right;">
          ₹${Number(item.unitPrice).toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">
          ₹${Number(item.lineTotal).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - ${escapeHtml(order.invoiceNumber)}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <tr>
      <td style="padding: 32px 28px; background: linear-gradient(135deg, ${brandColor} 0%, #0f172a 100%); text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
          ${escapeHtml(brand.name)}
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1; font-weight: 400;">
          ${escapeHtml(brand.tagline)}
        </p>
        <div style="margin-top: 20px; display: inline-block; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #ffffff; border: 1px solid rgba(255,255,255,0.3);">
          ✓ Order Confirmed
        </div>
      </td>
    </tr>

    <!-- Greeting & Invoice Info -->
    <tr>
      <td style="padding: 28px 28px 20px 28px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a;">
          Dear <strong>${escapeHtml(order.customerName)}</strong>,
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          Thank you for choosing <strong>${escapeHtml(brand.name)}</strong>. Your order has been officially verified and <strong>CONFIRMED</strong> by our team. The inventory has been allocated, and your order is now being processed.
        </p>

        <!-- Metadata Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <tr>
            <td style="padding: 14px 16px; width: 50%; vertical-align: top; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">Invoice Number</div>
              <div style="font-size: 16px; font-weight: 800; color: ${brandColor}; margin-top: 4px;">${escapeHtml(order.invoiceNumber)}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Date: ${formattedDate}</div>
            </td>
            <td style="padding: 14px 16px; width: 50%; vertical-align: top;">
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">Customer Details</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 4px;">${escapeHtml(order.customerName)}</div>
              <div style="font-size: 12px; color: #475569;">📞 ${escapeHtml(order.customerPhone)}</div>
              <div style="font-size: 12px; color: #475569;">✉️ ${escapeHtml(order.customerEmail)}</div>
              <div style="font-size: 12px; color: #0284c7; font-weight: 600; margin-top: 4px;">Mode: ${order.deliveryMethod === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'Store Pickup'}</div>
            </td>
          </tr>
          ${order.customerNote ? `
          <tr>
            <td colspan="2" style="padding: 10px 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569; background-color: #f1f5f9;">
              <strong>Note:</strong> ${escapeHtml(order.customerNote)}
            </td>
          </tr>
          ` : ''}
        </table>

        <!-- Order Items Table -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0;">Product / Service</th>
              <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; width: 60px;">Qty</th>
              <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; width: 85px;">Price</th>
              <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; width: 95px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Price Totals -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
          <tr>
            <td style="width: 55%;"></td>
            <td style="width: 45%;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Subtotal:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600;">₹${Number(order.subtotal).toLocaleString('en-IN')}</td>
                </tr>
                ${order.savings > 0 ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #16a34a;">Savings / Discount:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #16a34a; text-align: right; font-weight: 600;">-₹${Number(order.savings).toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0 4px 0; font-size: 16px; font-weight: 800; color: #0f172a; border-top: 2px solid #e2e8f0;">Grand Total:</td>
                  <td style="padding: 10px 0 4px 0; font-size: 18px; font-weight: 800; color: ${brandColor}; text-align: right; border-top: 2px solid #e2e8f0;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Store Contact Banner -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Store Contact & Support</div>
          <div style="font-size: 13px; color: #334155; line-height: 1.5;">
            📍 ${escapeHtml(brand.address)}<br/>
            ⏰ Hours: ${escapeHtml(brand.openingTime)} – ${escapeHtml(brand.closingTime)} (${escapeHtml(brand.holiday)})<br/>
            📞 Direct: +91 ${escapeHtml(brand.phonePrimary)} | WhatsApp: +91 ${escapeHtml(brand.whatsappNumber)}
          </div>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 28px; background-color: #0f172a; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b;">
        <p style="margin: 0 0 6px 0; color: #cbd5e1; font-weight: 600;">
          SS Multi-Brand Platform — Coimbatore
        </p>
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          This is an automated confirmation receipt generated for Invoice ${escapeHtml(order.invoiceNumber)}. Please retain for your records.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate clean plaintext fallback for order confirmation (prevents spam flags)
 */
export function generateOrderConfirmationEmailText(order: Order, brand: BrandConfig): string {
  const items = order.items || [];
  const itemsList = items
    .map((i) => `* ${i.productName} (Qty: ${i.quantity}, ${i.unitType}) — Rs. ${Number(i.lineTotal).toLocaleString('en-IN')}`)
    .join('\n');

  return `
ORDER CONFIRMATION — ${order.invoiceNumber}
${brand.name}
${brand.tagline}

Dear ${order.customerName},

Thank you for your order with ${brand.name}! Your order has been officially CONFIRMED.

INVOICE DETAILS:
- Invoice Number: ${order.invoiceNumber}
- Customer Name: ${order.customerName}
- Phone: ${order.customerPhone}
- Delivery Method: ${order.deliveryMethod === 'HOME_DELIVERY' ? 'Doorstep Delivery in Coimbatore' : 'Direct Store Pickup'}
- Status: CONFIRMED
- Date: ${new Date(order.confirmedAt || order.createdAt).toLocaleDateString('en-IN')}

ITEMS ORDERED:
${itemsList}

PAYMENT SUMMARY:
- Subtotal: Rs. ${Number(order.subtotal).toLocaleString('en-IN')}
- Savings: Rs. ${Number(order.savings).toLocaleString('en-IN')}
- Total Amount: Rs. ${Number(order.totalAmount).toLocaleString('en-IN')}

STORE INFORMATION:
${brand.name}
Address: ${brand.address}
Phone: +91 ${brand.phonePrimary}
WhatsApp: +91 ${brand.whatsappNumber}
Hours: ${brand.openingTime} - ${brand.closingTime} (${brand.holiday ? 'Holiday: ' + brand.holiday : 'Open All Days'})

This is an official automated confirmation receipt for invoice ${order.invoiceNumber}. Please retain for your records.
`.trim();
}

/**
 * Dispatch branded order confirmation email
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<EmailResult> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return {
        success: false,
        error: 'SMTP not configured. Environment variables SMTP_USER or SMTP_PASSWORD missing in Vercel settings.',
      };
    }

    const brand = BRANDS[order.brandId] || BRANDS.aquarium;
    const emailHtml = generateOrderConfirmationEmailHtml(order, brand);
    const emailText = generateOrderConfirmationEmailText(order, brand);
    const subject = `Order Confirmed — ${order.invoiceNumber} | ${brand.name}`;
    const senderEmail = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
    const fromAddress = `"${brand.name}" <${senderEmail}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: order.customerEmail,
      replyTo: `"${brand.name}" <${senderEmail}>`,
      sender: senderEmail,
      subject,
      text: emailText,
      html: emailHtml,
      headers: {
        'X-Entity-Ref-ID': order.invoiceNumber,
      },
    });

    console.log(`[Email] Order confirmation sent for ${order.invoiceNumber} to ${order.customerEmail}. Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Email] Failed to send order confirmation email:', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
