const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
} = require('baileyz');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    async function GIFTED_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                version: [2, 3000, 1033105955],
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000,
                emitOwnEvents: true,
                fireInitQueries: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: true,
                markOnlineOnConnect: true,
                browser: ['Mac OS', 'Safari', '10.15.7'],
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num, "NAVIYAMD");
                if (!res.headersSent) {
                    const formatted = code?.match(/.{1,4}/g)?.join("-") || code;
                    await res.send({ code: formatted });
                }
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
                        let desc = `*ð™³ðš˜ðš—ðš ðšœðš‘ðšŠðš›ðšŽ ðšðš‘ðš’ðšœ ðšŒðš˜ðšðšŽ ðš ðš’ðšðš‘ ðšŠðš—ðš¢ðš˜ðš—ðšŽ!! ðš„ðšœðšŽ ðšðš‘ðš’ðšœ ðšŒðš˜ðšðšŽ ðšðš˜ ðšŒðš›ðšŽðšŠðšðšŽ ðš…ð™°ð™¹ð™¸ðšð™°-ð™¼ð™³ ðš†ðš‘ðšŠðšðšœðšŠðš™ðš™ ðš„ðšœðšŽðš› ðš‹ðš˜ðš.*\n\n â—¦ *Github:* https://github.com/VajiraTech/VAJIRA-MD`;
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "á´ á´€á´ŠÉªÊ€á´€-á´á´…",
                                    thumbnailUrl: "https://telegra.ph/file/e069027c2178e2c7475c9.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VahMZasD8SE5GRwzqn3Z",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: code });
                    } catch (e) {
                        console.error('upload error:', e.message);
                    }
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`ðŸ‘¤ ${sock.user.id} Connected âœ…`);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service error:", err.message);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "â— Service Unavailable" });
            }
        }
    }
    return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
