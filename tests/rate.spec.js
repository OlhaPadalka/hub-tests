const puppeteer = require('puppeteer')
const expect = require('chai').expect
const config = require('../lib/config')


const loginPage = require('../page-objects/login.page')
const homePage = require('../page-objects/home.page')
const ratePage = require('../page-objects/rate.page')

let browser
let page

before(async () => {
    browser = await puppeteer.launch({
        headless: config.isHeadLess,
        slowMo: config.slowMo,
        devtools: config.devtools,
        timeout: config.launchTimeout,
    })
    page = await browser.newPage();
    await page.setDefaultTimeout(config.waitingTimeout);
    await page.setViewport({
        width: config.viewportWeiht,
        height: config.viewportHeight
    })
})

after(async () => {
    await browser.close();
})

describe('Negative tests for Rate page', () => {

    it('log in to hub as an admin', async () => {
        await page.goto(config.baseURl)
        await page.type(loginPage.emailInput, "admin@gmail.com")
        await page.type(loginPage.passwordInput, "admin")
        await page.click(loginPage.loginBtn)
        await page.waitForSelector(homePage.nearestEventsBlock, {visible:true})
    })

    it('go to Rate page from Home page', async () => {
        await page.waitForSelector(homePage.rateNavLink, {visible:true})
        await page.click(homePage.rateNavLink)
        await page.waitForSelector(ratePage.pointsPannelHeading, {visible:true})
        await page.waitForSelector(ratePage.usersTabContent, {visible:true})
    })

    it('check that logged in user doesnt see himself name in rate table', async () => {
        const innerUsersText = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText
        }, ratePage.usersTabContent)
        expect(innerUsersText).to.not.contains('Admin')
    })

    //Debug
    it('try to rate any user with empty reason input', async () => {
        await page.waitForSelector(ratePage.upVoteBtn, {visible:true})
        await page.click(ratePage.upVoteBtn)
        await page.waitForSelector(ratePage.modalForm, {visible:true})
        await page.waitForSelector(ratePage.voteBtn, {visible:true})

        await page.click(ratePage.voteBtn)
        await page.waitForSelector(ratePage.modalForm, {visible: true})

        await page.click(ratePage.cancelBtn)
        await page.waitForSelector(ratePage.modalForm, {visible: false})
    })

    it('try to rate any user with reason shorter than 3 characters', async () => {
        await page.reload()
        await page.waitForSelector(ratePage.upVoteBtn, {visible:true})
        await page.click(ratePage.upVoteBtn)
        await page.waitForSelector(ratePage.modalForm, {visible:true})
        await page.waitForSelector(ratePage.voteBtn, {visible:true})

        await page.type(ratePage.reasonTextarea, '12')
        await page.click(ratePage.voteBtn)

        await page.waitForSelector(ratePage.alertError, {visible:true})

        const alertEl = await page.$(ratePage.alertError)
        const text = await page.evaluate(el => el.textContent, alertEl)
        expect(text).to.contain('The reason must be at least 3 characters.')
    })
})

describe('Positive tests for Rate page', () => {

    it('rate any user with valid reason', async () => {
        await page.waitForSelector(ratePage.upVoteBtn, {visible:true})
        await page.click(ratePage.upVoteBtn)
        await page.waitForSelector(ratePage.modalForm, {visible:true})
        await page.waitForSelector(ratePage.reasonTextarea, {visible:true})
        await page.waitForSelector(ratePage.voteBtn, {visible:true})

        await page.click(ratePage.reasonTextarea)
        await page.type(ratePage.reasonTextarea, 'test')
        await page.click(ratePage.voteBtn)

        await page.waitForSelector(ratePage.alertSuccess, {visible:true})
        
        const alert = await page.$(ratePage.alertSuccess)
        const text = await page.evaluate(el => el.textContent, alert)
        expect(text).to.contain('You voted successfully!')
    })

    it('Unvote user', async () => { //needed for clean up data - because tests are cycled
        await page.waitForSelector(ratePage.downVoteBtn, {visible:true})
        await page.click(ratePage.downVoteBtn)
        await page.waitForSelector(ratePage.alertSuccess, {visible:true})
        
        const alert = await page.$(ratePage.alertSuccess)
        const text = await page.evaluate(el => el.textContent, alert)
        expect(text).to.contain('You removed your vote successfully!')

        await page.waitForSelector(ratePage.upVoteBtn)
    })
})