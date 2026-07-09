/* YektaD first-party analytics — no cookies, no IPs, no personal data */
(function(){try{
if(/bot|crawl|spider|lighthouse/i.test(navigator.userAgent))return;
var K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2c2R3Y2VidmF6ZHRtd2d4aHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDMzMTMsImV4cCI6MjA2NTY3OTMxM30.86kBRTyXJT2Yp9IkPjus3mur19UDQ4GN_YpZn0rPGeM';
var v=localStorage.getItem('yd-vid');if(!v){v=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('yd-vid',v);}
var q=new URLSearchParams(location.search).get('ref');
var host='direct';
try{
 if(q)host=q+' (link tag)';
 else if(document.referrer){host=new URL(document.referrer).hostname.replace(/^www\./,'');
  if(host===location.hostname.replace(/^www\./,''))return;}
}catch(e){}
fetch('https://hvsdwcebvazdtmwgxhuf.supabase.co/rest/v1/crochets_hits',{method:'POST',keepalive:true,
 headers:{apikey:K,Authorization:'Bearer '+K,'content-type':'application/json',Prefer:'return=minimal'},
 body:JSON.stringify({site:location.hostname.replace(/^www\./,''),path:location.pathname.slice(0,120),ref:host.slice(0,80),device:innerWidth<820?'mobile':'desktop',visitor:v.slice(0,40)})});
}catch(e){}})();
