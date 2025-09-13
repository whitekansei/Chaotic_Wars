const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Server started on port ${PORT}`);
});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message.toString());

        // 全員にブロードキャスト
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});
