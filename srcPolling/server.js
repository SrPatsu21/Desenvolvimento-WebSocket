const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = 8080;

// Armazena os pedidos em memória
let orders = {};

// Cria um novo pedido
app.post("/order", (req, res) => {
    // Cria um ID de pedido aleatório
    const orderId = Math.floor(Math.random() * 1000).toString();
    orders[orderId] = { statusIndex: 0, canceled: false };
    res.json({ orderId, status: "Pedido recebido" });
});

// Retorna o status do pedido
app.get("/order/:orderId", (req, res) => {
    const orderId = req.params.orderId;
    const order = orders[orderId];
    if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
    }
    const statusList = ["Pedido recebido", "Em preparação", "Saiu para entrega", "Entregue"];
    if (order.canceled) {
        return res.json({ orderId, status: "Pedido cancelado" });
    }
    res.json({ orderId, status: statusList[order.statusIndex] });
});

// Cancela o pedido
app.post("/order/:orderId/cancel", (req, res) => {
    const orderId = req.params.orderId;
    const order = orders[orderId];
    if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
    }
    order.canceled = true;
    res.json({ orderId, status: "Pedido cancelado" });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Lista de status em ordem fixa
const statusList = ["Pedido recebido", "Em preparação", "Saiu para entrega", "Entregue"];

// Atualiza os pedidos a cada 5 segundos (exceto se cancelados ou já entregues)
setInterval(() => {
    Object.keys(orders).forEach(orderId => {
        let order = orders[orderId];
        if (!order.canceled && order.statusIndex < statusList.length - 1) {
            order.statusIndex++;
        }
    });
}, 5000);
