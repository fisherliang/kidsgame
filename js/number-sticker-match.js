    const forest = document.getElementById('forest');
    const question = document.getElementById('question');
    const options = document.getElementById('options');
    const statusEl = document.getElementById('status');
    const nextBtn = document.getElementById('nextBtn');
    const voiceBtn = document.getElementById('voiceBtn');

    const VOICE_KEY = 'apple_voice_on';
    let voiceOn = (localStorage.getItem(VOICE_KEY) ?? 'on') !== 'off';
    voiceBtn.textContent = `語音：${voiceOn ? '開' : '關'}`;

    let resolved = false; // 當題是否已答對完結

    function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
    function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }

    function speak(text){
      if(!voiceOn) return;
      try{
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-TW';
        u.rate = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }catch(e){ /* ignore */ }
    }

    function generateApples(count){
      forest.innerHTML = '';
      let remaining = count;
      for(let i=0;i<3;i++){
        const tree = document.createElement('div');
        tree.className = 'tree';
        const trunk = document.createElement('div');
        trunk.className = 'trunk';
        tree.appendChild(trunk);
        const appleCount = (i < 2) ? rand(0, remaining) : remaining; // 確保總數等於 count
        remaining -= appleCount;
        for(let j=0;j<appleCount;j++){
          const apple = document.createElement('div');
          apple.className = 'apple';
          apple.textContent = '🍎';
          apple.style.left = rand(10,80)+'px';
          apple.style.top = rand(10,80)+'px';
          tree.appendChild(apple);
        }
        forest.appendChild(tree);
      }
    }

    function distinctOptions(correct){
      const set = new Set([correct]);
      while(set.size < 3){
        const n = rand(1,10);
        if(!set.has(n)) set.add(n);
      }
      return shuffle(Array.from(set));
    }

    function generateQuestion(){
      resolved = false;
      const total = rand(1,10);
      generateApples(total);
      question.textContent = '請問這三棵樹上共有幾顆蘋果呢？';
      statusEl.textContent = '';
      speak('請問這三棵樹上共有幾顆蘋果呢？');

      const answers = distinctOptions(total);
      options.innerHTML = '';
      answers.forEach(a => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.setAttribute('role','button');
        btn.setAttribute('tabindex','0');
        btn.textContent = a;
        btn.onclick = () => checkAnswer(a, total, btn);
        btn.onkeydown = (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); btn.click(); } };
        options.appendChild(btn);
      });
    }

    function lockAllOptions(){
      document.querySelectorAll('.option').forEach(b=> b.style.pointerEvents='none');
    }

    function checkAnswer(selected, correct, btn){
      if(resolved) return; // 這題已結束
      if(btn.classList.contains('wrong')) return; // 已選過錯誤的按鈕不再重覆觸發

      if(selected === correct){
        resolved = true;
        btn.classList.add('correct');
        const msg = `答對了！總共有 ${correct} 顆蘋果！`;
        statusEl.textContent = `🎉 ${msg}`;
        speak(msg);
        lockAllOptions();
        forest.animate([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}],{duration:600});
      } else {
        btn.classList.add('wrong'); // 僅鎖定錯誤選項，其餘可繼續作答
        const msg = '再想想～不是這個數字喔！';
        statusEl.textContent = msg;
        speak(msg);
        forest.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});
      }
    }

    nextBtn.onclick = generateQuestion;

    voiceBtn.onclick = () => {
      voiceOn = !voiceOn;
      localStorage.setItem(VOICE_KEY, voiceOn ? 'on' : 'off');
      voiceBtn.textContent = `語音：${voiceOn ? '開' : '關'}`;
      const msg = voiceOn ? '語音已開啟' : '語音已關閉';
      speak(msg);
    };

    generateQuestion();