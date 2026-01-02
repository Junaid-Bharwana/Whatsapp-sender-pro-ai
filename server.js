
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pino = require('pino');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    store.bind(sock.ev);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('New QR Received');
            io.emit('qr', qr);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('WhatsApp Connected!');
            io.emit('status', 'connected');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // API Endpoint to send message
    app.post('/send-message', async (req, res) => {
        const { number, message } = req.body;
        try {
            const jid = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: message });
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });
}

connectToWhatsApp();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Baileys Backend running on port ${PORT}`);
});
