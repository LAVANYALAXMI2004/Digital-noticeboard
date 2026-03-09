const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.knowafest.com/explore/events';
const COIMBATORE_URL = 'https://www.knowafest.com/explore/city/Coimbatore';
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DB_PATH = path.join(__dirname, '../data/notices.json');
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL_ID = process.env.HF_MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readNotices = () => {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH));
};

const saveNotices = (notices) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(notices, null, 2));
};

const getMaxIdNumber = (notices) => {
  const prefix = 'NGPDNB';
  return notices.reduce((max, notice) => {
    const num = parseInt(String(notice.id || '').replace(prefix, ''), 10);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
};

const makeIdFactory = (currentMax) => {
  const prefix = 'NGPDNB';
  let counter = currentMax;
  return () => {
    counter += 1;
    return `${prefix}${counter.toString().padStart(5, '0')}`;
  };
};

const promptFromEvent = (event) => (
  `Write a short and engaging description for this event.\n` +
  `Title: ${event.title || 'Untitled'}\n` +
  `Type: ${event.type || 'external'}\n` +
  `Location: ${event.location || 'unknown'}\n` +
  `Date: ${event.date || 'TBD'}\n`
);

const buildFallbackDescription = (event) => {
  const parts = [event.title || 'Upcoming event'];
  if (event.type) parts.push(`(${event.type})`);
  if (event.date) parts.push(`on ${event.date}`);
  if (event.location) parts.push(`at ${event.location}`);
  return parts.join(' ');
};

const fetchEventsPage = async (page, logs) => {
  // Fetch from main events page
  const url = `${BASE_URL}?page=${page}`;
  logs.push(`Fetching page ${page}: ${url}`);
  const res = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 10000,
  });
  const $ = cheerio.load(res.data);
  const events = [];
  $('a.card').each((_, card) => {
    const href = $(card).attr('href');
    if (!href) return;
    const link = `https://www.knowafest.com/${href.replace(/^\//, '').replace('/events/', '/explore/events/')}`;
    const img = $(card).find('img.card-img').attr('src');
    const poster = img ? img.replace('/thumbs/', '/uploads/') : null;
    const title = $(card).find('p.card-text').text().trim() || 'Untitled Event';
    const type = $(card).find('span.badge').text().trim() || 'external';
    const body = $(card).find('.card-body p').text().trim();
    let location = null;
    let date = null;
    if (body && body.includes(' - ')) {
      const [loc, dt] = body.split(' - ', 2).map((part) => part.trim());
      location = loc || null;
      date = dt || null;
    }
    events.push({ title, poster, type, location, date, link });
  });
  logs.push(`Found ${events.length} events on page ${page}`);

  // Fetch from Coimbatore city page (first page only)
  if (page === 1) {
    logs.push(`Fetching Coimbatore city events: ${COIMBATORE_URL}`);
    const resCity = await axios.get(COIMBATORE_URL, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
    });
    const $city = cheerio.load(resCity.data);
    $city('a.card').each((_, card) => {
      const href = $city(card).attr('href');
      if (!href) return;
      const link = `https://www.knowafest.com/${href.replace(/^\//, '').replace('/events/', '/explore/events/')}`;
      const img = $city(card).find('img.card-img').attr('src');
      const poster = img ? img.replace('/thumbs/', '/uploads/') : null;
      const title = $city(card).find('p.card-text').text().trim() || 'Untitled Event';
      const type = $city(card).find('span.badge').text().trim() || 'external';
      const body = $city(card).find('.card-body p').text().trim();
      let location = null;
      let date = null;
      if (body && body.includes(' - ')) {
        const [loc, dt] = body.split(' - ', 2).map((part) => part.trim());
        location = loc || null;
        date = dt || null;
      }
      events.push({ title, poster, type, location, date, link });
    });
    logs.push(`Found ${events.length} total events including Coimbatore city`);
  }
  return events;
};

const crawlKnowafest = async ({ pages = 1, delayMs = 600, logs }) => {
  const all = [];

  for (let page = 1; page <= pages; page += 1) {
    try {
      const pageEvents = await fetchEventsPage(page, logs);
      all.push(...pageEvents);
    } catch (err) {
      logs.push(`Failed to read page ${page}: ${err.message}`);
    }

    if (page < pages && delayMs) {
      await sleep(delayMs);
    }
  }

  return all;
};

const generateDescription = async (event, logs) => {
  if (!HF_TOKEN) {
    logs.push('HF_TOKEN not set; using fallback description');
    return buildFallbackDescription(event);
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/v1/chat/completions',
      {
        model: HF_MODEL_ID,
        messages: [{ role: 'user', content: promptFromEvent(event) }],
        max_tokens: 160,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content?.trim();
    if (content) return content;
    logs.push('Empty response from model; using fallback description');
    return buildFallbackDescription(event);
  } catch (err) {
    logs.push(`Description generation failed for ${event.title}: ${err.message}`);
    return buildFallbackDescription(event);
  }
};

const appendNewNotices = async ({ events, limit, logs, broadcast }) => {
  const notices = readNotices();
  const existingLinks = new Set(notices.map((n) => n.link).filter(Boolean));
  const existingTitles = new Set(
    notices
      .map((n) => (n.title ? n.title.toLowerCase() : null))
      .filter(Boolean),
  );

  const newEvents = events.filter((event) => {
    if (event.link && existingLinks.has(event.link)) return false;
    if (!event.link && event.title && existingTitles.has(event.title.toLowerCase())) return false;
    return true;
  });

  logs.push(`New events after dedupe: ${newEvents.length}`);

  const cappedEvents = typeof limit === 'number' && limit > 0
    ? newEvents.slice(0, limit)
    : newEvents;

  const idFactory = makeIdFactory(getMaxIdNumber(notices));
  const addedNotices = [];

  for (const event of cappedEvents) {
    const description = await generateDescription(event, logs);
    const notice = {
      id: idFactory(),
      title: event.title || 'Untitled Event',
      content: description,
      type: event.type || 'external',
      link: event.link || null,
      image: event.poster || null,
      createdAt: new Date().toISOString(),
    };

    notices.push(notice);
    addedNotices.push(notice);
  }

  if (addedNotices.length) {
    saveNotices(notices);
    logs.push(`Saved ${addedNotices.length} notices to disk`);
    if (typeof broadcast === 'function') {
      broadcast(notices);
      logs.push('Broadcasted updated notices to WebSocket clients');
    }
  } else {
    logs.push('No new notices to save');
  }

  return { addedCount: addedNotices.length, totalNotices: notices.length };
};

const runCrawler = async ({ pages = 1, limit = 10, delayMs = 600, broadcast } = {}) => {
  const logs = [];

  const events = await crawlKnowafest({ pages, delayMs, logs });
  logs.push(`Total events fetched: ${events.length}`);

  const { addedCount, totalNotices } = await appendNewNotices({
    events,
    limit,
    logs,
    broadcast,
  });

  return {
    logs,
    totalEvents: events.length,
    added: addedCount,
    totalNotices,
  };
};

module.exports = {
  runCrawler,
};
