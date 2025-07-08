const startPage = document.getElementById('start-page');
const selectEggPage = document.getElementById('select-egg-page');
const customTimePage = document.getElementById('custom-time-page');
const timerPage = document.getElementById('timer-page');

const startBtn = document.getElementById('start-btn');
const backToStartBtn = document.getElementById('back-to-start');
const backToSelectBtn = document.getElementById('back-to-select');
const backToSelectFromTimerBtn = document.getElementById('back-to-select-from-timer');

const eggChoices = document.querySelectorAll('.egg-choice');
const customStartBtn = document.getElementById('custom-start-btn');
const customTimeInput = document.getElementById('custom-time-input');

const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const resetBtn = document.getElementById('reset-btn');
const timerEndSound = document.getElementById('timer-end-sound');
const timerDisplay = document.querySelector('.timer-display');
const eggCookingIcon = document.querySelector('.egg-cooking');

const eggTimes = {
  runny: 4 * 60,
  soft: 6 * 60,
  hard: 10 * 60,
  sunny: 5 * 60,
};

let timerDuration = 25 * 60; // default 25 minutes in seconds
let timerRemaining = timerDuration;
let timerInterval = null;
let isPaused = false;
let currentEggType = null;

function showPage(page) {
  startPage.classList.remove('active');
  selectEggPage.classList.remove('active');
  customTimePage.classList.remove('active');
  timerPage.classList.remove('active');
  page.classList.add('active');
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timerRemaining);
  updateEggCookingProgress();
}

function updateEggCookingProgress() {
  if (!timerDuration) return;
  const progress = 1 - timerRemaining / timerDuration;
  // Animate egg color from light yellow to darker orange as it cooks
  const startColor = [248, 181, 0]; // #f8b500
  const endColor = [179, 107, 0]; // #b36b00
  const currentColor = startColor.map((start, i) =>
    Math.round(start + (endColor[i] - start) * progress)
  );
  eggCookingIcon.style.color = `rgb(${currentColor.join(',')})`;
  // Optionally scale the egg slightly as it cooks
  const scale = 1 + 0.3 * progress;
  eggCookingIcon.style.transform = `scale(${scale})`;

  // Add animation class based on current egg type
  eggCookingIcon.classList.remove('runny', 'soft', 'hard', 'sunny');
  if (currentEggType && ['runny', 'soft', 'hard', 'sunny'].includes(currentEggType)) {
    eggCookingIcon.classList.add(currentEggType);
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  isPaused = false;
  pauseBtn.style.display = 'inline-block';
  resumeBtn.style.display = 'none';

  timerInterval = setInterval(() => {
    if (!isPaused) {
      timerRemaining--;
      updateTimerDisplay();
      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        timerEndSound.volume = 0.5;
        timerEndSound.currentTime = 0;
        timerEndSound.play();
        // Play the sound twice quickly for better audibility
        setTimeout(() => {
          timerEndSound.currentTime = 0;
          timerEndSound.play();
        }, 500);
        showCookedEgg();
        alert('Time is up!');
        showPage(selectEggPage);
      }
    }
  }, 1000);
}

function pauseTimer() {
  isPaused = true;
  pauseBtn.style.display = 'none';
  resumeBtn.style.display = 'inline-block';
}

function resumeTimer() {
  isPaused = false;
  pauseBtn.style.display = 'inline-block';
  resumeBtn.style.display = 'none';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRemaining = timerDuration;
  updateTimerDisplay();
  isPaused = false;
  pauseBtn.style.display = 'inline-block';
  resumeBtn.style.display = 'none';
}

startBtn.addEventListener('click', () => {
  showPage(selectEggPage);
});

backToStartBtn.addEventListener('click', () => {
  showPage(startPage);
});

backToSelectBtn.addEventListener('click', () => {
  showPage(selectEggPage);
});

backToSelectFromTimerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRemaining = timerDuration;
  updateTimerDisplay();
  showCookedEgg(false);
  showPage(selectEggPage);
  timerEndSound.pause();
  timerEndSound.currentTime = 0;
});

eggChoices.forEach((btn) => {
  btn.addEventListener('click', () => {
    const choice = btn.getAttribute('data-choice');
    if (choice === 'custom') {
      showPage(customTimePage);
    } else if (eggTimes.hasOwnProperty(choice)) {
      currentEggType = choice;
      timerDuration = eggTimes[choice];
      timerRemaining = timerDuration;
      updateTimerDisplay();
      showCookedEgg(false);
      showPage(timerPage);
      startTimer();
    }
  });
});

customStartBtn.addEventListener('click', () => {
  const customMinutes = parseInt(customTimeInput.value, 10);
  if (isNaN(customMinutes) || customMinutes < 1 || customMinutes > 180) {
    alert('Please enter a valid time between 1 and 180 minutes.');
    return;
  }
  currentEggType = null;
  timerDuration = customMinutes * 60;
  timerRemaining = timerDuration;
  updateTimerDisplay();
  showCookedEgg(false);
  showPage(timerPage);
  startTimer();
});

pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);
resetBtn.addEventListener('click', resetTimer);

resetBtn.addEventListener('click', () => {
  timerEndSound.pause();
  timerEndSound.currentTime = 0;
});

backToSelectFromTimerBtn.addEventListener('click', () => {
  timerEndSound.pause();
  timerEndSound.currentTime = 0;
});

// Unlock audio on first user interaction for browsers that block autoplay
document.body.addEventListener('click', () => {
  timerEndSound.volume = 1.0;
  timerEndSound.play().then(() => {
    timerEndSound.pause();
    timerEndSound.currentTime = 0;
  }).catch(() => {});
}, { once: true });

function showCookedEgg(show = true) {
  if (show) {
    eggCookingIcon.style.display = 'none';
    document.querySelector('.egg-cooked').style.display = 'inline-block';
  } else {
    eggCookingIcon.style.display = 'inline-block';
    document.querySelector('.egg-cooked').style.display = 'none';
  }
}

// Initialize display
updateTimerDisplay();
