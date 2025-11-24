// Import the HTTP and WebSocket modules
const http = require('http');
const { WebSocketServer } = require('ws');

// Create a basic HTTP server (so WebSocket can upgrade properly)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server running...');
});

// Create a WebSocket server bound to our HTTP server
const wss = new WebSocketServer({ server });
const parts = ['head', 'torso', 'legs'];

const players = {};
// When a client connects
wss.on('connection', (ws) => {
  console.log('Client connected');
const clientId = Date.now().toString() + Math.random().toString(16).slice(2); 
  ws.clientId = clientId;

   const available = parts.filter(p => !Object.values(players).includes(p));
  const playerpart = available[Math.floor(Math.random() * available.length)];
  players[clientId] = playerpart;
   ws.send(JSON.stringify({ type: 'part', part: playerpart }));
  // When we receive a message from a client
  ws.on('message', (data) => {
    console.log('Received:', data.toString());

    // Broadcast it to all other connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(data.toString());
      }
    });
  });

  // When the client disconnects
  ws.on('close', () => console.log('Client disconnected'));
if (players[ws.clientId]) {
  delete players[ws.clientId];
}
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => console.log(`Server listening on ws://localhost:${PORT}`));
