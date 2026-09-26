/**
 * Ibn e Naimat Collection - Environment Configuration Template
 * 
 * INSTRUCTIONS:
 * 1. Duplicate this file and rename it to 'config.env.js'.
 * 2. Fill in your Supabase Project URL and public 'anon' Key.
 * 3. Never put your secret 'service_role' key here! Only the public 'anon' key is safe for client applications.
 * 4. This template file can be safely committed to GitHub.
 */

window.SUPABASE_ENV = {
  // Your Supabase Project URL (e.g. "https://xyzcompany.supabase.co")
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",

  // Your Supabase Public Anonymous API Key (Project Settings -> API -> anon public)
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",

  // Storage bucket name for product and hero images
  STORAGE_BUCKET: "catalog-images"
};
