import axios from "axios";
import cron from "node-cron";
import * as cheerio from "cheerio";
import { exec } from "child_process";

const { URL, SELECTOR, INSTOCK, SECONDS } = process.env;

const cronInterval = `*/${SECONDS ?? 15} * * * * *`;

cron.schedule(cronInterval, async () => {
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  const status = $(SELECTOR).first().text();

  console.log(`${new Date().toLocaleTimeString()}\t${status}`);

  if (status === INSTOCK) {
    exec(`open -a "Google Chrome" ${URL}`);
    process.exit(0);
  }
});
