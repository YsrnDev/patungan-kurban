import { type User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { hasAdminAccess, hasDashboardAccess, hasOperationalAccess } from '@/lib/config/authz';
import { getSupabasePublicEnvStatus } from '@/lib/supabase/config';
import {
  getStaffUserByEmail,
  StaffUsersTableMissingError,
  type StaffUserRecord,
} from '@/lib/services/staff-user-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface CurrentAuthContext {
  user: User | null;
  staffUser: StaffUserRecord | null;
  authErrorReason: string | null;
}

export interface AuthorizedAuthContext {
  user: User;
  staffUser: StaffUserRecord;
}

export interface ApiAuthorizedAuthContext extends AuthorizedAuthContext {}

export async function getCurrentUser(): Promise<User | null> {
  if (!getSupabasePublicEnvStatus().isConfigured) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentAuthContext(): Promise<CurrentAuthContext> {
  if (!getSupabasePublicEnvStatus().isConfigured) {
    return {
      user: null,
      staffUser: null,
      authErrorReason: 'supabase_env_missing',
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      user,
      staffUser: null,
      authErrorReason: null,
    };
  }

  try {
    const staffUser = await getStaffUserByEmail(user.email, { supabase });

    return {
      user,
      staffUser,
      authErrorReason: null,
    };
  } catch (error) {
    if (error instanceof StaffUsersTableMissingError) {
      return {
        user,
        staffUser: null,
        authErrorReason: 'staff_table_missing',
      };
    }

    throw error;
  }
}

export async function canAccessDashboard(): Promise<boolean> {
  const { staffUser } = await getCurrentAuthContext();
  return hasDashboardAccess(staffUser);
}

function redirectForAuthError(nextPath: string, reason: string | null) {
  if (reason === 'supabase_env_missing') {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent('Konfigurasi Supabase publik belum lengkap.')}`);
  }

  if (reason === 'staff_table_missing') {
    redirect('/auth/error?reason=staff_table_missing');
  }

  redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
}

export async function requireDashboardUser(options?: { next?: string }): Promise<AuthorizedAuthContext> {
  const nextPath = options?.next ?? '/dashboard';
  const { user, staffUser, authErrorReason } = await getCurrentAuthContext();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (authErrorReason) {
    redirectForAuthError(nextPath, authErrorReason);
  }

  if (!staffUser || !hasDashboardAccess(staffUser)) {
    redirect('/auth/error?reason=unauthorized');
  }

  return {
    user,
    staffUser,
  };
}

export async function requireAdminUser(options?: { next?: string }): Promise<AuthorizedAuthContext> {
  const context = await requireDashboardUser(options);

  if (!hasAdminAccess(context.staffUser)) {
    redirect('/auth/error?reason=admin_required');
  }

  return {
    user: context.user,
    staffUser: context.staffUser,
  };
}

export async function requireOperationalUser(options?: { next?: string }): Promise<AuthorizedAuthContext> {
  const context = await requireDashboardUser(options);

  if (!hasOperationalAccess(context.staffUser)) {
    redirect('/auth/error?reason=unauthorized');
  }

  return {
    user: context.user,
    staffUser: context.staffUser,
  };
}

export async function requireOperationalUserApi(): Promise<ApiAuthorizedAuthContext | NextResponse> {
  const { user, staffUser, authErrorReason } = await getCurrentAuthContext();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (authErrorReason) {
    const message = authErrorReason === 'staff_table_missing' ? 'Tabel staff belum tersedia.' : 'Konfigurasi autentikasi belum lengkap.';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!staffUser || !hasOperationalAccess(staffUser)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { user, staffUser };
}
