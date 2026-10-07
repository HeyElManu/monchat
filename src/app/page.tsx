"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Salut ! 👋",
      mine: false,
    },
    {
      id: 2,
      text: "Salut ! Ça va ?",
      mine: true,
    },
    {
      id: 3,
      text: "Oui très bien 😄",
      mine: false,
    },
  ]);

  function sendMessage() {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: message,
        mine: true,
      },
    ]);

    setMessage("");
  }

  return (
    <main className="flex h-screen bg-gray-100">
      
      {/* Liste des conversations */}
      <aside className="w-80 bg-white border-r">
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold">
            MonChat 💬
          </h1>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
            
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              C
            </div>

            <div>
              <p className="font-semibold">
                Claire
              </p>

              <p className="text-sm text-gray-500">
                Oui très bien 😄
              </p>
            </div>

            <div className="ml-auto w-3 h-3 bg-green-500 rounded-full" />
          </div>
        </div>
      </aside>


      {/* Conversation */}
      <section className="flex flex-1 flex-col">

        {/* En-tête */}
        <header className="h-20 bg-white border-b flex items-center px-6">
          
          <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">
            C
          </div>

          <div>
            <h2 className="font-semibold">
              Claire
            </h2>

            <p className="text-sm text-green-500">
              En ligne
            </p>
          </div>

        </header>


        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">

          {messages.map((msg) => (

            <div
              key={msg.id}
              className={`flex ${
                msg.mine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-md px-4 py-3 rounded-2xl ${
                  msg.mine
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>

            </div>

          ))}

        </div>


        {/* Zone d'envoi */}
        <div className="bg-white border-t p-4">

          <div className="flex gap-3">

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Écrire un message..."
              className="flex-1 border rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold"
            >
              Envoyer
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}