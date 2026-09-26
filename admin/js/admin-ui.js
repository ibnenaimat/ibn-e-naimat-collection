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
  let activeTab = 'dashboard';
  let currentEditingProductId = null;
  let currentEditingSlideId = null;
  let currentEditingCategoryId = null;

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
    toast.innerHTML = `
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}" 
         style="color: ${type === 'success' ? 'var(--success)' : 'var(--danger)'}; font-size: 1.1rem;"></i>
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

      // Update Sidebar Badges
      const prodBadge = document.getElementById('badgeProductCount');
      if (prodBadge) prodBadge.textContent = totalProds;

      const slideBadge = document.getElementById('badgeSlideCount');
      if (slideBadge) slideBadge.textContent = activeSlides;

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
        footer_bio: document.getElementById('settingFooterBio').value.trim()
      };

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
    const validTabs = ['dashboard', 'products', 'categories', 'hero', 'homepage', 'settings'];
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminApp);
  } else {
    initAdminApp();
  }

})();
