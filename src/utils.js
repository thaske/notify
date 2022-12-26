import * as cheerio from "cheerio";
import { exec } from "child_process";
import request from "./request.js";

async function getHTML(link) {
  const { data } = await request.get(link, {
    headers: {
      Referer: link,
      Host: new URL(link).hostname,
    },
  });

  return data;
}

function getStockStatus(data, selector) {
  const $ = cheerio.load(data);

  let status = $(selector).first().text().trim();
  if (status.length === 0) status = "OUT OF STOCK";

  return status;
}

function onSuccess(site, status) {
  if (status === site.IN_STOCK || status != site.SOLD_OUT) {
    exec(`afplay /System/Library/Sounds/Glass.aiff`);
    exec(`open -a Safari ${site.LINK}`);

    process.exit(0);
  }
}

function logStatus(site, status) {
  console.log(`${new Date().toLocaleTimeString()}\t${status}\t${site.NAME}`);
}

export { getHTML, getStockStatus, logStatus, onSuccess };
