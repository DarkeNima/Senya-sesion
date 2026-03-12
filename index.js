process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

console.log('Starting app on PORT:', PORT);

require('events').EventEmitter.defaultMaxListeners = 500;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('Loading qr.js...');
let server = require('./qr');
console.log('qr.js loaded OK');

console.log('Loading pair.js...');
let code = require('./pair');
console.log('pair.js loaded OK');

app.use('/server', server);
app.use('/code', code);
app.use('/pair', (req, res) => { res.sendFile(__path + '/pair.html'); });
app.use('/qr', (req, res) => { res.sendFile(__path + '/qr.html'); });
app.use('/', (req, res) => { res.sendFile(__path + '/main.html'); });

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});

module.exports = app;
