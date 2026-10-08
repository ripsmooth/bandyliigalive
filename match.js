import chromium from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';

export const maxDuration = 30;

export default async function handler(req,res){
  const id=String(req.query?.id || '24901').replace(/[^0-9]/g,'');
  const target='https://finbandy.torneopal.fi/taso/ottelu.php?ottelu='+id;
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

    const responses=[];
    page.on('response',r=>{
      const u=r.url();
      if(u.includes('torneopal')||u.includes('finbandy')){
        responses.push({status:r.status(),url:u.slice(0,800)});
      }
    });

    await page.goto(target,{waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForTimeout(4000);

    const data=await page.evaluate(()=>({
      url:location.href,
      title:document.title,
      text:(document.body?.innerText||'').slice(0,50000),
      htmlBytes:document.documentElement?.outerHTML?.length||0,
      tables:[...document.querySelectorAll('table')].map((t,i)=>({
        index:i,
        rows:[...t.querySelectorAll('tr')].slice(0,100).map(tr=>
          [...tr.querySelectorAll('th,td')].map(td=>
            (td.innerText||td.textContent||'').trim().replace(/\s+/g,' ')
          )
        )
      })),
      links:[...document.querySelectorAll('a')].map(a=>({
        text:(a.innerText||a.textContent||'').trim().replace(/\s+/g,' '),
        href:a.href
      })).filter(x=>x.text||x.href).slice(0,300),
      scripts:[...document.querySelectorAll('script')].map(s=>s.src||'inline').slice(0,100)
    }));

    res.status(200).json({ok:true,id,target,data,responses:responses.slice(-100)});
  }catch(e){
    res.status(500).json({ok:false,id,target,error:String(e),stack:e?.stack||''});
  }finally{
    if(browser) await browser.close().catch(()=>{});
  }
}
