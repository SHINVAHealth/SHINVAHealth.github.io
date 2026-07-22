const https=require('https');
function head(u){return new Promise(r=>{const req=https.request(u,{method:'HEAD',timeout:12000},res=>{r(u+' -> '+res.statusCode);res.resume();});req.on('error',e=>r(u+' -> ERR '+e.code));req.end();});}
(async()=>{
  for(const u of ['https://d413d9e806b44831b302566204ddda40.app.codebuddy.work/worldmap.html','https://a61085674b0a4c5e82ea5116f8aea9d1.app.codebuddy.work/worldmap.html']){
    console.log(await head(u));
  }
})();
