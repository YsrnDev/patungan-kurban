import { NextResponse } from 'next/server';

import { hasDashboardAccess } from '@/lib/config/authz';
import { getStaffUserByEmail, recordStaffLogin, StaffUsersTableMissingError } from '@/lib/services/staff-user-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = requestUrl.searchParams.get('next');
  const safeNextPath = nextPath && nextPath.startsWith('/') ? nextPath : '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?reason=missing_code', request.url));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/auth/error?reason=callback_failed', request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const staffUser = await getStaffUserByEmail(user?.email, { supabase });

    if (!hasDashboardAccess(staffUser)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/auth/error?reason=unauthorized', request.url));
    }

    await recordStaffLogin(user?.email);
  } catch (error) {
    await supabase.auth.signOut();

    if (error instanceof StaffUsersTableMissingError) {
      return NextResponse.redirect(new URL('/auth/error?reason=staff_table_missing', request.url));
    }

    return NextResponse.redirect(new URL('/auth/error?reason=callback_failed', request.url));
  }

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
