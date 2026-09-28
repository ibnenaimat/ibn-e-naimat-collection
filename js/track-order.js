/**
 * Ibn e Naimat Collection - Public Order Tracking Engine
 * Enforces dual credential security (Order ID + Customer Phone)
 * and animates step-by-step fulfillment timeline.
 */

(function () {
  'use strict';

  function formatPKR(val) {
    return 'PKR ' + Number(val || 0).toLocaleString('en-PK');
  }

  function resolveImg(src) {
    if (!src) return 'assets/images/placeholders/watch-placeholder.svg';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return src;
  }

  function formatDate(isoStr) {
    if (!isoStr) return 'Recently';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  }

  function maskPhone(p) {
    if (!p) return '-';
    const clean = p.replace(/[^0-9]/g, '');
    if (clean.length >= 10) {
      return clean.slice(0, 4) + ' •••• ' + clean.slice(-3);
    }
    return p;
  }

  // Status mapping to Stepper Index (1-6)
  const STATUS_CONFIG = {
    'Pending': { step: 1, label: 'Pending Verification', class: 'status-pending', percent: '0%' },
    'Confirmed': { step: 2, label: 'Order Confirmed', class: 'status-confirmed', percent: '20%' },
    'Processing': { step: 3, label: 'Processing & Video Inspection', class: 'status-processing', percent: '40%' },
    'Dispatched': { step: 4, label: 'Dispatched via Courier', class: 'status-dispatched', percent: '60%' },
    'Out for Delivery': { step: 5, label: 'Out for Delivery', class: 'status-out-for-delivery', percent: '80%' },
    'Delivered': { step: 6, label: 'Delivered Successfully', class: 'status-delivered', percent: '100%' },
    'Cancelled': { step: 0, label: 'Cancelled', class: 'status-cancelled', percent: '0%' }
  };

  async function handleTrack(orderId, phone) {
    const errorCard = document.getElementById('trackErrorCard');
    const errorMsg = document.getElementById('trackErrorMsg');
    const resultCard = document.getElementById('trackResultCard');
    const submitBtn = document.getElementById('btnTrackSubmit');

    function showError(msg) {
      if (resultCard) resultCard.style.display = 'none';
      if (errorCard) errorCard.style.display = 'block';
      if (errorMsg) errorMsg.textContent = msg;
      errorCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearError() {
      if (errorCard) errorCard.style.display = 'none';
    }

    clearError();

    if (!orderId || !orderId.trim()) {
      showError('Please enter your unique Order ID (e.g. INC-20260927-0042).');
      return;
    }

    if (!phone || !phone.trim()) {
      showError('Please enter the customer phone number provided at checkout for security verification.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation: spin 0.8s linear infinite;"></span> Verifying...';
    }

    try {
      const response = await window.STORE_CLIENT.trackOrder(orderId, phone);

      if (response && response.success && response.order) {
        renderOrderDetails(response.order, response.items || []);
        if (resultCard) {
          resultCard.style.display = 'block';
          resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        showError(response?.error || 'No order found matching this Order ID and Phone Number. Please check your credentials.');
      }
    } catch (err) {
      console.error('[TrackOrder] Exception:', err);
      showError('Unable to connect to order tracking service. Please try again or chat with us on WhatsApp.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-search"></i> <span>Track Order</span>';
      }
    }
  }

  function renderOrderDetails(order, items) {
    document.getElementById('resOrderId').textContent = order.order_id;
    document.getElementById('resOrderDate').textContent = formatDate(order.created_at);
    document.getElementById('resOrderUpdated').textContent = formatDate(order.updated_at || order.created_at);

    // Status Badge
    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
    const badge = document.getElementById('resStatusBadge');
    if (badge) {
      badge.className = `status-badge ${statusCfg.class}`;
      badge.innerHTML = `<i class="bi bi-circle-fill" style="font-size:0.55rem;"></i> ${statusCfg.label}`;
    }

    // Cancelled handling
    const cancelledBanner = document.getElementById('resCancelledBanner');
    const timelineBox = document.getElementById('resTimelineBox');
    if (order.status === 'Cancelled') {
      if (cancelledBanner) {
        cancelledBanner.style.display = 'flex';
        const reasonEl = document.getElementById('resCancelledReason');
        if (reasonEl) {
          reasonEl.textContent = order.admin_notes || 'This order was cancelled. Please contact our WhatsApp concierge if you have questions.';
        }
      }
      if (timelineBox) timelineBox.style.display = 'none';
    } else {
      if (cancelledBanner) cancelledBanner.style.display = 'none';
      if (timelineBox) timelineBox.style.display = 'block';
      updateStepper(statusCfg.step, statusCfg.percent);
    }

    // Customer & destination
    document.getElementById('resCustName').textContent = order.customer_name || '-';
    document.getElementById('resCustCity').textContent = order.city || '-';
    document.getElementById('resCustAddress').textContent = order.address || '-';
    document.getElementById('resCustPhone').textContent = maskPhone(order.phone);

    // Financials
    document.getElementById('resSubtotal').textContent = formatPKR(order.subtotal);
    document.getElementById('resDeliveryFee').textContent = Number(order.delivery_fee) === 0 ? 'FREE' : formatPKR(order.delivery_fee);
    document.getElementById('resGrandTotal').textContent = formatPKR(order.total);

    // Line items
    const tbody = document.getElementById('trackItemsTableBody');
    if (tbody) {
      if (items && items.length > 0) {
        tbody.innerHTML = items.map(item => `
          <tr>
            <td>
              <div class="track-prod-cell">
                <div class="track-prod-img">
                  <img src="${resolveImg(item.image_url || item.image)}" alt="${item.product_name || item.name}" onerror="this.src='assets/images/placeholders/watch-placeholder.svg'">
                </div>
                <div>
                  <div style="font-weight: 600;">${item.product_name || item.name}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">SKU: ${item.product_id || item.id}</div>
                </div>
              </div>
            </td>
            <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
            <td style="text-align: right;">${formatPKR(item.price)}</td>
            <td style="text-align: right; font-weight: 700;">${formatPKR(Number(item.price) * Number(item.quantity))}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
              Items registered under Order ID: <strong>${order.order_id}</strong>
            </td>
          </tr>
        `;
      }
    }

    // WhatsApp assistance link
    const waBtn = document.getElementById('resWaSupportBtn');
    if (waBtn) {
      const msg = `Hello Ibn e Naimat Collection,\n\nI have an inquiry regarding my order:\n- *Order ID:* ${order.order_id}\n- *Customer Name:* ${order.customer_name}\n- *Current Status:* ${order.status}\n\nPlease share latest delivery update.`;
      const waNum = window.CONFIG?.whatsapp?.international || '923302241340';
      waBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
    }
  }

  function updateStepper(currentStep, percent) {
    const fill = document.getElementById('resStepperFill');
    if (fill) fill.style.width = percent;

    for (let i = 1; i <= 6; i++) {
      const node = document.getElementById(`stepNode${i}`);
      if (!node) continue;

      node.classList.remove('completed', 'active');
      const circle = node.querySelector('.step-circle');

      if (i < currentStep) {
        node.classList.add('completed');
        if (circle) circle.innerHTML = '<i class="bi bi-check2"></i>';
      } else if (i === currentStep) {
        node.classList.add('active');
        if (circle) circle.innerHTML = '<i class="bi bi-arrow-right-short"></i>';
      } else {
        if (circle) circle.textContent = i;
      }
    }
  }

  function init() {
    const form = document.getElementById('trackOrderForm');
    const orderInput = document.getElementById('trackOrderId');
    const phoneInput = document.getElementById('trackPhone');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTrack(orderInput?.value, phoneInput?.value);
      });
    }

    // Auto-fill from URL query params
    const params = new URLSearchParams(window.location.search);
    const qId = params.get('id') || params.get('order_id');
    const qPhone = params.get('phone');

    if (qId && orderInput) orderInput.value = qId;
    if (qPhone && phoneInput) phoneInput.value = qPhone;

    if (qId && qPhone) {
      handleTrack(qId, qPhone);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
