const puppeteer = require('puppeteer');
require('dotenv').config();

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

  await sleepFor({ seconds: 1.5 });
  await setMouseInteractWithElement({ selector: '#signInSubmit', page });
  await page.click('#signInSubmit');

  await page.waitForSelector('#nav-hamburger-menu');

  await sleepFor({ seconds: 2 });
  await setMouseInteractWithElement({ selector: '#nav-hamburger-menu', page });
  await page.click('#nav-hamburger-menu');

  await sleepFor({ seconds: 1 });

  await page.waitForSelector('[data-menu-id="1"]');
  /* const link = await page.evaluate(() => {
    return document
      .querySelector('[data-menu-id="1"] li a')
      .getAttribute('href');
  }); */

  await page.click('[data-menu-id="1"] li a');

  await page.waitForSelector(
    '.a-carousel-row-inner .a-carousel-col.a-carousel-center .zg-carousel-general-faceout .p13n-sc-uncoverable-faceout'
  );
  const data = await page.evaluate(async () => {
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
   */

    const elements = Array.from(
      document.querySelectorAll(
        '.a-carousel-row-inner .a-carousel-col.a-carousel-center .zg-carousel-general-faceout .p13n-sc-uncoverable-faceout'
      )
    );

    return elements.map((el) => ({
      // Extraia as informações desejadas dos elementos
      image: el?.querySelector('img')?.src,
      link: el?.querySelector('a')?.href,
      description: el
        ?.querySelector('.p13n-sc-truncate-desktop-type2.p13n-sc-truncated')
        ?.textContent.trim(), // Substitua 'description-class' pela classe rea
      price: el
        ?.querySelector('._cDEzb_p13n-sc-price_3mJ9Z')
        ?.textContent.trim(), // Substitua 'price-class' pela classe real
    }));

    // tres classes: a-carousel-left, a-carousel-center, a-carousel-right
    // document.querySelectorAll('.a-carousel-row-inner')
    // .  a-carousel-col a-carousel-center
    // imagem
    // descrição
    // link
    // preço
  });

  console.log({ data });
})();
