const puppeteer = require("puppeteer");
const expect = require("chai").expect;

const config = require("../lib/config");
const funkctions = require("../lib/helpers");

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
    await funkctions.loadUrl(page, config.baseURl);
    await funkctions.typeText(page, loginPage.emailInput, "admin@gmail.com");
    await funkctions.typeText(page, loginPage.passwordInput, "admin");
    await funkctions.click(page, loginPage.loginBtn);
    await funkctions.shouldExist(page, homePage.nearestEventsBlock);
  });

  it("go to Rate page from Home page", async () => {
    await funkctions.shouldExist(page, homePage.rateNavLink);
    await funkctions.click(page, homePage.rateNavLink);
    await funkctions.shouldExist(page, ratePage.pointsPannelHeading);
    await funkctions.shouldExist(page, ratePage.usersTabContent);
  });

  it("check that logged in user doesnt see himself name in rate table", async () => {
    const innerUsersText = await page.evaluate(() => {
      return document.querySelector(".tab-content").innerText;
    });
    expect(innerUsersText).to.not.contains("Admin");
  });

  it("try to rate any user with empty reason input", async () => {
    await funkctions.click(page, ratePage.upVoteBtn);
    await page.waitFor(200); //timeout is needed because of voteBtn visibility
    await funkctions.shouldExist(page, ratePage.modalForm);

    await funkctions.click(page, ratePage.voteBtn);
    await funkctions.shouldExist(page, ratePage.modalForm, true);

    await funkctions.click(page, ratePage.cancelBtn);
    await funkctions.shouldExist(page, ratePage.modalForm, false);
  });

  it("try to rate any user with reason shorter than 3 characters", async () => {
    await page.waitFor(300);
    await funkctions.click(page, ratePage.upVoteBtn);
    await funkctions.shouldExist(page, ratePage.modalForm);
    await page.waitFor(300);

    await funkctions.click(page, ratePage.reasonTextarea);
    await funkctions.typeText(page, ratePage.reasonTextarea, "12");
    await funkctions.click(page, ratePage.voteBtn);

    await funkctions.shouldExist(page, ratePage.alertError);

    const element = await page.$(ratePage.alertError);
    const text = await page.evaluate(element => element.textContent, element);
    expect(text).to.contain("The reason must be at least 3 characters.");
  });
});

describe("Positive tests for Rate page", () => {
  it("rate any user with valid reason", async () => {
    await funkctions.click(page, ratePage.upVoteBtn);
    await funkctions.shouldExist(page, ratePage.modalForm);
    await page.waitFor(300);

    await funkctions.click(page, ratePage.reasonTextarea);
    await funkctions.typeText(page, ratePage.reasonTextarea, "test");
    await funkctions.click(page, ratePage.voteBtn);

    await funkctions.shouldExist(page, ratePage.alertSuccess);

    const element = await page.$(ratePage.alertSuccess);
    const text = await page.evaluate(element => element.textContent, element);
    expect(text).to.contain("You voted successfully!");
  });

  it("Unvote user", async () => {
    //needed for clean up data - because tests are cycled
    await funkctions.shouldExist(page, ratePage.downVoteBtn);
    await funkctions.click(page, ratePage.downVoteBtn);
    await funkctions.shouldExist(page, ratePage.alertSuccess);

    const element = await page.$(ratePage.alertSuccess);
    const text = await page.evaluate(element => element.textContent, element);
    expect(text).to.contain("You removed your vote successfully!");

    await funkctions.shouldExist(page, ratePage.upVoteBtn);
  });
});
