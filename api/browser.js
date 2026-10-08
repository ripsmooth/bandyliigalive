import chromium from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';

export const maxDuration = 30;

export default async function handler(req, res) {
  const target = 'https://finbandy.torneopal.fi/taso/sarja.php?turnaus=sjpl_2627&sarja=MBL';
  let browser;
  try {
    browser = await playwright.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 1000 }
    });

    const responses = [];
    page.on('response', r => {
      const u = r.url();
      if (u.includes('torneopal') || u.includes('finbandy')) {
        responses.push({status:r.status(), url:u.slice(0,500)});
      }
    });

    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      text: document.body?.innerText?.slice(0,20000) || '',
      tables: document.querySelectorAll('table').length,
      links: document.querySelectorAll('a').length,
      scripts: document.querySelectorAll('script').length,
      htmlBytes: document.documentElement?.outerHTML?.length || 0
    }));

    res.status(200).json({
      ok: true,
      target,
      ...data,
      responses: responses.slice(-30)
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: String(e),
      stack: e?.stack || ''
    });
  } finally {
    if (browser) await browser.close().catch(()=>{});
  }
}
