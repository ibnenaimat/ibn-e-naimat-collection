/**
 * Ibn e Naimat Collection — Order Notification Engine
 * Handles automated WhatsApp messages and confirmation emails for customers.
 * Supports Order Confirmation, Order Dispatched, Order Delivered, and Custom messages.
 */

(function(window) {
  'use strict';

  // Normalize Pakistani and international phone numbers to wa.me format (e.g. 923302241340)
  function normalizePhone(phone) {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.startsWith('0092')) {
      cleaned = '92' + cleaned.slice(4);
    } else if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.slice(1);
    } else if (!cleaned.startsWith('92') && cleaned.length === 10) {
      cleaned = '92' + cleaned;
    }
    return cleaned;
  }

  // Format PKR
  function formatPKR(val) {
    return 'PKR ' + (Number(val) || 0).toLocaleString('en-PK');
  }

  // Build items summary for text/WhatsApp
  function formatItemsText(items) {
    if (!items || !items.length) return 'Curated items registered with order';
    return items.map((it, idx) => {
      const name = it.product_name || it.name || 'Product';
      const qty = it.quantity || 1;
      const price = formatPKR(it.unit_price || it.price || 0);
      const subtotal = formatPKR((Number(it.unit_price || it.price || 0)) * qty);
      return `${idx + 1}. *${name}*\n   Qty: ${qty} × ${price} = *${subtotal}*`;
    }).join('\n');
  }

  // Generate Tracking URL
  function getTrackingUrl(order) {
    const origin = window.location.origin || '';
    const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const baseUrl = origin + path;
    const orderId = order.order_id || order.id || '';
    const phone = order.customer_phone || order.phone || '';
    return `${baseUrl}track-order.html?id=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`;
  }

  // --- WHATSAPP MESSAGE TEMPLATES ---

  /**
   * Order Confirmed WhatsApp Message
   */
  function generateWhatsAppConfirmation(order) {
    const orderId = order.order_id || order.id || 'INC-ORDER';
    const name = order.customer_name || 'Valued Customer';
    const city = order.customer_city || order.city || 'Pakistan';
    const address = order.customer_address || order.address || 'Address provided at checkout';
    const total = formatPKR(order.total || order.grand_total || 0);
    const subtotal = formatPKR(order.subtotal || 0);
    const delivery = Number(order.delivery_fee || 0) === 0 ? 'FREE' : formatPKR(order.delivery_fee);
    const itemsList = formatItemsText(order.items || []);
    const trackingUrl = getTrackingUrl(order);

    return `*IBN E NAIMAT COLLECTION*
*ORDER CONFIRMATION* 🛍️✨

Assalam-o-Alaikum *${name}*!

Great news! Your order has been *CONFIRMED* and registered in our fulfillment system.

━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* ${orderId}
📅 *Status:* Confirmed & In Preparation
━━━━━━━━━━━━━━━━━━━

🛍️ *Order Breakdown:*
${itemsList}

━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* ${subtotal}
🚚 *Nationwide Delivery:* ${delivery}
💳 *Grand Total:* *${total}*
💵 *Payment Method:* Cash on Delivery (COD)
━━━━━━━━━━━━━━━━━━━

📍 *Delivery Address:*
${address}, ${city}

✨ *What Happens Next?*
1. Our horology & packing team is preparing your package.
2. We will share a live video inspection of your items on this chat before courier handover.
3. You will receive courier dispatch tracking as soon as it leaves our hub.

🔎 *Track Your Order Status Live:*
${trackingUrl}

Thank you for choosing *Ibn e Naimat Collection*!
Official Concierge Hotline: 0330 2241340`;
  }

  /**
   * Order Dispatched WhatsApp Message
   */
  function generateWhatsAppDispatch(order, trackingCode = '', courierName = 'TCS / Leopards Courier') {
    const orderId = order.order_id || order.id || 'INC-ORDER';
    const name = order.customer_name || 'Valued Customer';
    const city = order.customer_city || order.city || 'Pakistan';
    const total = formatPKR(order.total || 0);
    const trackingUrl = getTrackingUrl(order);

    return `*IBN E NAIMAT COLLECTION*
*DISPATCH NOTIFICATION* 🚚📦

Assalam-o-Alaikum *${name}*!

Your order *#${orderId}* has been inspected, packed with tamper-evident seals, and *DISPATCHED* via ${courierName}.

━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* ${orderId}
🚚 *Courier Partner:* ${courierName}
${trackingCode ? `🏷️ *Courier Tracking #:* ${trackingCode}\n` : ''}💰 *Payable at Doorstep:* *${total}* (Cash on Delivery)
📍 *Destination:* ${city}
━━━━━━━━━━━━━━━━━━━

⏱️ *Estimated Delivery:* 2–3 business days.
Please keep exact cash ready upon courier arrival.

🔎 *Live Order Tracking:*
${trackingUrl}

If you have any questions or require assistance, our concierge is here to help!
Hotline: 0330 2241340`;
  }

  /**
   * Open Customer WhatsApp Chat with Pre-filled Message
   */
  function sendWhatsAppToCustomer(order, type = 'confirmed', customData = {}) {
    const phone = order.customer_phone || order.phone || '';
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) {
      alert('Customer phone number is missing or invalid.');
      return false;
    }

    let message = '';
    if (type === 'confirmed') {
      message = generateWhatsAppConfirmation(order);
    } else if (type === 'dispatched') {
      message = generateWhatsAppDispatch(order, customData.trackingCode, customData.courierName);
    } else if (type === 'custom') {
      message = customData.customMessage || generateWhatsAppConfirmation(order);
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  // --- HTML EMAIL TEMPLATES ---

  /**
   * Generate Responsive Luxury HTML Email
   */
  function generateConfirmationEmailHtml(order) {
    const orderId = order.order_id || order.id || 'INC-ORDER';
    const name = order.customer_name || 'Valued Customer';
    const city = order.customer_city || order.city || 'Pakistan';
    const address = order.customer_address || order.address || 'Delivery details on file';
    const total = formatPKR(order.total || 0);
    const subtotal = formatPKR(order.subtotal || 0);
    const delivery = Number(order.delivery_fee || 0) === 0 ? 'FREE' : formatPKR(order.delivery_fee);
    const trackingUrl = getTrackingUrl(order);
    const items = order.items || [];

    const itemsRows = items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
          <div style="font-weight: 700; color: #242321; font-size: 14px;">${item.product_name || item.name}</div>
          <div style="font-size: 12px; color: #888888;">Ref: ${item.product_id || item.id || '-'}</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #eeeeee; font-weight: 600; color: #242321; font-size: 14px;">${item.quantity || 1}</td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #eeeeee; font-weight: 700; color: #b59a6a; font-size: 14px;">${formatPKR(Number(item.unit_price || item.price || 0) * Number(item.quantity || 1))}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — Ibn e Naimat Collection</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5ef; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #242321;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f5ef; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #ddd6ca;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #242321; padding: 28px 30px; text-align: center; border-bottom: 3px solid #b59a6a;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;">
                IBN E NAIMAT COLLECTION
              </h1>
              <p style="color: #b59a6a; margin: 6px 0 0 0; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">
                Curators of Original Timepieces &amp; Curated Lifestyle
              </p>
            </td>
          </tr>

          <!-- Confirmation Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-block; width: 54px; height: 54px; line-height: 54px; border-radius: 50%; background-color: #e8f5e9; color: #166534; font-size: 26px; text-align: center;">✓</div>
                <h2 style="font-size: 22px; color: #242321; margin: 12px 0 4px 0;">Order Confirmed!</h2>
                <p style="color: #6b665e; font-size: 14px; margin: 0;">Assalam-o-Alaikum <strong>${name}</strong>, thank you for shopping with us.</p>
              </div>

              <!-- Order ID Badge -->
              <div style="background-color: #f1ece3; border: 1.5px dashed #b59a6a; border-radius: 6px; padding: 15px; text-align: center; margin-bottom: 25px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #6b665e; font-weight: 700;">Order ID Reference</div>
                <div style="font-size: 20px; font-weight: 800; color: #242321; letter-spacing: 0.05em; margin-top: 3px;">${orderId}</div>
              </div>

              <!-- Shipping Address -->
              <table role="presentation" width="100%" style="background-color: #faf8f5; border-radius: 6px; padding: 16px; margin-bottom: 25px; border: 1px solid #eeeeee;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #b59a6a; margin-bottom: 6px;">Delivery Destination</div>
                    <div style="font-size: 14px; color: #242321; line-height: 1.5;">
                      <strong>${name}</strong><br>
                      ${address}<br>
                      ${city}, Pakistan<br>
                      <strong>Phone:</strong> ${order.customer_phone || order.phone || '-'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Ordered Items -->
              <h3 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.06em; color: #242321; margin: 0 0 12px 0; border-bottom: 2px solid #242321; padding-bottom: 6px;">
                Ordered Items
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th align="left" style="font-size: 11px; text-transform: uppercase; color: #888888; padding-bottom: 8px;">Product</th>
                    <th align="center" style="font-size: 11px; text-transform: uppercase; color: #888888; padding-bottom: 8px;">Qty</th>
                    <th align="right" style="font-size: 11px; text-transform: uppercase; color: #888888; padding-bottom: 8px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #6b665e;">Subtotal:</td>
                  <td align="right" width="120" style="padding: 4px 0; font-size: 13px; color: #242321; font-weight: 600;">${subtotal}</td>
                </tr>
                <tr>
                  <td align="right" style="padding: 4px 0; font-size: 13px; color: #6b665e;">Nationwide Delivery:</td>
                  <td align="right" width="120" style="padding: 4px 0; font-size: 13px; color: #242321; font-weight: 600;">${delivery}</td>
                </tr>
                <tr>
                  <td align="right" style="padding: 10px 0; font-size: 16px; font-weight: 800; color: #242321; border-top: 2px dashed #ddd6ca;">Grand Total (COD):</td>
                  <td align="right" width="120" style="padding: 10px 0; font-size: 18px; font-weight: 800; color: #b59a6a; border-top: 2px dashed #ddd6ca;">${total}</td>
                </tr>
              </table>

              <!-- Live Tracking CTA -->
              <div style="text-align: center; margin: 30px 0 20px 0;">
                <a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: #242321; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #b59a6a;">
                  Track Your Live Order Online →
                </a>
              </div>

              <!-- Quality Promise -->
              <div style="background-color: #fbfbf9; border-left: 3px solid #b59a6a; padding: 12px 16px; font-size: 12px; color: #6b665e; line-height: 1.5; margin-top: 25px;">
                <strong>Authenticity Guarantee:</strong> Every item is pre-inspected. Our team shares an HD video inspection on WhatsApp (+92 330 2241340) before handing your parcel to the courier.
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1ece3; padding: 20px 30px; text-align: center; border-top: 1px solid #ddd6ca;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #6b665e;">
                Questions? WhatsApp us anytime: <a href="https://wa.me/923302241340" style="color: #128c7e; font-weight: 700; text-decoration: none;">0330 2241340</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #8e887e;">
                © ${new Date().getFullYear()} Ibn e Naimat Collection • All Rights Reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Plain text email fallback
   */
  function generateConfirmationEmailText(order) {
    const orderId = order.order_id || order.id || 'INC-ORDER';
    const name = order.customer_name || 'Valued Customer';
    const total = formatPKR(order.total || 0);
    const trackingUrl = getTrackingUrl(order);

    return `IBN E NAIMAT COLLECTION — ORDER CONFIRMATION

Assalam-o-Alaikum ${name},

Your order #${orderId} has been confirmed.

Order ID: ${orderId}
Grand Total: ${total} (Cash on Delivery)
Delivery Address: ${order.customer_address || order.address || ''}, ${order.customer_city || order.city || ''}

Track your live order online:
${trackingUrl}

We inspect every order thoroughly and share a video inspection on WhatsApp before dispatch.

WhatsApp Concierge Hotline: 0330 2241340
https://wa.me/923302241340`;
  }

  /**
   * Send Email to Customer
   * Automatically attempts EmailJS if configured; otherwise opens pre-filled email client.
   */
  async function sendEmailToCustomer(order) {
    const toEmail = order.customer_email || order.email;
    if (!toEmail) {
      return { success: false, reason: 'no_email', message: 'No customer email address provided for this order.' };
    }

    const orderId = order.order_id || order.id || 'INC-ORDER';
    const subject = `Order Confirmed: #${orderId} — Ibn e Naimat Collection`;
    const htmlBody = generateConfirmationEmailHtml(order);
    const textBody = generateConfirmationEmailText(order);

    // 1. Try EmailJS if available and credentials configured
    const emailJsConfig = getEmailJsConfig();
    if (window.emailjs && emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey) {
      try {
        emailjs.init(emailJsConfig.publicKey);
        const templateParams = {
          to_email: toEmail,
          to_name: order.customer_name || 'Valued Customer',
          order_id: orderId,
          total_amount: formatPKR(order.total),
          customer_city: order.customer_city || order.city || '',
          customer_address: order.customer_address || order.address || '',
          items_summary: formatItemsText(order.items || []),
          tracking_url: getTrackingUrl(order),
          html_content: htmlBody,
          plain_content: textBody
        };

        const res = await emailjs.send(emailJsConfig.serviceId, emailJsConfig.templateId, templateParams);
        return { success: true, method: 'emailjs', response: res };
      } catch (err) {
        console.warn('[OrderNotification] EmailJS send failed, falling back to mailto:', err);
      }
    }

    // 2. Fallback to Mailto client
    openEmailClient(order);
    return { success: true, method: 'mailto', message: 'Opened email client with pre-filled confirmation receipt.' };
  }

  /**
   * Launch Default Email Client with Pre-filled Confirmation
   */
  function openEmailClient(order) {
    const toEmail = order.customer_email || order.email || '';
    const orderId = order.order_id || order.id || 'INC-ORDER';
    const subject = encodeURIComponent(`Order Confirmed: #${orderId} — Ibn e Naimat Collection`);
    const body = encodeURIComponent(generateConfirmationEmailText(order));
    const mailtoUrl = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  }

  // Get EmailJS credentials from CONFIG or localStorage
  function getEmailJsConfig() {
    let cfg = {};
    try {
      const local = localStorage.getItem('ibn_emailjs_config');
      if (local) cfg = JSON.parse(local);
    } catch (e) {}

    return {
      serviceId: cfg.serviceId || window.CONFIG?.emailjs?.serviceId || '',
      templateId: cfg.templateId || window.CONFIG?.emailjs?.templateId || '',
      publicKey: cfg.publicKey || window.CONFIG?.emailjs?.publicKey || ''
    };
  }

  // Save EmailJS credentials
  function saveEmailJsConfig(serviceId, templateId, publicKey) {
    localStorage.setItem('ibn_emailjs_config', JSON.stringify({
      serviceId: serviceId.trim(),
      templateId: templateId.trim(),
      publicKey: publicKey.trim()
    }));
  }

  // Export module
  window.OrderNotification = {
    normalizePhone,
    formatPKR,
    formatItemsText,
    getTrackingUrl,
    generateWhatsAppConfirmation,
    generateWhatsAppDispatch,
    sendWhatsAppToCustomer,
    generateConfirmationEmailHtml,
    generateConfirmationEmailText,
    sendEmailToCustomer,
    openEmailClient,
    getEmailJsConfig,
    saveEmailJsConfig
  };

})(window);
