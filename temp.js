const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomtime = (min = 0, max = 10) => Math.floor(Math.random() * (max - min + 1)) + min;

exports.handler = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Open a visible browser window
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-infobars',
      '--disable-gpu',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--ignore-certificate-errors',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--window-size=1280,800'
    ]
  });
  const totalPages = 2; // Set the number of pages to scrape

  const allRecords = []; // To store all property data

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageUrl = `https://suumo.jp/jj/bukken/ichiran/JJ012FC001/?ar=030&bs=011&cn=9999999&cnb=0&et=9999999&initFlg=1&kb=1&kki=101&kt=9999999&mb=0&mt=9999999&ta=12&tj=0&pc=30&po=1&pj=2&page=${pageNum}`;
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    console.log(`Scraping page ${pageNum}: ${pageUrl}`);


    // Get property links

    const propertyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('h2.property_unit-title a'));
      return links.map(link => link.href);
    });

    console.log(`Found ${propertyLinks.length} properties on page ${pageNum}.`);

    for (let i = 0; i < Math.min(30, propertyLinks.length); i++) {
      await delay(randomtime(5000, 5000));
      console.log(`${i + 1 +propertyLinks.length * (pageNum -1)} Scrapping in the ${propertyLinks[i]}`);
      const url = propertyLinks[i];
      const detailPage = await browser.newPage();
      await detailPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

      // Extract image URLs
      const imageUrls = await detailPage.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.js-slideLazy-image.js-noContextMenu'));
        const srcs = imgs.map(img => img.src || img.getAttribute('rel'));
        return srcs.slice(0, 5);
      });

      const detailinfo = await detailPage.evaluate(() => {
        const info = [];
        let element = '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(1) td:nth-child(2)');
        info[0] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(1) td:nth-child(4)');
        info[1] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(2) td:nth-child(2)');
        info[2] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(2) td:nth-child(4)');
        info[3] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(3) td:nth-child(2)');
        info[4] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(3) td:nth-child(4)');
        info[5] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(4) td:nth-child(2)');
        info[6] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(4) td:nth-child(4)');
        info[7] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(5) td:nth-child(2)');
        info[8] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(5) td:nth-child(4)');
        info[9] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(6) td:nth-child(2)');
        info[10] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(6) td:nth-child(4)');
        info[11] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(7) td:nth-child(2)');
        info[12] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(7) td:nth-child(4)');
        info[13] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(8) td:nth-child(2)');
        info[14] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(8) td:nth-child(4)');
        info[15] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(9) td:nth-child(2)');
        info[16] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(9) td:nth-child(4)');
        info[17] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(10) td:nth-child(2)');
        info[18] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(10) td:nth-child(4)');
        info[19] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(11) td');
        info[20] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.bdclps.mt10 tbody tr:nth-child(12) td');
        info[21] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(1) td:nth-child(2)');
        info[22] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(1) td:nth-child(4)');
        info[23] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(2) td:nth-child(2)');
        info[24] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(2) td:nth-child(4)');
        info[25] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(3) td:nth-child(2)');
        info[26] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(3) td:nth-child(4)');
        info[27] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(4) td:nth-child(2)');
        info[28] = element ? element.textContent.trim() : '';
        element = document.querySelectorAll('table.bdclps.mt10')[1]?.querySelector('tbody tr:nth-child(4) td:nth-child(4)');
        info[29] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.mt10.bdGrayT.bdGrayL.bgWhite.pCell10.bdclps.wf.zm1 tbody tr:nth-child(2) td div');
        info[30] = element ? element.textContent.trim() : '';
        element = document.querySelector('table.mt10.bdGrayT.bdGrayL.bgWhite.pCell10.bdclps.wf.zm1 tbody tr:nth-child(2) td div.fgDRed');
        info[31] = element ? element.textContent.trim().replace(/[^0-9\- \(\)]/g, '').trim() : '';

        for (let i = 0; i < info.length; i++) {
          info[i] = info[i].replace(/\t/g, '').replace(/\n+/g, '\n').trim();
          console.log(`Detail info[${i}]: ${info[i]}`);
        }
        return info;
      });

      // Prepare data record
      const record = {
        '不動産のURL': url,
        '画像1': imageUrls[0],
        '画像2': imageUrls[1],
        '画像3': imageUrls[2],
        '画像4': imageUrls[3],
        '画像5': imageUrls[4],
        '株式会社': detailinfo[30],
        'Tel': detailinfo[31],
        '販売スケジュール': detailinfo[0],
        'イベント情報': detailinfo[1],
        '販売戸数': detailinfo[2],
        '最多価格帯': detailinfo[3],
        '価格': detailinfo[4],
        '管理費': detailinfo[5],
        '修繕積立金': detailinfo[6],
        '修繕積立基金': detailinfo[7],
        '諸費用': detailinfo[8],
        '間取り': detailinfo[9],
        '専有面積': detailinfo[10],
        'その他面積': detailinfo[11],
        '引渡可能時期': detailinfo[12],
        '完成時期(築年月)': detailinfo[13],
        '所在階': detailinfo[14],
        '向き': detailinfo[15],
        'エネルギー消費性能': detailinfo[16],
        '断熱性能': detailinfo[17],
        '目安光熱費': detailinfo[18],
        'リフォーム': detailinfo[19],
        'その他制限事項': detailinfo[20],
        'その他概要・特記事項': detailinfo[21],
        '所在地': detailinfo[22],
        '交通': detailinfo[23],
        '総戸数': detailinfo[24],
        '構造・階建て': detailinfo[25],
        '敷地面積': detailinfo[26],
        '敷地の権利形態': detailinfo[27],
        '用途地域': detailinfo[28],
        '駐車場': detailinfo[29]
      }
      // Add record to all records array
      // console.log(JSON.stringify(record, null, 1));
      allRecords.push(record);
      await detailPage.close();
    }

    await page.close();
  }

  await browser.close();
  return {
    statusCode: 500,
    body: JSON.stringify(allRecords,null,1),
  };
};