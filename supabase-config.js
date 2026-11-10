const BEAUTYBOOK_SUPABASE_URL =
    "https://utewurlabmgnmxpoosax.supabase.co";

const BEAUTYBOOK_SUPABASE_KEY =
    "sb_publishable_j5pXwOVMv3Sl2yXprjABUw__RNuqY9D";

window.beautybookSupabase = window.supabase.createClient(
    BEAUTYBOOK_SUPABASE_URL,
    BEAUTYBOOK_SUPABASE_KEY
);
