/**
 * Ibn e Naimat Collection - Admin Dashboard UI Controller
 * Manages view switching, interactive data tables, modals, image preview uploads,
 * specs list editing, and real-time toast alerts.
 */

(function () {
  'use strict';

  // State
  let allProducts = [];
  let allCategories = [];
  let allHeroSlides = [];
  let allSections = [];
  let allOrders = [];
  let activeTab = 'dashboard';
  let currentEditingProductId = null;
  let currentEditingSlideId = null;
  let currentEditingCategoryId = null;
  let currentEditingOrderId = null;
  let currentOrderFilterStatus = 'all';
  let currentOrderSearchQuery = '';

  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const adminTabs = document.querySelectorAll('.admin-tab');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const adminSidebar = document.querySelector('.admin-sidebar');
  const toastContainer = document.getElementById('toastContainer');

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconClass = 'bi-check-circle-fill';
    let iconColor = 'var(--success)';

    if (type === 'error' || type === 'danger') {
      iconClass = 'bi-exclamation-triangle-fill';
      iconColor = 'var(--danger)';
    } else if (type === 'info') {
      iconClass = 'bi-info-circle-fill';
      iconColor = 'var(--gold)';
    } else if (type === 'warning') {
      iconClass = 'bi-exclamation-circle-fill';
      iconColor = '#f59e0b';
    }

    toast.innerHTML = `
      <i class="bi ${iconClass}" style="color: ${iconColor}; font-size: 1.1rem;"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- TAB NAVIGATION ---
  function switchTab(tabId) {
    activeTab = tabId;

    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.mobile-bottom-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    adminTabs.forEach(tab => {
      tab.classList.toggle('active', tab.id === `tab-${tabId}`);
    });

    // Update Header
    const titles = {
      dashboard: { title: 'Dashboard Overview', sub: 'Store performance metrics, stock alerts, and quick actions' },
      products: { title: 'Product Catalog Management', sub: 'Create, edit, manage stock, and organize store products' },
      categories: { title: 'Category & Showcase Management', sub: 'Organize store departments and horizontal circular collections' },
      orders: { title: 'Customer Orders Management', sub: 'Live customer orders, fulfillment tracking, and status controls' },
      hero: { title: 'Hero Carousel Slider', sub: 'Control homepage hero slides, images, typography, and CTA links' },
      homepage: { title: 'Homepage & Section Controls', sub: 'Configure promotional banners, announcement text, and section visibility' },
      settings: { title: 'Store & Concierge Settings', sub: 'Manage official WhatsApp hotline, brand details, and business policies' },
      media: { title: 'Supabase Media Storage', sub: 'Directly upload and manage store images and branding graphics' }
    };

    if (titles[tabId]) {
      pageTitle.textContent = titles[tabId].title;
      pageSubtitle.textContent = titles[tabId].sub;
    }

    // Close mobile sidebar
    adminSidebar.classList.remove('open');

    // Trigger tab-specific refresh
    if (tabId === 'dashboard') loadDashboard();
    if (tabId === 'products') loadProductsTable();
    if (tabId === 'categories') loadCategoriesTable();
    if (tabId === 'orders') loadOrdersTable();
    if (tabId === 'hero') loadHeroSlidesGrid();
    if (tabId === 'homepage') loadHomepageSections();
    if (tabId === 'settings') loadSettingsForm();
  }

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      adminSidebar.classList.toggle('open');
    });
  }

  // Bind nav click
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-tab');
      if (target) switchTab(target);
    });
  });

  document.querySelectorAll('.mobile-bottom-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-tab');
      if (target) switchTab(target);
    });
  });

  // --- 1. DASHBOARD OVERVIEW ---
  async function loadDashboard() {
    try {
      allProducts = await window.ADMIN_API.getProducts();
      allCategories = await window.ADMIN_API.getCategories();
      allHeroSlides = await window.ADMIN_API.getHeroSlides();

      // Metrics
      const totalProds = allProducts.length;
      const activeProds = allProducts.filter(p => p.is_active).length;
      const outOfStockProds = allProducts.filter(p => p.stock_status === 'out_of_stock').length;
      const activeSlides = allHeroSlides.filter(s => s.is_active).length;

      document.getElementById('metricTotalProducts').textContent = totalProds;
      document.getElementById('metricActiveProducts').textContent = activeProds;
      document.getElementById('metricOutOfStock').textContent = outOfStockProds;
      document.getElementById('metricTotalCategories').textContent = allCategories.length;
      document.getElementById('metricHeroSlides').textContent = `${activeSlides} Active`;

      // Fetch and calculate Orders metrics
      let dashOrders = [];
      try {
        dashOrders = await window.ADMIN_API.getOrders();
      } catch (e) {
        console.warn('Dashboard orders fetch error:', e);
      }

      const totalOrders = dashOrders.length;
      const pendingOrders = dashOrders.filter(o => o.status === 'Pending').length;
      const totalRevenue = dashOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      const metricTotalOrdersEl = document.getElementById('metricTotalOrders');
      if (metricTotalOrdersEl) metricTotalOrdersEl.textContent = totalOrders;

      const metricPendingOrdersEl = document.getElementById('metricPendingOrders');
      if (metricPendingOrdersEl) metricPendingOrdersEl.textContent = pendingOrders;

      const metricRevenueEl = document.getElementById('metricTotalRevenue');
      if (metricRevenueEl) metricRevenueEl.textContent = `PKR ${totalRevenue.toLocaleString('en-PK')}`;

      // Update Sidebar Badges
      const prodBadge = document.getElementById('badgeProductCount');
      if (prodBadge) prodBadge.textContent = totalProds;

      const slideBadge = document.getElementById('badgeSlideCount');
      if (slideBadge) slideBadge.textContent = activeSlides;

      const orderBadge = document.getElementById('badgeOrderCount');
      if (orderBadge) orderBadge.textContent = pendingOrders;

      // Render Recent Products in Dashboard
      const recentTbody = document.getElementById('dashboardRecentProductsBody');
      if (recentTbody) {
        recentTbody.innerHTML = allProducts.slice(0, 5).map(p => `
          <tr>
            <td>
              <div class="product-cell">
                <img src="${p.image_url}" alt="${p.name}" class="product-thumb" onerror="this.src='../assets/images/placeholders/watch-placeholder.svg'">
                <div class="product-meta">
                  <div class="product-name">${p.name}</div>
                  <div class="product-sku">Ref: ${p.id}</div>
                </div>
              </div>
            </td>
            <td><span class="badge-category">${p.category_name}</span></td>
            <td><strong>Rs. ${Number(p.price).toLocaleString('en-PK')}</strong></td>
            <td>
              <span class="status-badge badge-${p.stock_status}">
                ${p.stock_status.replace('_', ' ')}
              </span>
            </td>
            <td>
              <button class="action-btn" onclick="window.ADMIN_UI.editProduct('${p.id}')" title="Edit Product">
                <i class="bi bi-pencil"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }

    } catch (err) {
      console.error('[AdminUI] Error loading dashboard metrics:', err);
    }
  }

  // --- 2. PRODUCTS MANAGEMENT ---
  async function loadProductsTable() {
    try {
      allProducts = await window.ADMIN_API.getProducts();
      allCategories = await window.ADMIN_API.getCategories();
      populateProductCategoryFilter();
      renderFilteredProducts();

      // Check if auto-edit is requested
      const urlParams = new URLSearchParams(window.location.search);
      const autoEditId = urlParams.get('edit');
      if (autoEditId) {
        await window.ADMIN_UI.editProduct(autoEditId);
      }
    } catch (err) {
      showToast('Error loading products: ' + err.message, 'error');
    }
  }

  function populateProductCategoryFilter() {
    const filterSelect = document.getElementById('productCategoryFilter');
    if (!filterSelect) return;

    const currentVal = filterSelect.value;
    filterSelect.innerHTML = `<option value="all">All Categories</option>` +
      allCategories.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');

    filterSelect.value = currentVal || 'all';
  }

  function renderFilteredProducts() {
    const searchVal = (document.getElementById('productSearchInput')?.value || '').toLowerCase().trim();
    const catFilter = document.getElementById('productCategoryFilter')?.value || 'all';
    const stockFilter = document.getElementById('productStockFilter')?.value || 'all';
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    let items = [...allProducts];

    if (searchVal) {
      items = items.filter(p =>
        p.name.toLowerCase().includes(searchVal) ||
        p.id.toLowerCase().includes(searchVal) ||
        p.category_name.toLowerCase().includes(searchVal)
      );
    }

    if (catFilter !== 'all') {
      items = items.filter(p => p.category_id === catFilter);
    }

    if (stockFilter !== 'all') {
      items = items.filter(p => p.stock_status === stockFilter);
    }

    document.getElementById('productCountLabel').textContent = `Showing ${items.length} of ${allProducts.length} items`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <i class="bi bi-inbox" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
            No products found matching your current filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(p => `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${p.image_url}" alt="${p.name}" class="product-thumb" onerror="this.src='../assets/images/placeholders/watch-placeholder.svg'">
            <div class="product-meta">
              <div class="product-name">${p.name}</div>
              <div class="product-sku">Ref: <strong>${p.id}</strong></div>
            </div>
          </div>
        </td>
        <td><span class="badge-category">${p.category_name}</span></td>
        <td>
          <div style="font-weight: 700; color: var(--text-main);">Rs. ${Number(p.price).toLocaleString('en-PK')}</div>
          ${p.sale_price ? `<div style="font-size: 0.75rem; color: var(--gold); text-decoration: line-through;">Rs. ${Number(p.sale_price).toLocaleString('en-PK')}</div>` : ''}
        </td>
        <td>
          <span class="status-badge badge-${p.stock_status}">
            ${p.stock_status.replace('_', ' ')}
          </span>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${p.is_active ? 'checked' : ''} onchange="window.ADMIN_UI.toggleProductActive('${p.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          ${p.featured ? '<span style="color: var(--gold); font-size: 0.75rem; font-weight: 700;"><i class="bi bi-star-fill"></i> Featured</span>' : '<span style="color: var(--text-dim); font-size: 0.75rem;">Standard</span>'}
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="window.ADMIN_UI.editProduct('${p.id}')" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="action-btn delete-btn" onclick="window.ADMIN_UI.deleteProduct('${p.id}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Product Search & Filter Listeners
  document.getElementById('productSearchInput')?.addEventListener('input', renderFilteredProducts);
  document.getElementById('productCategoryFilter')?.addEventListener('change', renderFilteredProducts);
  document.getElementById('productStockFilter')?.addEventListener('change', renderFilteredProducts);

  // --- PRODUCT MODAL & EDIT LOGIC ---
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const specsContainer = document.getElementById('specsContainer');
  const addSpecBtn = document.getElementById('addSpecBtn');

  function openProductModal(isEdit = false) {
    document.getElementById('productModalTitle').textContent = isEdit ? 'Edit Product' : 'Add New Product';
    document.getElementById('modalProductId').readOnly = isEdit;
    productModal.classList.add('show');
  }

  function closeProductModal() {
    productModal.classList.remove('show');
    productForm.reset();
    currentEditingProductId = null;
    document.getElementById('imagePreviewThumb').src = '../assets/images/placeholders/watch-placeholder.svg';
    specsContainer.innerHTML = '';
  }

  document.getElementById('closeProductModalBtn')?.addEventListener('click', closeProductModal);
  document.getElementById('cancelProductModalBtn')?.addEventListener('click', closeProductModal);
  document.getElementById('btnAddNewProduct')?.addEventListener('click', () => {
    currentEditingProductId = null;
    productForm.reset();
    populateCategoryDropdown();
    addSpecField();
    openProductModal(false);
  });

  function populateCategoryDropdown(selectedCatId = '') {
    const catSelect = document.getElementById('modalProductCategory');
    if (!catSelect) return;

    const mainCats = allCategories.filter(c => Number(c.sort_order) < 10);
    const otherCats = allCategories.filter(c => Number(c.sort_order) >= 10);

    let html = '';
    if (mainCats.length > 0) {
      html += `<optgroup label="Store Departments">` +
        mainCats.map(c => `<option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>${c.name}</option>`).join('') +
        `</optgroup>`;
    }
    if (otherCats.length > 0) {
      html += `<optgroup label="Showcase Collections">` +
        otherCats.map(c => `<option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>${c.name}</option>`).join('') +
        `</optgroup>`;
    }
    catSelect.innerHTML = html || allCategories.map(c => `<option value="${c.id}" ${c.id === selectedCatId ? 'selected' : ''}>${c.name}</option>`).join('');
  }

  function addSpecField(value = '') {
    const div = document.createElement('div');
    div.className = 'spec-item';
    div.innerHTML = `
      <input type="text" class="form-control spec-input" value="${value}" placeholder="e.g. Strap: Genuine Leather" required>
      <button type="button" class="btn-remove-spec" onclick="this.parentElement.remove()" title="Remove specification">
        <i class="bi bi-trash"></i>
      </button>
    `;
    specsContainer.appendChild(div);
  }

  if (addSpecBtn) {
    addSpecBtn.addEventListener('click', () => addSpecField());
  }

  // Image URL Helper for Admin Directory (resolves relative root assets cleanly)
  function formatAdminImageUrl(url) {
    if (!url) return '../assets/images/placeholders/watch-placeholder.svg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('../') || url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `../${url}`;
  }

  // Handle Product Image Upload
  const productImageFileInput = document.getElementById('productImageFile');
  const productImageDropZone = document.getElementById('productImageDropZone');
  const productImageUrlInput = document.getElementById('modalProductImageUrl');
  const imagePreviewThumb = document.getElementById('imagePreviewThumb');

  if (productImageUrlInput && imagePreviewThumb) {
    productImageUrlInput.addEventListener('input', () => {
      imagePreviewThumb.src = formatAdminImageUrl(productImageUrlInput.value.trim());
    });
  }

  if (productImageDropZone && productImageFileInput) {
    productImageDropZone.addEventListener('click', () => productImageFileInput.click());

    productImageFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Local preview
      imagePreviewThumb.src = URL.createObjectURL(file);

      // Upload to Supabase Storage
      try {
        showToast('Uploading image to Supabase Storage...', 'info');
        const publicUrl = await window.ADMIN_API.uploadImage(file, 'products');
        productImageUrlInput.value = publicUrl;
        imagePreviewThumb.src = publicUrl;
        showToast('Product image uploaded successfully!', 'success');
      } catch (err) {
        showToast('Image upload failed: ' + err.message, 'error');
      }
    });
  }

  // Product Form Submit
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('modalProductId').value.trim();
      const name = document.getElementById('modalProductName').value.trim();
      const categoryId = document.getElementById('modalProductCategory').value;
      const catObj = allCategories.find(c => c.id === categoryId);
      const categoryName = catObj ? catObj.name : 'Curated Item';
      const price = document.getElementById('modalProductPrice').value;
      const salePrice = document.getElementById('modalProductSalePrice').value;
      const badge = document.getElementById('modalProductBadge').value.trim();
      const imageUrl = document.getElementById('modalProductImageUrl').value.trim();
      const shortDesc = document.getElementById('modalProductDesc').value.trim();
      const stockStatus = document.getElementById('modalProductStock').value;
      const featured = document.getElementById('modalProductFeatured').checked;
      const isActive = document.getElementById('modalProductActive').checked;
      const sortOrder = document.getElementById('modalProductSortOrder').value;

      // Collect specs
      const specs = [];
      document.querySelectorAll('.spec-input').forEach(inp => {
        const val = inp.value.trim();
        if (val) specs.push(val);
      });

      if (!id || !name || !price || !imageUrl) {
        showToast('Please fill in all required fields (ID, Name, Price, Image URL)', 'error');
        return;
      }

      const payload = {
        id,
        name,
        category_id: categoryId,
        category_name: categoryName,
        price,
        sale_price: salePrice || null,
        badge,
        image_url: imageUrl,
        short_desc: shortDesc,
        specs,
        stock_status: stockStatus,
        featured,
        is_active: isActive,
        sort_order: sortOrder
      };

      try {
        const isEdit = Boolean(currentEditingProductId);
        await window.ADMIN_API.saveProduct(payload, isEdit);
        showToast(`Product "${name}" saved successfully!`, 'success');
        closeProductModal();
        loadProductsTable();
        loadDashboard();
      } catch (err) {
        showToast('Error saving product: ' + err.message, 'error');
      }
    });
  }

  // --- 3. HERO SLIDER MANAGEMENT ---
  async function loadHeroSlidesGrid() {
    try {
      allHeroSlides = await window.ADMIN_API.getHeroSlides();
      const grid = document.getElementById('heroSlidesGrid');
      if (!grid) return;

      if (allHeroSlides.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">No hero slides found. Click "+ Add Hero Slide" to create one.</div>`;
        return;
      }

      grid.innerHTML = allHeroSlides.map(slide => `
        <div class="hero-slide-admin-card" data-id="${slide.id}">
          <div class="hero-slide-thumb-box" style="background-image: url('${slide.bg_image_url}');">
            <div class="hero-slide-thumb-overlay"></div>
            <div class="hero-slide-order-badge">Slide #${slide.sort_order || slide.slide_index + 1}</div>
            <div class="hero-slide-content-preview">
              <div class="hero-slide-badge-text">${slide.badge_text || slide.category_title}</div>
              <div class="hero-slide-title-preview">${slide.title}</div>
            </div>
          </div>

          <div class="hero-slide-card-body">
            <p class="hero-slide-card-desc">${slide.description}</p>
            <div class="hero-slide-buttons-preview">
              <span><i class="bi bi-arrow-right-circle"></i> ${slide.primary_btn_text} &rarr; <code>${slide.primary_btn_url}</code></span>
            </div>

            <div class="hero-slide-card-footer">
              <label class="switch" title="Active on homepage">
                <input type="checkbox" ${slide.is_active ? 'checked' : ''} onchange="window.ADMIN_UI.toggleSlideActive('${slide.id}', this.checked)">
                <span class="slider"></span>
              </label>

              <div class="table-actions">
                <button class="action-btn" onclick="window.ADMIN_UI.editHeroSlide('${slide.id}')" title="Edit Slide">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete-btn" onclick="window.ADMIN_UI.deleteHeroSlide('${slide.id}')" title="Delete Slide">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('');

    } catch (err) {
      showToast('Error loading hero slides: ' + err.message, 'error');
    }
  }

  // Hero Slide Modal Logic
  const heroSlideModal = document.getElementById('heroSlideModal');
  const heroSlideForm = document.getElementById('heroSlideForm');

  function openHeroSlideModal(isEdit = false) {
    document.getElementById('heroModalTitle').textContent = isEdit ? 'Edit Hero Slide' : 'Add New Hero Slide';
    heroSlideModal.classList.add('show');
  }

  function closeHeroSlideModal() {
    heroSlideModal.classList.remove('show');
    heroSlideForm.reset();
    currentEditingSlideId = null;
    document.getElementById('heroSlideThumbPreview').src = '';
  }

  document.getElementById('closeHeroModalBtn')?.addEventListener('click', closeHeroSlideModal);
  document.getElementById('cancelHeroModalBtn')?.addEventListener('click', closeHeroSlideModal);
  document.getElementById('btnAddNewHeroSlide')?.addEventListener('click', () => {
    currentEditingSlideId = null;
    heroSlideForm.reset();
    document.getElementById('modalSlideIndex').value = allHeroSlides.length;
    openHeroSlideModal(false);
  });

  // Hero Slide Background Image Upload
  const slideImageFileInput = document.getElementById('slideImageFile');
  const slideImageDropZone = document.getElementById('slideImageDropZone');
  const slideImageUrlInput = document.getElementById('modalSlideBgUrl');
  const heroSlideThumbPreview = document.getElementById('heroSlideThumbPreview');

  if (slideImageUrlInput && heroSlideThumbPreview) {
    slideImageUrlInput.addEventListener('input', () => {
      heroSlideThumbPreview.src = formatAdminImageUrl(slideImageUrlInput.value.trim());
    });
  }

  if (slideImageDropZone && slideImageFileInput) {
    slideImageDropZone.addEventListener('click', () => slideImageFileInput.click());

    slideImageFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      heroSlideThumbPreview.src = URL.createObjectURL(file);

      try {
        showToast('Uploading hero background to Supabase Storage...', 'info');
        const publicUrl = await window.ADMIN_API.uploadImage(file, 'hero');
        slideImageUrlInput.value = publicUrl;
        heroSlideThumbPreview.src = publicUrl;
        showToast('Hero background uploaded successfully!', 'success');
      } catch (err) {
        showToast('Upload failed: ' + err.message, 'error');
      }
    });
  }

  if (heroSlideForm) {
    heroSlideForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        id: currentEditingSlideId,
        category_title: document.getElementById('modalSlideCategory').value.trim(),
        badge_text: document.getElementById('modalSlideBadge').value.trim(),
        title: document.getElementById('modalSlideTitle').value.trim(),
        title_highlight: document.getElementById('modalSlideHighlight').value.trim(),
        description: document.getElementById('modalSlideDesc').value.trim(),
        primary_btn_text: document.getElementById('modalSlideBtnText').value.trim(),
        primary_btn_url: document.getElementById('modalSlideBtnUrl').value.trim(),
        target_category: document.getElementById('modalSlideTargetCat').value.trim(),
        bg_image_url: document.getElementById('modalSlideBgUrl').value.trim(),
        sort_order: parseInt(document.getElementById('modalSlideOrder').value, 10) || 1,
        slide_index: parseInt(document.getElementById('modalSlideIndex').value, 10) || 0,
        is_active: document.getElementById('modalSlideActive').checked
      };

      try {
        await window.ADMIN_API.saveHeroSlide(payload, Boolean(currentEditingSlideId));
        showToast('Hero slide saved successfully!', 'success');
        closeHeroSlideModal();
        loadHeroSlidesGrid();
        loadDashboard();
      } catch (err) {
        showToast('Error saving hero slide: ' + err.message, 'error');
      }
    });
  }

  // --- 4. CATEGORIES MANAGEMENT ---
  // --- 4. CATEGORIES MANAGEMENT ---
  async function loadCategoriesTable() {
    try {
      allCategories = await window.ADMIN_API.getCategories();
      const tbody = document.getElementById('categoriesTableBody');
      if (!tbody) return;

      tbody.innerHTML = allCategories.map(cat => `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${formatAdminImageUrl(cat.image_url)}" alt="${cat.name}" class="product-thumb" style="border-radius: 50%; width: 44px; height: 44px; object-fit: cover;" onerror="this.src='../assets/images/placeholders/watch-placeholder.svg'">
              <div class="product-meta">
                <div class="product-name">${cat.name} ${cat.is_primary ? '<i class="bi bi-star-fill" style="color: var(--gold);" title="Primary Showcase"></i>' : ''}</div>
                <div class="product-sku">ID: <code>${cat.id}</code> &bull; Dept: ${cat.dept_name || cat.dept_id}</div>
              </div>
            </div>
          </td>
          <td><span class="badge-category">${cat.badge || 'Standard'}</span></td>
          <td>${cat.tagline || '-'}</td>
          <td><strong>#${cat.sort_order}</strong></td>
          <td>
            <label class="switch">
              <input type="checkbox" ${cat.is_active ? 'checked' : ''} onchange="window.ADMIN_UI.toggleCategoryActive('${cat.id}', this.checked)">
              <span class="slider"></span>
            </label>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn" onclick="window.ADMIN_UI.editCategory('${cat.id}')" title="Edit Category">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="action-btn delete-btn" onclick="window.ADMIN_UI.deleteCategory('${cat.id}')" title="Delete Category">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      // Auto-open edit modal if ?editCategory=ID is in URL
      const urlParams = new URLSearchParams(window.location.search);
      const autoEditCatId = urlParams.get('editCategory');
      if (autoEditCatId) {
        window.ADMIN_UI.editCategory(autoEditCatId);
      }

    } catch (err) {
      showToast('Error loading categories: ' + err.message, 'error');
    }
  }

  // --- CATEGORY CREATE / EDIT MODAL CONTROLLER ---
  const categoryModal = document.getElementById('categoryModal');
  const categoryForm = document.getElementById('categoryForm');

  function openCategoryModal(isEdit = false) {
    const titleEl = document.getElementById('categoryModalTitle');
    if (titleEl) titleEl.textContent = isEdit ? 'Edit Category' : 'Add New Category';
    const idInput = document.getElementById('modalCategoryId');
    if (idInput) idInput.readOnly = isEdit;
    if (categoryModal) categoryModal.classList.add('show');
  }

  function closeCategoryModal() {
    if (categoryModal) categoryModal.classList.remove('show');
    if (categoryForm) categoryForm.reset();
    currentEditingCategoryId = null;
    const thumb = document.getElementById('categoryImagePreviewThumb');
    if (thumb) thumb.src = '../assets/images/placeholders/watch-placeholder.svg';
  }

  document.getElementById('closeCategoryModalBtn')?.addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryModalBtn')?.addEventListener('click', closeCategoryModal);

  document.getElementById('btnAddNewCategory')?.addEventListener('click', () => {
    currentEditingCategoryId = null;
    if (categoryForm) categoryForm.reset();
    const idInput = document.getElementById('modalCategoryId');
    if (idInput) idInput.readOnly = false;
    const nextOrder = allCategories.length > 0
      ? Math.max(...allCategories.map(c => Number(c.sort_order) || 0)) + 1
      : 1;
    const sortInput = document.getElementById('modalCategorySortOrder');
    if (sortInput) sortInput.value = nextOrder;
    const thumb = document.getElementById('categoryImagePreviewThumb');
    if (thumb) thumb.src = '../assets/images/placeholders/watch-placeholder.svg';
    const activeCheck = document.getElementById('modalCategoryActive');
    if (activeCheck) activeCheck.checked = true;
    const primaryCheck = document.getElementById('modalCategoryPrimary');
    if (primaryCheck) primaryCheck.checked = false;
    openCategoryModal(false);
  });

  // Auto-slugify Category Identifier from Name when adding new category
  const modalCategoryNameInput = document.getElementById('modalCategoryName');
  const modalCategoryIdInput = document.getElementById('modalCategoryId');
  if (modalCategoryNameInput && modalCategoryIdInput) {
    modalCategoryNameInput.addEventListener('input', () => {
      if (!currentEditingCategoryId) {
        modalCategoryIdInput.value = modalCategoryNameInput.value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    });
  }

  // Handle Category Image Upload & Preview
  const categoryImageFileInput = document.getElementById('categoryImageFile');
  const categoryImageDropZone = document.getElementById('categoryImageDropZone');
  const categoryImageUrlInput = document.getElementById('modalCategoryImageUrl');
  const categoryImagePreviewThumb = document.getElementById('categoryImagePreviewThumb');

  if (categoryImageUrlInput && categoryImagePreviewThumb) {
    categoryImageUrlInput.addEventListener('input', () => {
      categoryImagePreviewThumb.src = formatAdminImageUrl(categoryImageUrlInput.value.trim());
    });
  }

  if (categoryImageDropZone && categoryImageFileInput) {
    categoryImageDropZone.addEventListener('click', () => categoryImageFileInput.click());

    categoryImageFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (categoryImagePreviewThumb) categoryImagePreviewThumb.src = URL.createObjectURL(file);

      try {
        showToast('Uploading category image to Supabase Storage...', 'info');
        const publicUrl = await window.ADMIN_API.uploadImage(file, 'categories');
        if (categoryImageUrlInput) categoryImageUrlInput.value = publicUrl;
        if (categoryImagePreviewThumb) categoryImagePreviewThumb.src = publicUrl;
        showToast('Category image uploaded successfully!', 'success');
      } catch (err) {
        showToast('Category image upload failed: ' + err.message, 'error');
      }
    });
  }

  // Category Form Submit
  if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = (modalCategoryIdInput?.value || '').trim().toLowerCase();
      const name = (modalCategoryNameInput?.value || '').trim();
      const deptValue = document.getElementById('modalCategoryDept')?.value || 'watches|Watches';
      const [deptId, deptName] = deptValue.split('|');
      const badge = (document.getElementById('modalCategoryBadge')?.value || '').trim();
      const tagline = (document.getElementById('modalCategoryTagline')?.value || '').trim();
      const imageUrl = (categoryImageUrlInput?.value || '').trim();
      const filterCat = (document.getElementById('modalCategoryFilterCat')?.value || '').trim() || id;
      const filterQuery = (document.getElementById('modalCategoryFilterQuery')?.value || '').trim();
      const sortOrder = parseInt(document.getElementById('modalCategorySortOrder')?.value, 10) || 0;
      const isPrimary = document.getElementById('modalCategoryPrimary')?.checked || false;
      const isActive = document.getElementById('modalCategoryActive')?.checked || false;

      if (!id || !name) {
        showToast('Please provide Category Identifier and Display Name.', 'error');
        return;
      }

      const payload = {
        id,
        name,
        dept_id: deptId,
        dept_name: deptName,
        tagline,
        badge,
        image_url: imageUrl,
        filter_category: filterCat,
        filter_query: filterQuery,
        sort_order: sortOrder,
        is_primary: isPrimary,
        is_active: isActive
      };

      try {
        const isEdit = Boolean(currentEditingCategoryId);
        await window.ADMIN_API.saveCategory(payload, isEdit);
        showToast(`Category "${name}" ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        closeCategoryModal();
        await loadCategoriesTable();
        populateCategoryDropdown();
        populateProductCategoryFilter();
        loadDashboard();
      } catch (err) {
        showToast('Error saving category: ' + err.message, 'error');
      }
    });
  }

  // --- 4. ORDERS MANAGEMENT ---
  const orderSearchInput = document.getElementById('orderSearchInput');
  const orderStatusFilters = document.getElementById('orderStatusFilters');
  const btnRefreshOrders = document.getElementById('btnRefreshOrders');
  const ordersTableBody = document.getElementById('ordersTableBody');
  const orderDetailModal = document.getElementById('orderDetailModal');
  const orderNotifyModal = document.getElementById('orderNotifyModal');
  const notifyTemplateSelect = document.getElementById('notifyTemplateSelect');
  const notifyCourierName = document.getElementById('notifyCourierName');
  const notifyTrackingCode = document.getElementById('notifyTrackingCode');
  const notifyMessageText = document.getElementById('notifyMessageText');
  const notifyDispatchFields = document.getElementById('notifyDispatchFields');
  let currentNotifyOrder = null;

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function loadOrdersTable() {
    if (!ordersTableBody) return;

    try {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <i class="bi bi-arrow-repeat spin" style="font-size: 1.5rem; display: inline-block; margin-bottom: 0.5rem;"></i>
            <div>Loading live customer orders...</div>
          </td>
        </tr>
      `;

      allOrders = await window.ADMIN_API.getOrders({
        status: currentOrderFilterStatus,
        search: currentOrderSearchQuery
      });

      // Update badge in sidebar
      const pendingCount = allOrders.filter(o => o.status === 'Pending').length;
      const orderBadge = document.getElementById('badgeOrderCount');
      if (orderBadge) orderBadge.textContent = pendingCount;

      if (!allOrders || allOrders.length === 0) {
        ordersTableBody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 3.5rem; color: var(--text-muted);">
              <i class="bi bi-inbox" style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem; opacity: 0.4;"></i>
              <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">No customer orders found</div>
              <div style="font-size: 0.8125rem;">Orders placed by customers will automatically appear here.</div>
            </td>
          </tr>
        `;
        return;
      }

      const statusBadges = {
        'Pending': { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' },
        'Confirmed': { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' },
        'Processing': { bg: 'rgba(99, 102, 241, 0.15)', text: '#4f46e5', border: 'rgba(99, 102, 241, 0.3)' },
        'Dispatched': { bg: 'rgba(168, 85, 247, 0.15)', text: '#9333ea', border: 'rgba(168, 85, 247, 0.3)' },
        'Out for Delivery': { bg: 'rgba(14, 165, 233, 0.15)', text: '#0284c7', border: 'rgba(14, 165, 233, 0.3)' },
        'Delivered': { bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
        'Cancelled': { bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' }
      };

      ordersTableBody.innerHTML = allOrders.map(o => {
        const d = new Date(o.created_at || Date.now());
        const formattedDate = d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) + '<br>' +
          `<span style="font-size: 0.72rem; color: var(--text-muted);">${d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>`;

        const totalFormatted = `PKR ${(Number(o.total) || 0).toLocaleString('en-PK')}`;
        const itemCount = (o.items && Array.isArray(o.items)) ? o.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) : 0;

        let cleanPhone = (o.customer_phone || '').replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
        const waMsg = encodeURIComponent(`Assalam-o-Alaikum ${o.customer_name || 'Customer'}, regarding your order #${o.order_id} at Ibn e Naimat Collection...`);
        const waLink = `https://wa.me/${cleanPhone}?text=${waMsg}`;

        const badgeCfg = statusBadges[o.status] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
        const statusPill = `<span style="display: inline-block; padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: ${badgeCfg.bg}; color: ${badgeCfg.text}; border: 1px solid ${badgeCfg.border}; white-space: nowrap;">${o.status || 'Pending'}</span>`;

        return `
          <tr>
            <td style="font-family: monospace; font-weight: 700; color: var(--gold); white-space: nowrap;">${o.order_id}</td>
            <td style="font-size: 0.8125rem; white-space: nowrap;">${formattedDate}</td>
            <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(o.customer_name || 'Guest')}</td>
            <td style="font-size: 0.8125rem; white-space: nowrap;">${escapeHtml(o.customer_phone || '-')}</td>
            <td style="font-size: 0.8125rem;">${escapeHtml(o.customer_city || '-')}</td>
            <td style="text-align: center;"><span style="background: rgba(0,0,0,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.78125rem; font-weight: 600;">${itemCount} item${itemCount !== 1 ? 's' : ''}</span></td>
            <td style="font-weight: 700; color: var(--text-main); white-space: nowrap;">${totalFormatted}</td>
            <td>${statusPill}</td>
            <td style="text-align: right; white-space: nowrap;">
              <button type="button" class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.78125rem; margin-right: 0.35rem;" onclick="window.ADMIN_UI.viewOrder('${o.order_id}')" title="View details &amp; fulfillment">
                <i class="bi bi-eye"></i> View
              </button>
              <button type="button" class="btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.78125rem; color: #16a34a; border-color: rgba(22, 163, 74, 0.4);" onclick="window.ADMIN_UI.notifyCustomer('${o.order_id}', 'confirmed')" title="Send WhatsApp/Email Confirmation to Customer">
                <i class="bi bi-whatsapp"></i> Notify
              </button>
            </td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      console.error('Error loading orders table:', err);
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: var(--danger);">
            <i class="bi bi-exclamation-triangle" style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem;"></i>
            Failed to load orders: ${escapeHtml(err.message)}
          </td>
        </tr>
      `;
    }
  }

  // Filter chips click
  if (orderStatusFilters) {
    orderStatusFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      orderStatusFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentOrderFilterStatus = chip.getAttribute('data-status') || 'all';
      loadOrdersTable();
    });
  }

  // Search input with debounce
  if (orderSearchInput) {
    let searchDebounceTimer = null;
    orderSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentOrderSearchQuery = e.target.value.trim();
        loadOrdersTable();
      }, 300);
    });
  }

  // Refresh button
  if (btnRefreshOrders) {
    btnRefreshOrders.addEventListener('click', () => {
      loadOrdersTable();
      showToast('Orders list refreshed', 'info');
    });
  }

  // Order Details Modal
  async function openOrderDetailModal(orderId) {
    try {
      const order = await window.ADMIN_API.getOrderById(orderId);
      if (!order) {
        showToast(`Order #${orderId} not found.`, 'error');
        return;
      }

      currentEditingOrderId = order.order_id;

      // Populate headers
      document.getElementById('orderModalTitle').textContent = `Order #${order.order_id}`;
      document.getElementById('orderModalSubtitle').textContent = `Placed on ${new Date(order.created_at || Date.now()).toLocaleString('en-PK')}`;

      // Populate status dropdown
      const statusSelect = document.getElementById('modalOrderStatusSelect');
      if (statusSelect) statusSelect.value = order.status || 'Pending';

      // Populate customer info
      const setText = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt || '-';
      };
      setText('modalCustName', order.customer_name);
      setText('modalCustPhone', order.customer_phone);
      setText('modalCustEmail', order.customer_email || 'Not provided');
      setText('modalOrderDate', new Date(order.created_at || Date.now()).toLocaleString('en-PK'));
      setText('modalCustCity', order.customer_city);
      setText('modalCustAddress', order.customer_address);
      setText('modalCustNotes', order.notes || 'None');

      // Admin notes textarea
      const adminNotesInput = document.getElementById('modalInternalAdminNotes');
      if (adminNotesInput) adminNotesInput.value = order.admin_notes || '';

      // Customer WhatsApp button
      const modalWaChatBtn = document.getElementById('modalWaChatBtn');
      if (modalWaChatBtn) {
        let cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
        const waMsg = encodeURIComponent(`Assalam-o-Alaikum ${order.customer_name}, this is Ibn e Naimat Collection regarding your order #${order.order_id}.`);
        modalWaChatBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
      }

      // Populate items table
      const itemsBody = document.getElementById('modalOrderItemsBody');
      if (itemsBody) {
        const items = order.items || [];
        if (items.length === 0) {
          itemsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1rem;">No item details available.</td></tr>`;
        } else {
          itemsBody.innerHTML = items.map(item => `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <img src="${formatAdminImageUrl(item.product_image)}" alt="${escapeHtml(item.product_name)}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" onerror="this.src='../assets/images/placeholders/watch-placeholder.svg'">
                  <div>
                    <div style="font-weight: 600; font-size: 0.875rem;">${escapeHtml(item.product_name)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">Ref: ${escapeHtml(item.product_id)}</div>
                  </div>
                </div>
              </td>
              <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
              <td style="text-align: right;">PKR ${(Number(item.unit_price) || 0).toLocaleString('en-PK')}</td>
              <td style="text-align: right; font-weight: 700; color: var(--gold);">PKR ${(Number(item.subtotal) || 0).toLocaleString('en-PK')}</td>
            </tr>
          `).join('');
        }
      }

      // Financials
      setText('modalSubtotalVal', `PKR ${(Number(order.subtotal) || 0).toLocaleString('en-PK')}`);
      setText('modalDeliveryVal', (Number(order.delivery_fee) || 0) === 0 ? 'FREE' : `PKR ${(Number(order.delivery_fee) || 0).toLocaleString('en-PK')}`);
      setText('modalGrandTotalVal', `PKR ${(Number(order.total) || 0).toLocaleString('en-PK')}`);

      if (orderDetailModal) orderDetailModal.classList.add('show');

    } catch (err) {
      showToast('Error opening order: ' + err.message, 'error');
    }
  }

  function closeOrderDetailModal() {
    if (orderDetailModal) orderDetailModal.classList.remove('show');
    currentEditingOrderId = null;
  }

  // Close buttons
  document.getElementById('closeOrderModalBtn')?.addEventListener('click', closeOrderDetailModal);
  document.getElementById('closeOrderModalBottomBtn')?.addEventListener('click', closeOrderDetailModal);

  // Update Status Button
  document.getElementById('btnUpdateOrderStatus')?.addEventListener('click', async () => {
    if (!currentEditingOrderId) return;
    const newStatus = document.getElementById('modalOrderStatusSelect')?.value;
    const adminNotes = document.getElementById('modalInternalAdminNotes')?.value.trim();

    try {
      await window.ADMIN_API.updateOrderStatus(currentEditingOrderId, newStatus, adminNotes);
      showToast(`Order #${currentEditingOrderId} status updated to "${newStatus}"!`, 'success');
      await loadOrdersTable();
      loadDashboard();

      // Trigger automatic customer notification prompt when status is set to Confirmed or Dispatched
      const order = await window.ADMIN_API.getOrderById(currentEditingOrderId);
      if (order) {
        if (newStatus === 'Confirmed') {
          const autoPrompt = localStorage.getItem('ibn_setting_auto_prompt_wa') !== 'false';
          const autoEmail = localStorage.getItem('ibn_setting_auto_send_email') !== 'false';

          if (autoEmail && (order.customer_email || order.email) && window.OrderNotification) {
            window.OrderNotification.sendEmailToCustomer(order).then(res => {
              if (res && res.success && res.method === 'emailjs') {
                showToast(`Automated confirmation email sent to ${order.customer_email || order.email}!`, 'success');
              }
            }).catch(console.warn);
          }

          if (autoPrompt) {
            openNotifyModal(order, 'confirmed');
          }
        } else if (newStatus === 'Dispatched') {
          openNotifyModal(order, 'dispatched');
        }
      }
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  });

  // Save Notes Only Button
  document.getElementById('btnSaveAdminNotes')?.addEventListener('click', async () => {
    if (!currentEditingOrderId) return;
    const currentStatus = document.getElementById('modalOrderStatusSelect')?.value;
    const adminNotes = document.getElementById('modalInternalAdminNotes')?.value.trim();

    try {
      await window.ADMIN_API.updateOrderStatus(currentEditingOrderId, currentStatus, adminNotes);
      showToast('Internal admin notes saved successfully.', 'success');
      await loadOrdersTable();
    } catch (err) {
      showToast('Failed to save notes: ' + err.message, 'error');
    }
  });

  // Cancel Order Button
  document.getElementById('modalCancelOrderBtn')?.addEventListener('click', async () => {
    if (!currentEditingOrderId) return;
    if (confirm(`Are you sure you want to mark Order #${currentEditingOrderId} as Cancelled?`)) {
      try {
        const adminNotes = document.getElementById('modalInternalAdminNotes')?.value.trim();
        await window.ADMIN_API.updateOrderStatus(currentEditingOrderId, 'Cancelled', adminNotes);
        const statusSelect = document.getElementById('modalOrderStatusSelect');
        if (statusSelect) statusSelect.value = 'Cancelled';
        showToast(`Order #${currentEditingOrderId} has been cancelled.`, 'warning');
        await loadOrdersTable();
        loadDashboard();
      } catch (err) {
        showToast('Failed to cancel order: ' + err.message, 'error');
      }
    }
  });

  // Print Packing Slip Button
  document.getElementById('modalPrintSlipBtn')?.addEventListener('click', async () => {
    if (!currentEditingOrderId) return;
    const order = await window.ADMIN_API.getOrderById(currentEditingOrderId);
    if (!order) return;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #ddd;">
          <strong>${escapeHtml(item.product_name)}</strong><br>
          <small style="color: #666;">SKU/Ref: ${escapeHtml(item.product_id)}</small>
        </td>
        <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #ddd;">PKR ${(Number(item.unit_price) || 0).toLocaleString('en-PK')}</td>
        <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold;">PKR ${(Number(item.subtotal) || 0).toLocaleString('en-PK')}</td>
      </tr>
    `).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Packing Slip - ${order.order_id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #222; font-size: 13px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b8933b; padding-bottom: 16px; margin-bottom: 20px; }
          .brand { font-size: 22px; font-weight: bold; color: #111; letter-spacing: 1px; }
          .order-id { font-size: 18px; font-weight: bold; color: #b8933b; font-family: monospace; }
          .info-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
          .info-box { flex: 1; background: #fbfbfb; border: 1px solid #eee; padding: 12px 16px; border-radius: 4px; }
          .info-box h4 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #b8933b; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; }
          .totals { margin-left: auto; width: 280px; }
          .totals tr td { padding: 4px 8px; }
          .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #222; padding-top: 6px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">IBN E NAIMAT COLLECTION</div>
            <div style="font-size: 11px; color: #666;">Luxury Watches &amp; Premium Lifestyle &bull; Pakistan</div>
            <div style="font-size: 11px; color: #666;">WhatsApp Concierge: 0330 2241340</div>
          </div>
          <div style="text-align: right;">
            <div class="order-id">${order.order_id}</div>
            <div style="font-size: 12px; color: #555;">Date: ${new Date(order.created_at || Date.now()).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div style="font-size: 12px; font-weight: bold; color: #222; margin-top: 4px;">Payment: Cash on Delivery (COD)</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h4>Customer Information</h4>
            <div><strong>${escapeHtml(order.customer_name)}</strong></div>
            <div>Phone: ${escapeHtml(order.customer_phone)}</div>
            ${order.customer_email ? `<div>Email: ${escapeHtml(order.customer_email)}</div>` : ''}
          </div>
          <div class="info-box">
            <h4>Delivery Address</h4>
            <div><strong>${escapeHtml(order.customer_city)}</strong></div>
            <div>${escapeHtml(order.customer_address)}</div>
            ${order.notes ? `<div style="margin-top: 6px; font-style: italic; color: #555;">Note: ${escapeHtml(order.notes)}</div>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <table style="width: 100%; margin: 0;">
            <tr>
              <td style="text-align: right;">Subtotal:</td>
              <td style="text-align: right;">PKR ${(Number(order.subtotal) || 0).toLocaleString('en-PK')}</td>
            </tr>
            <tr>
              <td style="text-align: right;">Delivery:</td>
              <td style="text-align: right;">${(Number(order.delivery_fee) || 0) === 0 ? 'FREE' : 'PKR ' + (Number(order.delivery_fee) || 0).toLocaleString('en-PK')}</td>
            </tr>
            <tr class="grand-total">
              <td style="text-align: right;">Total Amount:</td>
              <td style="text-align: right; color: #b8933b;">PKR ${(Number(order.total) || 0).toLocaleString('en-PK')}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          Thank you for choosing Ibn e Naimat Collection. For assistance, contact WhatsApp Concierge at 0330 2241340.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (printWin) {
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  });

  // --- ORDER NOTIFICATION MODAL & DISPATCH LOGIC ---
  function updateNotifyMessagePreview() {
    if (!currentNotifyOrder || !window.OrderNotification) return;

    const template = notifyTemplateSelect ? notifyTemplateSelect.value : 'confirmed';
    if (template === 'confirmed') {
      if (notifyDispatchFields) notifyDispatchFields.style.display = 'none';
      if (notifyMessageText) {
        notifyMessageText.value = window.OrderNotification.generateWhatsAppConfirmation(currentNotifyOrder);
      }
    } else if (template === 'dispatched') {
      if (notifyDispatchFields) notifyDispatchFields.style.display = 'grid';
      const courier = notifyCourierName ? notifyCourierName.value.trim() : 'TCS / Leopards Courier';
      const tracking = notifyTrackingCode ? notifyTrackingCode.value.trim() : '';
      if (notifyMessageText) {
        notifyMessageText.value = window.OrderNotification.generateWhatsAppDispatch(currentNotifyOrder, tracking, courier);
      }
    } else if (template === 'custom') {
      if (notifyDispatchFields) notifyDispatchFields.style.display = 'none';
      if (notifyMessageText && !notifyMessageText.value) {
        notifyMessageText.value = window.OrderNotification.generateWhatsAppConfirmation(currentNotifyOrder);
      }
    }
  }

  function openNotifyModal(order, defaultTemplate = 'confirmed') {
    if (!order) return;
    currentNotifyOrder = order;

    const modalTitle = document.getElementById('notifyModalTitle');
    const modalSubtitle = document.getElementById('notifyModalSubtitle');
    const nameEl = document.getElementById('notifyCustomerName');
    const phoneEl = document.getElementById('notifyCustomerPhone');
    const emailEl = document.getElementById('notifyCustomerEmail');

    if (modalTitle) modalTitle.textContent = `Send Notification — #${order.order_id}`;
    if (modalSubtitle) modalSubtitle.textContent = `Directly dispatch updates to ${order.customer_name || 'customer'} via WhatsApp or Email`;
    if (nameEl) nameEl.textContent = order.customer_name || 'Guest Customer';
    if (phoneEl) phoneEl.textContent = order.customer_phone || order.phone || 'No phone';
    if (emailEl) emailEl.textContent = order.customer_email || order.email || 'No email provided';

    if (notifyTemplateSelect) {
      notifyTemplateSelect.value = defaultTemplate;
    }

    updateNotifyMessagePreview();

    if (orderNotifyModal) orderNotifyModal.classList.add('show');
  }

  function closeNotifyModal() {
    if (orderNotifyModal) orderNotifyModal.classList.remove('show');
    currentNotifyOrder = null;
  }

  // Template select and input listeners
  if (notifyTemplateSelect) {
    notifyTemplateSelect.addEventListener('change', updateNotifyMessagePreview);
  }
  if (notifyCourierName) {
    notifyCourierName.addEventListener('input', updateNotifyMessagePreview);
  }
  if (notifyTrackingCode) {
    notifyTrackingCode.addEventListener('input', updateNotifyMessagePreview);
  }

  // Modal close buttons
  document.getElementById('closeNotifyModalBtn')?.addEventListener('click', closeNotifyModal);
  document.getElementById('closeNotifyModalBottomBtn')?.addEventListener('click', closeNotifyModal);

  // Dispatch via WhatsApp button
  document.getElementById('btnDispatchWaNotify')?.addEventListener('click', () => {
    if (!currentNotifyOrder) return;
    const msg = notifyMessageText ? notifyMessageText.value : '';
    const sent = window.OrderNotification?.sendWhatsAppToCustomer(currentNotifyOrder, 'custom', { customMessage: msg });
    if (sent) {
      showToast(`Opening WhatsApp chat with ${currentNotifyOrder.customer_name || 'customer'}...`, 'success');
    }
  });

  // Dispatch via Email button
  document.getElementById('btnDispatchEmailNotify')?.addEventListener('click', async () => {
    if (!currentNotifyOrder) return;
    const toEmail = currentNotifyOrder.customer_email || currentNotifyOrder.email;
    if (!toEmail) {
      showToast('This customer has not registered an email address.', 'warning');
      return;
    }

    showToast(`Dispatching confirmation email to ${toEmail}...`, 'info');
    try {
      const res = await window.OrderNotification.sendEmailToCustomer(currentNotifyOrder);
      if (res && res.success) {
        if (res.method === 'emailjs') {
          showToast(`Confirmation email successfully sent via EmailJS to ${toEmail}!`, 'success');
        } else {
          showToast(`Opened email client with pre-formatted receipt for ${toEmail}.`, 'success');
        }
      } else {
        showToast(`Email dispatch warning: ${res?.message || 'Could not send'}`, 'warning');
      }
    } catch (err) {
      showToast(`Failed to send email: ${err.message}`, 'error');
    }
  });

  // Copy notification text button
  document.getElementById('btnCopyNotifyMessage')?.addEventListener('click', () => {
    const text = notifyMessageText ? notifyMessageText.value : '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Notification message copied to clipboard!', 'info');
    }).catch(() => {
      showToast('Unable to copy text to clipboard.', 'warning');
    });
  });

  // Order Details Modal: WhatsApp & Email Buttons
  document.getElementById('modalSendWaConfirmBtn')?.addEventListener('click', async () => {
    if (!currentEditingOrderId) return;
    const order = await window.ADMIN_API.getOrderById(currentEditingOrderId);
    if (order) openNotifyModal(order, 'confirmed');
  });

  document.getElementById('modalSendEmailConfirmBtn')?.addEventListener('click', async () => {
    if (!currentEditingOrderId) return;
    const order = await window.ADMIN_API.getOrderById(currentEditingOrderId);
    if (order) openNotifyModal(order, 'confirmed');
  });

  // --- 5. HOMEPAGE SECTIONS ---
  async function loadHomepageSections() {
    try {
      allSections = await window.ADMIN_API.getHomepageSections();
      const container = document.getElementById('homepageSectionsList');
      if (!container) return;

      container.innerHTML = allSections.map(s => `
        <div class="metric-card" style="margin-bottom: 1rem;">
          <div>
            <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">${s.section_name}</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">${s.subheadline || s.headline || ''}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 0.8125rem; color: var(--text-muted);">Section #${s.sort_order}</span>
            <label class="switch">
              <input type="checkbox" ${s.is_visible ? 'checked' : ''} onchange="window.ADMIN_UI.toggleSection('${s.id}', this.checked)">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `).join('');

    } catch (err) {
      showToast('Error loading homepage sections: ' + err.message, 'error');
    }
  }

  // --- 6. WEBSITE SETTINGS ---
  async function loadSettingsForm() {
    try {
      const settings = await window.ADMIN_API.getWebsiteSettings();
      if (!settings) return;

      document.getElementById('settingStoreName').value = settings.store_name || '';
      document.getElementById('settingTagline').value = settings.tagline || '';
      document.getElementById('settingWhatsapp').value = settings.whatsapp_number || '';
      document.getElementById('settingWhatsappIntl').value = settings.whatsapp_international || '';
      document.getElementById('settingAnnouncement').value = settings.announcement_bar || '';
      document.getElementById('settingLogoUrl').value = settings.logo_url || '';
      document.getElementById('settingInstagram').value = settings.instagram_url || '';
      document.getElementById('settingFacebook').value = settings.facebook_url || '';
      document.getElementById('settingEmail').value = settings.email || '';
      document.getElementById('settingPhone').value = settings.phone || '';
      document.getElementById('settingTimings').value = settings.timings || '';
      document.getElementById('settingDelivery').value = settings.delivery_note || '';
      document.getElementById('settingFooterBio').value = settings.footer_bio || '';

      const defaultFeeEl = document.getElementById('settingDefaultDeliveryFee');
      if (defaultFeeEl) defaultFeeEl.value = settings.default_delivery_fee ?? 250;
      const freeThresholdEl = document.getElementById('settingFreeDeliveryThreshold');
      if (freeThresholdEl) freeThresholdEl.value = settings.free_delivery_threshold ?? 10000;

      // Notification & EmailJS settings
      if (window.OrderNotification) {
        const emailCfg = window.OrderNotification.getEmailJsConfig();
        const servInput = document.getElementById('settingEmailJsServiceId');
        const tempInput = document.getElementById('settingEmailJsTemplateId');
        const pubInput = document.getElementById('settingEmailJsPublicKey');
        if (servInput) servInput.value = emailCfg.serviceId || '';
        if (tempInput) tempInput.value = emailCfg.templateId || '';
        if (pubInput) pubInput.value = emailCfg.publicKey || '';
      }
      const autoPromptWa = localStorage.getItem('ibn_setting_auto_prompt_wa');
      const autoPromptEl = document.getElementById('settingAutoPromptWa');
      if (autoPromptEl && autoPromptWa !== null) {
        autoPromptEl.checked = autoPromptWa === 'true';
      }
      const autoSendEmail = localStorage.getItem('ibn_setting_auto_send_email');
      const autoSendEl = document.getElementById('settingAutoSendEmail');
      if (autoSendEl && autoSendEmail !== null) {
        autoSendEl.checked = autoSendEmail === 'true';
      }

    } catch (err) {
      console.warn('Could not load settings:', err);
    }
  }

  const settingsForm = document.getElementById('websiteSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        store_name: document.getElementById('settingStoreName').value.trim(),
        tagline: document.getElementById('settingTagline').value.trim(),
        whatsapp_number: document.getElementById('settingWhatsapp').value.trim(),
        whatsapp_international: document.getElementById('settingWhatsappIntl').value.trim(),
        whatsapp_display: `+${document.getElementById('settingWhatsappIntl').value.trim()}`,
        announcement_bar: document.getElementById('settingAnnouncement').value.trim(),
        logo_url: document.getElementById('settingLogoUrl').value.trim(),
        instagram_url: document.getElementById('settingInstagram').value.trim(),
        facebook_url: document.getElementById('settingFacebook').value.trim(),
        email: document.getElementById('settingEmail').value.trim(),
        phone: document.getElementById('settingPhone').value.trim(),
        timings: document.getElementById('settingTimings').value.trim(),
        delivery_note: document.getElementById('settingDelivery').value.trim(),
        default_delivery_fee: Number(document.getElementById('settingDefaultDeliveryFee')?.value) || 250,
        free_delivery_threshold: Number(document.getElementById('settingFreeDeliveryThreshold')?.value) || 10000,
        footer_bio: document.getElementById('settingFooterBio').value.trim()
      };

      // Save EmailJS & Customer Notification settings
      const serviceId = document.getElementById('settingEmailJsServiceId')?.value || '';
      const templateId = document.getElementById('settingEmailJsTemplateId')?.value || '';
      const publicKey = document.getElementById('settingEmailJsPublicKey')?.value || '';
      if (window.OrderNotification) {
        window.OrderNotification.saveEmailJsConfig(serviceId, templateId, publicKey);
      }
      const autoPromptCheck = document.getElementById('settingAutoPromptWa')?.checked ? 'true' : 'false';
      const autoSendEmailCheck = document.getElementById('settingAutoSendEmail')?.checked ? 'true' : 'false';
      localStorage.setItem('ibn_setting_auto_prompt_wa', autoPromptCheck);
      localStorage.setItem('ibn_setting_auto_send_email', autoSendEmailCheck);

      try {
        await window.ADMIN_API.saveWebsiteSettings(payload);
        showToast('Website settings updated successfully!', 'success');
      } catch (err) {
        showToast('Error saving settings: ' + err.message, 'error');
      }
    });
  }

  // --- GLOBAL EXPOSED ACTIONS ---
  window.ADMIN_UI = {
    showToast,
    switchTab,

    // Product actions
    editProduct: async (id) => {
      try {
        const p = await window.ADMIN_API.getProductById(id);
        if (!p) return;

        currentEditingProductId = p.id;
        populateCategoryDropdown(p.category_id);

        document.getElementById('modalProductId').value = p.id;
        document.getElementById('modalProductName').value = p.name;
        document.getElementById('modalProductCategory').value = p.category_id;
        document.getElementById('modalProductPrice').value = p.price;
        document.getElementById('modalProductSalePrice').value = p.sale_price || '';
        document.getElementById('modalProductBadge').value = p.badge || '';
        document.getElementById('modalProductImageUrl').value = p.image_url;
        document.getElementById('imagePreviewThumb').src = formatAdminImageUrl(p.image_url);
        document.getElementById('modalProductDesc').value = p.short_desc;
        document.getElementById('modalProductStock').value = p.stock_status || 'in_stock';
        document.getElementById('modalProductFeatured').checked = p.featured;
        document.getElementById('modalProductActive').checked = p.is_active;
        document.getElementById('modalProductSortOrder').value = p.sort_order || 0;

        // Render specs
        specsContainer.innerHTML = '';
        if (Array.isArray(p.specs) && p.specs.length > 0) {
          p.specs.forEach(s => addSpecField(s));
        } else {
          addSpecField();
        }

        openProductModal(true);
      } catch (err) {
        showToast('Error loading product details: ' + err.message, 'error');
      }
    },

    deleteProduct: async (id) => {
      if (confirm(`Are you sure you want to delete product "${id}"? This cannot be undone.`)) {
        try {
          await window.ADMIN_API.deleteProduct(id);
          showToast(`Product ${id} deleted successfully.`, 'success');
          loadProductsTable();
          loadDashboard();
        } catch (err) {
          showToast('Failed to delete product: ' + err.message, 'error');
        }
      }
    },

    toggleProductActive: async (id, isActive) => {
      try {
        await window.ADMIN_API.toggleProductActive(id, isActive);
        showToast(`Product ${id} is now ${isActive ? 'Active' : 'Inactive'}.`, 'success');
      } catch (err) {
        showToast('Failed to update status: ' + err.message, 'error');
      }
    },

    // Hero Slide actions
    editHeroSlide: async (id) => {
      const slide = allHeroSlides.find(s => s.id === id);
      if (!slide) return;

      currentEditingSlideId = slide.id;
      document.getElementById('modalSlideCategory').value = slide.category_title;
      document.getElementById('modalSlideBadge').value = slide.badge_text || '';
      document.getElementById('modalSlideTitle').value = slide.title;
      document.getElementById('modalSlideHighlight').value = slide.title_highlight || '';
      document.getElementById('modalSlideDesc').value = slide.description;
      document.getElementById('modalSlideBtnText').value = slide.primary_btn_text;
      document.getElementById('modalSlideBtnUrl').value = slide.primary_btn_url;
      document.getElementById('modalSlideTargetCat').value = slide.target_category || '';
      document.getElementById('modalSlideBgUrl').value = slide.bg_image_url;
      document.getElementById('heroSlideThumbPreview').src = formatAdminImageUrl(slide.bg_image_url);
      document.getElementById('modalSlideOrder').value = slide.sort_order;
      document.getElementById('modalSlideIndex').value = slide.slide_index;
      document.getElementById('modalSlideActive').checked = slide.is_active;

      openHeroSlideModal(true);
    },

    deleteHeroSlide: async (id) => {
      if (confirm('Are you sure you want to delete this hero slide?')) {
        try {
          await window.ADMIN_API.deleteHeroSlide(id);
          showToast('Hero slide deleted successfully.', 'success');
          loadHeroSlidesGrid();
        } catch (err) {
          showToast('Failed to delete slide: ' + err.message, 'error');
        }
      }
    },

    toggleSlideActive: async (id, isActive) => {
      try {
        await window.ADMIN_API.toggleHeroSlideActive(id, isActive);
        showToast(`Hero slide is now ${isActive ? 'Active' : 'Disabled'}.`, 'success');
      } catch (err) {
        showToast('Failed to update slide status: ' + err.message, 'error');
      }
    },

    editCategory: (id) => {
      const cat = allCategories.find(c => c.id === id);
      if (!cat) return;

      currentEditingCategoryId = cat.id;
      if (modalCategoryIdInput) {
        modalCategoryIdInput.value = cat.id;
        modalCategoryIdInput.readOnly = true;
      }
      if (modalCategoryNameInput) modalCategoryNameInput.value = cat.name;

      const deptSelect = document.getElementById('modalCategoryDept');
      if (deptSelect) {
        const matchVal = `${cat.dept_id}|${cat.dept_name}`;
        let optionExists = Array.from(deptSelect.options).some(o => o.value === matchVal);
        if (!optionExists && cat.dept_id) {
          const newOpt = document.createElement('option');
          newOpt.value = matchVal;
          newOpt.textContent = `${cat.dept_name || cat.dept_id}`;
          deptSelect.appendChild(newOpt);
        }
        deptSelect.value = matchVal;
      }

      const badgeInput = document.getElementById('modalCategoryBadge');
      if (badgeInput) badgeInput.value = cat.badge || '';

      const taglineInput = document.getElementById('modalCategoryTagline');
      if (taglineInput) taglineInput.value = cat.tagline || '';

      if (categoryImageUrlInput) categoryImageUrlInput.value = cat.image_url || '';
      if (categoryImagePreviewThumb) categoryImagePreviewThumb.src = formatAdminImageUrl(cat.image_url);

      const filterCatInput = document.getElementById('modalCategoryFilterCat');
      if (filterCatInput) filterCatInput.value = cat.filter_category || cat.id;

      const filterQueryInput = document.getElementById('modalCategoryFilterQuery');
      if (filterQueryInput) filterQueryInput.value = cat.filter_query || '';

      const sortOrderInput = document.getElementById('modalCategorySortOrder');
      if (sortOrderInput) sortOrderInput.value = cat.sort_order ?? 0;

      const primaryCheck = document.getElementById('modalCategoryPrimary');
      if (primaryCheck) primaryCheck.checked = Boolean(cat.is_primary);

      const activeCheck = document.getElementById('modalCategoryActive');
      if (activeCheck) activeCheck.checked = Boolean(cat.is_active);

      openCategoryModal(true);
    },

    deleteCategory: async (id) => {
      const cat = allCategories.find(c => c.id === id);
      const name = cat ? cat.name : id;
      if (confirm(`Are you sure you want to delete category "${name}" (${id})? This cannot be undone.`)) {
        try {
          await window.ADMIN_API.deleteCategory(id);
          showToast(`Category "${name}" deleted successfully.`, 'success');
          await loadCategoriesTable();
          populateCategoryDropdown();
          populateProductCategoryFilter();
          loadDashboard();
        } catch (err) {
          showToast('Failed to delete category: ' + err.message, 'error');
        }
      }
    },

    toggleCategoryActive: async (id, isActive) => {
      try {
        const cat = allCategories.find(c => c.id === id);
        if (cat) {
          cat.is_active = isActive;
          await window.ADMIN_API.saveCategory(cat, true);
          showToast(`Category "${cat.name}" is now ${isActive ? 'Active' : 'Inactive'}.`, 'success');
        }
      } catch (err) {
        showToast('Failed to update category: ' + err.message, 'error');
      }
    },

    toggleSection: async (id, isVisible) => {
      try {
        await window.ADMIN_API.toggleSectionVisibility(id, isVisible);
        showToast(`Section "${id}" is now ${isVisible ? 'Visible' : 'Hidden'}.`, 'success');
      } catch (err) {
        showToast('Failed to update section: ' + err.message, 'error');
      }
    },

    // Order actions
    viewOrder: (id) => {
      openOrderDetailModal(id);
    },

    notifyCustomer: async (id, template = 'confirmed') => {
      try {
        const order = await window.ADMIN_API.getOrderById(id);
        if (order) {
          openNotifyModal(order, template);
        } else {
          showToast(`Order #${id} not found.`, 'error');
        }
      } catch (err) {
        showToast(`Error opening notification: ${err.message}`, 'error');
      }
    },

    loadOrdersTable: () => {
      return loadOrdersTable();
    }
  };

  // Initial load
  function initAdminApp() {
    const urlParams = new URLSearchParams(window.location.search);
    let hash = window.location.hash.replace('#', '').trim();
    let hashParams = new URLSearchParams(hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : (hash.includes('&') ? hash : ''));
    if (hash.includes('?')) hash = hash.substring(0, hash.indexOf('?'));
    if (hash.includes('&')) hash = hash.substring(0, hash.indexOf('&'));

    const tabParam = urlParams.get('tab') || hashParams.get('tab');
    const validTabs = ['dashboard', 'products', 'categories', 'orders', 'hero', 'homepage', 'settings'];
    const targetTab = (tabParam && validTabs.includes(tabParam)) ? tabParam : ((hash && validTabs.includes(hash)) ? hash : 'dashboard');
    switchTab(targetTab);

    // Auto-open product edit modal if ?edit=SKU is in URL or hash
    const autoEditId = urlParams.get('edit') || hashParams.get('edit');
    if (autoEditId) {
      setTimeout(() => {
        if (window.ADMIN_UI && typeof window.ADMIN_UI.editProduct === 'function') {
          window.ADMIN_UI.editProduct(autoEditId);
        }
      }, 400);
    }

    // Auto-open category edit modal if ?editCategory=ID is in URL or hash
    const autoEditCatId = urlParams.get('editCategory') || hashParams.get('editCategory');
    if (autoEditCatId) {
      setTimeout(() => {
        if (window.ADMIN_UI && typeof window.ADMIN_UI.editCategory === 'function') {
          window.ADMIN_UI.editCategory(autoEditCatId);
        }
      }, 400);
    }

    // Auto-open order detail modal if ?order=ORDER_ID is in URL or hash
    const autoOrderId = urlParams.get('order') || hashParams.get('order');
    if (autoOrderId) {
      setTimeout(() => {
        if (window.ADMIN_UI && typeof window.ADMIN_UI.viewOrder === 'function') {
          window.ADMIN_UI.viewOrder(autoOrderId);
        }
      }, 450);
    }

    // Auto-open order notification modal if ?notify=ORDER_ID or ?open_notify=ORDER_ID is in URL or hash
    const autoNotifyId = urlParams.get('notify') || urlParams.get('open_notify') || hashParams.get('notify');
    if (autoNotifyId) {
      setTimeout(() => {
        if (window.ADMIN_UI && typeof window.ADMIN_UI.notifyCustomer === 'function') {
          window.ADMIN_UI.notifyCustomer(autoNotifyId, 'confirmed');
        }
      }, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminApp);
  } else {
    initAdminApp();
  }

})();
