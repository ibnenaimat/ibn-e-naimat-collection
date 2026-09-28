/**
 * Ibn e Naimat Collection - Universal Shopping Cart System
 * 
 * Features:
 * - Persistent Cart state across sessions via localStorage
 * - Real-time Cart Drawer with item list, quantity steppers, subtotals, and totals
 * - Dynamic Header Badge synchronization across all pages
 * - Seamless integration with WhatsApp and Checkout
 * - 100% Mobile & Desktop responsive
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ibn_collection_cart_v1';
  const DEFAULT_DELIVERY_FEE = 250;
  const FREE_DELIVERY_THRESHOLD = 10000;

  // State
  let cartItems = [];

  // Load from localStorage
  function loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cartItems = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
    } catch (e) {
      console.warn('[Cart] Error reading localStorage:', e);
      cartItems = [];
    }
  }

  // Save to localStorage & notify
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('[Cart] Error saving to localStorage:', e);
    }
    updateBadge();
    renderDrawerItems();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: cartItems } }));
  }

  // Currency Formatter
  function formatPKR(val) {
    return 'PKR ' + Number(val || 0).toLocaleString('en-PK');
  }

  // Resolve Image Path
  function resolveImg(src) {
    if (!src) return 'assets/images/placeholders/watch-placeholder.svg';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return src;
  }

  // --- CART OPERATIONS ---
  function getItems() {
    return [...cartItems];
  }

  function getItemCount() {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }

  function getSubtotal() {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  }

  function getDeliveryFee() {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
    return DEFAULT_DELIVERY_FEE;
  }

  function getTotal() {
    return getSubtotal() + getDeliveryFee();
  }

  function addItem(product, quantity = 1, shouldOpenDrawer = true) {
    if (!product || !product.id) return;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const existingIdx = cartItems.findIndex(i => i.id === product.id);
    if (existingIdx > -1) {
      cartItems[existingIdx].quantity += qty;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: product.image || 'assets/images/placeholders/watch-placeholder.svg',
        category: product.category || product.categoryName || '',
        quantity: qty
      });
    }

    saveCart();
    showToast(`Added to Cart: ${product.name}`);
    if (shouldOpenDrawer && !window.location.pathname.endsWith('checkout.html') && !window.location.href.includes('checkout.html')) {
      openDrawer();
    }
  }

  function updateQuantity(productId, quantity) {
    const qty = parseInt(quantity, 10);
    const existingIdx = cartItems.findIndex(i => i.id === productId);
    if (existingIdx === -1) return;

    if (isNaN(qty) || qty <= 0) {
      removeItem(productId);
    } else {
      cartItems[existingIdx].quantity = qty;
      saveCart();
    }
  }

  function removeItem(productId) {
    const existingIdx = cartItems.findIndex(i => i.id === productId);
    if (existingIdx > -1) {
      const item = cartItems[existingIdx];
      cartItems.splice(existingIdx, 1);
      saveCart();
      showToast(`Removed from Cart: ${item.name}`);
    }
  }

  function clearCart() {
    cartItems = [];
    saveCart();
  }

  // --- BADGE UPDATER ---
  function updateBadge() {
    const count = getItemCount();
    const badges = document.querySelectorAll('.cart-badge, #headerCartBadge, #mobileCartBadge');
    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
        badge.style.display = 'inline-flex';
        badge.classList.add('badge-bounce');
        setTimeout(() => badge.classList.remove('badge-bounce'), 300);
      } else {
        badge.style.display = 'inline-flex';
      }
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="bi bi-check2-circle"></i> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- DRAWER UI INJECTION & RENDERING ---
  function injectDrawer() {
    if (document.getElementById('cartDrawerOverlay')) return;

    const drawerHtml = `
      <div class="cart-drawer-overlay" id="cartDrawerOverlay" aria-hidden="true"></div>
      <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping Cart Drawer" aria-hidden="true">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">
            <i class="bi bi-bag-check" style="color: var(--gold-champagne);"></i>
            <span>Your Shopping Cart</span>
            <span class="cart-drawer-count" id="cartDrawerItemCount">(0)</span>
          </div>
          <button class="cart-drawer-close" id="cartDrawerClose" aria-label="Close Shopping Cart">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="cart-drawer-body" id="cartDrawerBody">
          <!-- Rendered dynamically -->
        </div>

        <div class="cart-drawer-footer" id="cartDrawerFooter">
          <!-- Rendered dynamically -->
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    // Event listeners for close
    document.getElementById('cartDrawerClose')?.addEventListener('click', closeDrawer);
    document.getElementById('cartDrawerOverlay')?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('cartDrawer')?.classList.contains('active')) {
        closeDrawer();
      }
    });
  }

  function renderDrawerItems() {
    const body = document.getElementById('cartDrawerBody');
    const footer = document.getElementById('cartDrawerFooter');
    const countBadge = document.getElementById('cartDrawerItemCount');
    if (!body || !footer) return;

    const count = getItemCount();
    if (countBadge) countBadge.textContent = `(${count})`;

    if (cartItems.length === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <i class="bi bi-bag-x"></i>
          </div>
          <h3 class="cart-empty-title">Your Cart is Empty</h3>
          <p class="cart-empty-desc">Discover our handpicked collection of luxury timepieces, pure honey nuts, and executive gifts.</p>
          <a href="shop.html" class="btn btn-gold cart-empty-btn" id="cartStartShoppingBtn">
            <span>Explore Collection</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      `;
      footer.innerHTML = '';
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';

    body.innerHTML = `
      <div class="cart-items-list">
        ${cartItems.map(item => `
          <div class="cart-item-card" data-id="${item.id}">
            <div class="cart-item-img">
              <img src="${resolveImg(item.image)}" alt="${item.name}" onerror="this.src='assets/images/placeholders/watch-placeholder.svg'">
            </div>
            <div class="cart-item-info">
              <div class="cart-item-top">
                <h4 class="cart-item-name" title="${item.name}">${item.name}</h4>
                <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item" title="Remove item">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
              <div class="cart-item-code">SKU: ${item.id}</div>
              <div class="cart-item-bottom">
                <div class="cart-qty-stepper">
                  <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease quantity">
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Increase quantity">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
                <div class="cart-item-price-box">
                  <span class="cart-item-price">${formatPKR(item.price * item.quantity)}</span>
                  ${item.quantity > 1 ? `<span class="cart-item-unit">(${formatPKR(item.price)} each)</span>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    const freeDeliveryNotice = subtotal >= FREE_DELIVERY_THRESHOLD
      ? `<div class="free-delivery-badge"><i class="bi bi-truck"></i> You qualify for <strong>FREE Nationwide Delivery!</strong></div>`
      : `<div class="free-delivery-progress">
           <i class="bi bi-info-circle"></i> Add <strong>${formatPKR(FREE_DELIVERY_THRESHOLD - subtotal)}</strong> more for FREE Nationwide Delivery!
         </div>`;

    footer.innerHTML = `
      ${freeDeliveryNotice}
      <div class="cart-summary-block">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <span class="summary-val">${formatPKR(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Estimated Delivery</span>
          <span class="summary-val">${deliveryFee === 0 ? '<span style="color:var(--wa-green-dark); font-weight:700;">FREE</span>' : formatPKR(deliveryFee)}</span>
        </div>
        <div class="cart-summary-row grand-total">
          <span>Grand Total</span>
          <span class="summary-val">${formatPKR(total)}</span>
        </div>
      </div>

      <div class="cart-actions-grid">
        <a href="checkout.html" class="btn btn-luxury-checkout" id="cartProceedCheckout">
          <span>Proceed to Checkout</span>
          <i class="bi bi-arrow-right"></i>
        </a>
        <button class="btn btn-wa-cart" id="cartOrderWhatsApp">
          <i class="bi bi-whatsapp"></i>
          <span>Order Cart on WhatsApp</span>
        </button>
      </div>

      <div class="cart-trust-note">
        <i class="bi bi-shield-check"></i>
        <span>100% Genuine Inspected Products &bull; Pay Cash on Delivery</span>
      </div>
    `;

    // Attach event listeners inside drawer
    body.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        removeItem(id);
      });
    });

    body.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cartItems.find(i => i.id === id);
        if (item) updateQuantity(id, item.quantity - 1);
      });
    });

    body.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cartItems.find(i => i.id === id);
        if (item) updateQuantity(id, item.quantity + 1);
      });
    });

    // WhatsApp order cart
    footer.querySelector('#cartOrderWhatsApp')?.addEventListener('click', () => {
      orderCartOnWhatsApp();
    });

    // Close on checkout click
    footer.querySelector('#cartProceedCheckout')?.addEventListener('click', () => {
      closeDrawer();
    });
  }

  // --- WHATSAPP ORDER WHOLE CART ---
  function orderCartOnWhatsApp() {
    if (cartItems.length === 0) return;

    let itemsList = cartItems.map((item, idx) => {
      return `${idx + 1}. *${item.name}* (SKU: ${item.id})\n   Qty: ${item.quantity} × ${formatPKR(item.price)} = ${formatPKR(item.price * item.quantity)}`;
    }).join('\n\n');

    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const total = getTotal();

    const message = `Hello Ibn e Naimat Collection,\n\nI would like to order my shopping cart items:\n\n${itemsList}\n\n` +
      `---------------------------\n` +
      `*Subtotal:* ${formatPKR(subtotal)}\n` +
      `*Delivery Charges:* ${deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)}\n` +
      `*Grand Total:* ${formatPKR(total)}\n` +
      `---------------------------\n\n` +
      `Please confirm stock availability and dispatch process.`;

    const waNumber = window.CONFIG?.whatsapp?.international || '923302241340';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // --- DRAWER TOGGLE ---
  function openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (!drawer || !overlay) return;

    drawer.classList.add('active');
    overlay.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (!drawer || !overlay) return;

    drawer.classList.remove('active');
    overlay.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // --- AUTO-ATTACH EVENT LISTENERS TO CART TRIGGERS ---
  function attachCartTriggers() {
    document.querySelectorAll('.header-cart-trigger, #headerCartTrigger, #mobileCartTrigger, [data-action="open-cart"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
    });
  }

  // --- INITIALIZATION ---
  function init() {
    loadCart();
    injectDrawer();
    updateBadge();
    renderDrawerItems();
    attachCartTriggers();

    // Re-bind when DOM changes or products render
    document.addEventListener('DOMContentLoaded', () => {
      updateBadge();
      attachCartTriggers();
      if (window.location.hash === '#open-cart' || window.location.hash.includes('cart')) {
        setTimeout(openDrawer, 200);
      }
    });

    if (window.location.hash === '#open-cart' || window.location.hash.includes('cart')) {
      setTimeout(openDrawer, 200);
    }
  }

  // Global Cart API
  window.Cart = {
    getItems,
    getItemCount,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
    formatPKR,
    refreshUI: () => {
      updateBadge();
      renderDrawerItems();
      attachCartTriggers();
    }
  };

  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
