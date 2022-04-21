import axios from "axios";
import notifier from "node-notifier";
import * as cheerio from "cheerio";
import { exec } from "child_process";
import cron from "node-cron";

const url = "***REMOVED***";

async function main() {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const status = $("div.buybox span.btn").first().text();
  console.log(status);

  if (status === "Buy") {
    notifier.notify({
      title: "In stock",
      message: "***REMOVED***",
    });
    notifier.on("click", () => {
      exec(`open -a "Google Chrome" ${url}`);
      process.exit(1);
    });
  }
}

cron.schedule("*/15 * * * * *", main);
