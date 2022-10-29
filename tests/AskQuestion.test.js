import puppeteer from "puppeteer";
import { gotoPage }  from "./utils.js";

let app = 'http://localhost:3000';
let browser, page;

const args = [
  '--no-sandbox',
  '--disable-setuid-sandbox'
]

describe("Ask Question Suite", () => {
  beforeEach(async () => {
    // Setting browser
    browser = await puppeteer.launch({args});
    // New page
    page = await browser.newPage();
    // Going to app url
    await gotoPage(app, page);
  })

  afterEach(async () => {
    // Close page
    await page.close();
    // Closer browser
    await browser.close();
  })

  test('Write text in input click Ok', async () => {
    await page.click('[onclick="window.askQuestion()"]');
    await page.type('input[name=ma-answer]', 'test comment', {delay: 20});

    // Query button by xpath element and text
    const button = (await page.$x("//button[text()='Ok']"))[0];
    await button.click()

    const message = await page.evaluate(
      () => {
        const messages = document.querySelectorAll('#status-log .message');
        return messages[messages.length - 1].innerHTML;
      }
    );

    expect(message)
      .toBe('Answer: {"action":"answered","answerResult":[{"fields":[{"id":"ma-answer","value":"test comment","type":"text"}]}]}')
  })

  test('Write text in input click Cancel', async () => {
    await page.click('[onclick="window.askQuestion()"]');
    await page.type('input[name=ma-answer]', 'test comment', {delay: 20});

    // Query button by xpath element and text
    const button = (await page.$x("//button[text()='Cancelar']"))[0];
    await button.click()

    const message = await page.evaluate(
      () => {
        const messages = document.querySelectorAll('#status-log .message');
        return messages[messages.length - 1].innerHTML;
      }
    );

    expect(message)
      .toBe('Answer: {"action":"closed"}')

  })
})
