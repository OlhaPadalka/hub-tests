const puppeteer = require('puppeteer');
const expect = require('chai').expect;

describe('Login page tests', () => {
    let browser;
    let page;

    before(async () => {
        browser = await puppeteer.launch({
            headless: true,
            slowMo: 0,
            devtools: false,
            timeout: 10000,
        });
        page = await browser.newPage();
        await page.setViewport({
            width: 800,
            height: 600
        });
    });

    after(async () => {
        //await page.waitFor(3000);
        await browser.close();
    });

    it('Open the page', async () => {
        await page.goto("https://hub-staging.clockwise.software/login");
        await page.waitForSelector("#email");

        const url = await page.url();
        const title = await page.title();

        expect(url).to.contain("https://hub-staging.clockwise.software/login");
        expect(title).to.contains("Clockwise Hub");
    });

    it('Valid log in', async () => {
        await page.type("#email", "admin@gmail.com");
        await page.type("#password", "admin");
        await page.click(".btn.btn-primary");
        await page.waitForSelector("#nearest_events");

        const url = await page.url();
        expect(url).to.contain("https://hub-staging.clockwise.software/home");
    });
});

describe('Login page invalid tests', () => {
    let browser;
    let page;

    before(async () => {
        browser = await puppeteer.launch({
            headless: true,
            slowMo: 0,
            devtools: false,
            timeout: 10000,
        });
        page = await browser.newPage();
        await page.setViewport({
            width: 800,
            height: 600
        });
    });

    after(async () => {
        //await page.waitFor(3000);
        await browser.close();
    });

    it('Showing exceptions when inputs were empty', async () => {
        await page.goto("https://hub-staging.clockwise.software/login");

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