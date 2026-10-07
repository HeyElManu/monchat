import { NextResponse } from 'next/server';
import { Temporal } from '@js-temporal/polyfill';

import { auth } from '@/auth';
import { db } from '@/prisma/db';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié.' },
        { status: 401 },
      );
    }

    const currentUserId = Number(session.user.id);

    const body = await request.json();
    const otherUserId = Number(body.userId);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      return NextResponse.json(
        { error: 'Utilisateur invalide.' },
        { status: 400 },
      );
    }

    if (currentUserId === otherUserId) {
      return NextResponse.json(
        { error: 'Impossible de discuter avec soi-même.' },
        { status: 400 },
      );
    }

    const otherUser = await db.orm.public.User
      .where({ id: otherUserId })
      .all()
      .first();

    if (!otherUser) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable.' },
        { status: 404 },
      );
    }

    const userAId = Math.min(currentUserId, otherUserId);
    const userBId = Math.max(currentUserId, otherUserId);

    const existingConversation = await db.orm.public.Conversation
      .where({
        userAId,
        userBId,
      })
      .all()
      .first();

    if (existingConversation) {
      return NextResponse.json({
        conversationId: existingConversation.id,
      });
    }

    const conversation = await db.orm.public.Conversation.create({
      userAId,
      userBId,
      createdAt: Temporal.Now.instant(),
    });

    return NextResponse.json(
      {
        conversationId: conversation.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('CONVERSATION_ERROR', error);

    return NextResponse.json(
      { error: 'Impossible de créer la conversation.' },
      { status: 500 },
    );
  }
}