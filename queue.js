const { Queue } = require("bullmq");
require("dotenv").config();

const redisOptions = { connection: { host: "localhost", port: 6379 } };
const crawlQueue = new Queue("crawlQueue", redisOptions);

module.exports = crawlQueue;
