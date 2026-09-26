/**
 * Ibn e Naimat Collection - Dedicated Category Page Controller
 * Powers separate category storefronts (Watches, Honey Nuts, Gadgets, Gifts, Calligraphy)
 * with dedicated subcategory filters, search, sorting, modal detail view, and WhatsApp ordering.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Determine active category from body data-category attribute
  const pageCategoryKey = document.body.getAttribute('data-category') || 'watches';

  // Config definition for all dedicated category pages
  const CATEGORY_CONFIGS = {
    'watches': {
      key: 'watches',
      name: 'Original Watches',
      badge: 'Curated Horology • 100% Authentic',
      title: 'Original Branded <em>Timepieces</em>',
      desc: 'Discover authentic luxury watches for men and women. Every timepiece is pre-inspected, backed by guaranteed authenticity, and delivered with nationwide insured courier.',
      categoryFilter: (p) => p.category === 'watches',
      subcategories: [
        { id: 'all', name: 'All Watches' },
        { id: 'formal', name: "Men's Formal", match: (p) => p.name.toLowerCase().includes('casio') || p.name.toLowerCase().includes('formal') },
        { id: 'sports', name: "Sports Chronograph", match: (p) => p.name.toLowerCase().includes('benyar') || p.name.toLowerCase().includes('chrono') },
        { id: 'womens', name: "Women's Watches", match: (p) => p.name.toLowerCase().includes('curren') || p.name.toLowerCase().includes('women') },
        { id: 'steel', name: "Luxury Steel", match: (p) => p.name.toLowerCase().includes('steel') || p.name.toLowerCase().includes('diamond') || p.name.toLowerCase().includes('seastar') },
        { id: 'master', name: "Master Chronometer", match: (p) => p.name.toLowerCase().includes('omega') || p.name.toLowerCase().includes('master') }
      ],
      features: [
        { icon: 'bi-patch-check-fill', title: '100% Original', desc: 'Guaranteed genuine brand timepieces' },
        { icon: 'bi-camera-video-fill', title: 'Pre-Dispatch Video', desc: 'Watch inspection video sent via WhatsApp' },
        { icon: 'bi-shield-check', title: 'Insured Delivery', desc: 'Safe delivery across all Pakistan cities' }
      ]
    },
    'honey-nuts': {
      key: 'honey-nuts',
      name: 'Honey Nuts',
      badge: '100% Pure • Organic Wildflower',
      title: 'Pure Raw Honey & <em>Dry Fruits</em>',
      desc: 'Raw, unheated natural flower honey infused with handpicked Kashmiri walnuts, whole roasted almonds, cashews, and pistachios in vacuum-sealed food-grade jars.',
      categoryFilter: (p) => p.category === 'honey-nuts',
      subcategories: [
        { id: 'all', name: 'All Honey & Nuts' },
        { id: '500g', name: "Royal Jar (500g)", match: (p) => p.name.includes('500g') },
        { id: '1kg', name: "Family Pack (1 Kg)", match: (p) => p.name.includes('1000g') || p.name.includes('1 Kg') },
        { id: 'walnut', name: "Walnut Special", match: (p) => p.name.toLowerCase().includes('walnut') }
      ],
      features: [
        { icon: 'bi-flower1', title: '100% Raw Flower Honey', desc: 'Unheated, unfiltered natural nectar' },
        { icon: 'bi-nut', title: 'Handpicked Nuts', desc: 'Premium Kashmiri walnuts, almonds & cashews' },
        { icon: 'bi-shield-fill-check', title: 'Zero Preservatives', desc: 'No artificial syrup, 100% food-grade glass' }
      ]
    },
    'gadgets': {
      key: 'gadgets',
      name: 'Tech Gadgets & Accessories',
      badge: 'Smart Utility • Premium Audio & GaN Fast Charge',
      title: 'Tech Gadgets & <em>Mobile Accessories</em>',
      desc: 'High-fidelity ANC wireless earbuds, military-grade GaN fast chargers, magnetic car mounts, and versatile aluminum expansion hubs.',
      categoryFilter: (p) => p.category === 'gadgets' || p.category === 'mobile-accessories',
      subcategories: [
        { id: 'all', name: 'All Tech & Accessories' },
        { id: 'audio', name: 'ANC Earbuds & Audio', match: (p) => p.category === 'gadgets' && (p.name.toLowerCase().includes('earbuds') || p.name.toLowerCase().includes('headphones')) },
        { id: 'chargers', name: 'GaN Chargers & Cables', match: (p) => p.category === 'mobile-accessories' && (p.name.toLowerCase().includes('charger') || p.name.toLowerCase().includes('cable')) },
        { id: 'mounts', name: 'MagSafe & Car Mounts', match: (p) => p.name.toLowerCase().includes('magsafe') || p.name.toLowerCase().includes('mount') },
        { id: 'hubs', name: 'USB-C Expansion Hubs', match: (p) => p.name.toLowerCase().includes('hub') }
      ],
      features: [
        { icon: 'bi-lightning-charge-fill', title: 'GaN Fast Charging', desc: 'Certified safe multi-protocol power' },
        { icon: 'bi-headphones', title: 'Studio-Grade Audio', desc: 'Active noise cancellation & high-res sound' },
        { icon: 'bi-cpu-fill', title: 'Tested Compatibility', desc: 'Engineered for iPhone, Samsung & Type-C' }
      ]
    },
    'gifts': {
      key: 'gifts',
      name: 'Luxury Gifts & Gift Sets',
      badge: 'Prestige Packaging • Executive Hampers',
      title: 'Luxury Gifts & <em>Curated Sets</em>',
      desc: 'Thoughtfully curated luxury gift hampers, his & hers prestige couple watch presentation boxes, and wellness hampers ready for executive gifting.',
      categoryFilter: (p) => p.category === 'gifts',
      subcategories: [
        { id: 'all', name: 'All Gift Sets' },
        { id: 'executive', name: 'Executive Hampers', match: (p) => p.name.toLowerCase().includes('executive') || p.name.toLowerCase().includes('royal') },
        { id: 'couple', name: 'Couple Watch Sets', match: (p) => p.name.toLowerCase().includes('couple') },
        { id: 'wellness', name: 'Wellness Hampers', match: (p) => p.name.toLowerCase().includes('wellness') }
      ],
      features: [
        { icon: 'bi-gift-fill', title: 'Luxury Packaging', desc: 'Custom presentation boxes with gold foil' },
        { icon: 'bi-envelope-heart-fill', title: 'Complimentary Card', desc: 'Add personalized handwritten message' },
        { icon: 'bi-truck', title: 'Direct Recipient Delivery', desc: 'Surprise gifting delivered across Pakistan' }
      ]
    },
    'calligraphy': {
      key: 'calligraphy',
      name: 'Islamic Calligraphy',
      badge: 'Spiritual Elegance • Handcrafted Canvas',
      title: 'Handcrafted Islamic <em>Calligraphy</em>',
      desc: 'Museum-grade framed canvas artwork featuring Ayatul Kursi, Surah Ar-Rahman, and 4 Qul crafted with gold and champagne accents for refined spiritual decor.',
      categoryFilter: (p) => p.category === 'calligraphy',
      subcategories: [
        { id: 'all', name: 'All Calligraphy Frames' },
        { id: 'ayatul-kursi', name: 'Ayatul Kursi', match: (p) => p.name.toLowerCase().includes('ayatul') },
        { id: 'surah-rahman', name: 'Surah Ar-Rahman', match: (p) => p.name.toLowerCase().includes('rahman') },
        { id: '4-qul', name: '4 Qul Collection', match: (p) => p.name.toLowerCase().includes('4 qul') }
      ],
      features: [
        { icon: 'bi-brush-fill', title: 'Artisan Craftsmanship', desc: 'High-density textured archival canvas' },
        { icon: 'bi-gem', title: 'Prestige Framing', desc: 'Matte black & brushed champagne metal frames' },
        { icon: 'bi-box-seam-fill', title: 'Reinforced Packaging', desc: 'Padded corner protection for safe transit' }
      ]
    }
  };

  const activeConfig = CATEGORY_CONFIGS[pageCategoryKey] || CATEGORY_CONFIGS['watches'];

  // State
  let activeSubcategory = 'all';
  let activeSort = 'featured';
  let searchQuery = '';

  // Check URL query parameters (e.g. ?sub=formal or ?q=casio)
  const urlParams = new URLSearchParams(window.location.search);
  const initialSub = urlParams.get('sub');
  if (initialSub && activeConfig.subcategories.some(s => s.id === initialSub)) {
    activeSubcategory = initialSub;
  }
  const initialQuery = urlParams.get('q');
  if (initialQuery) {
    searchQuery = initialQuery.trim();
  }

  // DOM Elements
  const subcategoryPillsEl = document.getElementById('categorySubPills');
  const productsGridEl = document.getElementById('categoryProductsGrid');
  const searchInputEl = document.getElementById('categorySearchInput');
  const sortSelectEl = document.getElementById('categorySortSelect');
  const countBadgeEl = document.getElementById('categoryCountText');
  const quickViewModal = document.getElementById('quickViewModal');
  const modalScrollArea = document.getElementById('modalScrollArea');
  const modalClose = document.getElementById('modalClose');

  // Mobile Drawer
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');

  if (mobileToggle && mobileDrawer && drawerOverlay) {
    const openMenu = () => {
      mobileDrawer.classList.add('open');
      drawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileDrawer.classList.remove('open');
      drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    mobileToggle.addEventListener('click', openMenu);
    drawerClose?.addEventListener('click', closeMenu);
    drawerOverlay.addEventListener('click', closeMenu);
  }

  // Floating WhatsApp button
  const floatingWa = document.getElementById('floatingWaBtn');
  if (floatingWa) {
    floatingWa.addEventListener('click', () => {
      const waUrl = `https://wa.me/923302241340?text=${encodeURIComponent('Hello Ibn e Naimat Collection, I am inquiring about ' + activeConfig.name + '.')}`;
      window.open(waUrl, '_blank');
    });
  }

  // Format PKR
  function formatPKR(val) {
    return 'PKR ' + Number(val || 0).toLocaleString('en-PK');
  }

  // Resolve Image Path
  function resolveImg(src) {
    if (!src) return 'assets/images/placeholders/watch-placeholder.svg';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return src;
  }

  // Render Subcategory Filter Pills
  function renderSubcategoryPills() {
    if (!subcategoryPillsEl) return;

    const baseItems = (window.PRODUCTS || []).filter(activeConfig.categoryFilter);

    subcategoryPillsEl.innerHTML = activeConfig.subcategories.map(sub => {
      let count = 0;
      if (sub.id === 'all') {
        count = baseItems.length;
      } else if (typeof sub.match === 'function') {
        count = baseItems.filter(sub.match).length;
      }

      return `
        <button class="collection-pill ${sub.id === activeSubcategory ? 'active' : ''}" data-sub="${sub.id}">
          ${sub.name} <span class="pill-count">(${count})</span>
        </button>
      `;
    }).join('');

    subcategoryPillsEl.querySelectorAll('.collection-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSubcategory = btn.getAttribute('data-sub');
        renderSubcategoryPills();
        renderProducts();
      });
    });
  }

  // Filter, Sort & Render Products
  function renderProducts() {
    if (!productsGridEl || !window.PRODUCTS) return;

    // 1. Base category filter
    let items = window.PRODUCTS.filter(activeConfig.categoryFilter);

    // 2. Subcategory filter
    if (activeSubcategory !== 'all') {
      const currentSub = activeConfig.subcategories.find(s => s.id === activeSubcategory);
      if (currentSub && typeof currentSub.match === 'function') {
        items = items.filter(currentSub.match);
      }
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = (p.shortDesc || p.description || '').toLowerCase().includes(q);
        const skuMatch = (p.id || '').toLowerCase().includes(q);
        const badgeMatch = (p.badge || '').toLowerCase().includes(q);
        return nameMatch || descMatch || skuMatch || badgeMatch;
      });
    }

    // 4. Sort
    items.sort((a, b) => {
      if (activeSort === 'price-asc') return a.price - b.price;
      if (activeSort === 'price-desc') return b.price - a.price;
      if (activeSort === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // featured default
    });

    // Update count badge
    if (countBadgeEl) {
      countBadgeEl.textContent = `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    // Empty state
    if (items.length === 0) {
      productsGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="bi bi-search" style="font-size: 2.5rem; color: var(--gold-champagne); opacity: 0.7;"></i>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-top: 1rem; color: var(--text-primary);">No Products Found</h3>
          <p style="color: var(--text-secondary); margin: 0.5rem auto 1.5rem auto; max-width: 420px; font-size: 0.9375rem;">
            We couldn't find any items matching your selection in ${activeConfig.name}. Try clearing filters or search.
          </p>
          <button class="btn btn-luxury-outline" id="btnResetFilters">Clear Filter</button>
        </div>
      `;

      document.getElementById('btnResetFilters')?.addEventListener('click', () => {
        activeSubcategory = 'all';
        searchQuery = '';
        if (searchInputEl) searchInputEl.value = '';
        renderSubcategoryPills();
        renderProducts();
      });
      return;
    }

    // Render Product Cards
    productsGridEl.innerHTML = items.map(p => {
      const badgeHtml = p.badge 
        ? `<span class="product-badge" style="background: var(--bg-dark); color: var(--gold-champagne);">${p.badge}</span>` 
        : '';

      const isOutOfStock = p.stock_status === 'out_of_stock';
      const stockBadge = isOutOfStock
        ? `<span class="stock-indicator out-of-stock"><i class="bi bi-x-circle"></i> Out of Stock</span>`
        : `<span class="stock-indicator in-stock"><i class="bi bi-check2"></i> In Stock</span>`;

      return `
        <article class="product-editorial-card reveal-on-scroll is-visible" data-product-id="${p.id}">
          <div class="product-visual-container">
            ${badgeHtml}
            <img src="${resolveImg(p.image)}" 
                 alt="${p.name}" 
                 class="product-primary-img" 
                 loading="lazy" 
                 onerror="this.src='assets/images/placeholders/watch-placeholder.svg'">
            <div class="visual-hover-actions">
              <button class="btn-action-view" data-product-id="${p.id}" title="Quick View &amp; Specifications">
                <i class="bi bi-eye"></i> Quick View
              </button>
            </div>
          </div>

          <div class="product-card-body">
            <div class="product-card-top">
              <span class="product-sku-tag">SKU: ${p.id}</span>
              ${stockBadge}
            </div>

            <h3 class="product-card-title" title="${p.name}">
              ${p.name}
            </h3>

            <p class="product-card-excerpt">
              ${p.shortDesc || p.description || ''}
            </p>

            <div class="product-pricing-row">
              <div class="price-box">
                <span class="price-currency">${formatPKR(p.price)}</span>
                ${p.originalPrice ? `<span class="price-compare">${formatPKR(p.originalPrice)}</span>` : ''}
              </div>
            </div>

            <div class="product-card-actions">
              <button class="btn-buy-wa ${isOutOfStock ? 'disabled' : ''}" 
                      data-product-id="${p.id}" 
                      ${isOutOfStock ? 'disabled' : ''}>
                <i class="bi bi-whatsapp"></i> 
                <span>${isOutOfStock ? 'Sold Out' : 'Order on WhatsApp'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card event listeners
    productsGridEl.querySelectorAll('.btn-buy-wa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-product-id');
        orderOnWhatsApp(pid);
      });
    });

    productsGridEl.querySelectorAll('.btn-action-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.getAttribute('data-product-id');
        openQuickView(pid);
      });
    });

    productsGridEl.querySelectorAll('.product-editorial-card').forEach(card => {
      card.addEventListener('click', () => {
        const pid = card.getAttribute('data-product-id');
        openQuickView(pid);
      });
    });
  }

  // WhatsApp Order Automation
  function orderOnWhatsApp(productId) {
    const product = (window.PRODUCTS || []).find(p => p.id === productId);
    if (!product) return;

    const message = `Hello Ibn e Naimat Collection,\n\nI would like to order this item:\n- *Product:* ${product.name}\n- *SKU:* ${product.id}\n- *Price:* ${formatPKR(product.price)}\n- *Category:* ${activeConfig.name}\n- *Page URL:* ${window.location.href}\n\nPlease confirm product availability, video inspection, and nationwide delivery details.`;
    const waUrl = `https://wa.me/923302241340?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // Quick View Modal
  function openQuickView(productId) {
    const product = (window.PRODUCTS || []).find(p => p.id === productId);
    if (!product || !quickViewModal || !modalScrollArea) return;

    const specsHtml = (product.specs && product.specs.length > 0)
      ? `<div class="modal-specs-list">
          ${product.specs.map(s => `
            <div class="spec-row">
              <span class="spec-label">${s.label}</span>
              <span class="spec-value">${s.value}</span>
            </div>
          `).join('')}
         </div>`
      : `<p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">Verified original specification guaranteed.</p>`;

    const isOutOfStock = product.stock_status === 'out_of_stock';

    modalScrollArea.innerHTML = `
      <div class="modal-product-grid">
        <div class="modal-gallery">
          <div class="modal-main-image-wrap">
            <img src="${resolveImg(product.image)}" alt="${product.name}" class="modal-main-img" onerror="this.src='assets/images/placeholders/watch-placeholder.svg'">
          </div>
        </div>

        <div class="modal-product-info">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span class="modal-cat-tag">${activeConfig.name}</span>
            <span class="product-sku-tag">SKU: ${product.id}</span>
          </div>

          <h2 class="modal-product-title">${product.name}</h2>

          <div class="modal-price-box">
            <span class="modal-current-price">${formatPKR(product.price)}</span>
            ${product.originalPrice ? `<span class="modal-compare-price">${formatPKR(product.originalPrice)}</span>` : ''}
          </div>

          <p class="modal-product-desc">${product.description || product.shortDesc || ''}</p>

          <div class="modal-specs-section">
            <h4 class="specs-heading"><i class="bi bi-card-checklist" style="color: var(--gold-champagne);"></i> Specifications &amp; Features</h4>
            ${specsHtml}
          </div>

          <div class="modal-assurance-box" style="margin: 1.25rem 0; padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="font-size: 0.8125rem; font-weight: 700; color: var(--gold-dark); margin-bottom: 0.35rem;">
              <i class="bi bi-shield-check"></i> Ibn e Naimat Authenticity Guarantee
            </div>
            <p style="font-size: 0.78125rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
              100% genuine product. Includes pre-dispatch WhatsApp video inspection and nationwide insured courier delivery.
            </p>
          </div>

          <div class="modal-actions-row">
            <button class="btn btn-wa-modal" id="modalBuyBtn" style="width: 100%; justify-content: center;" ${isOutOfStock ? 'disabled' : ''}>
              <i class="bi bi-whatsapp"></i>
              <span>${isOutOfStock ? 'Currently Out of Stock' : 'Order This on WhatsApp (0330 2241340)'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modalBuyBtn')?.addEventListener('click', () => {
      orderOnWhatsApp(product.id);
    });

    quickViewModal.classList.add('show');
    quickViewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    if (!quickViewModal) return;
    quickViewModal.classList.remove('show');
    quickViewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closeQuickView);
  quickViewModal?.addEventListener('click', (e) => {
    if (e.target === quickViewModal) closeQuickView();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quickViewModal?.classList.contains('show')) {
      closeQuickView();
    }
  });

  // Search input handler
  if (searchInputEl) {
    searchInputEl.value = searchQuery;
    searchInputEl.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Sort select handler
  if (sortSelectEl) {
    sortSelectEl.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  // Scroll reveal animation utility
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  }

  // Initial render
  renderSubcategoryPills();
  renderProducts();
  initScrollReveal();

  // Async dynamic catalog from Supabase
  if (window.STORE_CLIENT) {
    (async () => {
      try {
        const prodsRes = await window.STORE_CLIENT.fetchProducts();
        if (prodsRes.isLive && Array.isArray(prodsRes.data) && prodsRes.data.length > 0) {
          window.PRODUCTS = prodsRes.data;
          renderSubcategoryPills();
          renderProducts();
        }
      } catch (err) {
        console.warn('[CategoryPage] Error loading dynamic catalog from Supabase:', err);
      }
    })();
  }
});
