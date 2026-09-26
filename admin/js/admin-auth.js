/**
 * Ibn e Naimat Collection - Admin Authentication Guard
 * Enforces secure session checking, automatic refresh, and role authorization
 */

(function () {
  'use strict';

  let supabaseClient = null;
  let currentSession = null;
  let currentUser = null;

  async function initAuth() {
    const env = window.SUPABASE_ENV || {};
    const url = (env.SUPABASE_URL || '').trim();
    const key = (env.SUPABASE_ANON_KEY || '').trim();

    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true' || window.location.hash.includes('preview') || sessionStorage.getItem('admin_preview_mode') === 'true';

    // If credentials are completely unconfigured, redirect to login unless in preview mode
    if (!url || !key || url === 'YOUR_SUPABASE_PROJECT_URL') {
      if (!isPreview) {
        window.location.replace('login.html');
        return;
      } else {
        // Preview mode active
        const userEmailEl = document.getElementById('adminUserEmail');
        if (userEmailEl) userEmailEl.textContent = 'Preview Mode (Local)';
        return;
      }
    }

    if (typeof window.supabase === 'undefined') {
      console.error('[AdminAuth] Supabase SDK not loaded.');
      return;
    }

    supabaseClient = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error || !session) {
        if (!isPreview) {
          // Not authenticated -> redirect to login
          window.location.replace('login.html');
          return;
        } else {
          const userEmailEl = document.getElementById('adminUserEmail');
          if (userEmailEl) userEmailEl.textContent = 'Preview Mode (Local)';
          return;
        }
      }

      currentSession = session;
      currentUser = session.user;

      // Update UI with user info
      const userEmailEl = document.getElementById('adminUserEmail');
      const userAvatarEl = document.getElementById('adminUserAvatar');

      if (userEmailEl && currentUser) {
        userEmailEl.textContent = currentUser.email || 'Administrator';
        userEmailEl.title = currentUser.email || '';
      }

      if (userAvatarEl && currentUser && currentUser.email) {
        userAvatarEl.textContent = currentUser.email.charAt(0).toUpperCase();
      }

      // Listen for session termination
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          window.location.replace('login.html');
        } else if (session) {
          currentSession = session;
          currentUser = session.user;
        }
      });

      // Attach logout listener
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (confirm('Are you sure you want to log out of the Admin Console?')) {
            await supabaseClient.auth.signOut();
            window.location.replace('login.html');
          }
        });
      }

    } catch (err) {
      console.error('[AdminAuth] Auth guard exception:', err);
      window.location.replace('login.html');
    }
  }

  // Export
  window.ADMIN_AUTH = {
    init: initAuth,
    getClient: () => supabaseClient,
    getSession: () => currentSession,
    getUser: () => currentUser
  };

  // Start auth check immediately
  document.addEventListener('DOMContentLoaded', initAuth);

})();
