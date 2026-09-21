/**
 * Ibn e Naimat Collection - Main Application Logic
 * Clean, modular, and fast vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let activeCategory = 'all';
  let searchQuery = '';

  // DOM Elements
  const categoriesGrid = document.getElementById('categoriesGrid');
  const categoryTabs = document.getElementById('categoryTabs');
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const quickViewModal = document.getElementById('quickViewModal');
  const modalContainer = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const siteHeader = document.querySelector('.site-header');
  const inquiryForm = document.getElementById('inquiryForm');
  const floatingWaBtn = document.getElementById('floatingWaBtn');

  // --- 1. RENDER CATEGORIES SHOWCASE ---
  function renderCategoriesShowcase() {
    if (!categoriesGrid || !window.CATEGORIES) return;

    // Filter out 'all' for the showcase cards
    const showcaseCats = window.CATEGORIES.filter(c => c.id !== 'all');
    
    categoriesGrid.innerHTML = showcaseCats.map(cat => `
      <div class="category-card" data-category="${cat.id}">
        <div class="category-icon-wrapper">
          <img src="${cat.image}" alt="${cat.name}" loading="lazy">
        </div>
        <h3 class="category-name">${cat.name}</h3>
        <p class="category-tagline">${cat.tagline || ''}</p>
        <span class="category-btn">
          View Products <i class="bi bi-arrow-right"></i>
        </span>
      </div>
    `).join('');

    // Attach click events
    categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-category');
        selectCategory(catId);
        
        // Scroll to shop section
        const shopSection = document.getElementById('shop');
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // --- 2. RENDER CATEGORY FILTER TABS ---
  function renderCategoryTabs() {
    if (!categoryTabs || !window.CATEGORIES) return;

    categoryTabs.innerHTML = window.CATEGORIES.map(cat => `
      <button class="tab-btn ${cat.id === activeCategory ? 'active' : ''}" data-category="${cat.id}">
        ${cat.name}
      </button>
    `).join('');

    categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        selectCategory(catId);
      });
    });
  }

  // --- 3. FILTER & RENDER PRODUCTS ---
  function renderProducts() {
    if (!productsGrid || !window.PRODUCTS) return;

    let filtered = window.PRODUCTS;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <i class="bi bi-search"></i>
          <h3>No products found</h3>
          <p class="text-muted">Try adjusting your search or switching to another category.</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" id="resetFilterBtn">View All Items</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          selectCategory('all');
        });
      }
      return;
    }

    productsGrid.innerHTML = filtered.map(product => `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image-box">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-quick-action">
            <button class="quick-view-btn" data-id="${product.id}">
              <i class="bi bi-eye"></i> Quick View
            </button>
          </div>
        </div>

        <div class="product-content">
          <div class="product-category-label">${product.categoryName}</div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.shortDesc}</p>

          <div class="product-footer">
            <div class="product-price-box">
              <span class="product-price-label">Price</span>
              <span class="product-price">${window.CONFIG.currency.format(product.price)}</span>
            </div>

            <button class="btn product-wa-btn order-wa-btn" data-id="${product.id}">
              <i class="bi bi-whatsapp"></i> Order on WhatsApp
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach event listeners to newly created cards
    productsGrid.querySelectorAll('.order-wa-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        orderOnWhatsApp(id);
      });
    });

    productsGrid.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openQuickView(id);
      });
    });

    // Make entire product card open quick view for better mobile usability
    productsGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // If user clicked order button, don't trigger modal
        if (e.target.closest('.order-wa-btn')) return;
        const id = card.getAttribute('data-id');
        openQuickView(id);
      });
    });
  }

  // --- 4. SELECT CATEGORY HANDLER ---
  function selectCategory(catId) {
    activeCategory = catId;

    // Update active tab styling
    if (categoryTabs) {
      categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === catId);
      });
    }

    // Update active showcase card styling
    if (categoriesGrid) {
      categoriesGrid.querySelectorAll('.category-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-category') === catId);
      });
    }

    renderProducts();
  }

  // --- 5. WHATSAPP ORDER AUTOMATION ---
  function orderOnWhatsApp(productId) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const message = window.CONFIG.whatsapp.defaultOrderMessage(product);
    const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab / launch app on mobile
    window.open(waUrl, '_blank');
  }

  // --- 6. QUICK VIEW MODAL LOGIC ---
  function openQuickView(productId) {
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product || !quickViewModal || !modalContainer) return;

    const specsHtml = product.specs && product.specs.length > 0 
      ? `
        <div class="modal-specs-title">Key Specifications</div>
        <ul class="modal-specs-list">
          ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
        </ul>
      ` : '';

    modalContainer.innerHTML = `
      <div class="modal-img-col">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="modal-info-col">
        ${product.badge ? `<span class="modal-badge">${product.badge}</span>` : ''}
        <h2 class="modal-title">${product.name}</h2>
        <div class="modal-code">Item Code: <strong>${product.id}</strong> | ${product.categoryName}</div>
        
        <div class="modal-price-box">
          <span class="modal-price">${window.CONFIG.currency.format(product.price)}</span>
        </div>

        <p class="modal-desc">${product.shortDesc}</p>

        ${specsHtml}

        <div class="modal-actions">
          <button class="btn btn-wa modal-order-btn" style="width: 100%; font-size: 1rem;" data-id="${product.id}">
            <i class="bi bi-whatsapp"></i> Order on WhatsApp (03302241340)
          </button>
          <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.75rem; text-align: center;">
            <i class="bi bi-shield-check"></i> 100% Inspected Genuine Item • Advance Payment Confirmation
          </p>
        </div>
      </div>
    `;

    // Order button inside modal
    const modalOrderBtn = modalContainer.querySelector('.modal-order-btn');
    if (modalOrderBtn) {
      modalOrderBtn.addEventListener('click', () => {
        orderOnWhatsApp(product.id);
      });
    }

    quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent page scroll behind modal
  }

  function closeQuickView() {
    if (!quickViewModal) return;
    quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeQuickView);
  }

  if (quickViewModal) {
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        closeQuickView();
      }
    });
  }

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quickViewModal && quickViewModal.classList.contains('active')) {
      closeQuickView();
    }
  });

  // --- 7. SEARCH INPUT LISTENER ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // --- 8. MOBILE DRAWER NAVIGATION ---
  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (drawerOverlay) drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Close drawer on clicking links
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      const targetCat = link.getAttribute('data-category');
      if (targetCat) {
        selectCategory(targetCat);
      }
    });
  });

  // --- 9. STICKY HEADER SCROLL SHADOW ---
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // --- 10. QUICK INQUIRY FORM VIA WHATSAPP ---
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inquiryName')?.value || 'Valued Customer';
      const city = document.getElementById('inquiryCity')?.value || 'Pakistan';
      const message = document.getElementById('inquiryMessage')?.value || 'I am interested in your products.';

      const waText = `Assalam-o-Alaikum Ibn e Naimat Collection!\n\n` +
                     `• *Name:* ${name}\n` +
                     `• *City:* ${city}\n` +
                     `• *Message:* ${message}\n\n` +
                     `Please get back to me with availability & details.`;

      const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      inquiryForm.reset();
    });
  }

  // --- 11. FLOATING WHATSAPP BUTTON ---
  if (floatingWaBtn) {
    floatingWaBtn.addEventListener('click', () => {
      const waText = window.CONFIG.whatsapp.defaultInquiryMessage();
      const waUrl = `https://wa.me/${window.CONFIG.whatsapp.international}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
    });
  }

  // --- 12. CATEGORY JUMP LINKS (Navbar Category Buttons) ---
  document.querySelectorAll('[data-category-target]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      const cat = elem.getAttribute('data-category-target');
      if (cat) {
        selectCategory(cat);
      }
    });
  });

  // Initialize
  renderCategoriesShowcase();
  renderCategoryTabs();
  renderProducts();
});
