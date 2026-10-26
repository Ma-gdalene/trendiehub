import { createClient } from '@supabase/supabase-js';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://hapjyuomrpakftoljlcf.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GESWlsaY7eXe-heM1lDMiA_z5jtk7iY';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

if (import.meta.env.VITE_API_BASE_URL) setBaseUrl(import.meta.env.VITE_API_BASE_URL);
setAuthTokenGetter(async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});
