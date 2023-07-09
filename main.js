import puppeteer, {TimeoutError} from "puppeteer";
import axios from "axios";
import {URL, URLSearchParams} from 'url';

import * as cheerio from "cheerio";

import {sleep, messageLogger, createTimestamp} from "./src/util.js";

const articlesUrl = "https://beveragegroup.herokuapp.com/finland-article-favorites"
const saveUrl = "https://beveragegroup.herokuapp.com/finland-article-stock-batch"

const menuSelector = "body > div.store-stock-container > div.medium-up-dropdown-wrap.hide-for-small-only.clearfix > ul > li > ul";

const getStoresUrl = (id) => `https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/en_US/-/EUR/ViewProduct-Include?SKU=${id}&AppendStoreList=true&AjaxRequestMarker=true&AjaxRequestMarker=true`

const main = async () => {
  const start = new Date().getTime();
  const response = await axios.get(articlesUrl);
  const articles = response.data.data;

  if (articles.length < 1) {
    console.log("No articles")
    return;
  }

  let browser = await puppeteer.launch({headless: "new"});
  let page = await browser.newPage();

  for (const article of articles) {
    await page.goto(getStoresUrl(article.articleNr));

    try {
      await page.waitForSelector(menuSelector, {
        visible: true,
        timeout: 10000,
      });
    } catch (error) {
      if (error instanceof TimeoutError) {
        messageLogger(article, "# Error #  Menu not found");
      }
      continue;
    }
    const content = await page.content();

    const $ = cheerio.load(content);

    const urls = [];
    $('a[data-url]').each((index, element) => {
      const url = $(element).attr('data-url');
      urls.push(url);
    });

    if (urls.length < 1) {
      messageLogger(article,
          "# Error # No urls: " + getStoresUrl(article.articleNr))
      continue;
    }

    const collectedData = [];

    for (const urlData of urls) {

      const url = new URL(urlData);
      const searchParams = new URLSearchParams(url.search);

      const storeId = searchParams.get('StoreID');
      const storeStock = searchParams.get('StoreStock');
      collectedData.push({
        "articleNr": article.articleNr,
        "storeNr": storeId,
        "stock": storeStock,
      })
    }

    const res = await axios.post(saveUrl, {
      articleNr: article.articleNr,
      stocks: collectedData,
    });

    if (res.status === 200) {
      messageLogger(article, "Successfully saved.")
    } else {
      messageLogger(article, `Error:  ${res.status}`);
    }
    await sleep(1000);
  }

  await browser.close();
  const duration = new Date().getTime() - start;
  console.log(`Took ${duration / 1000}s`);
}

main()
.then(() => console.log("Done!"))
.catch((error) => {
  console.log(error);
  console.log("Failed!");
});
