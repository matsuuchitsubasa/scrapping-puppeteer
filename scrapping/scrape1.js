const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomtime = (min = 0, max = 10) => Math.floor(Math.random() * (max - min + 1)) + min;

(async () => {
  // Create a timestamped parent folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const parentDir = path.join(__dirname, "suumo" + timestamp);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir);
  }

  const imageDir = path.join(parentDir, "Images");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

  const browser = await puppeteer.launch({ headless: false });
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
      await delay(randomtime(2000, 3000));
      const check = await page.evaluate(() => {
        let element = document.querySelectorAll('span.ui-label')[i];
        element = element ? element.textContent.trim() : '';
        return element;
      });
      console.log(`Check label: ${check}`);
      if (check !== '価格更新' && check !== '新着') continue;

      console.log(`${i + 1} Scrapping in the ${propertyLinks[i]}`);
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
        const imgs = Array.from(document.querySelectorAll('.js-slideLazy-image.js-noContextMenu'));
        const srcs = imgs.map(img => img.src || img.getAttribute('rel'));
        return srcs.slice(0, 5);
      });

      // Download images into folder
      for (let j = 0; j < imageUrls.length; j++) {
        const imageUrl = imageUrls[j];
        console.log(`Downloading image ${j + 1} from ${imageUrl}`);
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
        }
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
        'info29': detailinfo[28],
        'info30': detailinfo[29],
        'info31': detailinfo[30],
        'info32': detailinfo[31],
      };

      // Add record to all records array
      allRecords.push(record);

      await detailPage.close();
    }

    await page.close();
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
      { id: 'info31', title: '株式会社' },
      { id: 'info32', title: 'Tel' },
      { id: 'info1', title: '販売スケジュール' },
      { id: 'info2', title: 'イベント情報' },
      { id: 'info3', title: '販売戸数' },
      { id: 'info4', title: '最多価格帯' },
      { id: 'info5', title: '価格' },
      { id: 'info6', title: '管理費' },
      { id: 'info7', title: '修繕積立金' },
      { id: 'info8', title: '修繕積立基金' },
      { id: 'info9', title: '諸費用' },
      { id: 'info10', title: '間取り' },
      { id: 'info11', title: '専有面積' },
      { id: 'info12', title: 'その他面積' },
      { id: 'info13', title: '引渡可能時期' },
      { id: 'info14', title: '完成時期(築年月)' },
      { id: 'info15', title: '所在階' },
      { id: 'info16', title: '向き' },
      { id: 'info17', title: 'エネルギー消費性能' },
      { id: 'info18', title: '断熱性能' },
      { id: 'info19', title: '目安光熱費' },
      { id: 'info20', title: 'リフォーム' },
      { id: 'info21', title: 'その他制限事項' },
      { id: 'info22', title: 'その他概要・特記事項' },
      { id: 'info23', title: '所在地' },
      { id: 'info24', title: '交通' },
      { id: 'info25', title: '総戸数' },
      { id: 'info26', title: '構造・階建て' },
      { id: 'info27', title: '敷地面積' },
      { id: 'info28', title: '敷地の権利形態' },
      { id: 'info29', title: '用途地域' },
      { id: 'info30', title: '駐車場' },
    ],
    encoding: 'utf8',
    alwaysQuote: true
  });
  await csvWriter.writeRecords(allRecords);
  console.log('Scraping complete! Data saved as CSV.');

  await browser.close();
})();