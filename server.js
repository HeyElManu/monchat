const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Liste des pseudos utilisés
const connectedUsers = new Set();

// Historique des messages
const messageHistory = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  let userPseudo = null;

  console.log('Un utilisateur est connecté');

  // Vérifie le pseudo à la connexion
  socket.on('join', (pseudo, callback) => {
    if (connectedUsers.has(pseudo)) {
      callback({ success: false, message: 'Pseudo déjà utilisé !' });
    } else {
      connectedUsers.add(pseudo);
      userPseudo = pseudo;

      // Envoie l’historique des messages au nouvel utilisateur
      callback({ success: true, history: messageHistory });
      console.log(`Pseudo connecté: ${pseudo}`);
    }
  });

  // Réception des messages
  socket.on('chat message', ({ pseudo, message }) => {
    const msg = { pseudo, message };
    messageHistory.push(msg);       // Ajoute au tableau d’historique
    io.emit('chat message', msg);   // Envoie à tous
  });

  // Libère le pseudo à la déconnexion
  socket.on('disconnect', () => {
    if (userPseudo) {
      connectedUsers.delete(userPseudo);
      console.log(`Pseudo déconnecté: ${userPseudo}`);
    }
  });
});

http.listen(PORT, () => console.log(`Serveur en ligne sur le port ${PORT}`));
