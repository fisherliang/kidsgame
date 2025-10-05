// ====== 鍵盤設定 ======
const row1 = "QWERTYUIOP".split("");
const row2 = "ASDFGHJKL".split("");
const row3 = "ZXCVBNM".split("");

// ====== 字母短音 ======
const phonetic = {
  A: "e", B: "bee", C: "cee", D: "dee", E: "ee",
  F: "ef", G: "gee", H: "aitch", I: "eye", J: "jay",
  K: "kay", L: "el", M: "em", N: "en", O: "oh",
  P: "pee", Q: "cue", R: "ar", S: "es", T: "tee",
  U: "you", V: "vee", W: "double you", X: "ex",
  Y: "why", Z: "zee"
};

// ====== DOM ======
const questionDiv = document.getElementById("question");
const resultDiv = document.getElementById("result");
const startBtn = document.getElementById("startBtn");
const voiceToggle = document.getElementById("voiceToggle");
const feedbackToggle = document.getElementById("feedbackToggle");

// ====== 狀態 ======
let currentLetter = "";
let score = 0;
let count = 0;
let totalQuestions = 10;
let playing = false;
let pressLock = false;
let letterVoiceEnabled = true;
let feedbackVoiceEnabled = true;
let voicesLoaded = false;

// ====== 初始化鍵盤 ======
function createKeyboardRow(rowLetters, containerId) {
  const container = document.getElementById(containerId);
  rowLetters.forEach(k => {
    const keyDiv = document.createElement("div");
    keyDiv.classList.add("key");
    keyDiv.id = k;
    keyDiv.textContent = k;
    container.appendChild(keyDiv);
  });
}
createKeyboardRow(row1, "row1");
createKeyboardRow(row2, "row2");
createKeyboardRow(row3, "row3");

// ====== 初始化語音引擎 ======
function preloadVoices() {
  speechSynthesis.getVoices(); // 預熱
  if (speechSynthesis.getVoices().length) voicesLoaded = true;
  else {
    speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
    };
  }
}
preloadVoices();

// ====== 穩定語音播放函式 ======
let speaking = false;
function speak(text, rate = 1.0) {
  if (!text || speaking) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = rate;
  speaking = true;
  utter.onend = () => speaking = false;
  try {
    speechSynthesis.speak(utter);
  } catch (e) {
    console.warn("Voice failed:", e);
  }
}

// ====== 題目邏輯 ======
function randomLetter() {
  const all = [...row1, ...row2, ...row3];
  return all[Math.floor(Math.random() * all.length)];
}

function nextQuestion() {
  if (count >= totalQuestions) {
    questionDiv.textContent = "Game Over!";
    resultDiv.textContent = `You got ${score} / ${totalQuestions} correct.`;
    playing = false;
    return;
  }
  currentLetter = randomLetter();
  questionDiv.textContent = currentLetter;
  count++;
  pressLock = false;
  if (letterVoiceEnabled) speak(`Press ${phonetic[currentLetter]}`, 0.95);
}

// ====== Keyup 判定 ======
document.addEventListener("keyup", e => {
  if (!playing || pressLock) return;
  const key = e.key.toUpperCase();
  const keyDiv = document.getElementById(key);
  if (!keyDiv) return;

  pressLock = true;
  if (letterVoiceEnabled) speak(phonetic[key] || key);

  const correct = key === currentLetter;
  if (correct) {
    score++;
    keyDiv.classList.add("correct");
    if (feedbackVoiceEnabled) speak("Good job!", 1.1);
  } else {
    keyDiv.classList.add("wrong");
    if (feedbackVoiceEnabled) speak("Try again!", 1.0);
  }

  setTimeout(() => keyDiv.classList.remove("correct", "wrong"), 300);
  setTimeout(nextQuestion, 600);
});

// ====== Start 按鈕 ======
startBtn.addEventListener("click", () => {
  if (!voicesLoaded) preloadVoices();
  // 第一次點擊解除靜音限制
  if (!playing && letterVoiceEnabled) speak("Ready to start!", 1.1);

  score = 0;
  count = 0;
  resultDiv.textContent = "";
  playing = true;
  pressLock = false;
  nextQuestion();
});

// ====== 開關控制 ======
voiceToggle.addEventListener("click", () => {
  letterVoiceEnabled = !letterVoiceEnabled;
  voiceToggle.textContent = letterVoiceEnabled ? "Letter Voice: ON" : "Letter Voice: OFF";
  voiceToggle.classList.toggle("on", letterVoiceEnabled);
});

feedbackToggle.addEventListener("click", () => {
  feedbackVoiceEnabled = !feedbackVoiceEnabled;
  feedbackToggle.textContent = feedbackVoiceEnabled ? "Feedback Voice: ON" : "Feedback Voice: OFF";
  feedbackToggle.classList.toggle("on", feedbackVoiceEnabled);
});