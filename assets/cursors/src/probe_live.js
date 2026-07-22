const https=require('https');
function head(u){return new Promise(r=>{const req=https.request(u,{method:'HEAD',timeout:12000},res=>{r(u+' -> '+res.statusCode);res.resume();});req.on('error',e=>r(u+' -> ERR '+e.code));req.end();});}
(async()=>{
  for(const u of ['https://SHINVAHealth.github.io/worldmap.html','https://CheungChingSan.github.io/worldmap.html']){
    console.log(await head(u));
  }
})();
