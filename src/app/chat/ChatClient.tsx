'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
};

type Conversation = {
  id: number;
  otherUser: User;
  createdAt: string;
};

type Props = {
  users: User[];
  conversations: Conversation[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
};

export default function ChatClient({
  users,
  conversations,
  currentUser,
}: Props) {
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Met à jour la présence de l'utilisateur
  useEffect(() => {
    async function updatePresence() {
      try {
        await fetch('/api/presence', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Erreur présence :', error);
      }
    }

    // Première mise à jour immédiatement
    updatePresence();

    // Puis toutes les 30 secondes
    const interval = setInterval(updatePresence, 30000);

    return () => clearInterval(interval);
  }, []);

  async function openConversation(userId: number) {
    setSelectedUserId(userId);
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? 'Impossible d’ouvrir la conversation.',
        );
        return;
      }

      router.push(`/chat/${data.conversationId}`);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  function openExistingConversation(conversationId: number) {
    router.push(`/chat/${conversationId}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">

        {/* En-tête */}
        <header className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">
            Mon Chat 💬
          </h1>

          <p className="mt-2 text-gray-500">
            Connecté en tant que {currentUser.name}
          </p>
        </header>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid min-h-[600px] gap-6 md:grid-cols-3">

          {/* COLONNE DE GAUCHE */}
          <aside className="rounded-2xl bg-white p-4 shadow">

            {/* Conversations existantes */}
            <h2 className="mb-4 text-lg font-bold">
              Mes conversations
            </h2>

            {conversations.length === 0 ? (
              <p className="mb-6 text-sm text-gray-500">
                Aucune conversation pour le moment.
              </p>
            ) : (
              <div className="mb-6 space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      openExistingConversation(conversation.id)
                    }
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-gray-100"
                  >
                    {/* Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                      {conversation.otherUser.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Informations */}
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {conversation.otherUser.username}
                      </div>

                      <div className="text-xs text-gray-500">
                        Conversation privée
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Séparateur */}
            <div className="border-t pt-5">

              <h2 className="mb-4 text-lg font-bold">
                Nouveaux messages
              </h2>

              {users.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun autre utilisateur.
                </p>
              ) : (
                <div className="space-y-2">

                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => openConversation(user.id)}
                      disabled={loading}
                      className={`w-full rounded-xl p-3 text-left transition ${
                        selectedUserId === user.id
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">
                        {user.username}
                      </div>

                      <div
                        className={`text-sm ${
                          selectedUserId === user.id
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {user.email}
                      </div>
                    </button>
                  ))}

                </div>
              )}

            </div>
          </aside>

          {/* ZONE PRINCIPALE */}
          <section className="rounded-2xl bg-white shadow md:col-span-2">

            <div className="flex h-full min-h-[600px] items-center justify-center p-6">

              {loading ? (
                <p className="text-gray-500">
                  Ouverture de la conversation...
                </p>
              ) : (
                <div className="text-center">

                  <div className="mb-3 text-5xl">
                    💬
                  </div>

                  <h2 className="text-xl font-semibold">
                    Bienvenue sur Mon Chat
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Sélectionne une conversation pour commencer.
                  </p>

                </div>
              )}

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}