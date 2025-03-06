import scrapy
import psycopg2
import redis

# PostgreSQL Connection
conn = psycopg2.connect("dbname=webcrawler user=username password=password host=localhost")
cursor = conn.cursor()

# Redis Connection
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

class WebSpider(scrapy.Spider):
    name = "webspider"

    def __init__(self, start_url=None, *args, **kwargs):
        super(WebSpider, self).__init__(*args, **kwargs)
        self.start_urls = [start_url]

    def parse(self, response):
        title = response.xpath("//title/text()").get()
        content = response.xpath("//body//text()").getall()
        content = " ".join(content).strip()

        # Save to PostgreSQL
        cursor.execute(
            "INSERT INTO scraped_data (url, title, content) VALUES (%s, %s, %s) ON CONFLICT (url) DO NOTHING",
            (response.url, title, content),
        )
        conn.commit()

        # Extract links and add to Redis queue
        for href in response.css("a::attr(href)").getall():
            if href.startswith("http"):
                redis_client.sadd("url_queue", href)

# Start crawling using: scrapy runspider scrapy_crawler.py -a start_url="https://example.com"
