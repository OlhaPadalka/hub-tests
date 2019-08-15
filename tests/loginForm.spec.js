const puppeteer = require('puppeteer');
const expect = require('chai').expect;

const config = require('../lib/config');
const click = require('../lib/helpers').click;
const typeText = require('../lib/helpers').typeText;
const loadUrl = require('../lib/helpers').loadUrl;

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
    await browser.close();
});

describe('Login page invalid tests', () => {

    it('Showing exceptions when inputs were empty', async () => {
        await loadUrl(page, config.baseURl);
        await click(page, loginPageLocator.loginBtn)
        await page.waitForSelector(loginPageLocator.helpText);
    });

    it('Invalid log in ', async () => {
        await typeText(page, loginPageLocator.emailInput, "admin@gmail.com");
        await typeText(page, loginPageLocator.passwordInput, "admin1");
        await click(page, loginPageLocator.loginBtn);
        await page.waitForSelector(loginPageLocator.helpText);
    });
});

describe('Forgot password page', () => {

    it('Click on the "Forgot password" button',async () => {
        await loadUrl(page, config.baseURl);
        await page.waitForSelector(loginPageLocator.emailInput);

        await click(page, loginPageLocator.rememberMeBtn);
        await page.waitForSelector(loginPageLocator.emailInput);

        const url = page.url();
        await expect(url).to.contain("https://hub-staging.clockwise.software/password/reset");
    });

    it('Send new password', async () => {
        await typeText(page, loginPageLocator.emailInput,"admin@gmail.com");
        await click(page, loginPageLocator.loginBtn);
        await page.waitForSelector(loginPageLocator.alertSucces);
    });

    it('Back to login page', async () => {
        await click(page, loginPageLocator.loginBackBtn);
        await page.waitForSelector(loginPageLocator.passwordInput);

        const url = page.url();
        await expect(url).to.contain("https://hub-staging.clockwise.software/login");
    });
});

describe('Login page tests', () => {

    it('Open the page', async () => {
        await loadUrl(page, config.baseURl);
        await page.waitForSelector(loginPageLocator.emailInput);

        const url = await page.url();
        const title = await page.title();

        expect(url).to.contain("https://hub-staging.clockwise.software/login");
        expect(title).to.contains("Clockwise Hub");
    });

    it('Select the "Remember me" chackbox', async () => {
        await click(page, loginPageLocator.checkbox);

        const onCheckbox = await page.evaluate(() => {
            return document.querySelector('input[type="checkbox"]').checked;
        })

        expect(onCheckbox).to.equal(true);
    });

    it('Valid log in', async () => {
        await typeText(page, loginPageLocator.emailInput, "admin@gmail.com");
        await typeText(page, loginPageLocator.passwordInput, "admin");
        await click(page, loginPageLocator.loginBtn);
        await page.waitForSelector(homePageLocator.nearestEventsBlock);

        const url = await page.url();
        expect(url).to.contain("https://hub-staging.clockwise.software/home");
    });
});