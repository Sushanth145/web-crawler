const { Worker } = require("bullmq");
const { crawlPage } = require("./puppeteer_crawler");

const redisOptions = { connection: { host: "localhost", port: 6379 } };

const worker = new Worker(
  "crawlQueue",
  async (job) => {
    await crawlPage(job.data.url);
  },
  redisOptions
);

console.log("Worker started...");
