import axios from "axios";
import cron from "node-cron";
import * as cheerio from "cheerio";
import notifier from "node-notifier";
import { exec } from "child_process";

const { URL, SELECTOR, INSTOCK } = process.env;

async function main() {
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  const status = $(SELECTOR).first().text();

  process.stdout.cursorTo(0);
  process.stdout.write(`${new Date().toLocaleTimeString()}\t${status}`);

  if (status === INSTOCK) {
    exec(`open -a "Google Chrome" ${URL}`);
    notifier.notify("In stock");
    process.exit(0);
  }
}

cron.schedule("*/15 * * * * *", main);
