const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const multer = require('multer');

const dbPath = path.join(__dirname, '../data/notices.json');

// Multer setup: store uploaded images in /uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/home/rohithvarsan/uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `notice_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// Helper functions
const getNotices = () => {
    if (!fs.existsSync(dbPath)) return [];
    return JSON.parse(fs.readFileSync(dbPath));
};

const saveNotices = (notices) => {
    fs.writeFileSync(dbPath, JSON.stringify(notices, null, 2));
};

const generateNoticeId = (notices) => {
    const prefix = 'NGPDNB';
    if (notices.length === 0) return `${prefix}00001`;
    const lastId = notices[notices.length - 1].id;
    const lastNumber = parseInt(lastId.replace(prefix, ''), 10);
    return `${prefix}${(lastNumber + 1).toString().padStart(5, '0')}`;
};

// GET all notices
router.get('/', (req, res) => {
    res.json(getNotices());
});

// POST a new notice with image
router.post('/', upload.single('image'), (req, res) => {
    const { title, content, type, link } = req.body;
    if (!title || !content || !type) {
        return res.status(400).json({ error: 'Title, content, and type are required' });
    }

    const notices = getNotices();
    const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const newNotice = {
        id: generateNoticeId(notices),
        title,
        content,
        type,
        link: link || null,
        image: imageUrl,
        createdAt: new Date().toISOString()
    };

    notices.push(newNotice);
    saveNotices(notices);

    // Broadcast updated notices to WebSocket clients
    const wss = req.app.get('wss');
    if (wss) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(notices));
            }
        });
    }

    res.status(201).json(newNotice);
});

// DELETE a notice
router.delete('/:id', (req, res) => {
    let notices = getNotices();
    notices = notices.filter(n => n.id !== req.params.id);
    saveNotices(notices);

    // Broadcast updated notices
    const wss = req.app.get('wss');
    if (wss) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(notices));
            }
        });
    }

    res.json({ message: 'Notice deleted' });
});

module.exports = router;