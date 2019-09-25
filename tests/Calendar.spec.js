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

describe('Create a holiday event as an Admin', () => {

  it('log in to hub as an Admin', async () => {
    await loginPage.login(page, 'admin@gmail.com', 'admin')
  })

  it('go to Calendar page', async () => {
    await functions.click(page, homePage.calendarNavLink)
  })

  it('check that Calendar page is loaded', async () => {
    await functions.shouldExist(page, calendarPage.calendarMonthView)
  })

  it('click on date cell in Calendar', async () => {
    await functions.click(page, calendarPage.dateCell)
  })

  it('check that event form is popped up', async () => {
    await functions.shouldExist(page, calendarPage.eventModal)
  })

  it('click on event Type drop-down', async () => {
    await functions.click(page, calendarPage.eventTypeDropDown)
  })

  it('select event type = Holiday', async () => {
    await page.select(calendarPage.eventTypeDropDown, calendarPage.events.holiday)
  })

  it('submit event', async () => {
    await functions.click(page, calendarPage.fillOutButton)
  })

  it('wait for event submiting', async () => {
    await page.waitFor(300)
  })

})