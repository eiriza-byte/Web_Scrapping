const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('dom.html', 'utf-8');
const dom = new JSDOM(html);

global.window = dom.window;
global.document = dom.window.document;

const $ = require('jquery');

function scrapeData() {
  const rows = $('.assignment-list .ig-row');

  console.log(`\nFound ${rows.length} assignment(s):\n`);

  rows.each((i, el) => {
    const $row = $(el);

    const title = $row.find('.ig-title').text().trim().replace(/\s+/g, ' ');
    const link = $row.find('.ig-title').attr('href') || 'No link available';
    const status = $row.find('.submission-status-container').text().trim().replace(/\s+/g, ' ') || 'Not Submitted / Available';
    const dueDate = $row.find('.assignment-date-due').text().trim().replace(/\s+/g, ' ') || 'No due date';

    console.log(`${i + 1}. ${title}`);
    console.log(`   Status: ${status}`);
    console.log(`   Due Date: ${dueDate}`);
    console.log(`   Link: ${link}`);
    console.log('');
  });
}

scrapeData();