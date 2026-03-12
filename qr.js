const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    async function GIFTED_MD_PAIR_CODE() {
        const {
            default: makeWASocket,
            useMultiFileAuthState,
            delay,
            makeCacheableSignalKeyStore,
            Browsers,
            jidNormalizedUser
        } = await import("@whiskeysockets/baileys");

        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                if (qr) await res.end(await QRCode.toBuffer(qr));
                if (connection == "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "VAJIRA-MD=" + string_session;
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        let desc = `*𝙳𝚘𝚗𝚝 𝚜𝚑𝚊𝚛𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚍𝚎 𝚠𝚒𝚝𝚑 𝚊𝚗𝚢𝚘𝚗𝚎!! 𝚄𝚜𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚍𝚎 𝚝𝚘 𝚌𝚛𝚎𝚊𝚝𝚎 𝙿𝚒𝚗𝚔𝚅𝚎𝚗𝚘𝚖-𝙼𝙳 𝚆𝚑𝚊𝚝𝚜𝚊𝚙𝚙 𝚄𝚜𝚎𝚛 𝚋𝚘𝚝.*\n\n ◦ *Github:* https://github.com/ayooh-us/Pink-Venom-MD`;
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴠᴀᴊɪʀᴀ-ᴍᴅ",
                                    thumbnailUrl: "https://telegra.ph/file/e069027c2178e2c7475c9.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VahMZasD8SE5GRwzqn3Z",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: code })
                    } catch (e) {
                        console.error('Upload error:', e);
                        let desc = `*𝙳𝚘𝚗𝚝 𝚜𝚑𝚊𝚛𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚍𝚎 𝚠𝚒𝚝𝚑 𝚊𝚗𝚢𝚘𝚗𝚎!! 𝚄𝚜𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚍𝚎 𝚝𝚘 𝚌𝚛𝚎𝚊𝚝𝚎 𝚅𝙰𝙹𝙸𝚁𝙰-𝙼𝙳 𝚆𝚑𝚊𝚝𝚜𝚊𝚙𝚙 𝚄𝚜𝚎𝚛 𝚋𝚘𝚝.*\n\n ◦ *Github:* https://github.com/VajiraTech/VAJIRA-MD`;
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴠᴀᴊɪʀᴀ-ᴍᴅ",
                                    thumbnailUrl: "https://telegra.ph/file/e069027c2178e2c7475c9.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VahMZasD8SE5GRwzqn3Z",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        })
                    }
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅`);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("service error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }
    await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
