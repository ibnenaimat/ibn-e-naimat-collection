/**
 * Ibn e Naimat Collection - Universal Supabase Data Client
 * 
 * Provides live database access for products, categories, hero slides, and settings
 * with zero-breakage automatic fallback to embedded static data.
 */

(function () {
  'use strict';

  let supabaseInstance = null;
  let isConfigured = false;

  // Initialize Supabase client if credentials are present
  function initClient() {
    const env = window.SUPABASE_ENV || {};
    const url = (env.SUPABASE_URL || '').trim();
    const key = (env.SUPABASE_ANON_KEY || '').trim();

    if (url && key && url !== 'YOUR_SUPABASE_PROJECT_URL' && key !== 'YOUR_SUPABASE_ANON_KEY') {
      if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        try {
          supabaseInstance = window.supabase.createClient(url, key, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          });
          isConfigured = true;
        } catch (err) {
          console.warn('[StoreClient] Error initializing Supabase client:', err);
          isConfigured = false;
        }
      }
    }
  }

  // --- 1. FETCH WEBSITE SETTINGS ---
  async function fetchWebsiteSettings() {
    if (isConfigured && supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('website_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (!error && data) {
          return { data, isLive: true };
        }
      } catch (err) {
        console.warn('[StoreClient] Falling back to local settings:', err);
      }
    }

    // Static fallback
    return {
      data: {
        store_name: window.CONFIG?.storeName || 'Ibn e Naimat Collection',
        tagline: window.CONFIG?.tagline || '',
        whatsapp_number: window.CONFIG?.whatsapp?.number || '03302241340',
        whatsapp_international: window.CONFIG?.whatsapp?.international || '923302241340',
        whatsapp_display: window.CONFIG?.whatsapp?.displayNumber || '+92 330 2241340',
        announcement_bar: 'Nationwide Insured Delivery Across Pakistan • Official WhatsApp Concierge (0330 2241340)',
        logo_url: 'assets/images/official-logo.png'
      },
      isLive: false
    };
  }

  // --- 2. FETCH CATEGORIES ---
  async function fetchCategories() {
    if (isConfigured && supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          // Format to match products.js schema
          const formatted = [
            { id: 'all', name: 'All Collections', tagline: 'Explore our complete curated catalog', icon: 'bi-grid-fill' },
            ...data.map(c => ({
              id: c.id,
              name: c.name,
              tagline: c.tagline || '',
              badge: c.badge || '',
              image: c.image_url || '',
              description: c.tagline || '',
              deptId: c.dept_id,
              deptName: c.dept_name,
              isPrimary: c.is_primary,
              filterCategory: c.filter_category || c.id,
              filterQuery: c.filter_query || ''
            }))
          ];
          return { data: formatted, isLive: true };
        }
      } catch (err) {
        console.warn('[StoreClient] Falling back to local categories:', err);
      }
    }

    // Fallback to window.CATEGORIES
    return { data: window.CATEGORIES || [], isLive: false };
  }

  // --- 3. FETCH CIRCULAR SHOWCASE CATEGORIES ---
  async function fetchShowcaseCategories() {
    if (isConfigured && supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .gte('sort_order', 10)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const formatted = data.map(c => ({
            id: c.id,
            name: c.name,
            deptId: c.dept_id,
            deptName: c.dept_name,
            image: c.image_url || '',
            isPrimary: c.is_primary,
            badge: c.badge || '',
            filterCategory: c.filter_category || 'watches',
            filterQuery: c.filter_query || ''
          }));
          return { data: formatted, isLive: true };
        }
      } catch (err) {
        console.warn('[StoreClient] Falling back to local showcase categories:', err);
      }
    }

    // Fallback to window.SHOWCASE_CATEGORIES
    return { data: window.SHOWCASE_CATEGORIES || [], isLive: false };
  }

  // --- 4. FETCH PRODUCTS ---
  async function fetchProducts() {
    if (isConfigured && supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const formatted = data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category_id,
            categoryName: p.category_name,
            price: Number(p.price),
            salePrice: p.sale_price ? Number(p.sale_price) : null,
            badge: p.badge || '',
            image: p.image_url,
            secondaryImages: Array.isArray(p.secondary_images) ? p.secondary_images : [],
            shortDesc: p.short_desc,
            specs: Array.isArray(p.specs) ? p.specs : [],
            featured: Boolean(p.featured),
            stockStatus: p.stock_status || 'in_stock'
          }));
          return { data: formatted, isLive: true };
        }
      } catch (err) {
        console.warn('[StoreClient] Falling back to local products:', err);
      }
    }

    // Fallback to window.PRODUCTS
    return { data: window.PRODUCTS || [], isLive: false };
  }

  // --- 5. FETCH HERO SLIDES ---
  async function fetchHeroSlides() {
    if (isConfigured && supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const formatted = data.map((s, idx) => ({
            id: s.id,
            slideIndex: idx,
            categoryTitle: s.category_title,
            badgeText: s.badge_text,
            title: s.title,
            titleHighlight: s.title_highlight,
            description: s.description,
            primaryBtnText: s.primary_btn_text || 'Explore Collection',
            primaryBtnUrl: s.primary_btn_url || 'shop.html',
            targetCategory: s.target_category || '',
            secondaryBtnText: s.secondary_btn_text || 'Order on WhatsApp',
            secondaryBtnUrl: s.secondary_btn_url || 'https://wa.me/923302241340',
            bgImageUrl: s.bg_image_url
          }));
          return { data: formatted, isLive: true };
        }
      } catch (err) {
        console.warn('[StoreClient] Falling back to default hero slides:', err);
      }
    }

    return { data: null, isLive: false };
  }

  // --- 6. FETCH HOMEPAGE SECTIONS ---
  async function fetchHomepageSections() {
    if (isConfigured && supabaseInstance) {
      try {
        const { data, error } = await supabaseInstance
          .from('homepage_sections')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data) {
          const map = {};
          data.forEach(s => {
            map[s.id] = s;
          });
          return { data: map, isLive: true };
        }
      } catch (err) {
        console.warn('[StoreClient] Falling back to default section visibility:', err);
      }
    }

    return { data: {}, isLive: false };
  }

  // --- 7. ORDER ID GENERATOR ---
  function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get today's order count from local storage
    const allStored = getLocalOrders();
    const todayOrders = allStored.filter(o => o.order_id && o.order_id.includes(dateStr));
    let seq = todayOrders.length + 1;
    let candidateId = `INC-${dateStr}-${String(seq).padStart(4, '0')}`;

    // Ensure candidate is strictly unique
    while (allStored.some(o => o.order_id === candidateId)) {
      seq += 1;
      if (seq > 9999) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        candidateId = `INC-${dateStr}-${rand}`;
        break;
      }
      candidateId = `INC-${dateStr}-${String(seq).padStart(4, '0')}`;
    }

    return candidateId;
  }

  // Local Orders Store Helper
  function getLocalOrders() {
    try {
      const data = localStorage.getItem('ibn_collection_orders');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalOrder(order, items) {
    try {
      const orders = getLocalOrders();
      const existingIdx = orders.findIndex(o => o.order_id === order.order_id);
      const record = { ...order, items: items || [] };
      if (existingIdx > -1) {
        orders[existingIdx] = record;
      } else {
        orders.unshift(record); // newest first
      }
      localStorage.setItem('ibn_collection_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('[StoreClient] Error writing to local order cache:', e);
    }
  }

  // --- 8. CREATE ORDER ---
  async function createOrder(orderData, items) {
    const orderId = orderData.order_id || generateOrderId();
    const timestamp = new Date().toISOString();

    const orderRecord = {
      order_id: orderId,
      customer_name: (orderData.customer_name || '').trim(),
      phone: (orderData.phone || orderData.customer_phone || '').trim(),
      customer_phone: (orderData.phone || orderData.customer_phone || '').trim(),
      email: (orderData.email || orderData.customer_email || '').trim() || null,
      customer_email: (orderData.email || orderData.customer_email || '').trim() || null,
      address: (orderData.address || orderData.customer_address || '').trim(),
      customer_address: (orderData.address || orderData.customer_address || '').trim(),
      city: (orderData.city || orderData.customer_city || '').trim(),
      customer_city: (orderData.city || orderData.customer_city || '').trim(),
      notes: (orderData.notes || '').trim() || null,
      subtotal: Number(orderData.subtotal) || 0,
      delivery_fee: Number(orderData.delivery_fee) || 0,
      total: Number(orderData.total) || 0,
      status: 'Pending',
      payment_method: orderData.payment_method || 'cod',
      admin_notes: null,
      created_at: timestamp,
      updated_at: timestamp
    };

    const lineItems = (items || []).map(item => ({
      order_id: orderId,
      product_id: item.id || item.product_id,
      product_name: item.name || item.product_name,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.price || item.unit_price) || 0,
      price: Number(item.price || item.unit_price) || 0,
      subtotal: (Number(item.price || item.unit_price) || 0) * (Number(item.quantity) || 1),
      image_url: item.image || item.image_url || item.product_image || null,
      product_image: item.image || item.image_url || item.product_image || null,
      created_at: timestamp
    }));

    // Always cache locally first so user never loses order
    saveLocalOrder(orderRecord, lineItems);

    // Save to live Supabase if connected
    if (isConfigured && supabaseInstance) {
      try {
        const { data: insertedOrder, error: orderErr } = await supabaseInstance
          .from('orders')
          .insert([orderRecord])
          .select()
          .single();

        if (orderErr) {
          console.warn('[StoreClient] Error inserting into Supabase orders:', orderErr);
        } else {
          // Insert items
          const { error: itemsErr } = await supabaseInstance
            .from('order_items')
            .insert(lineItems);

          if (itemsErr) {
            console.warn('[StoreClient] Error inserting into Supabase order_items:', itemsErr);
          }
        }
      } catch (err) {
        console.warn('[StoreClient] Supabase order insertion exception:', err);
      }
    }

    return {
      success: true,
      orderId: orderId,
      order_id: orderId,
      order: orderRecord,
      items: lineItems
    };
  }

  // --- 9. TRACK ORDER (SECURE VERIFICATION: ORDER ID + PHONE) ---
  async function trackOrder(orderId, phone) {
    if (!orderId || !phone) {
      return { success: false, error: 'Please enter both your Order ID and Phone Number.' };
    }

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');
    const cleanOrderId = orderId.trim().toUpperCase();

    // 1. Try Supabase
    if (isConfigured && supabaseInstance) {
      try {
        // Query order by order_id
        const { data: orders, error } = await supabaseInstance
          .from('orders')
          .select('*')
          .ilike('order_id', cleanOrderId);

        if (!error && orders && orders.length > 0) {
          const match = orders.find(o => {
            const dbPhone = (o.phone || o.customer_phone || '').replace(/[^0-9]/g, '');
            return dbPhone === cleanInputPhone || 
                   dbPhone.endsWith(cleanInputPhone.slice(-10)) ||
                   cleanInputPhone.endsWith(dbPhone.slice(-10));
          });

          if (match) {
            // Fetch line items
            const { data: items } = await supabaseInstance
              .from('order_items')
              .select('*')
              .eq('order_id', match.order_id);

            return {
              success: true,
              order: match,
              items: items || []
            };
          }
        }
      } catch (err) {
        console.warn('[StoreClient] Supabase tracking lookup error:', err);
      }
    }

    // 2. Fallback to local storage cache
    const localOrders = getLocalOrders();
    const foundLocal = localOrders.find(o => {
      if ((o.order_id || '').toUpperCase() !== cleanOrderId) return false;
      const dbPhone = (o.phone || o.customer_phone || '').replace(/[^0-9]/g, '');
      return dbPhone === cleanInputPhone || 
             dbPhone.endsWith(cleanInputPhone.slice(-10)) ||
             cleanInputPhone.endsWith(dbPhone.slice(-10));
    });

    if (foundLocal) {
      return {
        success: true,
        order: foundLocal,
        items: foundLocal.items || []
      };
    }

    return {
      success: false,
      error: 'No order found matching this Order ID and Phone Number. Please verify your details or contact us on WhatsApp.'
    };
  }

  // --- 10. GET ALL ORDERS (FOR ADMIN / MANAGEMENT) ---
  async function getAllOrders(filters = {}) {
    let ordersList = [];

    if (isConfigured && supabaseInstance) {
      try {
        let query = supabaseInstance
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          ordersList = data.map(o => ({
            ...o,
            items: o.order_items || []
          }));
        }
      } catch (err) {
        console.warn('[StoreClient] Error fetching orders from Supabase:', err);
      }
    }

    // Merge with local orders so freshly placed local test orders appear seamlessly
    const localList = getLocalOrders();
    const map = new Map();
    ordersList.forEach(o => map.set(o.order_id, o));
    localList.forEach(o => {
      if (!map.has(o.order_id)) {
        map.set(o.order_id, o);
      }
    });

    let merged = Array.from(map.values());

    // Apply client filters if needed
    if (filters.status && filters.status !== 'all') {
      merged = merged.filter(o => o.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      merged = merged.filter(o => 
        (o.order_id || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q) ||
        (o.city || '').toLowerCase().includes(q)
      );
    }

    // Sort newest first
    merged.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return merged;
  }

  // --- 11. UPDATE ORDER STATUS ---
  async function updateOrderStatus(orderId, newStatus, adminNotes) {
    const timestamp = new Date().toISOString();
    const updatePayload = {
      status: newStatus,
      updated_at: timestamp
    };
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    // Update in local cache
    const localOrders = getLocalOrders();
    const idx = localOrders.findIndex(o => o.order_id === orderId);
    if (idx > -1) {
      localOrders[idx] = { ...localOrders[idx], ...updatePayload };
      localStorage.setItem('ibn_collection_orders', JSON.stringify(localOrders));
    }

    // Update in Supabase
    if (isConfigured && supabaseInstance) {
      try {
        const { error } = await supabaseInstance
          .from('orders')
          .update(updatePayload)
          .eq('order_id', orderId);

        if (error) console.warn('[StoreClient] Supabase status update error:', error);
      } catch (err) {
        console.warn('[StoreClient] Supabase status update exception:', err);
      }
    }

    return { success: true, orderId, status: newStatus };
  }

  // Self-init on load
  initClient();

  // Export universal client to window
  window.STORE_CLIENT = {
    isConfigured: () => isConfigured,
    getSupabase: () => supabaseInstance,
    fetchWebsiteSettings,
    fetchCategories,
    fetchShowcaseCategories,
    fetchProducts,
    fetchHeroSlides,
    fetchHomepageSections,
    // Order System Methods
    generateOrderId,
    createOrder,
    trackOrder,
    getAllOrders,
    updateOrderStatus,
    getLocalOrders
  };

})();
