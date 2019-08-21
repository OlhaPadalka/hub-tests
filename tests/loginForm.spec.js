const puppeteer = require("puppeteer");
const expect = require("chai").expect;

const config = require("../lib/config");
const funkctions = require("../lib/helpers");
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
    await funkctions.loadUrl(page, config.baseURl);

    await funkctions.waitForText(page, "body", "Login");

    await funkctions.click(page, loginPageLocator.loginBtn);
    await funkctions.shouldExist(page, loginPageLocator.helpText);
  });

  it("Invalid log in ", async () => {
    await funkctions.typeText(page, loginPageLocator.emailInput, utils.generateEmail());
    await funkctions.typeText(page, loginPageLocator.passwordInput, utils.generateID(5));
    await funkctions.click(page, loginPageLocator.loginBtn);
    await funkctions.shouldExist(page, loginPageLocator.helpText);
  });
});

describe("Forgot password page", () => {
  it('Click on the "Forgot password" button', async () => {
    await funkctions.loadUrl(page, config.baseURl);
    await funkctions.shouldExist(page, loginPageLocator.emailInput);

    await funkctions.click(page, loginPageLocator.rememberMeBtn);
    await funkctions.shouldExist(page, loginPageLocator.emailInput);

    const url = page.url();
    await expect(url).to.contain(
      "https://hub-staging.clockwise.software/password/reset"
    );
  });

  it("Send new password", async () => {
    await funkctions.typeText(page, loginPageLocator.emailInput, "admin@gmail.com");
    await funkctions.click(page, loginPageLocator.loginBtn);
    await funkctions.shouldExist(page, loginPageLocator.alertSucces);
  });

  it("Back to login page", async () => {
    await funkctions.click(page, loginPageLocator.loginBackBtn);
    await funkctions.shouldExist(page, loginPageLocator.passwordInput);

    const url = page.url();
    await expect(url).to.contain(
      "https://hub-staging.clockwise.software/login"
    );
  });
});

describe("Login page tests", () => {
  it("Open the page", async () => {
    await funkctions.loadUrl(page, config.baseURl);
    await funkctions.shouldExist(page, loginPageLocator.emailInput);

    const url = await page.url();
    const title = await page.title();

    expect(url).to.contain("https://hub-staging.clockwise.software/login");
    expect(title).to.contains("Clockwise Hub");
  });

  it('Select the "Remember me" chackbox', async () => {
    await funkctions.click(page, loginPageLocator.checkbox);

    const onCheckbox = await page.evaluate(() => {
      return document.querySelector('input[type="checkbox"]').checked;
    });

    expect(onCheckbox).to.equal(true);
  });

  it("Valid log in", async () => {
    await funkctions.typeText(page, loginPageLocator.emailInput, "admin@gmail.com");
    await funkctions.typeText(page, loginPageLocator.passwordInput, "admin");
    await funkctions.click(page, loginPageLocator.loginBtn);
    await funkctions.shouldExist(page, homePageLocator.nearestEventsBlock);

    const url = await page.url();
    expect(url).to.contain("https://hub-staging.clockwise.software/home");
  });
});
