import express from 'express';
import { chromium } from 'playwright';

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const browser = await chromium.launch({
    headless: true,
    chromiumSandbox: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://instagram.com');
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  await browser.close();
  res.json({ title });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});