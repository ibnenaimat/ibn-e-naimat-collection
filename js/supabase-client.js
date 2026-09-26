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
    fetchHomepageSections
  };

})();
