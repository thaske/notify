import fs from "fs";
import axios from "axios";
import jsonc from "jsonc";
import cron from "node-cron";
import * as cheerio from "cheerio";
import { exec } from "child_process";

const { SECONDS } = process.env;
const sites = jsonc.parse(fs.readFileSync("sites.jsonc", "utf8"));

cron.schedule(`*/${SECONDS ?? 15} * * * * *`, async () => {
  const promises = Object.values(sites).map(
    async ({ URL, SELECTOR, INSTOCK }) => {
      try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        let status = $(SELECTOR).first().text().trim();
        if (status.length === 0) {
          status = "OUT OF STOCK";
        }

        console.log(`${new Date().toLocaleTimeString()}\t${status}\t${URL}`);

        if (status === INSTOCK) {
          exec(`open -a "Google Chrome" ${URL}`);
          process.exit(0);
        }
      } catch (error) {
        console.error(error, URL);
      }
    }
  );

  await Promise.all(promises);
});
