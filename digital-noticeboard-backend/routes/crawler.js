const express = require('express');
const WebSocket = require('ws');
const { runCrawler } = require('../services/knowafestCrawler');

const router = express.Router();

const toPositiveInt = (value, fallback) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const broadcastNotices = (wss, notices) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notices));
    }
  });
};

const handleRequest = async (req, res) => {
  const pages = toPositiveInt(req.query.pages ?? req.body?.pages, 1);
  const limit = toPositiveInt(req.query.limit ?? req.body?.limit, 10);

  try {
    const result = await runCrawler({
      pages,
      limit,
      broadcast: (notices) => broadcastNotices(req.app.get('wss'), notices),
    });

    res.json({
      message: 'Crawler run completed',
      pages,
      limit,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: 'Crawler run failed', detail: err.message });
  }
};

router.get('/', handleRequest);
router.post('/', handleRequest);

module.exports = router;
