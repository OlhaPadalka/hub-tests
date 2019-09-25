const puppeteer = require('puppeteer')
const expect = require('chai').expect
const config = require('../lib/config')
const functions = require('../lib/helpers')
const loginPage = require('../page-objects/login.page')
const homePage = require('../page-objects/home.page')
const calendarPage = require('../page-objects/calendar.page')

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

describe('Calendar test, as an admin', () => {

  it('log in to hub as an Admin', async () => {
    await loginPage.login(page, 'admin@gmail.com', 'admin')
  })

  it('go to Calendar page', async () => {
    await functions.click(page, homePage.calendarNavLink)
  })

  it('check that Calendar page is loaded', async () => {
    await functions.shouldExist(page, calendarPage.calendarMonthView)
  })


})