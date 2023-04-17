import axios from "axios";
import cron from "node-cron";
import * as cheerio from "cheerio";
import { exec } from "child_process";
import Push from "pushover-notifications";

const {
  PUSHOVER_USER,
  PUSHOVER_TOKEN,
  SITE_NAME,
  PRODUCT_URL,
  PRODUCT_NAME,
  JS_SELECTOR,
  OUT_OF_STOCK_TEXT,
  CHECK_INTERVAL_IN_MINUTES,
} = process.env;

const request = axios.create({
  headers: {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
    Connection: "keep-alive",
    DNT: "1",
  },
});

const push = new Push({
  user: PUSHOVER_USER,
  token: PUSHOVER_TOKEN,
});

function logStatus(status) {
  console.log(`${new Date().toLocaleTimeString()}\t${status}\t${SITE_NAME}`);
}

function notifyLocallyAndQuit() {
  exec(`afplay /System/Library/Sounds/Glass.aiff`);
  exec(`open -a "Google Chrome" ${PRODUCT_URL}`);

  process.exit(0);
}

function notifyPushover() {
  push.send(
    {
      message: `${PRODUCT_NAME} is in stock!`,
      title: "Stock Alert",
      sound: "magic",
      priority: 1,
      url: PRODUCT_URL,
      url_title: "Buy Now",
    },
    (err, result) => {
      if (err) throw err;
    }
  );
}

function sendErrorNotification(error) {
  push.send(
    {
      message: `Error checking ${PRODUCT_NAME} stock:\n\n${error.message}`,
      title: "Error",
      sound: "magic",
      priority: 1,
    },
    (err, result) => {
      if (err) throw err;
    }
  );
}

async function getHTML() {
  const { data } = await request.get(PRODUCT_URL, {
    headers: {
      Referer: PRODUCT_URL,
      Host: new URL(PRODUCT_URL).hostname,
    },
  });

  return data;
}

function getStockStatus(data) {
  const $ = cheerio.load(data);

  let status = $(JS_SELECTOR).first().text().trim();
  console.log(status);
  if (status.length === 0) status = "OUT OF STOCK";

  return status;
}

async function isProductInStock() {
  const html = await getHTML();
  const status = getStockStatus(html);

  return status !== OUT_OF_STOCK_TEXT;
}

const check = async () => {
  try {
    const inStock = await isProductInStock();

    if (inStock) {
      logStatus("IN STOCK");
      notifyPushover();
    } else {
      logStatus("OUT OF STOCK");
    }
  } catch (error) {
    sendErrorNotification(error);
    console.error(error.message);
  }
};

cron.schedule(`*/${CHECK_INTERVAL_IN_MINUTES} * * * *`, check);
