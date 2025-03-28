const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rota para servir o arquivo HTML principal
app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let votes = { optionA: 0, optionB: 0 };

app.get('/votes', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendVotes = () => res.write(`data: ${JSON.stringify(votes)}\n\n`);
    sendVotes();

    const interval = setInterval(sendVotes, 1000);
    req.on('close', () => clearInterval(interval));
});

app.post('/vote', (req, res) => {
    const option = req.body.option;
    if (votes[option] !== undefined) {
        votes[option]++;
    }
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
