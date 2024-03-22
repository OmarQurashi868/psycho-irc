const { WebSocket, WebSocketServer } = require('ws');
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;
// eslint-disable-next-line no-undef
const NAME = process.env.NAME || "My server";


const wss = new WebSocketServer({ port: parseInt(PORT) + 1 }, () => {
    console.log(`Websocket server listening on port ${parseInt(PORT) + 1}`);
});

const initWss = () => {
    wss.on('connection', function connection(ws) {
        ws.on('error', console.error);

        ws.on('message', function message(data, isBinary) {
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    console.log(client)
                    client.send(data, { binary: isBinary });
                }
            });
        });

        ws.send(`Welcome to ${NAME}`);
    });
}

module.exports = initWss;