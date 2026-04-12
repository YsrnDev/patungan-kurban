const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
  '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

export interface SupabasePublicEnvStatus {
  isConfigured: boolean;
  missing: Array<'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'>;
  message: string | null;
}

function formatMissingEnvMessage(names: string[]): string {
  return `Missing required Supabase environment variable${names.length > 1 ? 's' : ''}: ${names.join(', ')}`;
}

function getRequiredEnv(value: string, name: string): string {
  if (!value) {
    throw new Error(formatMissingEnvMessage([name]));
  }

  return value;
}

export function getSupabasePublicEnvStatus(): SupabasePublicEnvStatus {
  const missing: SupabasePublicEnvStatus['missing'] = [];

  if (!SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return {
    isConfigured: missing.length === 0,
    missing,
    message: missing.length > 0 ? formatMissingEnvMessage(missing) : null,
  };
}

export function getSupabaseUrl(): string {
  return getRequiredEnv(SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabasePublishableKey(): string {
  return getRequiredEnv(SUPABASE_PUBLISHABLE_KEY, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
}

export function getSupabaseServiceRoleKey(): string {
  return getRequiredEnv(SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
}
