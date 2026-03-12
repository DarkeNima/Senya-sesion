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
const PORT = process.env.PORT || 8080;

console.log('Starting app on PORT:', PORT);
require('events').EventEmitter.defaultMaxListeners = 500;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test each require one by one
try { require('./gen-id'); console.log('gen-id OK'); } catch(e) { console.error('gen-id FAIL:', e.message); }
try { require('qrcode'); console.log('qrcode OK'); } catch(e) { console.error('qrcode FAIL:', e.message); }
try { require('pino'); console.log('pino OK'); } catch(e) { console.error('pino FAIL:', e.message); }
try { require('./mega'); console.log('mega OK'); } catch(e) { console.error('mega FAIL:', e.message); }

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

app.listen(PORT, () => { console.log('Server running on port ' + PORT); });
module.exports = app;
