const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const net = require('net');
const cors = require('cors');

const FASTCLICK_PORT = 7777;
const FASTCLICK_HOST = 'localhost';

// // Activer CORS pour toutes les routes
app.use(cors({
  origin: 'http://localhost:3001',
   credentials: true
 }));

function sendCommandToFastClick(command) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(FASTCLICK_PORT, FASTCLICK_HOST, () => {
      client.write(command + '\n');
    });

    let data = '';
    client.on('data', (chunk) => {
      data += chunk.toString();
      resolve(data.trim());
    });

    client.on('end', () => {
      resolve(data.trim());
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}

io.on('connection', (socket) => {
  console.log('Un client est connecté');
  socket.on('getConfig', async () => {
    try {
      const config = await sendCommandToFastClick('READ config');
      socket.emit('clickConfig', config);
    } catch (err) {
      console.error('Erreur lors de la récupération de la configuration:', err);
      socket.emit('error', 'Impossible de récupérer la configuration');
    }
  });

  // Événement pour récupérer la flat config
  socket.on('getFlatConfig', async () => {
    try {
        console.log("okok");
        const flatConfig = await sendCommandToFastClick('READ flatconfig');
        console.log(flatConfig);

      socket.emit('clickFlatConfig', flatConfig);
    } catch (err) {
      console.error('Erreur lors de la récupération de la flat config:', err);
      socket.emit('error', 'Impossible de récupérer la flat configg');
    }
  });

  socket.on('command', async (command) => {
    try {
      console.log("la commande", command);
      const resultResponse = await sendCommandToFastClick(command);
      const result = resultResponse
      .split('\n')
      .filter(line => line && !line.startsWith('200') && !line.startsWith('DATA') && !line.startsWith('Click'))
      .map(line => line.split('\t')[0]);

      console.log("et son résultat", result);
      console.log("et son résultat sans parse", resultResponse);
      socket.emit('commandResult', result);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la commande:', err);
      socket.emit('error', 'Impossible d\'exécuter la commande');
    }
  });

  socket.on('getHandlers', async (element) => {
    try {
      console.log("tetete", element);
      const handlersResponse = await sendCommandToFastClick(`READ ${element}.handlers`);
      
      const handlers = handlersResponse
        .split('\n')
        .filter(line => line && !line.startsWith('200') && !line.startsWith('DATA') && !line.startsWith('Click'))
        .map(line => line.split('\t')[0]);
  
      socket.emit('handlers', handlers);
    } catch (err) {
      console.error('Erreur lors de la récupération des handlers:', err);
      socket.emit('error', 'Impossible de récupérer les handlers');
    }
  });  
});

const SERVER_PORT = 3000;
http.listen(SERVER_PORT, () => {
  console.log(`Serveur en écoute sur le port ${SERVER_PORT}`);
});