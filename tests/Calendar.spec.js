const puppeteer = require("puppeteer");
const expect = require("chai").expect;
const config = require("../lib/config");

let browser;
let page;

before(async () => {
  browser = await puppeteer.launch({
    headless: config.isHeadLess,
    slowMo: config.slowMo,
    devtools: config.devtools,
    timeout: config.launchTimeout
  });
  page = await browser.newPage();
  await page.setDefaultTimeout(config.waitingTimeout);
  await page.setViewport({
    width: config.viewportWeiht,
    height: config.viewportHeight
  });
});

after(async () => {
  //await page.waitFor(3000);
  await browser.close();
});

describe("Calendar test, as a user", () => {
  it("", () => {});
});
