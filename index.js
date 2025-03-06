const crawlQueue = require("./queue");

async function startCrawling() {
  const startUrl = "https://www.google.com"; // Change this URL
  await crawlQueue.add("crawl", { url: startUrl });
  console.log("Crawl started...");
}

startCrawling();