import fs from "fs";
import axios from "axios";
import jsonc from "jsonc";
import cron from "node-cron";
import * as cheerio from "cheerio";
import { exec } from "child_process";

const { SECONDS } = process.env;
const SITES = jsonc.parse(fs.readFileSync("sites.jsonc", "utf8"));

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

cron.schedule(`*/${SECONDS ?? 15} * * * * *`, async () => {
  const promises = Object.entries(SITES).map(
    async ([site, { LINK, SELECTOR, INSTOCK }]) => {
      try {
        const { data } = await request.get(LINK, {
          headers: {
            Referer: LINK,
            Host: new URL(LINK).hostname,
          },
        });

        const $ = cheerio.load(data);

        let status = $(SELECTOR).first().text().trim();
        if (status.length === 0) status = "OUT OF STOCK";

        console.log(`${new Date().toLocaleTimeString()}\t${status}\t${site}`);

        if (status === INSTOCK) {
          exec(`open -a "Google Chrome" ${URL}`);
          process.exit(0);
        }
      } catch (error) {
        console.error(error);
      }
    }
  );

  await Promise.all(promises);
});
