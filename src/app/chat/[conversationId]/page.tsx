import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/prisma/db';

import ConversationClient from './ConversationClient';

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const currentUserId = Number(session.user.id);

  const { conversationId: conversationIdParam } = await params;

  const conversationId = Number(conversationIdParam);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    notFound();
  }

  const conversation = await db.orm.public.Conversation
    .where({ id: conversationId })
    .all()
    .first();

  if (!conversation) {
    notFound();
  }

  if (
    conversation.userAId !== currentUserId &&
    conversation.userBId !== currentUserId
  ) {
    notFound();
  }

  const otherUserId =
    conversation.userAId === currentUserId
      ? conversation.userBId
      : conversation.userAId;

  const otherUser = await db.orm.public.User
    .where({ id: otherUserId })
    .all()
    .first();

  if (!otherUser) {
    notFound();
  }

  return (
    <ConversationClient
      conversationId={conversation.id}
      currentUserId={currentUserId}
      otherUser={{
        id: otherUser.id,
        username: otherUser.username,
      }}
    />
  );
}