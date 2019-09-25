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

    it('log in to hub as an admin', async () => {
        await functions.loadUrl(page, config.baseURl)
        await functions.typeText(page, loginPage.emailInput, 'admin@gmail.com')
        await functions.typeText(page, loginPage.passwordInput, 'admin')
        await functions.click(page, loginPage.loginBtn)
        await functions.shouldExist(page, homePage.nearestEventsBlock, true)
    })

    it('go to Rate page from Home page', async () => {
        await functions.shouldExist(page, homePage.rateNavLink, true)
        await functions.click(page, homePage.rateNavLink)
        await functions.shouldExist(page, ratePage.pointsPannelHeading, true)
        await functions.shouldExist(page, ratePage.usersTabContent, true)
    })

    it('check that logged in user doesnt see himself name in rate table', async () => {
        const innerUsersText = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText
        }, ratePage.usersTabContent)
        expect(innerUsersText).to.not.contains('Admin')
    })

    //Debug
    it('try to rate any user with empty reason input', async () => {
        await functions.shouldExist(page, ratePage.upVoteBtn, true)
        await functions.click(page, ratePage.upVoteBtn)
        await functions.shouldExist(page, ratePage.modalForm, true)
        await functions.shouldExist(page, ratePage.voteBtn, true)

        await functions.click(page, ratePage.voteBtn)
        await functions.shouldExist(page, ratePage.modalForm, true)

        await functions.click(ratePage.cancelBtn)
        await functions.shouldExist(page, ratePage.modalForm, false)
    })

    it('try to rate any user with reason shorter than 3 characters', async () => {
        await page.reload()
        await functions.shouldExist(page, ratePage.upVoteBtn, true)
        await functions.click(page, ratePage.upVoteBtn)
        await functions.shouldExist(page, ratePage.modalForm, true)
        await functions.shouldExist(page, ratePage.voteBtn, true)

        await functions.typeText(page, ratePage.reasonTextarea, '12')
        await functions.click(page, ratePage.voteBtn)

        await functions.shouldExist(page, ratePage.alertError, true)

        const alertEl = await page.$(ratePage.alertError)
        const text = await page.evaluate(el => el.textContent, alertEl)
        expect(text).to.contain('The reason must be at least 3 characters.')
    })
})

describe('Positive tests for Rate page', () => {

    it('rate any user with valid reason', async () => {
        await page.reload()
        await functions.shouldExist(page, ratePage.upVoteBtn, true)
        await functions.click(page, ratePage.upVoteBtn)
        await functions.shouldExist(page, ratePage.modalForm, true)
        await functions.shouldExist(page, ratePage.reasonTextarea, true)
        await functions.shouldExist(page, ratePage.voteBtn, true)

        await functions.click(page, ratePage.reasonTextarea)
        await functions.typeText(page, ratePage.reasonTextarea, 'test')
        await functions.click(ratePage.voteBtn)

        await functions.shouldExist(page, ratePage.alertSuccess, true)
        
        const alert = await page.$(ratePage.alertSuccess)
        const text = await page.evaluate(el => el.textContent, alert)
        expect(text).to.contain('You voted successfully!')
    })

    it('Unvote user', async () => { //needed for clean up data - because tests are cycled
        await functions.shouldExist(page, ratePage.downVoteBtn, true)
        await functions.click(page, ratePage.downVoteBtn)
        await functions.shouldExist(page, ratePage.alertSuccess, true)
        
        const alert = await page.$(ratePage.alertSuccess)
        const text = await page.evaluate(el => el.textContent, alert)
        expect(text).to.contain('You removed your vote successfully!')

        await functions.shouldExist(page, ratePage.upVoteBtn)
    })
})

describe('Use all rate points for user ratings', () => {

    it('check that user has 3 points for rating', async () => {
        await functions.shouldExist(page, ratePage.pointsPannelHeading, true)
        let pointsText = await page.evaluate((selector) => {
            return document.querySelector(selector).innerText
        }, ratePage.pointsPannelHeading)
        expect(pointsText).to.contains('3 point(s) left')
    })

    it('rate 3 users one by one', async () => {  
        for(let i=0; i++; i<3){
            await functions.shouldExist(page, ratePage.upVoteBtn, true)
            await functions.click(page, ratePage.upVoteBtn)
            await functions.shouldExist(page, ratePage.reasonTextarea, true)
            await functions.shouldExist(ratePage.voteBtn)
            await functions.typeText(page, ratePage.reasonTextarea, 'test'+Math.random()*100)
            await functions.click(ratePage.voteBtn)
            await functions.shouldExist(page, ratePage.alertSuccess, true)
            await page.waitFor(100)    
        }
    })
})
