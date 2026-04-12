import { NextResponse } from 'next/server';

import { getAvailabilitySnapshot } from '@/lib/services/qurban-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getAvailabilitySnapshot();
  return NextResponse.json(data);
}
