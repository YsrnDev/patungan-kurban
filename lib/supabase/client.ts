'use client';

import { createBrowserClient } from '@supabase/ssr';

import {
  getSupabasePublicEnvStatus,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  const envStatus = getSupabasePublicEnvStatus();

  if (!envStatus.isConfigured) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
  }

  return browserClient;
}
