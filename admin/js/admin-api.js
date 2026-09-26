/**
 * Ibn e Naimat Collection - Admin Data API
 * Handles database CRUD operations and Supabase Storage image uploads
 */

(function () {
  'use strict';

  function getClient() {
    return window.ADMIN_AUTH ? window.ADMIN_AUTH.getClient() : null;
  }

  // --- STORAGE / IMAGE UPLOADS ---
  async function uploadImage(file, folder = 'products') {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const bucket = window.SUPABASE_ENV?.STORAGE_BUCKET || 'catalog-images';
    const fileExt = file.name.split('.').pop();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const filePath = `${folder}/${Date.now()}_${cleanName}`;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // --- PRODUCTS CRUD ---
  async function getProducts() {
    const client = getClient();
    if (!client) {
      if (window.PRODUCTS) {
        return window.PRODUCTS.map((p, idx) => ({
          ...p,
          category_id: p.category,
          category_name: p.categoryName,
          is_active: true,
          stock_status: 'in_stock',
          image_url: p.image.startsWith('http') || p.image.startsWith('../') ? p.image : `../${p.image}`,
          sort_order: idx + 1
        }));
      }
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async function getProductById(id) {
    const client = getClient();
    if (!client) {
      if (window.PRODUCTS) {
        const found = window.PRODUCTS.find(p => p.id === id);
        if (found) {
          return {
            ...found,
            category_id: found.category,
            category_name: found.categoryName,
            is_active: true,
            stock_status: 'in_stock',
            image_url: found.image.startsWith('http') || found.image.startsWith('../') ? found.image : `../${found.image}`,
            sort_order: 1
          };
        }
      }
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async function saveProduct(product, isEdit = false) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const payload = {
      id: product.id.trim(),
      name: product.name.trim(),
      category_id: product.category_id,
      category_name: product.category_name,
      price: parseFloat(product.price),
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      badge: product.badge || null,
      image_url: product.image_url,
      secondary_images: product.secondary_images || [],
      short_desc: product.short_desc,
      specs: product.specs || [],
      featured: Boolean(product.featured),
      is_active: Boolean(product.is_active),
      stock_status: product.stock_status || 'in_stock',
      sort_order: parseInt(product.sort_order, 10) || 0,
      updated_at: new Date().toISOString()
    };

    if (isEdit) {
      const { data, error } = await client
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      payload.created_at = new Date().toISOString();
      const { data, error } = await client
        .from('products')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  async function deleteProduct(id) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async function toggleProductActive(id, isActive) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
      .from('products')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // --- CATEGORIES CRUD ---
  async function getCategories() {
    const client = getClient();
    if (!client) {
      if (window.CATEGORIES) {
        return window.CATEGORIES.filter(c => c.id !== 'all').map((c, idx) => ({
          ...c,
          dept_id: c.deptId || c.id,
          dept_name: c.deptName || c.name,
          image_url: c.image ? (c.image.startsWith('http') || c.image.startsWith('../') ? c.image : `../${c.image}`) : '',
          is_active: true,
          sort_order: idx + 1
        }));
      }
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function saveCategory(category, isEdit = false) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const payload = {
      id: category.id.trim().toLowerCase(),
      name: category.name.trim(),
      dept_id: category.dept_id || 'all',
      dept_name: category.dept_name || 'All Collections',
      tagline: category.tagline || '',
      badge: category.badge || '',
      image_url: category.image_url || '',
      is_primary: Boolean(category.is_primary),
      filter_category: category.filter_category || category.id,
      filter_query: category.filter_query || '',
      sort_order: parseInt(category.sort_order, 10) || 0,
      is_active: Boolean(category.is_active),
      updated_at: new Date().toISOString()
    };

    if (isEdit) {
      const { data, error } = await client
        .from('categories')
        .update(payload)
        .eq('id', category.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      payload.created_at = new Date().toISOString();
      const { data, error } = await client
        .from('categories')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  async function deleteCategory(id) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // --- HERO SLIDER CRUD ---
  async function getHeroSlides() {
    const client = getClient();
    if (!client) {
      return [
        {
          id: 'slide-1',
          slide_index: 0,
          sort_order: 1,
          category_title: 'WATCHES',
          badge_text: 'Curated Collection • Haute Horlogerie',
          title: 'Premium Watches for Every Moment.',
          title_highlight: 'Every Moment',
          description: 'Original watches. Modern style. Refined quality. Discover timepieces selected for your everyday moments.',
          primary_btn_text: 'Explore Watches',
          primary_btn_url: 'shop.html?category=watches',
          target_category: 'watches',
          secondary_btn_text: 'Order on WhatsApp',
          secondary_btn_url: 'https://wa.me/923302241340',
          bg_image_url: '../assets/images/hero/hero-watches.jpg',
          is_active: true
        },
        {
          id: 'slide-2',
          slide_index: 1,
          sort_order: 2,
          category_title: 'HONEY NUTS',
          badge_text: '100% Pure • Gourmet Wellness',
          title: 'Nature’s Finest, Naturally Sweet.',
          title_highlight: 'Naturally Sweet',
          description: 'Pure honey blended with carefully selected nuts, dried fruits and seeds for a delicious premium experience.',
          primary_btn_text: 'Explore Honey Nuts',
          primary_btn_url: '#honey-nuts-section',
          target_category: 'honey-nuts',
          secondary_btn_text: 'Order on WhatsApp',
          secondary_btn_url: 'https://wa.me/923302241340',
          bg_image_url: '../assets/images/hero/hero-honey-nuts.jpg',
          is_active: true
        },
        {
          id: 'slide-3',
          slide_index: 2,
          sort_order: 3,
          category_title: 'GADGETS',
          badge_text: 'Smart Tech • Everyday Essentials',
          title: 'Smart Gadgets. Modern Lifestyle.',
          title_highlight: 'Modern Lifestyle',
          description: 'Useful, stylish and carefully selected gadgets designed for modern everyday life.',
          primary_btn_text: 'Explore Gadgets',
          primary_btn_url: 'shop.html?category=gadgets',
          target_category: 'gadgets',
          secondary_btn_text: 'Order on WhatsApp',
          secondary_btn_url: 'https://wa.me/923302241340',
          bg_image_url: '../assets/images/hero/hero-gadgets.jpg',
          is_active: true
        },
        {
          id: 'slide-4',
          slide_index: 3,
          sort_order: 4,
          category_title: 'GIFT ITEMS',
          badge_text: 'Executive Suites • Bespoke Packaging',
          title: 'Gifts Made to Be Remembered.',
          title_highlight: 'Remembered',
          description: 'Thoughtful and elegant gift items for special moments and meaningful occasions.',
          primary_btn_text: 'Explore Gifts',
          primary_btn_url: '#promotions',
          target_category: 'gifts',
          secondary_btn_text: 'Order on WhatsApp',
          secondary_btn_url: 'https://wa.me/923302241340',
          bg_image_url: '../assets/images/hero/hero-gifts.jpg',
          is_active: true
        }
      ];
    }

    const { data, error } = await client
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function saveHeroSlide(slide, isEdit = false) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const payload = {
      slide_index: parseInt(slide.slide_index, 10) || 0,
      category_title: (slide.category_title || 'COLLECTION').toUpperCase(),
      badge_text: slide.badge_text || '',
      title: slide.title,
      title_highlight: slide.title_highlight || '',
      description: slide.description,
      primary_btn_text: slide.primary_btn_text || 'Explore Collection',
      primary_btn_url: slide.primary_btn_url || 'shop.html',
      target_category: slide.target_category || '',
      secondary_btn_text: slide.secondary_btn_text || 'Order on WhatsApp',
      secondary_btn_url: slide.secondary_btn_url || 'https://wa.me/923302241340',
      bg_image_url: slide.bg_image_url,
      is_active: Boolean(slide.is_active),
      sort_order: parseInt(slide.sort_order, 10) || 0,
      updated_at: new Date().toISOString()
    };

    if (isEdit && slide.id) {
      const { data, error } = await client
        .from('hero_slides')
        .update(payload)
        .eq('id', slide.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      payload.created_at = new Date().toISOString();
      const { data, error } = await client
        .from('hero_slides')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  async function deleteHeroSlide(id) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async function toggleHeroSlideActive(id, isActive) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
      .from('hero_slides')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // --- WEBSITE SETTINGS ---
  async function getWebsiteSettings() {
    const client = getClient();
    if (!client) {
      return {
        store_name: 'Ibn e Naimat Collection',
        tagline: 'Original Branded Watches, Pure Honey Nuts, Gadgets & Luxury Gifts',
        whatsapp_number: '03302241340',
        whatsapp_international: '923302241340',
        whatsapp_display: '+92 330 2241340',
        announcement_bar: 'Nationwide Insured Delivery Across Pakistan • Official WhatsApp Concierge (0330 2241340)',
        logo_url: '../assets/images/official-logo.png',
        favicon_url: '../assets/images/official-logo.png',
        instagram_url: 'https://instagram.com/ibnenaimatcollection',
        facebook_url: 'https://facebook.com/ibnenaimatcollection',
        email: 'contact@ibnenaimat.com',
        phone: '03302241340',
        timings: 'Monday – Sunday: 10:00 AM – 11:00 PM PKT',
        delivery_note: 'Nationwide Insured Delivery Across Pakistan',
        footer_bio: 'Curators of original branded timepieces, pure wildflower honey nuts, Islamic calligraphy, and refined accessories with uncompromising authenticity and personal service across Pakistan.'
      };
    }

    const { data, error } = await client
      .from('website_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;
    return data;
  }

  async function saveWebsiteSettings(settings) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const payload = {
      store_name: settings.store_name,
      tagline: settings.tagline,
      whatsapp_number: settings.whatsapp_number,
      whatsapp_international: settings.whatsapp_international,
      whatsapp_display: settings.whatsapp_display,
      announcement_bar: settings.announcement_bar,
      logo_url: settings.logo_url,
      favicon_url: settings.favicon_url,
      instagram_url: settings.instagram_url,
      facebook_url: settings.facebook_url,
      email: settings.email,
      phone: settings.phone,
      timings: settings.timings,
      delivery_note: settings.delivery_note,
      footer_bio: settings.footer_bio,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from('website_settings')
      .upsert({ id: 1, ...payload })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // --- HOMEPAGE SECTIONS ---
  async function getHomepageSections() {
    const client = getClient();
    if (!client) {
      return [
        { id: 'hero_slider', section_name: 'Hero Carousel Slider', is_visible: true, sort_order: 1, headline: 'Curated Luxury Showcase' },
        { id: 'circular_categories', section_name: 'Circular Category Showcase', is_visible: true, sort_order: 2, headline: 'Explore by Category' },
        { id: 'honey_nuts_spotlight', section_name: 'Dedicated Honey Nuts Feature', is_visible: true, sort_order: 3, headline: 'Premium Honey Nuts' },
        { id: 'promotional_banner', section_name: 'Executive Gifts Banner', is_visible: true, sort_order: 4, headline: 'Prestige Gifting & Bespoke Sets' },
        { id: 'about_story', section_name: 'About Story & Philosophy', is_visible: true, sort_order: 5, headline: 'Our Philosophy' },
        { id: 'service_trust', section_name: 'Service Commitments', is_visible: true, sort_order: 6, headline: 'Built on Trust & Quality' },
        { id: 'concierge_cta', section_name: 'Concierge Support Banner', is_visible: true, sort_order: 7, headline: 'Ready to Place Your Order or Inquire?' }
      ];
    }

    const { data, error } = await client
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function toggleSectionVisibility(id, isVisible) {
    const client = getClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
      .from('homepage_sections')
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Export
  window.ADMIN_API = {
    uploadImage,
    getProducts,
    getProductById,
    saveProduct,
    deleteProduct,
    toggleProductActive,
    getCategories,
    saveCategory,
    deleteCategory,
    getHeroSlides,
    saveHeroSlide,
    deleteHeroSlide,
    toggleHeroSlideActive,
    getWebsiteSettings,
    saveWebsiteSettings,
    getHomepageSections,
    toggleSectionVisibility
  };

})();
