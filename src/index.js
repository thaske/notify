import fs from "fs";
import jsonc from "jsonc";
import cron from "node-cron";
import { getHTML, getStockStatus, logStatus, onSuccess } from "./utils.js";

const SITES = jsonc.parse(fs.readFileSync("sites.jsonc", "utf8"));

const check = async (site) => {
  try {
    const html = await getHTML(site.LINK);
    const status = getStockStatus(html, site.SELECTOR);

    logStatus(site, status);
    onSuccess(site, status);
  } catch (error) {
    console.error(error.message);
  }
}

SITES.forEach((site, index) => {
  cron.schedule(`${(60 / SITES.length) * index} * * * * *`, check(site));
});
