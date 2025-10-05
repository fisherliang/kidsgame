(() => {
  const VOICE_ON_KEY = 'cg_voice_on';
  const voiceEnabled = () => localStorage.getItem(VOICE_ON_KEY)!=='off';
  const setVoice = (on) => localStorage.setItem(VOICE_ON_KEY, on? 'on':'off');

  const CATEGORIES = [
    { name: '水果', icon: '🍎', items: [
      {label:'西瓜', emoji:'🍉'}, {label:'蘋果', emoji:'🍎'}, {label:'香蕉', emoji:'🍌'}, {label:'草莓', emoji:'🍓'}, {label:'葡萄', emoji:'🍇'}, 
      {label:'鳳梨', emoji:'🍍'}, {label:'橘子', emoji:'🍊'}, {label:'檸檬', emoji:'🍋'}, {label:'櫻桃', emoji:'🍒'}, {label:'奇異果', emoji:'🥝'}
    ]},
    { name: '動物', icon: '🐻', items: [
      {label:'狗狗', emoji:'🐶'}, {label:'貓咪', emoji:'🐱'}, {label:'大象', emoji:'🐘'}, {label:'獅子', emoji:'🦁'}, {label:'兔兔', emoji:'🐰'},
      {label:'狐狸', emoji:'🦊'}, {label:'猴子', emoji:'🐒'}, {label:'青蛙', emoji:'🐸'}, {label:'貓頭鷹', emoji:'🦉'}
    ]},
    { name: '交通工具', icon: '🚗', items: [
      {label:'小汽車', emoji:'🚗'}, {label:'飛機', emoji:'✈️'}, {label:'小火車', emoji:'🚂'}, {label:'腳踏車', emoji:'🚲'}, {label:'船船', emoji:'⛵️'},
      {label:'救護車', emoji:'🚑'}, {label:'計程車', emoji:'🚕'}, {label:'摩托車', emoji:'🛵'}, {label:'直升機', emoji:'🚁'}
    ]}
  ];

  const rail = document.getElementById('rail');
  const statusEl = document.getElementById('status');
  const live = document.getElementById('live');
  const confetti = document.getElementById('confetti');

  const btnNew = document.getElementById('btn-new');
  const btnVoice = document.getElementById('btn-voice');

  const say = (text) => {
    if (!voiceEnabled()) return; 
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-TW';
      u.rate = 1.05;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }catch(e){ /* ignore */ }
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function pickRoundItems(){
    // pick 2 items from each category => total 6
    const picks=[];
    for(const cat of CATEGORIES){
      const items = shuffle([...cat.items]).slice(0,2).map(x=>({...x, category:cat.name}));
      picks.push(...items);
    }
    return shuffle(picks);
  }

  let remaining = 0;

  function renderRail(items){
    rail.innerHTML = '';
    remaining = items.length;
    for(const it of items){
      const el = document.createElement('div');
      el.className = 'sticker';
      el.draggable = true;
      el.setAttribute('role','img');
      el.setAttribute('aria-grabbed','false');
      el.dataset.category = it.category;
      el.dataset.label = it.label;
      el.textContent = it.emoji;
      const badge = document.createElement('span');
      badge.className='badge';
      badge.textContent = it.label;
      el.appendChild(badge);

      el.addEventListener('dragstart', e=>{
        e.dataTransfer.setData('text/plain', JSON.stringify({c: it.category, l: it.label, e: it.emoji}));
        e.dataTransfer.effectAllowed='move';
        el.style.opacity=.7; el.style.transform='scale(0.98)';
        el.setAttribute('aria-grabbed','true');
        live.textContent = `抓起 ${it.label}`;
      });
      el.addEventListener('dragend', ()=>{ el.style.opacity=''; el.style.transform=''; el.setAttribute('aria-grabbed','false'); });

      rail.appendChild(el);
    }
    statusEl.textContent = '把貼紙放到正確的家';
  }

  function initZones(){
    document.querySelectorAll('.zone').forEach(zone=>{
      zone.addEventListener('dragover', e=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; zone.classList.add('active'); });
      zone.addEventListener('dragleave', ()=> zone.classList.remove('active'));
      zone.addEventListener('drop', e=>{
        e.preventDefault();
        zone.classList.remove('active');
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const need = zone.dataset.accept;
        if(data.c === need){
          onCorrectDrop(zone, data);
        }else{
          onWrongDrop(zone, data);
        }
      });
    });
  }

  function onCorrectDrop(zone, data){
    // remove the dragged sticker from rail
    const toRemove = [...rail.children].find(x => x.dataset && x.dataset.label===data.l && x.dataset.category===data.c);
    if(toRemove){ toRemove.remove(); }

    // create a pinned sticker inside zone
    const pin = document.createElement('div');
    pin.className = 'sticker small';
    pin.textContent = data.e;
    pin.title = data.l;
    pin.style.cursor='default';
    pin.draggable=false;
    zone.appendChild(pin);

    zone.classList.add('correct');
    setTimeout(()=> zone.classList.remove('correct'), 600);

    live.textContent = `${data.l} 放對了！`;
    say(`${data.l}，${data.c}`);

    remaining--;
    if(remaining<=0){
      celebrate();
      statusEl.textContent = '太棒了！全部完成！按「下一回合」再玩一次';
      say('太棒了！全部完成！');
    }else{
      statusEl.textContent = `很好！還有 ${remaining} 張貼紙`;
    }
  }

  function onWrongDrop(zone, data){
    statusEl.textContent = `再想想看～ ${data.l} 不屬於 ${zone.dataset.accept}`;
    live.textContent = `放錯了，${data.l} 不是 ${zone.dataset.accept}`;
    shake(zone);
  }

  function shake(el){
    el.animate([
      {transform:'translateX(0)'},
      {transform:'translateX(-6px)'},
      {transform:'translateX(6px)'},
      {transform:'translateX(0)'}
    ], {duration:220, iterations:1});
  }

  function celebrate(){
    // simple confetti
    confetti.innerHTML='';
    const colors=['#22c55e','#ef4444','#3b82f6','#f59e0b','#a855f7'];
    for(let i=0;i<80;i++){
      const s=document.createElement('span');
      s.style.left = Math.random()*100+'%';
      s.style.background = colors[Math.floor(Math.random()*colors.length)];
      s.style.animationDuration = (2 + Math.random()*2)+'s';
      s.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
      confetti.appendChild(s);
    }
    setTimeout(()=> confetti.innerHTML='', 3500);
  }

  function resetZones(){
    document.querySelectorAll('.zone').forEach(z=>{
      // keep headers and hint, remove pinned stickers
      [...z.querySelectorAll('.sticker')].forEach(s=>s.remove());
    });
  }

  function newRound(){
    resetZones();
    const items = pickRoundItems();
    renderRail(items);
  }

  // init
  initZones();
  newRound();

  btnNew.addEventListener('click', newRound);
  // voice toggle
  function refreshVoiceBtn(){ btnVoice.textContent = `語音：${voiceEnabled()? '開':'關'}`; }
  btnVoice.addEventListener('click', ()=>{ setVoice(!voiceEnabled()); refreshVoiceBtn(); });
  refreshVoiceBtn();
})();