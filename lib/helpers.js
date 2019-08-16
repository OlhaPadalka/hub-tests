module.exports = {
    click: async (page, selector) => {
        try {
            await page.waitForSelector(selector);
            await page.click(selector);
        } catch (error) {
            throw new Error('Could not click on selector: ${selector}');
        }
    },
    typeText: async (page, selector, text) => {
        try {
            await page.waitForSelector(selector);
            await page.type(selector, text);
        } catch (error) {
            throw new Error('Could not type text into selector: ${selector}');
        }
    },
    loadUrl: async (page, url) => {
        await page.goto(url, { waitUntil: 'networkidle0' });
    }
}