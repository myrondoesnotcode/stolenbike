/* Site configuration.
 *
 * The Supabase values are safe to publish — the anon key is designed to sit in
 * a web page, and the database's row-level security is what actually guards the
 * data. Setup instructions and the SQL are in supabase/setup.sql.
 *
 * Leave them empty and the site runs as a read-only preview of demo data.
 */
window.BIKEMAP_CONFIG = {
  supabaseUrl: 'https://orvtqujeufmofkkbinvt.supabase.co',
  supabaseAnonKey: 'sb_publishable_Zx-qKq8eDP9cVfoAMp-ptA_ij6ECcvq',

  // Shown in both footers. Leave authorUrl empty for plain text, no link.
  authorName: 'Myron Shneider',
  authorUrl: 'https://www.linkedin.com/in/mshneider/',
};
