import { NextResponse } from 'next/server';
import { Temporal } from '@js-temporal/polyfill';

import { auth } from '@/auth';
import { db } from '@/prisma/db';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié.' },
        { status: 401 },
      );
    }

    const currentUserId = Number(session.user.id);

    const { searchParams } = new URL(request.url);
    const conversationId = Number(
      searchParams.get('conversationId'),
    );

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json(
        { error: 'Conversation invalide.' },
        { status: 400 },
      );
    }

    const conversation = await db.orm.public.Conversation
      .where({ id: conversationId })
      .all()
      .first();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation introuvable.' },
        { status: 404 },
      );
    }

    if (
      conversation.userAId !== currentUserId &&
      conversation.userBId !== currentUserId
    ) {
      return NextResponse.json(
        { error: 'Accès refusé.' },
        { status: 403 },
      );
    }

    const messages = await db.orm.public.Message
      .where({ conversationId })
      .all();

    return NextResponse.json(
      messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        read: message.read,
      })),
    );
  } catch (error) {
    console.error('GET_MESSAGES_ERROR', error);

    return NextResponse.json(
      { error: 'Impossible de récupérer les messages.' },
      { status: 500 },
    );
  }
}

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

    const conversationId = Number(body.conversationId);
    const content = String(body.content ?? '').trim();

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json(
        { error: 'Conversation invalide.' },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Le message est vide.' },
        { status: 400 },
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Le message est trop long.' },
        { status: 400 },
      );
    }

    const conversation = await db.orm.public.Conversation
      .where({ id: conversationId })
      .all()
      .first();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation introuvable.' },
        { status: 404 },
      );
    }

    if (
      conversation.userAId !== currentUserId &&
      conversation.userBId !== currentUserId
    ) {
      return NextResponse.json(
        { error: 'Accès refusé.' },
        { status: 403 },
      );
    }

    const message = await db.orm.public.Message.create({
      content,
      createdAt: Temporal.Now.instant(),
      read: false,
      senderId: currentUserId,
      conversationId,
    });

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        read: message.read,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST_MESSAGE_ERROR', error);

    return NextResponse.json(
      { error: 'Impossible d’envoyer le message.' },
      { status: 500 },
    );
  }
}