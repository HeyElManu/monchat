import { NextResponse } from 'next/server';
import { Temporal } from '@js-temporal/polyfill';

import { auth } from '@/auth';
import { db } from '@/prisma/db';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié.' },
        { status: 401 },
      );
    }

    const userId = Number(session.user.id);

    await db.orm.public.User
      .where({ id: userId })
      .update({
        lastSeen: Temporal.Now.instant(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PRESENCE_ERROR', error);

    return NextResponse.json(
      { error: 'Impossible de mettre à jour la présence.' },
      { status: 500 },
    );
  }
}