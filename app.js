
(function(){
var fs=parseFloat(localStorage.getItem('fs')||'1.125');
function apply(){document.documentElement.style.setProperty('--fs',fs)}
apply();
window.cfs=function(d){fs=Math.max(.75,Math.min(2,+(fs+d).toFixed(3)));apply();localStorage.setItem('fs',fs)};

var si=null,ov=document.getElementById('so'),inp=document.getElementById('si'),res=document.getElementById('sr');
function bp(){return document.documentElement.getAttribute('data-root')||'./'}
function open_s(){if(!ov)return;ov.classList.add('on');if(inp)inp.focus();if(!si)fetch(bp()+'search-index.json').then(function(r){return r.json()}).then(function(d){si=d}).catch(function(){})}
function close_s(){if(!ov)return;ov.classList.remove('on');if(inp)inp.value='';if(res)res.innerHTML=''}
document.querySelectorAll('.js-s').forEach(function(e){e.addEventListener('click',function(ev){ev.preventDefault();open_s()})});
if(ov)ov.addEventListener('click',function(e){if(e.target===ov)close_s()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close_s();if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();open_s()}});
if(inp){var tm;inp.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(ds,200)})}
function ds(){
  if(!si||!inp)return;var q=inp.value.trim();if(!q){res.innerHTML='';return}
  var h=si.filter(function(x){return x.t.indexOf(q)!==-1}).slice(0,50);
  if(!h.length){res.innerHTML='<div style="padding:1rem;opacity:.6">\u0915\u094b\u0908 \u092a\u0930\u093f\u0923\u093e\u092e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e</div>';return}
  var b=bp();
  res.innerHTML=h.map(function(r){
    var u=b+r.c+'/'+r.ch+'/#v'+r.v,t=r.t.length>150?r.t.substring(0,150)+'...':r.t;
    var i=t.indexOf(q);if(i!==-1)t=t.substring(0,i)+'<mark style="background:rgba(218,157,91,.4)">'+t.substring(i,i+q.length)+'</mark>'+t.substring(i+q.length);
    return '<a href="'+u+'" class="sri"><div class="rr">\u0938\u094d\u0915\u0928\u094d\u0927 '+r.c+' \u00b7 \u0905\u0927\u094d\u092f\u093e\u092f '+r.ch+' \u00b7 \u0936\u094d\u0932\u094b\u0915 '+r.v+'</div><div class="rt">'+t+'</div></a>';
  }).join('');
}
var gt=document.getElementById('gt');
if(gt){window.addEventListener('scroll',function(){gt.classList.toggle('on',window.scrollY>400)});gt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})})}
if(window.location.hash)setTimeout(function(){var e=document.querySelector(window.location.hash);if(e)e.scrollIntoView({behavior:'smooth',block:'center'})},300);
})();
