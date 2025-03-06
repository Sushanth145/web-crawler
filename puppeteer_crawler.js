const puppeteer = require("puppeteer");
const db = require("./db");
const crawlQueue = require("./queue");

async function crawlPage(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`Crawling: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Extract title and content
    const title = await page.title();
    const content = await page.evaluate(() => document.body.innerText);

    await saveToDatabase(url, title, content);

    // Extract links
    const links = await page.$$eval("a", (anchors) =>
      anchors.map((a) => a.href).filter((href) => href.startsWith("http"))
    );

    await addLinksToQueue(links);
  } catch (error) {
    console.error(`Error crawling ${url}: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function saveToDatabase(url, title, content) {
  try {
    await db.query(
      "INSERT INTO scraped_data (url, title, content) VALUES ($1, $2, $3) ON CONFLICT (url) DO NOTHING",
      [url, title, content]
    );
    console.log(`Saved to DB: ${url}`);
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
  }
}

async function addLinksToQueue(links) {
  for (let link of links) {
    await crawlQueue.add("crawl", { url: link });
  }
}

module.exports = { crawlPage };
