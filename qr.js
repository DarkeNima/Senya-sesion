const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const pino = require("pino");
const { upload } = require('./mega');
let router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    try {
        const baileys = await import('@whiskeysockets/baileys');
        const makeWASocket = baileys.default;
        const { useMultiFileAuthState, delay, Browsers } = baileys;

        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        let sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Desktop"),
        });

        sock.ev.on('creds.update', saveCreds);
        sock.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect, qr } = s;
            if (qr && !res.headersSent) {
                res.end(await QRCode.toBuffer(qr));
            }
            if (connection == "open") {
                await delay(5000);
                let rf = __dirname + `/temp/${id}/creds.json`;
                try {
                    const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    let md = "VAJIRA-MD=" + string_session;
                    let code = await sock.sendMessage(sock.user.id, { text: md });
                    await sock.sendMessage(sock.user.id, {
                        text: `*Don't share this code!!*\n\n◦ *Github:* https://github.com/VajiraTech/VAJIRA-MD`,
                    }, { quoted: code });
                } catch (e) { console.error('Upload error:', e.message); }
                await delay(10);
                await sock.ws.close();
                await removeFile('./temp/' + id);
                console.log('QR session done ✅');
            } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode != 401) {
                await delay(10);
                // reconnect
            }
        });
    } catch (err) {
        console.error("qr error:", err.message);
        await removeFile('./temp/' + id);
        if (!res.headersSent) res.send({ code: "❗ Service Unavailable" });
    }
});

module.exports = router;
