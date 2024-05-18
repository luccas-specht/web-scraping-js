const puppeteer = require('puppeteer');
//https://www.youtube.com/watch?v=AUgpvfsAYJ4&t=599
// https://www.youtube.com/watch?v=pTRDVZeQCbc
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.scrapethissite.com/pages/');

  const anchor = await page.evaluate(() => {
    const ATags = document.querySelectorAll('a');
    const tagsToArray = Array.from(ATags);
    const linkFound = tagsToArray.reduce((acc, cur) => {
      if (cur.href === 'https://www.scrapethissite.com/pages/forms/') {
        acc = cur.href;
      }
      return acc;
    }, 'not-link');

    return linkFound;
  });

  await page.goto(anchor);
  await page.waitForSelector('#q');

  await page.type('#q', 'Luccas AMA Natalie', { delay: 200 });
  await Promise.all([page.waitForNavigation(), page.click('.btn-primary')]);

  await page.$eval('input[type="text"]', (input) => (input.value = ''));

  await page.type('#q', 'New York Rangers', { delay: 200 });
  await Promise.all([page.waitForNavigation(), page.click('.btn-primary')]);

  //await browser.close();
})();
