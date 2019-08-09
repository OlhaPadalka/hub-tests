const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const config = require('../lib/config');
const loginPageLocator = require('../page-objects/login.page');
const homePageLocator = require('../page-objects/home.page');

let browser;
let page;

before(async () => {
    browser = await puppeteer.launch({
        headless: config.isHeadLess,
        slowMo: config.slowMo,
        devtools: config.devtools,
        timeout: config.launchTimeout,
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

describe('Login page invalid tests', () => {

    it('Showing exceptions when inputs were empty', async () => {
        //await page.goto("https://hub-staging.clockwise.software/login");
        await page.goto(config.baseURl);
        await page.waitForSelector(loginPageLocator.loginBtn);
        await page.click(loginPageLocator.loginBtn);
        await page.waitForSelector(loginPageLocator.helpText);
    });

    it('Invalid log in ', async () => {
        await page.type(loginPageLocator.emailInput, "admin@gmail.com");
        await page.type(loginPageLocator.passwordInput, "admin1");
        await page.click(loginPageLocator.loginBtn);
        await page.waitForSelector(loginPageLocator.helpText);
    });
});

describe('Forgot password page', () => {

    it('Click on the "Forgot password" button',async () => {
        await page.goto(config.baseURl);
        await page.waitForSelector(loginPageLocator.emailInput);

        await page.click(loginPageLocator.rememberMeBtn);
        await page.waitForSelector(loginPageLocator.emailInput);

        const url = page.url();
        await expect(url).to.contain("https://hub-staging.clockwise.software/password/reset");
    });

    it('Send new password', async () => {
        await page.type(loginPageLocator.emailInput,"admin@gmail.com");
        await page.click(loginPageLocator.loginBtn);
        await page.waitForSelector(loginPageLocator.alertSucces);
    });

    it('Back to login page', async () => {
        await page.click(loginPageLocator.loginBackBtn);
        await page.waitForSelector(loginPageLocator.passwordInput);

        const url = page.url();
        await expect(url).to.contain("https://hub-staging.clockwise.software/login");
    });
});

describe('Login page tests', () => {

    it('Open the page', async () => {
        //await page.goto("https://hub-staging.clockwise.software/login");
        await page.goto(config.baseURl);
        await page.waitForSelector(loginPageLocator.emailInput);

        const url = await page.url();
        const title = await page.title();

        expect(url).to.contain("https://hub-staging.clockwise.software/login");
        expect(title).to.contains("Clockwise Hub");
    });

    // it('Select the "Remember me" chackbox', async () => {
    //     await page.click(".checkbox");
    // });

    it('Valid log in', async () => {
        await page.type(loginPageLocator.emailInput, "admin@gmail.com");
        await page.type(loginPageLocator.passwordInput, "admin");
        await page.click(loginPageLocator.loginBtn);
        await page.waitForSelector(homePageLocator.nearestEventsBlock);

        const url = await page.url();
        expect(url).to.contain("https://hub-staging.clockwise.software/home");
    });
});