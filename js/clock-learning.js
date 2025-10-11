const canvas = document.getElementById('clock');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const checkBtn = document.getElementById('check-btn');
    const message = document.getElementById('message');
    const voiceToggle = document.getElementById('voice-toggle');
    const levelSelect = document.getElementById('level');
    const hint = document.getElementById('hint');
    const hourValue = document.getElementById('hour-value');
    const minuteValue = document.getElementById('minute-value');

    let hourAngle = 0, minuteAngle = 0;
    let targetTime = {hour: 0, minute: 0};

    function drawClock() {
      ctx.clearRect(0, 0, 300, 300);

      ctx.beginPath();
      ctx.arc(150, 150, 140, 0, Math.PI * 2);
      ctx.strokeStyle = '#0D254D';
      ctx.lineWidth = 6;
      ctx.stroke();

      // 刻度線
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60 - Math.PI / 2;
        const isHourMark = i % 5 === 0;
        const inner = isHourMark ? 110 : 120;
        const outer = 135;
        ctx.beginPath();
        ctx.moveTo(150 + Math.cos(angle) * inner, 150 + Math.sin(angle) * inner);
        ctx.lineTo(150 + Math.cos(angle) * outer, 150 + Math.sin(angle) * outer);
        ctx.lineWidth = isHourMark ? 4 : 1;
        ctx.strokeStyle = '#0D254D';
        ctx.stroke();
      }

      // 數字
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let n = 1; n <= 12; n++) {
        const angle = (n - 3) * (Math.PI * 2) / 12;
        const x = 150 + Math.cos(angle) * 90;
        const y = 150 + Math.sin(angle) * 90;
        ctx.fillText(n, x, y);
      }

      // 時針
      ctx.save();
      ctx.translate(150,150);
      ctx.rotate(hourAngle - Math.PI/2);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(60,0);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#1E3A8A';
      ctx.stroke();
      ctx.restore();

      // 分針
      ctx.save();
      ctx.translate(150,150);
      ctx.rotate(minuteAngle - Math.PI/2);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(100,0);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2563EB';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(150,150,5,0,Math.PI*2);
      ctx.fillStyle = '#0D254D';
      ctx.fill();

      updateTextValues();
    }

    function updateTextValues() {
      let hour = ((hourAngle + Math.PI*2) % (Math.PI*2)) / (Math.PI*2) * 12;
      let minute = ((minuteAngle + Math.PI*2) % (Math.PI*2)) / (Math.PI*2) * 60;
      hour = Math.round(hour) || 12;
      minute = Math.round(minute) % 60;
      const paddedMinute = minute.toString().padStart(2, '0');
      hourValue.textContent = `${hour} 點`;
      minuteValue.textContent = `${paddedMinute} 分`;
    }

    function updateHands(type, direction) {
      const step = type === 'hour' ? (Math.PI / 6) / 5 : Math.PI / 30;
      if (type === 'hour') hourAngle += direction * step;
      else minuteAngle += direction * step;
      drawClock();
      hint.textContent = `目前控制：${type === 'hour' ? '時針（短針）' : '分針（長針）'}`;
    }

    document.getElementById('hour-plus').onclick = () => updateHands('hour', +1);
    document.getElementById('hour-minus').onclick = () => updateHands('hour', -1);
    document.getElementById('minute-plus').onclick = () => updateHands('minute', +1);
    document.getElementById('minute-minus').onclick = () => updateHands('minute', -1);

    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'm': case 'M': updateHands('minute', +1); break;
        case 'n': case 'N': updateHands('minute', -1); break;
        case 'z': case 'Z': updateHands('hour', -1); break;
        case 'x': case 'X': updateHands('hour', +1); break;
      }
    });

    function speak(text){
      if (!voiceToggle.checked) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-TW';
      speechSynthesis.speak(u);
    }

    function randomTime(level){
      let h = Math.floor(Math.random()*12)+1;
      let m=0;
      if(level==2) m=30;
      else if(level==3) m=20;
      else if(level==4) m=15;
      else if(level==5) m=Math.floor(Math.random()*60);
      return {hour:h,minute:m};
    }

    function startQuestion(){
      targetTime = randomTime(parseInt(levelSelect.value));
      let text = `請把時鐘轉到${targetTime.hour}點`;
      if(targetTime.minute>0) text += `${targetTime.minute}分`;
      message.textContent = text;
      speak(text);
    }

    function checkAnswer(){
      let h = ((hourAngle+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*12;
      let m = ((minuteAngle+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*60;
      let hDiff = Math.abs(h - targetTime.hour);
      let mDiff = Math.abs(m - targetTime.minute);
      if(hDiff>6) hDiff = 12 - hDiff;
      if(mDiff>30) mDiff = 60 - mDiff;

      if(hDiff<0.5 && mDiff<5){
        const t = `太棒了！現在是${targetTime.hour}點${targetTime.minute>0?targetTime.minute+'分':''}！`;
        message.textContent = t;
        speak(t);
      }else{
        message.textContent = '差一點點，再試試看喔～';
        speak('差一點點，再試試看喔～');
      }
    }

    startBtn.addEventListener('click', startQuestion);
    checkBtn.addEventListener('click', checkAnswer);
    drawClock();