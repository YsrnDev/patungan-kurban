import { NextRequest, NextResponse } from 'next/server';

import { registerParticipant } from '@/lib/services/qurban-service';
import { ValidationError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await registerParticipant(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof ValidationError ? error.message : 'Registrasi gagal diproses.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
