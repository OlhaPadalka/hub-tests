const loginURL = require('../lib/config').baseURl

module.exports = {
  emailInput: '#email',
  passwordInput: '#password',
  loginBtn: '.btn.btn-primary',
  helpText: '.help-block',
  rememberMeBtn: '.btn.btn-link',
  alertSucces: '.alert.alert-success',
  loginBackBtn: '.nav.navbar-nav.navbar-right',
  checkbox: 'input[type="checkbox"]',
  forgotPassword: 'a.btn-link',

  login: async function(page, email, password){
    await page.goto(loginURL)
    await page.waitForSelector(this.emailInput)
    await page.click(this.emailInput)
    await page.type(this.emailInput, email)
    await page.waitForSelector(this.passwordInput)
    await page.click(this.passwordInput)
    await page.type(this.passwordInput, password)
    await page.waitForSelector(this.loginBtn)
    await page.click(this.loginBtn)
    await page.waitFor(200)
  }
}
