const puppeteer = require('puppeteer')
const expect = require('chai').expect

const config = require('../lib/config')
const functions = require('../lib/helpers')

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
    timeout: config.launchTimeout
  })
  page = await browser.newPage()
  await page.setDefaultTimeout(config.waitingTimeout)
  await page.setViewport({
    width: config.viewportWeiht,
    height: config.viewportHeight
  })
})

after(async () => {
    await browser.close()
})

describe('Negative tests for Rate page', () => {

    it('log in as an Admin', async () => {
        await loginPage.login(page, 'admin@gmail.com', 'admin')
    })

    it('check that dashboard is visible', async () => {
        await functions.shouldExist(page, homePage.nearestEventsBlock, true)
    })

    it('go to Rate page', async () => {
        await functions.click(page, homePage.rateNavLink)
    })

    it('check that Rate page is loaded', async () => {
        await functions.shouldExist(page, ratePage.pointsPannelHeading, true)
        await functions.shouldExist(page, ratePage.usersTabContent, true)
    })

    it('check that logged in user doesnt see himself name in rate table', async () => {
        var innerUsersText = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText
        }, ratePage.usersTabContent)
        expect(innerUsersText).to.not.contains('Admin')
    })

    it('click on UpVote icon in users table', async () => {
        await functions.click(page, ratePage.upVoteBtn)
    })

    it('wait for feedback form appearence', async () => {
        await page.waitFor(300)
    })

    it('submit empty feedback form', async () => {
        await functions.click(page, ratePage.voteBtn)
    })

    it('check that feedback form is still opened', async () => {
        await functions.shouldExist(page, ratePage.modalForm, true)
    })

    it('cancel voting for closing form', async () => {
        await functions.click(page, ratePage.cancelBtn)
    })

    it('check that form is invisible', async () => {
        await functions.shouldExist(page, ratePage.modalForm, false)
    })

    it('reload page', async () => {
        await page.reload()
    })

    it('click on UpVote icon in users table', async () => {
        await functions.click(page, ratePage.upVoteBtn)
    })

    it('wait for feedback form appearence', async () => {
        await page.waitFor(300)
    })

    it('type reason shorter than 3 symbols', async () => {
        await functions.typeText(page, ratePage.reasonTextarea, '+')
    })

    it('submit vote', async () => {
        await functions.click(page, ratePage.voteBtn)
    })

    it('wait while submiting is ended', async () => {
        await page.waitFor(300)
    })

    it('check error alert', async () => {
        var alertEl = await page.$(ratePage.alertError)
        var text = await page.evaluate(el => el.textContent, alertEl)
        expect(text).to.contain('The reason must be at least 3 characters.')
    })
})

describe('Positive tests for Rate page', () => {

    it('reload Rate page', async () => {
        await page.reload()
    })

    it('click on UpVote icon in users table', async () => {
        await functions.click(page, ratePage.upVoteBtn)
    })

    it('wait for feedback form appearence', async () => {
        await page.waitFor(300)
    })

    it('fill in feedback form with valid reason', async () => {
        await functions.typeText(page, ratePage.reasonTextarea, 'test')
    })

    it('submit feedback', async () => {
        await functions.click(page, ratePage.voteBtn)
    })

    it('wait while submiting is ended', async () => {
        await page.waitFor(300)
    })

    it('check success alert', async () => {
        var alert = await page.$(ratePage.alertSuccess)
        var text = await page.evaluate(el => el.textContent, alert)
        expect(text).to.contain('You voted successfully!')
    })

    it('unvote voted user for clearing test env', async () => {
        await functions.click(page, ratePage.downVoteBtn)
    })

    it('check success alert', async () => {
        var alert = await page.$(ratePage.alertSuccess)
        var text = await page.evaluate(el => el.textContent, alert)
        expect(text).to.contain('You removed your vote successfully!')
    })
})
