import { redirect } from 'next/navigation';
import { Temporal } from '@js-temporal/polyfill';

import { auth } from '@/auth';
import { db } from '@/prisma/db';

import ChatClient from './ChatClient';

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const currentUserId = Number(session.user.id);

  // Récupération de tous les utilisateurs
  const users = await db.orm.public.User
    .where({})
    .all();

  // On retire l'utilisateur actuellement connecté
  const otherUsers = users
    .filter((user) => user.id !== currentUserId)
    .map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
    }));

  // Récupération de toutes les conversations
  const allConversations = await db.orm.public.Conversation
    .where({})
    .all();

  // On garde uniquement les conversations de l'utilisateur connecté
  const myConversations = allConversations.filter(
    (conversation) =>
      conversation.userAId === currentUserId ||
      conversation.userBId === currentUserId,
  );

  // Préparation des conversations pour le composant client
  const conversations = myConversations
    .map((conversation) => {
      const otherUserId =
        conversation.userAId === currentUserId
          ? conversation.userBId
          : conversation.userAId;

      const otherUser = users.find(
        (user) => user.id === otherUserId,
      );

      if (!otherUser) {
        return null;
      }

      return {
        id: conversation.id,

        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          email: otherUser.email,
        },

        createdAt: conversation.createdAt,
      };
    })
    .filter(
      (
        conversation,
      ): conversation is NonNullable<typeof conversation> =>
        Boolean(conversation),
    )
    // Prisma 8 utilise Temporal.Instant
    .sort((a, b) =>
      Temporal.Instant.compare(
        b.createdAt,
        a.createdAt,
      ),
    );

  return (
    <ChatClient
      users={otherUsers}
      conversations={conversations.map((conversation) => ({
        ...conversation,
        // On convertit Temporal.Instant en chaîne
        // avant de l'envoyer au composant client.
        createdAt: conversation.createdAt.toString(),
      }))}
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}