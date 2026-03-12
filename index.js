process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

console.log('Starting app on PORT:', PORT);

let server, code;
try {
    server = require('./qr');
    console.log('qr.js loaded OK');
} catch(e) {
    console.error('ERROR loading qr.js:', e);
}

try {
    code = require('./pair');
    console.log('pair.js loaded OK');
} catch(e) {
    console.error('ERROR loading pair.js:', e);
}

require('events').EventEmitter.defaultMaxListeners = 500;

if (server) app.use('/server', server);
if (code) app.use('/code', code);

app.use('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html')
})
app.use('/qr', async (req, res, next) => {
    res.sendFile(__path + '/qr.html')
})
app.use('/', async (req, res, next) => {
    res.sendFile(__path + '/main.html')
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
})

module.exports = app
