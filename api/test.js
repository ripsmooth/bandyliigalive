export default async function handler(req,res){
  const target="https://finbandy.torneopal.fi/taso/sarja.php?turnaus=sjpl_2627&sarja=MBL";
  try{
    const r=await fetch(target,{headers:{
      "User-Agent":"Mozilla/5.0 (compatible; BandyliigaTest/1.0)",
      "Accept":"text/html,application/xhtml+xml"
    }});
    const html=await r.text();
    const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.replace(/<[^>]+>/g,"").trim()||"";
    const tables=(html.match(/<table\b/gi)||[]).length;
    const links=(html.match(/<a\b/gi)||[]).length;
    const matchHints=(html.match(/(ottelu|match|JPS|Veiterä|Bandyliiga|sarjataulukko)/gi)||[]).length;
    res.status(200).json({
      target,http_status:r.status,bytes:Buffer.byteLength(html),
      title,tables,links,match_hints:matchHints,
      html_preview:html.slice(0,12000)
    });
  }catch(e){
    res.status(500).json({error:String(e),target});
  }
}
