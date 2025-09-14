// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const players = new Map(); // ws -> nickname

function broadcast(msg) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (raw) => {
    const msg = raw.toString();
    const [cmd, payload] = msg.split("|");
    console.log("Recv:", msg);

    if (cmd === "JOIN") {
      const nickname = payload || "Player" + Math.floor(Math.random() * 10000);
      players.set(ws, nickname);

      // 新規参加者へ現在の全プレイヤーリストを送る
      const allNames = Array.from(players.values()).join(",");
      broadcast(`PLAYERS|${allNames}`);

      // 全員に新しい参加者を通知
      broadcast(`JOIN|${nickname}`);

    } else if (cmd === "LEAVE") {
      const nickname = players.get(ws);
      players.delete(ws);
      broadcast(`LEAVE|${nickname}`);

    } else if (cmd === "REQUEST_PLAYERS") {
      const allNames = Array.from(players.values()).join(",");
      ws.send(`PLAYERS|${allNames}`);

    } else {
      // それ以外のメッセージは全員にそのまま転送
      broadcast(msg);
    }
  });

  ws.on("close", () => {
    const nickname = players.get(ws);
    if (nickname) {
      players.delete(ws);
      broadcast(`LEAVE|${nickname}`);
    }
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8080");
