const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const axios = require('axios');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomtime = (min = 1000, max = 1100) => Math.floor(Math.random() * (max - min + 1)) + min;

(async () => {
  // Create a timestamped parent folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const parentDir = path.join(__dirname, "homes" + timestamp);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir);
  }

  const imageDir = path.join(parentDir, "Images");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

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

  const pageUrl = `https://www.homes.co.jp/mansion/chuko/chiba/list/`;

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.setViewport({ width: 1280, height: 800 });

  // await delay(randomtime());
  await page.select('#cond_sortby', 'newdate'); // Sort by "新着順"
  // await delay(randomtime());
  await page.select('#cond_newdate', '1'); // select "本日"
  
  await delay(randomtime(2000, 3000)); // Wait for the page to load after sorting

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    console.log(`Scraping page ${pageNum}: ${pageUrl}`);

    // Get property links
    const propertyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.mod-bukkenList .prg-bundle .mod-mergeBuilding--sale .moduleInner .moduleHead h3 a'));
      return links.map(link => link.href);
    });

    // for (let i = 0; i < Math.min(30,propertyLinks.length) ; i++) {
    //   console.log(`Property ${i + 1} URL: ${propertyLinks[i]}`);
    // }

    console.log(`Found ${propertyLinks.length} properties on page ${pageNum}.`);

    for (let i = 0; i < propertyLinks.length; i++) {
      await delay(randomtime()); // Wait for random seconds to ensure the page is fully loaded

      const url = propertyLinks[i];
      const detailPage = await browser.newPage();
      await detailPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

      // Create folder for images
      const propertyFolderName = `property_${i + 1 + (pageNum - 1) * propertyLinks.length}`;
      const propertyFolderPath = path.join(imageDir, propertyFolderName);
      if (!fs.existsSync(propertyFolderPath)) {
        fs.mkdirSync(propertyFolderPath);
      }

      // Extract image URLs
      const imageUrls = await detailPage.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.max-w-screen.object-contain'));
        console.log('Image count:', imgs.length);
        return imgs.slice(0, 5).map(img => img.src || img.getAttribute('rel'));
      });

      console.log('count: %d', imageUrls.length);

      // Download images into folder
      // await delay(randomtime); // Wait for 2 seconds before downloading images

      for (let j = 0; j < imageUrls.length; j++) {
        const imageUrl = imageUrls[j];
        console.log("imageUrl: ", imageUrl);
        const imagePath = path.join(propertyFolderPath, `image_${j + 1}.jpg`);
        try {
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(imagePath, response.data);
        } catch (err) {
          console.error(`Failed to download image ${imageUrl}: ${err.message}`);
        }
      }

      const detailinfo = await detailPage.evaluate(() => {
        const info = [];
        let element = '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(1) td p');
        info[0] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(2) td');
        info[1] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(3) td');
        info[2] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(4) td');
        info[3] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(5) td');
        info[4] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(6) td');
        info[5] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(7) td');
        info[6] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(8) td');
        info[7] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(9) td');
        info[8] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(10) td');
        info[9] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(11) td');
        info[10] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(12) td');
        info[11] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(13) td');
        info[12] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(14) td');
        info[13] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(15) td');
        info[14] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(16) td');
        info[15] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(17) td');
        info[16] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(18) td');
        info[17] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(19) td div p');
        info[18] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(20) td');
        info[19] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(21) td');
        info[20] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(22) td');
        info[21] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(23) td');
        info[22] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(24) td');
        info[23] = element ? element.textContent.trim() : '';
        element = document.querySelector('tbody.divide-y.divide-mono-300 tr:nth-child(25) td');
        info[24] = element ? element.textContent.trim() : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(1)');
        info[25] = element ? element.textContent.trim().split('：')[1] : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(2)');
        info[26] = element ? element.textContent.trim().split('：')[1] : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(3)');
        info[27] = element ? element.textContent.trim().split('：')[1] : '';
        element = document.querySelector('#about div.mt-6 div.space-y-1 p:nth-child(4)');


        element = document.querySelector('.sticky.w-80.rounded-lg div div div p');
        info[28] = element ? element.textContent.trim().replace(/[^0-9\- \(\)]/g, '').trim() : '';

        element = document.querySelector('.sticky.w-80.rounded-lg .mt-4.space-y-1 p:nth-child(2)');
        info[29] = element ? element.textContent.trim().split('：')[1] : '';


        return info;
      });

      // Prepare data record
      const record = {
        url,
        'ImageURLs1': imageUrls[0],
        'ImageURLs2': imageUrls[1],
        'ImageURLs3': imageUrls[2],
        'ImageURLs4': imageUrls[3],
        'ImageURLs5': imageUrls[4],
        'info1': detailinfo[0],
        'info2': detailinfo[1],
        'info3': detailinfo[2],
        'info4': detailinfo[3],
        'info5': detailinfo[4],
        'info6': detailinfo[5],
        'info7': detailinfo[6],
        'info8': detailinfo[7],
        'info9': detailinfo[8],
        'info10': detailinfo[9],
        'info11': detailinfo[10],
        'info12': detailinfo[11],
        'info13': detailinfo[12],
        'info14': detailinfo[13],
        'info15': detailinfo[14],
        'info16': detailinfo[15],
        'info17': detailinfo[16],
        'info18': detailinfo[17],
        'info19': detailinfo[18],
        'info20': detailinfo[19],
        'info21': detailinfo[20],
        'info22': detailinfo[21],
        'info23': detailinfo[22],
        'info24': detailinfo[23],
        'info25': detailinfo[24],
        'info26': detailinfo[25],
        'info27': detailinfo[26],
        'info28': detailinfo[27],
        'info29': detailinfo[28] || '', // 株式会社
        'info30': detailinfo[29] || '' // Tel
      };

      // Add record to all records array
      allRecords.push(record);
      await detailPage.close();
    }
    // Click the "nextPage" button to navigate to the next page
    const nextPageButtonSelector = '.nextPage';
    const nextPageExists = await page.$(nextPageButtonSelector);

    if (nextPageExists) {
      console.log('Navigating to the next page...');
      await page.click(nextPageButtonSelector);
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
    } else {
      console.log('No next page button found. Ending pagination.');
    }
  }

  // Save the CSV file
  const csvPath = path.join(parentDir, 'scrapping.csv');
  const csvWriter = createCsvWriter({
    path: csvPath,
    header: [
      { id: 'url', title: '不動産のURL' },
      { id: 'ImageURLs1', title: '画像1' },
      { id: 'ImageURLs2', title: '画像2' },
      { id: 'ImageURLs3', title: '画像3' },
      { id: 'ImageURLs4', title: '画像4' },
      { id: 'ImageURLs5', title: '画像5' },
      { id: 'info30', title: '株式会社' },
      { id: 'info29', title: 'Tel' },
      { id: 'info1', title: '価格' },
      { id: 'info2', title: '管理費等' },
      { id: 'info3', title: '修繕積立金' },
      { id: 'info4', title: '間取り' },
      { id: 'info5', title: '専有面積' },
      { id: 'info6', title: 'バルコニー面積' },
      { id: 'info7', title: '駐車場' },
      { id: 'info8', title: '築年月' },
      { id: 'info9', title: '所在地' },
      { id: 'info10', title: '交通' },
      { id: 'info11', title: '所在階 / 階数' },
      { id: 'info12', title: '総戸数' },
      { id: 'info13', title: '主要採光面' },
      { id: 'info14', title: '建物構造' },
      { id: 'info15', title: '用途地域' },
      { id: 'info16', title: '土地権利' },
      { id: 'info17', title: '国土法届出' },
      { id: 'info18', title: '管理' },
      { id: 'info19', title: '現況' },
      { id: 'info20', title: '引渡し' },
      { id: 'info21', title: '取引態様' },
      { id: 'info22', title: 'その他条件' },
      { id: 'info23', title: '備考' },
      { id: 'info24', title: 'LIFULL HOME\'S 物件番号' },
      { id: 'info25', title: '自社物件番号' },
      { id: 'info26', title: '情報公開日' },
      { id: 'info27', title: '最新情報提供日' },
      { id: 'info28', title: '情報有効期限' },
    ],
    encoding: 'utf8',
    alwaysQuote: true
  });
  await csvWriter.writeRecords(allRecords);
  console.log('Scraping complete! Data saved as CSV.');

  await browser.close();
})();