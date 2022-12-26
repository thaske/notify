import fs from "fs";
import jsonc from "jsonc";
import cron from "node-cron";
import { getHTML, getStockStatus, logStatus, onSuccess } from "./utils.js";

const SITES = jsonc.parse(fs.readFileSync("sites.jsonc", "utf8"));

SITES.forEach((site, index) => {
  cron.schedule(`${(60 / SITES.length) * index} * * * * *`, async () => {
    try {
      const html = await getHTML(site.LINK);
      const status = getStockStatus(html, site.SELECTOR);

      logStatus(site, status);
      onSuccess(site, status);
    } catch (error) {
      console.error(error);
    }
  });
});
