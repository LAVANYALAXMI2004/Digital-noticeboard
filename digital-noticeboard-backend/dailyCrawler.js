// dailyCrawler.js
const { runCrawler } = require('./services/knowafestCrawler');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, './data/notices.json');

const runDailyCrawler = async () => {
  // Delete previous day's data
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  // Run crawler and save new data
  await runCrawler({ pages: 1, limit: 10 });
  console.log('Daily crawler completed and replaced notices.json');
};

runDailyCrawler();
