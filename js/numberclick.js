let currentNumber;
let questionCount = 0;
let correctCount = 0;
const totalQuestions = 10;
let pressedKey = null;
let voiceEnabled = true;

const body = document.body;
const gameDiv = document.getElementById("game");
const messageDiv = document.getElementById("message");
const resultDiv = document.getElementById("result");
const restartBtn = document.getElementById("restart");
const voiceToggle = document.getElementById("voiceToggle");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

// 🔊 語音播放
function speak(text) {
  if (!voiceEnabled) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-TW";
  utterance.rate = 1.1;
  speechSynthesis.speak(utterance);
}

function newQuestion() {
  currentNumber = Math.floor(Math.random() * 10);
  gameDiv.textContent = currentNumber;
  messageDiv.textContent = "請按鍵盤上的數字鍵";
  body.style.backgroundColor = "#f0f8ff";
  pressedKey = null;
  speak(currentNumber.toString());
}

function endGame() {
  gameDiv.textContent = "";
  messageDiv.textContent = "";
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  resultDiv.textContent = `遊戲結束！正確率：${accuracy}%`;
  speak(`遊戲結束，正確率 ${accuracy} 百分比`);
  restartBtn.style.display = "inline-block";
}

document.addEventListener("keydown", (event) => {
  if (pressedKey === null && event.key >= "0" && event.key <= "9") {
    pressedKey = event.key;
  }
});

document.addEventListener("keyup", (event) => {
  if (questionCount >= totalQuestions) return;
  if (pressedKey === null) return;
  if (event.key === pressedKey) {
    if (parseInt(pressedKey) === currentNumber) {
      messageDiv.textContent = "✅ 答對了！";
      body.style.backgroundColor = "#90ee90";
      correctSound.currentTime = 0;
      correctSound.play();
      speak("答對了");
      correctCount++;
    } else {
      messageDiv.textContent = `❌ 錯誤，正確答案是 ${currentNumber}`;
      body.style.backgroundColor = "#ff7f7f";
      wrongSound.currentTime = 0;
      wrongSound.play();
      speak(`錯誤，正確答案是 ${currentNumber}`);
    }

    questionCount++;
    pressedKey = null;

    if (questionCount < totalQuestions) {
      setTimeout(newQuestion, 1200);
    } else {
      setTimeout(endGame, 1200);
    }
  }
});

restartBtn.addEventListener("click", () => {
  questionCount = 0;
  correctCount = 0;
  resultDiv.textContent = "";
  restartBtn.style.display = "none";
  newQuestion();
});

voiceToggle.addEventListener("change", () => {
  voiceEnabled = voiceToggle.checked;
  speak(voiceEnabled ? "語音朗讀已開啟" : "語音朗讀已關閉");
});

newQuestion();
