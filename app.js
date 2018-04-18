const ALL_COLORS = window.colors;
let COLORS = [];
const CARD_FLIP_TIME = 500;
const gameStats = {
  startTime: 0,
  stepsCount: 0,
  reset() {
    document.querySelector('.steps').innerHTML = '0 steps';
    document.querySelector('.timer').innerHTML = '0 seconds';
    this.stepsCount = 0;
    this.cards = [];
    this.numCardsOpen = 0;
    this.lastOpenedCard = null;
    this.lastOpenedCardId = null;
    this.lastOpenedCardUid = null;
  },
  addStep() {
    this.stepsCount += 1;
    document.querySelector('.steps').innerHTML = `${this.stepsCount} steps`;
  },
  cards: [],
  numCardsOpen: 0,
  lastOpenedCard: null,
  lastOpenedCardId: null,
  lastOpenedCardUid: null,
};
const pickColors = (allColors, numColorsToPick = 2) => {
  const pickedColors = [];
  for (let i = 0; i < numColorsToPick; i += 1) {
    const index = Math.floor(Math.random() * allColors.length);
    const color = allColors.splice(index, 1);
    pickedColors.push(color);
  }
  return pickedColors;
};
const randomizeItems = gameField => {
  // make temporary array with items duplicates
  const tempItems = [];
  COLORS.forEach((item, id) => {
    gameStats.cards.push({ item, win: false });
    tempItems.push({ item, id });
    tempItems.push({ item, id });
  });
  // randomly pick items from this array and push them to new game array
  for (let i = 0; i < COLORS.length * 2; i += 1) {
    const index = Math.floor(Math.random() * tempItems.length);
    const [{ item, id }] = tempItems.splice(index, 1);
    gameField.innerHTML += `
        <div class="square" data-id="${id}" data-uid="${i}">
        <div class="square__wrapper">
        <div class="square__front">
        </div>
        <div class="square__back" style="background-color: ${item}">
        <span class="color-name">${item}</span>
        </div>
        </div>
        </div>
      `;
  }
};

const startTimer = () => {
  gameStats.startTime = new Date();
};

const getTimeElapsed = () => {
  const endTime = new Date();
  let timeDiff = endTime - gameStats.startTime;
  // strip the ms
  timeDiff /= 1000;
  // get seconds
  return Math.round(timeDiff);
};

const startTimerDisplay = () => {
  const timer = document.querySelector('.timer');
  const timerId = setInterval(() => {
    timer.innerHTML = `${getTimeElapsed()} seconds`;
  }, 1000);
  return timerId;
};

const makeRatingAndTime = () => {
  // stars rating
  let starsRating = 1;
  if (gameStats.stepsCount < 20) {
    starsRating = 5;
  } else if (gameStats.stepsCount < 30) {
    starsRating = 4;
  } else if (gameStats.stepsCount < 40) {
    starsRating = 3;
  } else if (gameStats.stepsCount < 50) {
    starsRating = 2;
  } else {
    starsRating = 1;
  }
  const starsInPopup = document.querySelectorAll('.star-rating .star');
  const starsInPanel = document.querySelectorAll('.game-panel .star');
  const updateStarsRating = starsArray => {
    starsArray.forEach((star, index) => {
      star.classList.add('grey');
      if (index < starsRating) {
        star.classList.remove('grey');
      }
    });
  };
  updateStarsRating(starsInPopup);
  updateStarsRating(starsInPanel);

  getTimeElapsed();
  const timeRating = document.querySelector('.time');
  timeRating.innerHTML = `${getTimeElapsed()} seconds`;
};

const createNewTable = gameField => {
  COLORS = pickColors(ALL_COLORS.slice());
  // clear game field
  gameField.innerHTML = '';
  // fill with new
  randomizeItems(gameField);
};
const makeNewGame = (gameField, timerID) => {
  gameStats.reset();
  clearInterval(timerID);
  makeRatingAndTime();
  Array.from(gameField.children).forEach(item => {
    item.classList.remove('visible');
  });
  setTimeout(() => {
    createNewTable(gameField);
  }, CARD_FLIP_TIME);
};

const checkIfWinner = ({ cards } = gameStats) => {
  for (const card of cards) {
    if (card.win === false) {
      return false;
    }
  }
  return true;
};

const hidePopupOverlay = overlay => {
  overlay.classList.add('hidden');
};
const showPopupOverlay = overlay => {
  makeRatingAndTime();
  overlay.classList.remove('hidden');
};

const main = () => {
  let timerID;
  const gameField = document.querySelector('.game-field');
  const overlay = document.querySelector('.popup-overlay');
  const newGameButton = document.querySelectorAll('.new-game');
  // add popup event listener
  overlay.addEventListener('click', e => {
    if (e.target === overlay) hidePopupOverlay(overlay);
  });
  // add "new game button" event listener
  newGameButton.forEach(button => {
    button.addEventListener('click', () => {
      hidePopupOverlay(overlay);
      makeNewGame(gameField, timerID);
    });
  });
  createNewTable(gameField);
  // adding events to game field
  gameField.addEventListener(
    'click',
    e => {
      // event delegation pattern
      for (let { target } = e; target && target !== this; target = target.parentNode) {
        const { lastOpenedCard, lastOpenedCardId, cards, numCardsOpen, stepsCount } = gameStats;
        if (target.matches('.square')) {
          makeRatingAndTime();
          // star timer if first touch
          if (stepsCount === 0) {
            startTimer();
            timerID = startTimerDisplay();
          }
          const { id, uid } = target.dataset;
          switch (numCardsOpen) {
            case 0:
              if (cards[id].win) break;
              gameStats.lastOpenedCard = target;
              gameStats.lastOpenedCardId = id;
              gameStats.lastOpenedCardUid = uid;
              gameStats.numCardsOpen += 1;
              target.classList.toggle('visible');
              gameStats.addStep();
              break;
            case 1:
              if (lastOpenedCard === target || cards[id].win) break;
              if (lastOpenedCardId === id) {
                gameStats.cards[id].win = true;
                gameStats.numCardsOpen = 0;
                target.classList.toggle('visible');
                gameStats.addStep();
                if (checkIfWinner() === true) {
                  clearInterval(timerID);
                  setTimeout(() => {
                    showPopupOverlay(overlay);
                  }, CARD_FLIP_TIME);
                }
              } else {
                gameStats.numCardsOpen += 1;
                target.classList.toggle('visible');
                gameStats.addStep();
                setTimeout(() => {
                  target.classList.toggle('visible');
                  lastOpenedCard.classList.toggle('visible');
                  gameStats.numCardsOpen = 0;
                }, CARD_FLIP_TIME);
              }

              break;
            case 2:
              break;
            default:
              break;
          }
          break;
        }
      }
    },
    false,
  );
};

document.addEventListener('DOMContentLoaded', main);
