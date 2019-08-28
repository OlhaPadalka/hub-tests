const puppeteer = require("puppeteer");
const expect = require("chai").expect;

const config = require("../lib/config");
const functions = require("../lib/helpers");

const loginPage = require("../page-objects/login.page");
const homePage = require("../page-objects/home.page");
const ratePage = require("../page-objects/rate.page");

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

describe("Negative tests for Rate page", () => {
  it("log in to hub as an admin", async () => {
    await functions.loadUrl(page, config.baseURl);
    await functions.typeText(page, loginPage.emailInput, "admin@gmail.com");
    await functions.typeText(page, loginPage.passwordInput, "admin");
    await functions.click(page, loginPage.loginBtn);
    await functions.shouldExist(page, homePage.nearestEventsBlock);
  });

  it("go to Rate page from Home page", async () => {
    await functions.shouldExist(page, homePage.rateNavLink);
    await functions.click(page, homePage.rateNavLink);
    await functions.shouldExist(page, ratePage.pointsPannelHeading);
    await functions.shouldExist(page, ratePage.usersTabContent);
  });

  it("check that logged in user doesnt see himself name in rate table", async () => {
    const innerUsersText = await page.evaluate(() => {
      return document.querySelector(".tab-content").innerText;
    });
    expect(innerUsersText).to.not.contains("Admin");
  });

  it("try to rate any user with empty reason input", async () => {
    await functions.click(page, ratePage.upVoteBtn);
    await page.waitFor(200); //timeout is needed because of voteBtn visibility
    await functions.shouldExist(page, ratePage.modalForm);

    await functions.click(page, ratePage.voteBtn);
    await functions.shouldExist(page, ratePage.modalForm, true);

    await functions.click(page, ratePage.cancelBtn);
    await functions.shouldExist(page, ratePage.modalForm, false);
  });

  it("try to rate any user with reason shorter than 3 characters", async () => {
    await page.waitFor(300);
    await functions.click(page, ratePage.upVoteBtn);
    await functions.shouldExist(page, ratePage.modalForm);
    await page.waitFor(300);

    await functions.click(page, ratePage.reasonTextarea);
    await functions.typeText(page, ratePage.reasonTextarea, "12");
    await functions.click(page, ratePage.voteBtn);

    await functions.shouldExist(page, ratePage.alertError);

    const element = await page.$(ratePage.alertError);
    const text = await page.evaluate(element => element.textContent, element);
    expect(text).to.contain("The reason must be at least 3 characters.");
  });
});

describe("Positive tests for Rate page", () => {
  it("rate any user with valid reason", async () => {
    await functions.click(page, ratePage.upVoteBtn);
    await functions.shouldExist(page, ratePage.modalForm);
    await page.waitFor(300);

    await functions.click(page, ratePage.reasonTextarea);
    await functions.typeText(page, ratePage.reasonTextarea, "test");
    await functions.click(page, ratePage.voteBtn);

    await functions.shouldExist(page, ratePage.alertSuccess);

    const element = await page.$(ratePage.alertSuccess);
    const text = await page.evaluate(element => element.textContent, element);
    expect(text).to.contain("You voted successfully!");
  });

  it("Unvote user", async () => {
    //needed for clean up data - because tests are cycled
    await functions.shouldExist(page, ratePage.downVoteBtn);
    await functions.click(page, ratePage.downVoteBtn);
    await functions.shouldExist(page, ratePage.alertSuccess);

    const element = await page.$(ratePage.alertSuccess);
    const text = await page.evaluate(element => element.textContent, element);
    expect(text).to.contain("You removed your vote successfully!");

    await functions.shouldExist(page, ratePage.upVoteBtn);
  });
});
