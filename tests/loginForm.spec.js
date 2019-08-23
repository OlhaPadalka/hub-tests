const puppeteer = require("puppeteer");
const expect = require("chai").expect;

const config = require("../lib/config");
const functions = require("../lib/helpers");
const utils = require("../lib/utils");

const loginPageLocator = require("../page-objects/login.page");
const homePageLocator = require("../page-objects/home.page");

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
  await browser.close();
});

describe("Login page invalid tests", () => {
  it("Showing exceptions when inputs were empty", async () => {
    await functions.loadUrl(page, config.baseURl);

    await functions.waitForText(page, "body", "Login");

    await functions.click(page, loginPageLocator.loginBtn);
    await functions.shouldExist(page, loginPageLocator.helpText);
  });

  it("Invalid log in ", async () => {
    await functions.typeText(page, loginPageLocator.emailInput, utils.generateEmail());
    await functions.typeText(page, loginPageLocator.passwordInput, utils.generateID(5));
    await functions.click(page, loginPageLocator.loginBtn);
    await functions.shouldExist(page, loginPageLocator.helpText);
  });
});

describe("Forgot password page", () => {
  it('Click on the "Forgot password" button', async () => {
    await functions.loadUrl(page, config.baseURl);
    await functions.shouldExist(page, loginPageLocator.emailInput);

    await functions.click(page, loginPageLocator.rememberMeBtn);
    await functions.shouldExist(page, loginPageLocator.emailInput);

    const url = page.url();
    await expect(url).to.contain(
      "https://hub-staging.clockwise.software/password/reset"
    );
  });

  it("Send new password", async () => {
    await functions.typeText(page, loginPageLocator.emailInput, "admin@gmail.com");
    await functions.click(page, loginPageLocator.loginBtn);
    await functions.shouldExist(page, loginPageLocator.alertSucces);
  });

  it("Back to login page", async () => {
    await functions.click(page, loginPageLocator.loginBackBtn);
    await functions.shouldExist(page, loginPageLocator.passwordInput);

    const url = page.url();
    await expect(url).to.contain(
      "https://hub-staging.clockwise.software/login"
    );
  });
});

describe("Login page tests", () => {
  it("Open the page", async () => {
    await functions.loadUrl(page, config.baseURl);
    await functions.shouldExist(page, loginPageLocator.emailInput);

    const url = await page.url();
    const title = await page.title();

    expect(url).to.contain("https://hub-staging.clockwise.software/login");
    expect(title).to.contains("Clockwise Hub");
  });

  it('Select the "Remember me" chackbox', async () => {
    await functions.click(page, loginPageLocator.checkbox);

    const onCheckbox = await page.evaluate(() => {
      return document.querySelector('input[type="checkbox"]').checked;
    });

    expect(onCheckbox).to.equal(true);
  });

  it("Valid log in", async () => {
    await functions.typeText(page, loginPageLocator.emailInput, "admin@gmail.com");
    await functions.typeText(page, loginPageLocator.passwordInput, "admin");
    await functions.click(page, loginPageLocator.loginBtn);
    await functions.shouldExist(page, homePageLocator.nearestEventsBlock);

    const url = await page.url();
    expect(url).to.contain("https://hub-staging.clockwise.software/home");
  });
});
