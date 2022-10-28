import puppeteer from "puppeteer";
import { sleep, gotoPage }  from "./utils.js";

let app = 'http://localhost:3000';
let browser, page;

const args = [
  '--no-sandbox',
  '--disable-setuid-sandbox'
]

describe("Ask Yes No question Suites", () => {
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

  test('Open modal', async () => {
    await page.click('button.ma-btn');
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeTruthy();
  })

  test('Click yes button close modal', async () => {
    await page.click('button.ma-btn');
    await page.click('button[data-answer=yes]');
    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();
  })

  test('Click no button close modal', async () => {
    await page.click('button.ma-btn');
    await page.click('button[data-answer=no]');
    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();
  })

  test('Close button modal', async () => {
    await page.click('button.ma-btn');
    await page.click('button.ma-close');
    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();
  })

  test('Press ESC close modal', async () => {
    await page.click('button.ma-btn');
    await page.keyboard.press('Escape', { delay: 300 });
    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();
  })
 
  test('Modal click outside close modal', async () => {
    await page.click('button.ma-btn');

    // Click outside modal inside blur container
    const elem = await page.$('div.ma-container');
    const boundingBox = await elem.boundingBox();
    await page.mouse.click(boundingBox.x + 10, boundingBox.y + 10);

    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();
  })


  test('Click yes button answer yes', async () => {
    await page.click('button.ma-btn');
    await page.click('button[data-answer=yes]');
    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();

    const message = await page.evaluate(
      () => { 
        const messages = document.querySelectorAll('#status-log .message');
        return messages[messages.length - 1].innerHTML;
      } 
    );

    expect(message).toBe('Answer: {"action":"answered","answer":"yes"}')
  })


  test('Click no button answer no', async () => {
    await page.click('button.ma-btn');
    await page.click('button[data-answer=no]');
    // Timeout wait modal close animation
    await sleep(500);
    let modal = (await page.$('.ma-modal')) || null;
    expect(modal).toBeNull();

    const message = await page.evaluate(
      () => { 
        const messages = document.querySelectorAll('#status-log .message');
        return messages[messages.length - 1].innerHTML;
      } 
    );

    expect(message).toBe('Answer: {"action":"answered","answer":"no"}')
  })
  
})
