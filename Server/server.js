const WebSocket = require("ws");

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

// WebSocket → nickname
const players = new Map();

function broadcast(message) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    const message = msg.toString();
    console.log("Received:", message);

    const [cmd, payload] = message.split("|");

    if (cmd === "JOIN") {
  const nickname = payload || "Player" + Math.floor(Math.random() * 10000);

  // 既存の同名プレイヤーを切断
  for (const [client, name] of players) {
    if (name === nickname) {
      client.close();
      players.delete(client);
      break;
    }
  }

  players.set(ws, nickname);

  // 全員に現在のプレイヤーリストを送信（ここがポイント！）
  broadcast("PLAYERS|" + Array.from(players.values()).join(","));
}
 else if (cmd === "LEAVE") {
      const nickname = players.get(ws);
      players.delete(ws);
      broadcast("PLAYERS|" + Array.from(players.values()).join(","));
    }
  });

  ws.on("close", () => {
    const nickname = players.get(ws);
    if (nickname) {
      players.delete(ws);
      broadcast("PLAYERS|" + Array.from(players.values()).join(","));
    }
  });
});

console.log(`WebSocket server running on ws://localhost:${port}`);
