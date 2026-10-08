import chromium from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';

export const maxDuration = 30;

async function extract(page, url, label) {
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForTimeout(2500);
  return await page.evaluate((label)=>({
    label,
    url:location.href,
    title:document.title,
    text:(document.body?.innerText||'').slice(0,50000),
    tables:[...document.querySelectorAll('table')].map((t,i)=>({
      index:i,
      rows:[...t.querySelectorAll('tr')].slice(0,200).map(tr=>[...tr.querySelectorAll('th,td')].map(td=>(td.innerText||td.textContent||'').trim().replace(/\s+/g,' ')))
    })),
    links:[...document.querySelectorAll('a')].map(a=>({
      text:(a.innerText||a.textContent||'').trim().replace(/\s+/g,' '),
      href:a.href
    })).filter(x=>x.text||x.href)
  }),label);
}

export default async function handler(req,res){
  const base='https://finbandy.torneopal.fi/taso/';
  let browser;
  try{
    browser=await playwright.launch({
      args:chromium.args,
      executablePath:await chromium.executablePath(),
      headless:true
    });
    const page=await browser.newPage({
      userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36',
      viewport:{width:1440,height:1200}
    });

    const common='turnaus=sjpl_2627&sarja=MBL';
    const data={};
    data.standings=await extract(page,base+'sarja.php?'+common,'Sarjataulukko');
    data.matches=await extract(page,base+'sarja.php?'+common+'&ottelut=1','Kaikki ottelut');
    data.scorers=await extract(page,base+'maaliporssi.php?'+common+'&lohko=5','Runkosarja maalipörssi');

    // Keep a compact list of likely match links from the all-matches page.
    data.match_links=data.matches.links.filter(x=>
      /ottelu|match|jps|veiterä|akilles|botnia|hifk|kampparit|narukerä|ols|wp 35/i.test(x.text+' '+x.href)
    ).slice(0,300);

    res.status(200).json({ok:true,data});
  }catch(e){
    res.status(500).json({ok:false,error:String(e),stack:e?.stack||''});
  }finally{
    if(browser) await browser.close().catch(()=>{});
  }
}
