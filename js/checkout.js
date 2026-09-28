/**
 * Ibn e Naimat Collection - Checkout Engine
 * Validates customer details, computes financials, generates unique Order ID,
 * and records order in live Supabase & local database.
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

  let deliveryFee = 250;
  let freeThreshold = 10000;

  // Initialize Checkout View
  async function initCheckout() {
    let items = window.Cart ? window.Cart.getItems() : [];

    // Support ?demo=1 for instant verification / testing
    if ((!items || items.length === 0) && new URLSearchParams(window.location.search).get('demo') === '1') {
      if (window.Cart) {
        window.Cart.addItem({
          id: "WTC-OLEVS-9931",
          name: "OLEVS 9931 Luxury Automatic Gold",
          price: 13500,
          originalPrice: 17500,
          image: "assets/images/products/watches/olevs-9931-gold.jpg",
          category: "Watches"
        }, 1);
        window.Cart.addItem({
          id: "HN-ROYAL-500",
          name: "Royal Honey Nuts Jar (500g)",
          price: 2450,
          originalPrice: 2950,
          image: "assets/images/products/honey-nuts/royal-honey-nuts-500g.png",
          category: "Honey Nuts"
        }, 2);
        items = window.Cart.getItems();
      }
    }

    const checkoutGrid = document.getElementById('checkoutGrid');
    const emptyState = document.getElementById('checkoutEmptyCartState');

    if (!items || items.length === 0) {
      if (checkoutGrid) checkoutGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (checkoutGrid) checkoutGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // Fetch delivery settings from website_settings if live
    if (window.STORE_CLIENT) {
      try {
        const { data: settings } = await window.STORE_CLIENT.fetchWebsiteSettings();
        if (settings) {
          if (settings.default_delivery_fee !== undefined) deliveryFee = Number(settings.default_delivery_fee);
          if (settings.free_delivery_threshold !== undefined) freeThreshold = Number(settings.free_delivery_threshold);
        }
      } catch (e) {
        console.warn('[Checkout] Using fallback delivery settings:', e);
      }
    }

    renderSummary(items);
    attachListeners();
  }

  // Render Order Items & Totals in Review Card
  function renderSummary(items) {
    const itemsListEl = document.getElementById('checkoutItemsList');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const deliveryFeeEl = document.getElementById('checkoutDeliveryFee');
    const grandTotalEl = document.getElementById('checkoutGrandTotal');

    if (!itemsListEl) return;

    const subtotal = items.reduce((sum, i) => sum + (Number(i.price) * (Number(i.quantity) || 1)), 0);
    const applicableDelivery = (subtotal >= freeThreshold || subtotal === 0) ? 0 : deliveryFee;
    const grandTotal = subtotal + applicableDelivery;

    itemsListEl.innerHTML = items.map(item => `
      <div class="summary-item-row">
        <div class="summary-item-img">
          <img src="${resolveImg(item.image)}" alt="${item.name}" onerror="this.src='assets/images/placeholders/watch-placeholder.svg'">
        </div>
        <div class="summary-item-info">
          <div class="summary-item-name" title="${item.name}">${item.name}</div>
          <div class="summary-item-qty">SKU: ${item.id} &bull; Qty: ${item.quantity}</div>
        </div>
        <div class="summary-item-price">
          ${formatPKR(item.price * item.quantity)}
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = formatPKR(subtotal);
    if (deliveryFeeEl) {
      deliveryFeeEl.innerHTML = applicableDelivery === 0 
        ? '<span style="color:var(--wa-green-dark); font-weight:700;">FREE Delivery</span>' 
        : formatPKR(applicableDelivery);
    }
    if (grandTotalEl) grandTotalEl.textContent = formatPKR(grandTotal);
  }

  // Form Validation and Submission
  function attachListeners() {
    const citySelect = document.getElementById('custCity');
    const otherCityGroup = document.getElementById('otherCityGroup');
    const otherCityInput = document.getElementById('custOtherCity');

    if (citySelect) {
      citySelect.addEventListener('change', () => {
        if (citySelect.value === 'Other') {
          if (otherCityGroup) otherCityGroup.style.display = 'block';
          if (otherCityInput) otherCityInput.setAttribute('required', 'true');
        } else {
          if (otherCityGroup) otherCityGroup.style.display = 'none';
          if (otherCityInput) otherCityInput.removeAttribute('required');
        }
      });
    }

    // Place Order Button
    const placeOrderBtn = document.getElementById('btnPlaceOrder');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // Listen for cart changes
    window.addEventListener('cart:updated', () => {
      const currentItems = window.Cart ? window.Cart.getItems() : [];
      if (currentItems.length === 0) {
        initCheckout();
      } else {
        renderSummary(currentItems);
      }
    });
  }

  // Handle Order Placement
  async function handlePlaceOrder() {
    const errorBox = document.getElementById('checkoutErrorMsg');
    const placeOrderBtn = document.getElementById('btnPlaceOrder');

    function showError(msg) {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert(msg);
      }
    }

    function clearError() {
      if (errorBox) {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
      }
    }

    clearError();

    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const emailInput = document.getElementById('custEmail');
    const addressInput = document.getElementById('custAddress');
    const citySelect = document.getElementById('custCity');
    const otherCityInput = document.getElementById('custOtherCity');
    const notesInput = document.getElementById('custNotes');

    const customerName = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const address = addressInput ? addressInput.value.trim() : '';
    let city = citySelect ? citySelect.value : '';
    if (city === 'Other') {
      city = otherCityInput ? otherCityInput.value.trim() : '';
    }
    const notes = notesInput ? notesInput.value.trim() : '';

    // Validation Rules
    if (!customerName || customerName.length < 2) {
      showError('Please enter your full name.');
      nameInput?.focus();
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone || cleanPhone.length < 10) {
      showError('Please enter a valid Pakistan mobile/WhatsApp number (e.g. 0330 2241340).');
      phoneInput?.focus();
      return;
    }

    if (!address || address.length < 8) {
      showError('Please enter your complete street delivery address.');
      addressInput?.focus();
      return;
    }

    if (!city) {
      showError('Please select or specify your delivery city in Pakistan.');
      citySelect?.focus();
      return;
    }

    const items = window.Cart ? window.Cart.getItems() : [];
    if (!items || items.length === 0) {
      showError('Your cart is empty. Please add items to your cart before placing an order.');
      return;
    }

    const subtotal = items.reduce((sum, i) => sum + (Number(i.price) * (Number(i.quantity) || 1)), 0);
    const applicableDelivery = (subtotal >= freeThreshold || subtotal === 0) ? 0 : deliveryFee;
    const grandTotal = subtotal + applicableDelivery;

    // Disable button to prevent double-submissions
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation: spin 0.8s linear infinite;"></span>
        <span>Securing &amp; Placing Order...</span>
      `;
    }

    try {
      const orderPayload = {
        customer_name: customerName,
        phone: phone,
        email: email,
        address: address,
        city: city,
        notes: notes,
        subtotal: subtotal,
        delivery_fee: applicableDelivery,
        total: grandTotal,
        payment_method: 'cod'
      };

      const result = await window.STORE_CLIENT.createOrder(orderPayload, items);

      if (result && result.success) {
        // Cache last placed order in sessionStorage for fast confirmation display
        sessionStorage.setItem('last_placed_order', JSON.stringify({
          orderId: result.orderId,
          order: result.order,
          items: result.items
        }));

        // Clear cart
        if (window.Cart) {
          window.Cart.clearCart();
        }

        // Redirect to Confirmation Page
        window.location.href = `order-confirmation.html?id=${encodeURIComponent(result.orderId)}`;
      } else {
        throw new Error(result?.error || 'Failed to record order.');
      }
    } catch (err) {
      console.error('[Checkout] Error during order placement:', err);
      showError('There was an issue processing your order. Please try again or order directly via WhatsApp.');
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = `
          <i class="bi bi-shield-lock-fill" style="color: var(--gold-champagne);"></i>
          <span>Confirm &amp; Place Order</span>
        `;
      }
    }
  }

  // Self-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
  } else {
    initCheckout();
  }

})();
