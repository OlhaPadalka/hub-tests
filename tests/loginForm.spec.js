const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const config = require('../lib/config');

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
        await page.waitForSelector(".btn.btn-primary");
        await page.click(".btn.btn-primary");
        await page.waitForSelector(".help-block");
    });

    it('Invalid log in ', async () => {
        await page.type("#email", "admin@gmail.com");
        await page.type("#password", "admin1");
        await page.click(".btn.btn-primary");
        await page.waitForSelector(".help-block");
    });
});

describe('Forgot password page', () => {

    it('Click on the "Forgot password" button',async () => {
        await page.goto(config.baseURl);
        await page.waitForSelector("#email");

        await page.click(".btn.btn-link");
        await page.waitForSelector("#email");

        const url = page.url();
        await expect(url).to.contain("https://hub-staging.clockwise.software/password/reset");
    });

    it('Send new password', async () => {
        await page.type("#email","admin@gmail.com");
        await page.click(".btn.btn-primary");
        await page.waitForSelector(".alert.alert-success");
    });

    it('Back to login page', async () => {
        await page.click(".nav.navbar-nav.navbar-right");
        await page.waitForSelector("#password");

        const url = page.url();
        await expect(url).to.contain("https://hub-staging.clockwise.software/login");
    });
});

describe('Login page tests', () => {

    it('Open the page', async () => {
        //await page.goto("https://hub-staging.clockwise.software/login");
        await page.goto(config.baseURl);
        await page.waitForSelector("#email");

        const url = await page.url();
        const title = await page.title();

        expect(url).to.contain("https://hub-staging.clockwise.software/login");
        expect(title).to.contains("Clockwise Hub");
    });

    // it('Select the "Remember me" chackbox', async () => {
    //     await page.click(".checkbox");
    // });

    it('Valid log in', async () => {
        await page.type("#email", "admin@gmail.com");
        await page.type("#password", "admin");
        await page.click(".btn.btn-primary");
        await page.waitForSelector("#nearest_events");

        const url = await page.url();
        expect(url).to.contain("https://hub-staging.clockwise.software/home");
    });
});