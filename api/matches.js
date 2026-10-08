import chromium from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';

export const maxDuration = 30;

export default async function handler(req, res) {
  const target='https://finbandy.torneopal.fi/taso/sarja.php?turnaus=sjpl_2627&sarja=MBL';
  let browser;
  try {
    browser=await playwright.launch({
      args:chromium.args,
      executablePath:await chromium.executablePath(),
      headless:true
    });

    const page=await browser.newPage({
      userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36',
      viewport:{width:1440,height:1200}
    });

    await page.goto(target,{waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForTimeout(3000);

    const before=await page.evaluate(()=>({
      url:location.href,
      title:document.title,
      links:[...document.querySelectorAll('a')].map(a=>({
        text:(a.innerText||a.textContent||'').trim().replace(/\s+/g,' '),
        href:a.href
      })).filter(x=>x.text||x.href)
    }));

    // Look for a link to the regular season / match schedule.
    const candidates=before.links.filter(x=>
      /runkosarja|ottelu|otteluohjelma|matches/i.test(x.text+' '+x.href)
    );

    let opened=null;
    if(candidates.length){
      const chosen=candidates.find(x=>/runkosarja/i.test(x.text)) || candidates[0];
      await page.goto(chosen.href,{waitUntil:'domcontentloaded',timeout:20000});
      await page.waitForTimeout(3000);
      opened=await page.evaluate(()=>({
        url:location.href,
        title:document.title,
        text:document.body?.innerText?.slice(0,30000)||'',
        tables:document.querySelectorAll('table').length,
        links:[...document.querySelectorAll('a')].map(a=>({
          text:(a.innerText||a.textContent||'').trim().replace(/\s+/g,' '),
          href:a.href
        })).filter(x=>/ottelu|match|jps|veiterä|akilles|botnia|hifk|kampparit|narukerä|ols|wp 35/i.test(x.text+' '+x.href)).slice(0,150)
      }));
    }

    res.status(200).json({
      ok:true,
      main:{url:before.url,title:before.title},
      candidate_links:candidates,
      opened
    });
  } catch(e){
    res.status(500).json({ok:false,error:String(e),stack:e?.stack||''});
  } finally {
    if(browser) await browser.close().catch(()=>{});
  }
}
