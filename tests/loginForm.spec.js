const puppeteer = require('puppeteer')
const expect = require('chai').expect

const config = require('../lib/config')
const functions = require('../lib/helpers')
const utils = require('../lib/utils')

const loginPageLocator = require('../page-objects/login.page')
const homePageLocator = require('../page-objects/home.page')

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

describe('Login page invalid tests', () => {
  
  describe('Submit empty login form', () => {

    it('go to login page', async () => {
      await functions.loadUrl(page, config.baseURl)
    })

    it('check that page is loaded', async () => {
      await functions.waitForText(page, 'body', 'Login')
    })

    it('submit empty login form', async () => {
      await functions.click(page, loginPageLocator.loginBtn)
    })

    it('check that error is shown', async () => {
      await functions.shouldExist(page, loginPageLocator.helpText)
    })

  })
  
  describe('Try to log in with invalid credentials', async () => {
    
    it('Fill in email input', async () => {
      await functions.typeText(page, loginPageLocator.emailInput, utils.generateEmail())
    })

    it('fill in password input', async () => {
      await functions.typeText(page, loginPageLocator.passwordInput, utils.generateID(5))
    })

    it('submit form', async () => {
      await functions.click(page, loginPageLocator.loginBtn)
    })

    it('check that error is shown', async () => {
      await functions.shouldExist(page, loginPageLocator.helpText)
    })

  })

})

describe('Forgot password tests', () => {

  it('go to login page', async () => {
    await functions.loadUrl(page, config.baseURl)
  })

  it('Click on the "Forgot password" link', async () => {
    await functions.click(page, loginPageLocator.forgotPassword)
  })

  it('check that user is redirected to reset password page', async () => {
    const url = await page.url()
    expect(url).to.contain('https://hub-staging.clockwise.software/password/reset')
  })

  it('fill in email input', async () => {
    await functions.typeText(page, loginPageLocator.emailInput, 'admin@gmail.com')
  })

  it('submit password reset', async () => {
    await functions.click(page, loginPageLocator.loginBtn)
  })

  it('check success alert', async () => {
    await functions.shouldExist(page, loginPageLocator.alertSucces)
  })

  it('go back to login page', async () => {
    await functions.click(page, loginPageLocator.loginBackBtn)
  })

  it('check that user is on login page', async () => {
    await functions.shouldExist(page, loginPageLocator.passwordInput)
  })

  it('check url path', async () => {
    const url = await page.url()
    expect(url).to.contain('https://hub-staging.clockwise.software/login')
  })

})

describe('Log in with valid credentials', () => {
  
  it('load login page', async () => {
    await functions.loadUrl(page, config.baseURl)
  })

  it('check page title', async () => {
    const title = await page.title()
    expect(title).to.contains('Clockwise Hub')
  })

  it('click on "Remember me" checkbox', async () => {
    await functions.click(page, loginPageLocator.checkbox)
  })

  it('check that checkbox is checked', async () => {
    const onCheckbox = await page.evaluate(() => {
      return document.querySelector('input[type="checkbox"]').checked
    })
    expect(onCheckbox).to.equal(true)
  })

  it('fill in email input with valid data', async () => {
    await functions.typeText(page, loginPageLocator.emailInput, 'admin@gmail.com')
  })

  it('fill in password input with valid data', async () => {
    await functions.typeText(page, loginPageLocator.passwordInput, 'admin')
  })

  it('submit login form', async () => {
    await functions.click(page, loginPageLocator.loginBtn)
  })

  it('check that dashboard is loaded', async () => {
    await functions.shouldExist(page, homePageLocator.nearestEventsBlock)
  })

  it('check url path for home page', async () => {
    const url = await page.url()
    expect(url).to.contain('https://hub-staging.clockwise.software/home')
  })

})
