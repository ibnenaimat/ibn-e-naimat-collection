/**
 * Ibn e Naimat Collection - Homepage Application Logic
 * Interactive Catalog with Category Filter Pills, Live Search, Multi-Criteria Sorting,
 * Quick View Luxury Modal, and Staggered Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let activeCategory = 'all';
  let activeSort = 'featured';
  let searchQuery = '';

  // DOM Elements - Catalog
  const homeCategoryPills = document.getElementById('homeCategoryPills');
  const featuredGrid = document.getElementById('featuredGrid');
  const homeSearchInput = document.getElementById('homeSearchInput');
  const homeSortSelect = document.getElementById('homeSortSelect');
  const homeCountText = document.getElementById('homeCountText');
  const homeCatalogTag = document.getElementById('homeCatalogTag');
  const homeCatalogTitle = document.getElementById('homeCatalogTitle');
  const homeCatalogDesc = document.getElementById('homeCatalogDesc');
  const headerSearchTrigger = document.getElementById('headerSearchTrigger');

  // DOM Elements - Circular Category Showcase
  const categoryShowcaseTrack = document.getElementById('categoryShowcaseTrack');
  const catCarouselPrev = document.getElementById('catCarouselPrev');
  const catCarouselNext = document.getElementById('catCarouselNext');
  const showcaseDeptTabs = document.getElementById('showcaseDeptTabs');

  // DOM Elements - Modal & Navigation
  const quickViewModal = document.getElementById('quickViewModal');
  const modalScrollArea = document.getElementById('modalScrollArea');
  const modalClose = document.getElementById('modalClose');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const siteHeader = document.querySelector('.site-header');
  const floatingWaBtn = document.getElementById('floatingWaBtn');

  // --- 1. RENDER CATEGORY PILLS ---
  function renderCategoryPills() {
    if (!homeCategoryPills || !window.CATEGORIES || !window.PRODUCTS) return;

    homeCategoryPills.innerHTML = window.CATEGORIES.map(cat => {
      const count = cat.id === 'all'
        ? window.PRODUCTS.length
        : window.PRODUCTS.filter(p => p.category === cat.id).length;

      return `
        <button class="collection-pill ${cat.id === activeCategory ? 'active' : ''}" data-category="${cat.id}">
          ${cat.name} <span class="pill-count">(${count})</span>
        </button>
      `;
    }).join('');

    homeCategoryPills.querySelectorAll('.collection-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        if (homeSearchInput) homeSearchInput.value = '';
        searchQuery = '';
        if (categoryShowcaseTrack) {
          categoryShowcaseTrack.querySelectorAll('.showcase-category-item').forEach(el => el.classList.remove('selected-circle'));
        }
        selectCategory(catId);
      });
    });
  }

  // --- 2. SELECT CATEGORY & UPDATE SECTION HEADER ---
  function selectCategory(catId, shouldScroll = false) {
    activeCategory = catId;

    // Update active pill state
    if (homeCategoryPills) {
      homeCategoryPills.querySelectorAll('.collection-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === catId);
      });
    }

    // Update section header copy
    const currentCatObj = window.CATEGORIES ? window.CATEGORIES.find(c => c.id === activeCategory) : null;
    if (activeCategory === 'all') {
      if (homeCatalogTag) homeCatalogTag.textContent = 'Curated Luxury Catalog';
      if (homeCatalogTitle) homeCatalogTitle.innerHTML = 'The Curated <em>Catalog</em>';
      if (homeCatalogDesc) homeCatalogDesc.textContent = 'Explore 100% verified original branded timepieces, museum-grade calligraphy frames, high-speed mobile accessories, and pure organic honey nuts.';
    } else if (currentCatObj) {
      if (homeCatalogTag) homeCatalogTag.textContent = currentCatObj.badge || 'Curated Department';
      if (homeCatalogTitle) homeCatalogTitle.innerHTML = `${currentCatObj.name} <em>Showcase</em>`;
      if (homeCatalogDesc) homeCatalogDesc.textContent = currentCatObj.description || currentCatObj.tagline || '';
    }

    renderCatalog();

    if (shouldScroll) {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // --- 3. FILTER, SORT & RENDER CATALOG PRODUCTS ---
  function renderCatalog() {
    if (!featuredGrid || !window.PRODUCTS) return;

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
      // 'featured': featured items first, then preserve base order
      items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Update count indicator
    if (homeCountText) {
      homeCountText.textContent = `Showing ${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    // Empty state
    if (items.length === 0) {
      featuredGrid.innerHTML = `
        <div class="editorial-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: var(--radius-md);">
          <i class="bi bi-search" style="font-size: 2.5rem; color: var(--gold-primary); margin-bottom: 1rem; display: inline-block;"></i>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem; color: #ffffff;">No Products Found</h3>
          <p class="text-muted" style="color: #a1a1aa; max-width: 460px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
            We could not find any items matching your selected criteria. Try adjusting your search term or select another category.
          </p>
          <button class="btn btn-gold-action" id="resetHomeFiltersBtn">
            Reset All Filters
          </button>
        </div>
      `;

      document.getElementById('resetHomeFiltersBtn')?.addEventListener('click', () => {
        if (homeSearchInput) homeSearchInput.value = '';
        searchQuery = '';
        if (homeSortSelect) homeSortSelect.value = 'featured';
        activeSort = 'featured';
        selectCategory('all');
      });
      return;
    }

    // Render product cards with luxury staggered entrance animation
    featuredGrid.innerHTML = items.map((product, idx) => `
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
              <span class="editorial-price-label">Price in Pakistan</span>
              <span class="editorial-price">${window.CONFIG.currency.format(product.price)}</span>
            </div>

            <button class="btn editorial-order-btn order-wa-action" data-id="${product.id}">
              <i class="bi bi-whatsapp"></i> Order on WhatsApp
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach card action listeners
    featuredGrid.querySelectorAll('.order-wa-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        orderOnWhatsApp(btn.getAttribute('data-id'));
      });
    });

    featuredGrid.querySelectorAll('.view-detail-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuickView(btn.getAttribute('data-id'));
      });
    });

    featuredGrid.querySelectorAll('.editorial-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.order-wa-action')) return;
        openQuickView(card.getAttribute('data-id'));
      });
    });
  }

  // --- 4. SEARCH & SORT EVENT HANDLERS ---
  if (homeSearchInput) {
    homeSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }

  if (homeSortSelect) {
    homeSortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderCatalog();
    });
  }

  // Header search trigger smoothly opens and focuses search bar
  if (headerSearchTrigger) {
    headerSearchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => {
        homeSearchInput?.focus();
      }, 500);
    });
  }

  // --- 4.5 CIRCULAR CATEGORY SHOWCASE LOGIC ---
  function renderCategoryShowcase(activeDept = 'all') {
    if (!categoryShowcaseTrack || !window.SHOWCASE_CATEGORIES) return;

    const categories = activeDept === 'all'
      ? window.SHOWCASE_CATEGORIES
      : window.SHOWCASE_CATEGORIES.filter(cat => cat.deptId === activeDept);

    categoryShowcaseTrack.innerHTML = categories.map(cat => `
      <div class="showcase-category-item ${cat.isPrimary ? 'primary-watch-cat' : ''}" 
           data-cat-id="${cat.id}"
           data-dept="${cat.deptId}"
           role="button"
           tabindex="0"
           aria-label="${cat.name}">
        <div class="category-circle-frame">
          ${cat.isPrimary ? '<span class="primary-crown-badge" title="Signature Horology"><i class="bi bi-star-fill"></i></span>' : ''}
          <img src="${cat.image}" alt="${cat.name}" loading="lazy">
        </div>
        <span class="category-circle-label">${cat.name}</span>
        <span class="category-circle-dept">${cat.deptName}</span>
      </div>
    `).join('');

    // Attach click and keyboard events
    categoryShowcaseTrack.querySelectorAll('.showcase-category-item').forEach(item => {
      const catId = item.getAttribute('data-cat-id');
      const catData = window.SHOWCASE_CATEGORIES.find(c => c.id === catId);

      const handleSelect = (e) => {
        e.preventDefault();
        if (!catData) return;

        // Apply filter query and category
        searchQuery = catData.filterQuery || '';
        if (homeSearchInput) {
          homeSearchInput.value = searchQuery;
        }

        // Highlight selected circle
        categoryShowcaseTrack.querySelectorAll('.showcase-category-item').forEach(el => el.classList.remove('selected-circle'));
        item.classList.add('selected-circle');

        selectCategory(catData.filterCategory || 'all', true);
      };

      item.addEventListener('click', handleSelect);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleSelect(e);
        }
      });
    });
  }

  // Department quick-filter tabs
  if (showcaseDeptTabs) {
    showcaseDeptTabs.querySelectorAll('.dept-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        showcaseDeptTabs.querySelectorAll('.dept-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const dept = tab.getAttribute('data-dept') || 'all';
        renderCategoryShowcase(dept);
        if (categoryShowcaseTrack) {
          categoryShowcaseTrack.scrollTo({ left: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // Carousel arrow controls
  if (catCarouselPrev && categoryShowcaseTrack) {
    catCarouselPrev.addEventListener('click', () => {
      categoryShowcaseTrack.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  if (catCarouselNext && categoryShowcaseTrack) {
    catCarouselNext.addEventListener('click', () => {
      categoryShowcaseTrack.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  // --- 5. WHATSAPP ORDER AUTOMATION ---
  function orderOnWhatsApp(productId) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const message = window.CONFIG.whatsapp.defaultOrderMessage(product);
    const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // --- 6. LUXURY PRODUCT DETAIL EXPERIENCE (MODAL & RELATED ITEMS) ---
  function openQuickView(productId) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product || !quickViewModal || !modalScrollArea) return;

    // Find 3 related items in same category or watches
    const related = window.PRODUCTS
      .filter(p => p.id !== product.id && (p.category === product.category || p.category === 'watches'))
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

  // --- 7. MOBILE DRAWER NAVIGATION ---
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

  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // --- 8. SCROLL HEADER EFFECT ---
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });

  // --- 9. FLOATING WHATSAPP BUTTON ---
  floatingWaBtn?.addEventListener('click', () => {
    const waText = window.CONFIG.whatsapp.defaultInquiryMessage();
    const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  });

  // --- 10. REFINED SCROLL REVEAL (INTERSECTION OBSERVER) ---
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

  // --- 11. INITIALIZATION ---
  renderCategoryShowcase('all');
  renderCategoryPills();
  renderCatalog();
  initScrollReveal();
});
