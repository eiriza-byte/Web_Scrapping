const { chromium } = require('playwright');
const fs = require('fs'); // Built-in Node.js module to write files

async function scrapeALUCanvas() {
 // 1. Launch a normal, visible browser window
 const browser = await chromium.launch({ headless: false });
 const page = await browser.newPage();

 console.log('Navigating to ALU Canvas...');
 await page.goto('https://alueducation.instructure.com/courses/3130/assignments');

 // 2. PAUSE AND HANDOFF TO STUDENT FOR GOOGLE AND 2FA LOGIN
 console.log('\n======================================================');
 console.log('ACTION REQUIRED: Please log in using your student Google account.');
 console.log('Complete any 2FA prompts on your mobile device if required.');
 console.log('======================================================\n');

 // The script will wait indefinitely (timeout: 0) until it detects that the browser
 // has successfully redirected past the login screens and onto the Canvas dashboard.
 await page.waitForURL('**/courses**', { timeout: 0 });

 console.log('Login verified! Arrived at the Canvas Dashboard.');
 console.log('Navigating to the "Frontend Web development" course...');

 // 3. Navigate into the Course and to the Assignments tab
 // Playwright text locators make it easy to find links without raw CSS codes
 await page.goto('https://alueducation.instructure.com/courses/3130/assignments');
 await page.waitForLoadState('networkidle');

 // Wait for the assignment container structure to render on the screen
  await page.waitForSelector('.ig-row', { timeout: 15000 }).catch(() => {
    console.log('Selectors not found.');
  });
  console.log('Page title:', await page.title());

 // 4. Locate all assignment cards or rows
 // Canvas typically organizes assignments inside rows matching '.ig-row'
 const assignmentRows = await page.locator('.assignment-list .ig-row').all();
 const scrapedAssignments = [];

 console.log(`Detected ${assignmentRows.length} items. Extracting DOM elements...`);

 // 5. Loop through each row to safely pull details
 for (const row of assignmentRows) {
   try {
    // Pull Title
    const title = await row.locator('.ig-title').innerText();
    // Pull Due Date safely (Handles missing due dates without crashing)
    const dueDateElement = row.locator('.assignment-date-due');
    const dueDate = (await dueDateElement.count()) > 0
       ? await dueDateElement.innerText()
       : 'No due date';
    // Pull Status text (such as "Submitted", "Missing", or standard badge details)
    const statusElement = row.locator('.submission-status-container');
    const status = (await statusElement.count()) > 0
       ? await statusElement.innerText()
       : 'Not Submitted / Available';

    // Push cleanly formatted objects into our storage array
    scrapedAssignments.push({
       title: title.trim().replace(/\n/g, ' '),
       dueDate: dueDate.trim().replace(/\n/g, ' '),
       status: status.trim().replace(/\n/g, ' ')
    });
 } catch (error) {
    // If a single row parsing fails, skip it instead of breaking the entire scriptexecution loop
   continue;
 }
}
 // 6. OUTPUT 1: Visual Table in Terminal Console
 console.log('\n--- SCRAPED ASSIGNMENT DATA ---');
 console.table(scrapedAssignments);
 // 7. OUTPUT 2: Export Data to a local JSON file
 const outputFilename = 'canvas_assignments.json';
 // JSON.stringify params: (data, replacer function, indentation spaces)
 const jsonString = JSON.stringify(scrapedAssignments, null, 2);

 fs.writeFileSync(outputFilename, jsonString, 'utf-8');
 console.log(`\nSuccess! Clean JSON dataset saved locally to: ./${outputFilename}`);
 // Hold the browser open briefly before shutting down the script execution
 await page.waitForTimeout(5000);
 await browser.close();
}
scrapeALUCanvas();