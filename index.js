import cron from "node-cron";
import puppeteer from "puppeteer";
import playwright from "playwright";
import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";

const { URL, SELECTOR, INSTOCK } = process.env;

// read headers from headers.json
const headers = JSON.parse(fs.readFileSync("headers.json"));

async function getProductStatus() {
  const response = await fetch(
    "https://www.bhphotovideo.com/api/item/p/product-details?from=cli&aperture=1",
    {
      headers,
      body: {
        params: {
          itemList: [{ skuNo: 1542674, itemSource: "REG" }],
          channels: ["priceInfo"],
          channelParams: {
            priceInfo: { PRICING_CONTEXT: "DETAILS_CART_LAYER" },
          },
        },
      },
      method: "POST",
    }
  );

  const data = await response.json();

  // write to file
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

getProductStatus();

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//   });
//   const page = await browser.newPage();
//   await page.goto(URL);

//   cron.schedule("*/15 * * * * *", async () => {
//     try {
//       const status = await page
//         .$(SELECTOR)
//         .then((el) => el.getProperty("textContent"))
//         .then((text) => text.jsonValue());

//       console.log(`${new Date().toLocaleTimeString()}\t${status}`);

//       if (status === INSTOCK) {
//         exec(`open -a "Google Chrome" ${URL}`);
//         process.exit(0);
//       } else {
//         await page.reload();
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   });
// })();
