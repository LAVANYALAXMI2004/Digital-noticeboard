require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const noticesRoute = require('./routes/notices');
const crawlerRoute = require('./routes/crawler');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

app.set('wss', wss);
app.set('upload', upload);

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('/home/rohithvarsan/uploads'));
app.use('/api/notices', noticesRoute);
app.use('/api/crawler', crawlerRoute);

const dbPath = path.join(__dirname, './data/notices.json');

const getNotices = () => {
    if (!fs.existsSync(dbPath)) return [];
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};


wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    const notices = getNotices();
    ws.send(JSON.stringify(notices));

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});


// Serve frontend build as static files
const frontendBuildPath = path.join(__dirname, '../digital-noticeboard-frontend/build');
app.use(express.static(frontendBuildPath));

// SPA catch-all: serve index.html for any non-API route
app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));