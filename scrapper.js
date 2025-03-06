const puppeteer = require("puppeteer");
const { Client } = require("pg");
require("dotenv").config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
});


(async () => {
  await db.connect();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // Generate URLs dynamically from product/1 to product/28
  const productUrls = [];
  for (let i = 1; i <= 28; i++) {
    productUrls.push(`https://web-scraping.dev/product/${i}`);
  }
  for (const url of productUrls) {
    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      // Extract product name
      const productName = await page.$eval(".product-title", (el) => el.innerText);
      // Extract product price
      const productPrice = await page.$eval(".product-price", (el) =>
        parseFloat(el.innerText.replace("$", ""))
      );
      console.log(`Scraped: ${productName} - $${productPrice}`);
      // Store in PostgreSQL
      await db.query(
        "INSERT INTO products (name, price, url) VALUES ($1, $2, $3) ON CONFLICT (url) DO NOTHING",
        [productName, productPrice, url]
      );
    } catch (error) {
      console.error(`Error scraping ${url}: ${error.message}`);
    }
  }
  await browser.close();
  await db.end();
  console.log("✅ Scraping completed!");
})();
