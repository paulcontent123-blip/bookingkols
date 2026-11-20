import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, hasSupabase, useFakeDb } from '../config';
import { fakeClient } from './fake';

let client: SupabaseClient | null = null;

/** Mọi chức năng đều đọc/ghi database Supabase. (Chỉ khi chạy kiểm thử cục bộ mới có database giả trong bộ nhớ.) */
export function getSupabase(): SupabaseClient {
  if (useFakeDb) return fakeClient as unknown as SupabaseClient;
  if (!hasSupabase) {
    throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env.');
  }
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return client;
}
