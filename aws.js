const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

function convertToCSV({ data, name = 'best_sellers_AWS' }) {
  const csv = [
    ['Image URL', 'URL', 'Description', 'Price'],
    ...data.map((book) => [book.image, book.url, book.description, book.price]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  fs.writeFileSync(path.join(__dirname, `${name}.csv`), csv);
}

function sleepFor({ seconds }) {
  var secondsToWait = seconds * 1000;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, secondsToWait);
  });
}

// não usar a sintax sugar do asyn await
// compartilhar o page
async function setMouseInteractWithElement({ selector, page }) {
  const element = await page.$(selector);
  const boundingBox = await element.boundingBox();
  await page.mouse.move(
    boundingBox.x + boundingBox.width / 2,
    boundingBox.y + boundingBox.height / 2
  );
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://www.amazon.com.br/ap/signin?openid.pape.max_auth_age=3600&openid.return_to=https%3A%2F%2Fwww.amazon.com.br%3A443%2Fhz%2Fmas%2Fthank-you%2Fyour-account%2Fmyapps%2F**%3Fref_%3Dnav_AccountFlyout_aad&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=amzn_masrw_webapp_br&openid.mode=checkid_setup&language=pt_BR&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0'
  );

  await page.waitForSelector('#ap_email');
  await page.waitForSelector('#ap_password');
  await page.type('#ap_email', `${process.env.AWS_USER}`, { delay: 200 });
  await page.type('#ap_password', `${process.env.AWS_PASSWORD}`, {
    delay: 200,
  });

  await page.waitForSelector('#signInSubmit');
  await sleepFor({ seconds: 1.5 });
  await setMouseInteractWithElement({ selector: '#signInSubmit', page });
  await page.click('#signInSubmit');

  await page.waitForSelector('#nav-hamburger-menu');
  await sleepFor({ seconds: 2 });
  await setMouseInteractWithElement({ selector: '#nav-hamburger-menu', page });
  await page.click('#nav-hamburger-menu');

  await page.waitForSelector('[data-menu-id="1"]');
  await sleepFor({ seconds: 1 });
  await setMouseInteractWithElement({ selector: '[data-menu-id="1"]', page });
  await page.click('[data-menu-id="1"] li a');

  await page.waitForSelector(
    '.a-carousel-row-inner .a-carousel-col.a-carousel-center .zg-carousel-general-faceout .p13n-sc-uncoverable-faceout'
  );
  const data = await page.evaluate(async () => {
    const elements = Array.from(
      document.querySelectorAll(
        '.a-carousel-row-inner .a-carousel-col.a-carousel-center .zg-carousel-general-faceout .p13n-sc-uncoverable-faceout'
      )
    );

    return elements.map((el) => ({
      image: el?.querySelector('img')?.src,
      url: el?.querySelector('a')?.href,
      description: el
        ?.querySelector('.p13n-sc-truncate-desktop-type2.p13n-sc-truncated')
        ?.textContent.trim(),
      price: el
        ?.querySelector('._cDEzb_p13n-sc-price_3mJ9Z')
        ?.textContent.trim(),
    }));

    // tres classes: a-carousel-left, a-carousel-center, a-carousel-right
  });

  convertToCSV({ data });

  await browser.close();
})();

// logica pra ir scrollando e pegar mais elementos, funciona com scroll infinito onde para fazer o fecth vai ate o final da tela:
/*
    const distance = 100;
    let scrolledAmount = 0;

    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      scrolledAmount += distance;

      if (scrolledAmount >= document.body.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, 100);




    Array.from(...[new Array(10000)]).forEach((_, index) => {
    setTimeout(() => {
       document.querySelector('#twotabsearchtextbox').setAttribute('value', `fone de ouvido - {index}`)
        document.querySelector('#nav-search-submit-button').click(); 
    }, 3000)
})
   */
