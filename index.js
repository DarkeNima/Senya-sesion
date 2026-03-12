process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

console.log('Starting app on PORT:', PORT);

__path = process.cwd();
require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lazy load routes only when requested
app.use('/server', (req, res, next) => {
    try {
        const server = require('./qr');
        server(req, res, next);
    } catch(e) {
        console.error('qr.js error:', e.message);
        res.status(500).send('QR service error');
    }
});

app.use('/code', (req, res, next) => {
    try {
        const code = require('./pair');
        code(req, res, next);
    } catch(e) {
        console.error('pair.js error:', e.message);
        res.status(500).send('Pair service error');
    }
});

app.use('/pair', (req, res) => {
    res.sendFile(__path + '/pair.html');
});

app.use('/qr', (req, res) => {
    res.sendFile(__path + '/qr.html');
});

app.use('/', (req, res) => {
    res.sendFile(__path + '/main.html');
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});

module.exports = app;
