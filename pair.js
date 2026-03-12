const { makeid } = require('./gen-id');
const express = require('express');
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
    let num = req.query.number;
    try {
        const baileys = await import('@whiskeysockets/baileys');
        const makeWASocket = baileys.default;
        const { useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = baileys;

        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        let sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.macOS("Safari")
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            if (!res.headersSent) await res.send({ code });
        }

        sock.ev.on('creds.update', saveCreds);
        sock.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect } = s;
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
                } catch (e) { console.error('error:', e.message); }
                await delay(10);
                await sock.ws.close();
                await removeFile('./temp/' + id);
                console.log('Pair session done ✅');
            } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode != 401) {
                await delay(10);
            }
        });
    } catch (err) {
        console.error("pair error:", err.message);
        await removeFile('./temp/' + id);
        if (!res.headersSent) res.send({ code: "❗ Service Unavailable" });
    }
});

module.exports = router;
