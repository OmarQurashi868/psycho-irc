const { WebSocket, WebSocketServer } = require('ws');
const { checkTokenValidity } = require("../utils/userAuth");
const User = require("../classes/User");
// eslint-disable-next-line no-undef
const NAME = process.env.SERVER_NAME || "My server";
const log = require("./logger");

const initWss = (httpServer) => {
    const wss = new WebSocketServer({ noServer: true });
   log(`Websocket server listening`);

    httpServer.on("upgrade", async (req, socket, head) => {
        socket.on('error', () => {
           log("Error occured at socket upgrade")
        });
        const token = req.headers["authtoken"];

        const isTokenValid = await checkTokenValidity(token);
        if (!isTokenValid) {
            socket.write('HTTP/1.1 401 Unauthorized\r\nContent-Length: 45\r\nContent-Type: application/json\r\n\r\n{"message":"authtoken is missing or invalid"}');
            socket.destroy();
           log("Failed connection attempt");
            return;
        }

        socket.removeListener('error', () => {
           log("Error occured at socket listener remove")
        });
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        })
    })

    wss.on('connection', async function connection(ws, req) {
        ws.on('error', console.error);

        const token = req.headers["authtoken"];
        let username = ""
        if (token) {
            username = await User.getUsernameByToken(token);
        } else {
            username = "unidentified"
        }

        ws.on('message', function message(data) {
            const payload = `{"sender":"${username}","type":"message","content":"${data}"}`
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                }
            });
        });

        ws.on("close", function goodbye(code, reason) {
            const extraDetails = code != 1000 ? `, reason: ${reason}` : ""
            const payload = `{"sender":"${username}","type":"alert","content":"disconnected${extraDetails}"}`
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                }
            });
        })

        ws.send(`Welcome to ${NAME}`);
        const payload = `{"sender":"${username}","type":"alert","content":"connected"}`
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
        log(`User connected successfully: ${username}`);
    });
}

module.exports = initWss;
