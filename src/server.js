const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = 8080;

// Servindo a pasta public com o HTML
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Criando o WebSocket no mesmo servidor
const wss = new WebSocket.Server({ server });

let orders = {}; // Armazena os pedidos e seus status

wss.on("connection", (ws) => {
    console.log("Cliente conectado");

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "subscribe") {
            const { orderId } = data;
            if (!orders[orderId]) {
                orders[orderId] = { ws, statusIndex: 0 }; // Inicia no primeiro status
            }
            console.log("orderId:"+ orderId)
            ws.send(JSON.stringify({ orderId, status: "Pedido recebido" }));
        }

        if (data.type === "cancel") {
            const { orderId } = data;
            if (orders[orderId]) {
                ws.send(JSON.stringify({ orderId, status: "Pedido cancelado" }));
                delete orders[orderId]; // Remove o pedido do acompanhamento
            }
        }
    });

    ws.on("close", () => {
        console.log("Cliente desconectado");
    });
});

// Lista de status em ordem fixa
const statusList = ["Pedido recebido", "Em preparação", "Saiu para entrega", "Entregue"];

// Atualiza os pedidos na sequência correta
setInterval(() => {
    Object.keys(orders).forEach((orderId) => {
        let order = orders[orderId];

        if (order.statusIndex < statusList.length - 1) {
            order.statusIndex++; // Avança para o próximo status
            order.ws.send(JSON.stringify({ orderId, status: statusList[order.statusIndex] }));
        }
    });
}, 5000); // Atualiza o status a cada 5 segundos
