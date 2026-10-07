'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Message = {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  read: boolean;
};

type Props = {
  conversationId: number;
  currentUserId: number;
  otherUser: {
    id: number;
    username: string;
  };
};

export default function ConversationClient({
  conversationId,
  currentUserId,
  otherUser,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    try {
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`,
        {
          cache: 'no-store',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Impossible de charger les messages.');
        return;
      }

      setMessages(data);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const text = content.trim();

    if (!text || sending) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Impossible d’envoyer le message.');
        return;
      }

      setMessages((current) => [...current, data]);
      setContent('');
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col bg-white shadow">
        <header className="flex items-center gap-4 border-b p-4">
          <Link
            href="/chat"
            className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
          >
            ←
          </Link>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-lg font-bold">
            {otherUser.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="font-bold">
              {otherUser.username}
            </h1>

            <p className="text-sm text-gray-500">
              Conversation privée
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">
                Chargement des messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-3 text-5xl">
                  💬
                </div>

                <p className="font-medium">
                  Aucun message
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Envoie le premier message à {otherUser.username}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isMine =
                  message.senderId === currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          isMine
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {new Date(
                          message.createdAt,
                        ).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="border-t bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 border-t p-4"
        >
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Écrire un message..."
            maxLength={2000}
            disabled={sending}
            className="flex-1 rounded-full border px-5 py-3 outline-none focus:ring-2"
          />

          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {sending ? '...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </main>
  );
}