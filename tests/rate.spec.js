const puppeteer = require('puppeteer');
const expect = require('chai').expect;

const config = require('../lib/config');
const click = require('../lib/helpers').click;
const typeText = require('../lib/helpers').typeText;
const loadUrl = require('../lib/helpers').loadUrl;
const shouldExist = require('../lib/helpers').shouldExist;

const loginPage = require('../page-objects/login.page');
const homePage = require('../page-objects/home.page');
const ratePage = require('../page-objects/rate.page');

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

describe('Negative tests for Rate page', () => {

    it('log in to hub as an admin', async () => {
        await loadUrl(page, config.baseURl);
        await typeText(page, loginPage.emailInput, "admin@gmail.com");
        await typeText(page, loginPage.passwordInput, "admin");
        await click(page, loginPage.loginBtn);
        await shouldExist(page, homePage.nearestEventsBlock);
    });

    it('go to Rate page from Home page', async () => {
        await shouldExist(page, homePage.rateNavLink);
        await click(page, homePage.rateNavLink);
        await shouldExist(page, ratePage.pointsPannelHeading);
        await shouldExist(page, ratePage.usersTabContent);
    });

    it('check that logged in user doesnt see himself name in rate table', async () => {
        const innerUsersText = await page.evaluate(() => {
            return document.querySelector('.tab-content').innerText
        });
        expect(innerUsersText).to.not.contains('Admin');
    });

    it('try to rate any user with empty reason input', async () => {
        await click(page, ratePage.upVoteBtn);
        await page.waitFor(200) //timeout is needed because of voteBtn visibility
        await shouldExist(page, ratePage.modalForm);

        await click(page, ratePage.voteBtn);
        await shouldExist(page, ratePage.modalForm, true);

        await click(page, ratePage.cancelBtn);
        await shouldExist(page, ratePage.modalForm, false);
    });

    it('try to rate any user with reason shorter than 3 characters', async () => {
        await click(page, ratePage.upVoteBtn);
        await shouldExist(page, ratePage.modalForm);

        await typeText(page, ratePage.reasonTextarea, '12');
        await click(page, ratePage.voteBtn);

        await shouldExist(page, ratePage.alertError);

        const element = await page.$(ratePage.alertError);
        const text = await page.evaluate(element => element.textContent, element);
        expect(text).to.contain('The reason must be at least 3 characters.');
    });
})

describe('Positive tests for Rate page', () => {

    it('rate any user with valid reason', async () => {
        await click(page, ratePage.upVoteBtn);
        await shouldExist(page, ratePage.modalForm);
        await page.waitFor(300);

        await click(page, ratePage.reasonTextarea);
        await typeText(page, ratePage.reasonTextarea, 'test');
        await click(page, ratePage.voteBtn);

        await shouldExist(page, ratePage.alertSuccess);
        
        const element = await page.$(ratePage.alertSuccess);
        const text = await page.evaluate(element => element.textContent, element);
        expect(text).to.contain('You voted successfully!');
    });

    it('Unvote user', async () => { //needed for clean up data - because tests are cycled
        await shouldExist(page, ratePage.downVoteBtn);
        await click(page, ratePage.downVoteBtn);
        await shouldExist(page, ratePage.alertSuccess);
        
        const element = await page.$(ratePage.alertSuccess);
        const text = await page.evaluate(element => element.textContent, element);
        expect(text).to.contain('You removed your vote successfully!');

        await shouldExist(page, ratePage.upVoteBtn);
    });
});