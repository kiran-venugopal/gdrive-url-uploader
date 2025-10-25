const { WebSocketServer } = require("ws");
const http = require("http");

let server;
const clients = new Map();
const fileClients = new Map();

const setupWebSocket = (app) => {
  if (!server) {
    server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: "/websocket" });

    wss.on("connection", (ws, req) => {
      const clientId = Date.now().toString();
      // clients.set(clientId, ws);

      console.log(`Client ${clientId} connected. Total: ${clients.size}`);

      ws.on("message", (data) => {
        const message = JSON.parse(data);

        const fileId = message.fileId;
        if (fileId) {
          if (fileClients.has(fileId)) {
            fileClients.get(fileId).push(ws);
          } else {
            fileClients.set(fileId, [ws]);
          }
        }

        // Broadcast to all clients (pub/sub pattern)
        // clients.forEach((client, id) => {
        //   if (client.readyState === 1) {
        //     // OPEN
        //     client.send(
        //       JSON.stringify({
        //         from: clientId,
        //         ...message,
        //         timestamp: Date.now(),
        //       })
        //     );
        //   }
        // });
      });

      //   ws.on("close", () => {
      //     clients.delete(clientId);
      //     console.log(`Client ${clientId} disconnected. Total: ${clients.size}`);
      //   });
    });

    wss.on("error", (err) => {
      console.log("error in socket!", err);
    });
    console.log("init websocket done!");
  }
  return server;
};

module.exports = { setupWebSocket, fileClients };
