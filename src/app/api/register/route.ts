import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Temporal } from '@js-temporal/polyfill';

import { db } from '@/prisma/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires.' },
        { status: 400 },
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Le pseudo doit contenir au moins 3 caractères.' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 },
      );
    }

    const existingEmail = await db.orm.public.User
      .where({ email })
      .all()
      .first();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cette adresse e-mail est déjà utilisée.' },
        { status: 409 },
      );
    }

    const existingUsername = await db.orm.public.User
      .where({ username })
      .all()
      .first();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Ce pseudo est déjà utilisé.' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const now = Temporal.Now.instant();

    await db.orm.public.User.create({
      username,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error('REGISTER_ERROR', error);

    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 },
    );
  }
}