import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { hasDashboardAccess } from '@/lib/config/authz';
import { getStaffUserByEmail, StaffUsersTableMissingError } from '@/lib/services/staff-user-service';
import {
  getSupabasePublicEnvStatus,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

function isDashboardPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!getSupabasePublicEnvStatus().isConfigured) {
    if (isDashboardPath(request.nextUrl.pathname)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', request.nextUrl.pathname);
      loginUrl.searchParams.set('error', 'Konfigurasi Supabase publik belum lengkap.');
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isDashboardPath(request.nextUrl.pathname)) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const staffUser = await getStaffUserByEmail(user.email, { supabase });

    if (!hasDashboardAccess(staffUser)) {
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('reason', 'unauthorized');
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set(
      'reason',
      error instanceof StaffUsersTableMissingError ? 'staff_table_missing' : 'callback_failed',
    );
    return NextResponse.redirect(errorUrl);
  }

  return response;
}
