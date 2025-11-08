const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Quand un utilisateur envoie un message
  socket.on('chat message', ({ pseudo, message }) => {
    io.emit('chat message', { pseudo, message });
  });
});

http.listen(PORT, () => console.log(`Serveur en ligne sur le port ${PORT}`));