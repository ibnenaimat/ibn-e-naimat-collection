/**
 * Ibn e Naimat Collection - Dedicated Shop / Catalog Application Logic
 * Pure Vanilla JavaScript with dynamic URL routing and sorting
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let activeCategory = 'all';
  let activeSort = 'featured';
  let searchQuery = '';

  // DOM References
  const shopCategoryPills = document.getElementById('shopCategoryPills');
  const shopProductsGrid = document.getElementById('shopProductsGrid');
  const shopSearchInput = document.getElementById('shopSearchInput');
  const shopSortSelect = document.getElementById('shopSortSelect');
  const shopHeroTag = document.getElementById('shopHeroTag');
  const shopHeroTitle = document.getElementById('shopHeroTitle');
  const shopHeroDesc = document.getElementById('shopHeroDesc');
  const shopCountText = document.getElementById('shopCountText');
  const breadcrumbCategory = document.getElementById('breadcrumbCategory');

  // Modal References
  const quickViewModal = document.getElementById('quickViewModal');
  const modalScrollArea = document.getElementById('modalScrollArea');
  const modalClose = document.getElementById('modalClose');

  // Mobile Drawer
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const siteHeader = document.querySelector('.site-header');
  const floatingWaBtn = document.getElementById('floatingWaBtn');

  // --- 1. DETERMINE INITIAL CATEGORY FROM URL ---
  function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const catQuery = urlParams.get('category');
    if (catQuery && window.CATEGORIES && window.CATEGORIES.some(c => c.id === catQuery)) {
      return catQuery;
    }
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && window.CATEGORIES && window.CATEGORIES.some(c => c.id === hash)) {
      return hash;
    }
    return 'all';
  }

  // --- 2. RENDER CATEGORY PILLS ---
  function renderCategoryPills() {
    if (!shopCategoryPills || !window.CATEGORIES) return;

    shopCategoryPills.innerHTML = window.CATEGORIES.map(cat => {
      const count = cat.id === 'all' 
        ? window.PRODUCTS.length 
        : window.PRODUCTS.filter(p => p.category === cat.id).length;

      return `
        <button class="collection-pill ${cat.id === activeCategory ? 'active' : ''}" data-category="${cat.id}">
          ${cat.name} <span class="pill-count">(${count})</span>
        </button>
      `;
    }).join('');

    shopCategoryPills.querySelectorAll('.collection-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        selectCategory(catId, true);
      });
    });
  }

  // --- 3. UPDATE HEADER HERO DETAILS ---
  function updateShopHeader() {
    const currentCatObj = window.CATEGORIES.find(c => c.id === activeCategory);

    if (activeCategory === 'all') {
      if (shopHeroTag) shopHeroTag.textContent = 'Curated Luxury Catalog';
      if (shopHeroTitle) shopHeroTitle.innerHTML = 'The Complete <em>Collection</em>';
      if (shopHeroDesc) shopHeroDesc.textContent = 'Explore our verified original branded timepieces, museum-grade Islamic calligraphy frames, high-speed mobile accessories, and pure honey nuts.';
      if (breadcrumbCategory) breadcrumbCategory.textContent = 'All Collections';
    } else if (currentCatObj) {
      if (shopHeroTag) shopHeroTag.textContent = currentCatObj.badge || 'Curated Collection';
      if (shopHeroTitle) shopHeroTitle.innerHTML = `${currentCatObj.name} <em>Showcase</em>`;
      if (shopHeroDesc) shopHeroDesc.textContent = currentCatObj.description || currentCatObj.tagline || '';
      if (breadcrumbCategory) breadcrumbCategory.textContent = currentCatObj.name;
    }
  }

  // --- 4. FILTER, SORT & RENDER PRODUCTS ---
  function renderCatalog() {
    if (!shopProductsGrid || !window.PRODUCTS) return;

    let items = [...window.PRODUCTS];

    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter(p => p.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    if (activeSort === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'name-asc') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // 'featured': featured items first, then original array order
      items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Update count badge
    if (shopCountText) {
      shopCountText.textContent = `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    // Empty state
    if (items.length === 0) {
      shopProductsGrid.innerHTML = `
        <div class="editorial-empty-state" style="grid-column: 1 / -1;">
          <i class="bi bi-search"></i>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem; color: #ffffff;">No Products Found</h3>
          <p class="text-muted" style="color: #a1a1aa; max-width: 480px; margin: 0 auto 1.5rem auto;">
            We could not find any items matching your selected criteria. Try resetting the filters or searching for something else.
          </p>
          <button class="btn btn-gold-action" id="resetCatalogFiltersBtn">
            Reset All Filters
          </button>
        </div>
      `;

      document.getElementById('resetCatalogFiltersBtn')?.addEventListener('click', () => {
        if (shopSearchInput) shopSearchInput.value = '';
        searchQuery = '';
        if (shopSortSelect) shopSortSelect.value = 'featured';
        activeSort = 'featured';
        selectCategory('all', true);
      });
      return;
    }

    // Render cards with smooth staggered animation
    shopProductsGrid.innerHTML = items.map((product, idx) => `
      <div class="editorial-card card-entry-anim" style="animation-delay: ${(idx % 9) * 0.045}s;" data-id="${product.id}">
        <div class="editorial-card-media">
          ${product.badge ? `<span class="editorial-card-badge">${product.badge}</span>` : ''}
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="editorial-quick-view-overlay">
            <button class="editorial-quick-btn view-detail-action" data-id="${product.id}">
              <i class="bi bi-eye"></i> Quick View
            </button>
          </div>
        </div>

        <div class="editorial-card-body">
          <span class="editorial-card-tag">${product.categoryName}</span>
          <h3 class="editorial-card-title">${product.name}</h3>
          <div class="editorial-card-code">Reference: ${product.id}</div>
          <p class="editorial-card-desc">${product.shortDesc}</p>

          <div class="editorial-card-footer">
            <div class="editorial-price-box">
              <span class="editorial-price-label">Price</span>
              <span class="editorial-price">${window.CONFIG.currency.format(product.price)}</span>
            </div>

            <button class="btn editorial-order-btn order-wa-action" data-id="${product.id}">
              <i class="bi bi-whatsapp"></i> Order on WhatsApp
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach card event listeners
    shopProductsGrid.querySelectorAll('.order-wa-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        orderOnWhatsApp(btn.getAttribute('data-id'));
      });
    });

    shopProductsGrid.querySelectorAll('.view-detail-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuickView(btn.getAttribute('data-id'));
      });
    });

    shopProductsGrid.querySelectorAll('.editorial-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.order-wa-action')) return;
        openQuickView(card.getAttribute('data-id'));
      });
    });
  }

  // --- 5. SELECT CATEGORY HANDLER ---
  function selectCategory(catId, updateUrl = true) {
    activeCategory = catId;

    if (shopCategoryPills) {
      shopCategoryPills.querySelectorAll('.collection-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === catId);
      });
    }

    if (updateUrl && window.history && window.history.pushState) {
      const newUrl = catId === 'all' 
        ? window.location.pathname 
        : `${window.location.pathname}?category=${catId}`;
      window.history.pushState({ category: catId }, '', newUrl);
    }

    updateShopHeader();
    renderCatalog();
  }

  // --- 6. WHATSAPP ORDER AUTOMATION ---
  function orderOnWhatsApp(productId) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const message = window.CONFIG.whatsapp.defaultOrderMessage(product);
    const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // --- 7. LUXURY QUICK VIEW MODAL ---
  function openQuickView(productId) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product || !quickViewModal || !modalScrollArea) return;

    // Find related items
    const related = window.PRODUCTS
      .filter(p => p.id !== product.id && (p.category === product.category || p.featured))
      .slice(0, 3);

    const specsListHtml = product.specs && product.specs.length > 0 
      ? `
        <div class="modal-specs-block">
          <h4>Technical Specifications &amp; Features</h4>
          <ul class="modal-specs-list">
            ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
          </ul>
        </div>
      ` : '';

    const relatedHtml = related.length > 0 ? `
      <div class="modal-related-area">
        <h3 class="modal-related-title">You May Also Appreciate</h3>
        <div class="modal-related-grid">
          ${related.map(r => `
            <div class="related-product-card" data-id="${r.id}">
              <div class="related-img-box">
                <img src="${r.image}" alt="${r.name}" loading="lazy">
              </div>
              <div class="related-title">${r.name}</div>
              <div class="related-price">${window.CONFIG.currency.format(r.price)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    modalScrollArea.innerHTML = `
      <div class="modal-top-grid">
        <div class="modal-img-col">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="modal-info-col">
          <div class="modal-brand-badge">
            <img src="assets/images/official-logo.png" alt="Ibn e Naimat Collection">
          </div>
          ${product.badge ? `<span class="modal-badge-tag">${product.badge}</span>` : ''}
          <h2 class="modal-title">${product.name}</h2>
          
          <div class="modal-meta-row">
            Reference: <strong>${product.id}</strong> • Collection: <strong>${product.categoryName}</strong>
          </div>

          <div class="modal-price-box">
            <span class="modal-price">${window.CONFIG.currency.format(product.price)}</span>
            <span class="modal-stock-badge"><i class="bi bi-check-circle-fill"></i> In Stock • Pakistan</span>
          </div>

          <p class="modal-desc">${product.shortDesc}</p>

          ${specsListHtml}

          <div class="modal-actions-box">
            <button class="btn btn-wa-luxury modal-order-btn" style="width: 100%; font-size: 0.9375rem;" data-id="${product.id}">
              <i class="bi bi-whatsapp"></i> Order on WhatsApp (03302241340)
            </button>
            <p style="font-size: 0.75rem; color: #71717a; text-align: center; margin-top: 0.85rem;">
              <i class="bi bi-shield-check"></i> 100% Inspected Genuine Item • Advance Payment Confirmation • Tracked Courier
            </p>
          </div>
        </div>
      </div>

      ${relatedHtml}
    `;

    // Order action inside modal
    modalScrollArea.querySelector('.modal-order-btn')?.addEventListener('click', () => {
      orderOnWhatsApp(product.id);
    });

    // Related items clicks
    modalScrollArea.querySelectorAll('.related-product-card').forEach(rcard => {
      rcard.addEventListener('click', () => {
        const rid = rcard.getAttribute('data-id');
        openQuickView(rid);
      });
    });

    quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    if (!quickViewModal) return;
    quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closeQuickView);

  quickViewModal?.addEventListener('click', (e) => {
    if (e.target === quickViewModal) {
      closeQuickView();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quickViewModal?.classList.contains('active')) {
      closeQuickView();
    }
  });

  // --- 8. SEARCH & SORT LISTENERS ---
  if (shopSearchInput) {
    shopSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }

  if (shopSortSelect) {
    shopSortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderCatalog();
    });
  }

  // Popstate for browser back/forward navigation
  window.addEventListener('popstate', () => {
    activeCategory = getCategoryFromUrl();
    renderCategoryPills();
    updateShopHeader();
    renderCatalog();
  });

  // --- 9. MOBILE DRAWER NAVIGATION ---
  function openDrawer() {
    mobileDrawer?.classList.add('active');
    drawerOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer?.classList.remove('active');
    drawerOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  // --- 10. SCROLL HEADER EFFECT ---
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });

  // --- 11. FLOATING WHATSAPP BUTTON ---
  floatingWaBtn?.addEventListener('click', () => {
    const waText = window.CONFIG.whatsapp.defaultInquiryMessage();
    const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  });

  // --- 12. REFINED SCROLL REVEAL (INTERSECTION OBSERVER) ---
  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
      return;
    }

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
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  }

  // Initialize
  activeCategory = getCategoryFromUrl();
  renderCategoryPills();
  updateShopHeader();
  renderCatalog();
  initScrollReveal();
});
