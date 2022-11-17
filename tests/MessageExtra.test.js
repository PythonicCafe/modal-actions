describe("Message Extra Suite", () => {
  beforeEach(async () => {
    // Open extra content
    await page.click('[onclick="window.message()"]');
    await page.click('a.ma-modal__link');
  })


  test('Open modal extra content', async () => {
    const modalContentDisplay = await page.evaluate(
      () => document.querySelectorAll('.ma-modal')[0].style.display
    );
    expect(modalContentDisplay).toBe('none');
  })

  test('Open modal extra content of extra content', async () => {
    await page.click('[onclick="window.messageExtra2()"]');

    // First modal content
    const modalContentDisplay = await page.evaluate(
      () => document.querySelectorAll('.ma-modal')[0].style.display
    );
    expect(modalContentDisplay).toBe('none');

    // Second modal content
    const modalContentDisplay1 = await page.evaluate(
      () => document.querySelectorAll('.ma-modal')[1].style.display
    );
    expect(modalContentDisplay1).toBe('none');

    // Second modal content
    const modalContentDisplay3 = await page.evaluate(
      () => document.querySelectorAll('.ma-modal')[2].style.display
    );
    expect(modalContentDisplay3).toBe('');
  })

  test('Open modal extra content of extra content', async () => {
    await page.click('[onclick="window.messageExtra2()"]');

    const extraModalTitle = await page.evaluate(
      () => document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__title').innerText
    );
    expect(extraModalTitle).toBe("Title Extra Modal 2");

    const extraModalContent = await page.evaluate(
      () => document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__body').innerText
    );
    expect(extraModalContent).toBe("Lorem ipsum dolor 2 sit amet, consectetur adipiscing elit. Phasellus gravida id leo pellentesque finibus.");
  })

  test('Open modal extra content click back button two times check title and content of current modal body', async () => {
    await page.click('[onclick="window.messageExtra2()"]');
    // Click on active back button
    await page.evaluate(() => {
      document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__back').click();
    });
    // Click on active back button on the third modal body content
    await page.evaluate(() => {
      document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__back').click();
    });

    // Check if title and content are equals first modal body title and content
    const extraModalTitle = await page.evaluate(
      () => document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__title').innerText
    );
    expect(extraModalTitle).toBe("Title");

    const extraModalContent = await page.evaluate(
      () => document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__body').innerText
    );
    expect(extraModalContent).toBe("Lorem ipsum 1 dolor sit amet, consectetur adipiscing elit. Phasellus gravida id leo pellentesque finibus.");
  })

  test('Open modal with tabs showing first tab', async () => {
    const firstTab = await page.evaluate(
      () => document.querySelectorAll('.ma-nav__tab')[0].classList.contains("ma-nav__tab--active")
    );
    expect(firstTab).toBe(true);
  })

  test('Open modal with tabs click second tab', async () => {
    // xpath getting tab button
    const tabButton = (await page.$x("//button[text()='Tab 2']"))[0];
    await tabButton.click()

    const clickedTab = await page.evaluate(
      () => document.querySelectorAll('.ma-nav__tab')[1].classList.contains("ma-nav__tab--active")
    );
    expect(clickedTab).toBe(true);
  })

  test('Open modal extra content showing title and content ', async () => {
    const extraModalTitle = await page.evaluate(
      () => document.querySelector('.ma-modal:not([style*="display: none"]) .ma-modal__title').innerText
    );
    expect(extraModalTitle).toBe("Title Extra Modal 1");

    const extraModalContent = await page.evaluate(
      () => document.querySelector('.tab-content:not(.hidden) .modal-body').innerText
    );
    expect(extraModalContent)
      .toBe('Test tab 1 Lorem ipsum 2 dolor sit amet, consectetur adipiscing elit. Phasellus gravida id leo pellentesque finibus.');
  })

  test('Open modal with tabs click second tab showing content', async () => {
    // xpath getting tab button
    const tabButton = (await page.$x("//button[text()='Tab 2']"))[0];
    await tabButton.click()
    const extraModalContent = await page.evaluate(
      () => document.querySelector('.tab-content:not(.hidden) .modal-body').innerText
    );
    expect(extraModalContent).toBe('Test tab 2');
  })
})
