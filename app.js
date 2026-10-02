
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
if(inp){var tm;inp.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(ds,250)})}

/* ── IAST/Roman → Devanagari transliteration ── */
var iast_map=[
['aa','आ'],['ii','ई'],['uu','ऊ'],['ee','ई'],['oo','ऊ'],
['ai','ऐ'],['au','औ'],['ei','ऐ'],['ou','औ'],
['ā','आ'],['ī','ई'],['ū','ऊ'],
['ṛ','ऋ'],['ṝ','ॠ'],
['kh','ख'],['gh','घ'],['ch','च'],['chh','छ'],['jh','झ'],
['Th','ठ'],['Dh','ढ'],['th','थ'],['dh','ध'],
['ph','फ'],['bh','भ'],['sh','श'],['Sh','ष'],
['tn','ञ'],['ng','ङ'],['ny','ञ'],
['k','क'],['g','ग'],['c','च'],['j','ज'],
['T','ट'],['D','ड'],['N','ण'],['t','त'],['d','द'],['n','न'],
['p','प'],['b','ब'],['m','म'],
['y','य'],['r','र'],['l','ल'],['v','व'],['w','व'],
['s','स'],['h','ह'],
['a','अ'],['i','इ'],['u','उ'],['e','ए'],['o','ओ']
];
var vowel_set=new Set('अआइईउऊऋॠएऐओऔ'.split(''));
var vowel_signs={'आ':'ा','इ':'ि','ई':'ी','उ':'ु','ऊ':'ू',
'ऋ':'ृ','ॠ':'ॄ','ए':'े','ऐ':'ै','ओ':'ो','औ':'ौ'};

function to_dev(s){
  s=s.toLowerCase().replace(/ṣ/g,'Sh').replace(/ḍ/g,'D').replace(/ṭ/g,'T').replace(/ṇ/g,'N');
  var out='',i=0,prev_cons=false;
  while(i<s.length){
    var matched=false;
    for(var p=0;p<iast_map.length;p++){
      var rom=iast_map[p][0],dev=iast_map[p][1];
      if(s.substr(i,rom.length)===rom){
        if(vowel_set.has(dev)){
          if(prev_cons&&vowel_signs[dev]){out+=vowel_signs[dev]}
          else if(prev_cons&&dev==='अ'){/* inherent a, skip */}
          else{out+=dev}
          prev_cons=false;
        }else{
          if(prev_cons)out+='्';
          out+=dev;
          prev_cons=true;
        }
        i+=rom.length;matched=true;break;
      }
    }
    if(!matched){
      if(prev_cons)out+='्';
      prev_cons=false;
      if(s[i]!==' ')out+=s[i];else out+=' ';
      i++;
    }
  }
  if(prev_cons)out+='्';
  return out;
}

function has_latin(s){return /[a-zA-ZĀ-ſḀ-ỿ]/.test(s)}

/* ── Normalize text for matching ── */
function norm(s){
  return s.replace(/[्ंः़‍‌]/g,'')
          .replace(/[।॥\-–—''""]/g,' ')
          .replace(/\s+/g,' ').trim();
}

/* ── Reference detection: 1.4.9 or 1/4/9 etc ── */
var ref_re=/^(\d{1,2})[.\/ ,\-]+(\d{1,3})[.\/ ,\-]+(\d{1,3})$/;
var dev_digits='०१२३४५६७८९';
function int_to_dev(n){return String(n).split('').map(function(d){return dev_digits[+d]}).join('')}

function try_ref(q){
  q=q.replace(/[स्कन्धअध्यायश्लोक]/g,'').replace(/\s+/g,' ').trim();
  var m=q.match(ref_re);
  if(!m)return null;
  return {c:+m[1],ch:+m[2],v:int_to_dev(+m[3])};
}

/* ── Main search ── */
function ds(){
  if(!si||!inp)return;
  var q=inp.value.trim();
  if(!q){res.innerHTML='';return}

  var b=bp();

  // Reference search
  var ref=try_ref(q);
  if(ref){
    var url=b+ref.c+'/'+ref.ch+'/#v'+ref.v;
    res.innerHTML='<a href="'+url+'" class="sri" style="border:2px solid var(--link)"><div class="rr">स्कन्ध '+ref.c+' · अध्याय '+ref.ch+' · श्लोक '+ref.v+'</div><div class="rt">→ इस श्लोक पर जाएं</div></a>';
    return;
  }

  // Transliterate if Latin input
  var search_q=q;
  if(has_latin(q))search_q=to_dev(q);

  // Split into words for multi-word AND matching
  var words=norm(search_q).split(/\s+/).filter(function(w){return w.length>0});
  if(!words.length){res.innerHTML='';return}

  var hits=[];
  for(var x=0;x<si.length;x++){
    var nt=norm(si[x].t);
    var all_match=true;
    for(var w=0;w<words.length;w++){
      if(nt.indexOf(words[w])===-1){all_match=false;break}
    }
    if(all_match)hits.push(si[x]);
    if(hits.length>=200)break;
  }

  if(!hits.length){
    res.innerHTML='<div style="padding:1rem;opacity:.6">कोई परिणाम नहीं मिला</div>';
    if(has_latin(q))res.innerHTML+='<div style="padding:0 1rem .5rem;opacity:.5;font-size:.85em">(खोज: "'+search_q+'")</div>';
    return;
  }

  var highlight_q=search_q;
  res.innerHTML=hits.map(function(r){
    var u=b+r.c+'/'+r.ch+'/#v'+r.v;
    var t=r.t.length>200?r.t.substring(0,200)+'…':r.t;
    // Highlight each word
    for(var w=0;w<words.length;w++){
      var wi=t.indexOf(words[w]);
      if(wi===-1){var nt2=norm(t);wi=nt2.indexOf(words[w]);if(wi!==-1){var wl=words[w].length;t=t.substring(0,wi)+'<mark style="background:rgba(218,157,91,.4)">'+t.substring(wi,wi+wl)+'</mark>'+t.substring(wi+wl)}}
      else{var wl=words[w].length;t=t.substring(0,wi)+'<mark style="background:rgba(218,157,91,.4)">'+t.substring(wi,wi+wl)+'</mark>'+t.substring(wi+wl)}
    }
    return '<a href="'+u+'" class="sri"><div class="rr">स्कन्ध '+r.c+' · अध्याय '+r.ch+' · श्लोक '+r.v+'</div><div class="rt">'+t+'</div></a>';
  }).join('')+(hits.length>=200?'<div style="padding:.5rem 1rem;opacity:.5;font-size:.85em">प्रथम 200 परिणाम दिखाए गए हैं। कृपया खोज को संक्षिप्त करें।</div>':'')+(has_latin(q)?'<div style="padding:.25rem 1rem .5rem;opacity:.5;font-size:.85em">(खोज: "'+search_q+'")</div>':'');
}

var gt=document.getElementById('gt');
if(gt){window.addEventListener('scroll',function(){gt.classList.toggle('on',window.scrollY>400)});gt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})})}
if(window.location.hash)setTimeout(function(){var e=document.querySelector(window.location.hash);if(e)e.scrollIntoView({behavior:'smooth',block:'center'})},300);
})();
