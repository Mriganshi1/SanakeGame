// script.js
// Black and white Pokémon memory game

const board = document.getElementById('game-board');
const winMessage = document.getElementById('win-message');
const GRID_SIZE = 4;
const PAIRS = (GRID_SIZE * GRID_SIZE) / 2;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let cards = [];

// TIMER FEATURE
let timerInterval = null;
let secondsElapsed = 0;

function startTimer() {
  secondsElapsed = 0;
  document.getElementById('timer').textContent = `Time: 0s`;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById('timer').textContent = `Time: ${secondsElapsed}s`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

// Fetch 8 unique Pokémon
async function getPokemonSymbols() {
  const ids = [];
  while (ids.length < PAIRS) {
    const id = Math.floor(Math.random() * 151) + 1; // Gen 1
    if (!ids.includes(id)) ids.push(id);
  }
  const promises = ids.map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(res => res.json())
    .then(data => ({
      name: data.name,
      symbol: `<img src='${data.sprites.front_default}' alt='${data.name}' style='filter: grayscale(1); width:48px; height:48px;'/>`,
      img: data.sprites.front_default
    })));
  return Promise.all(promises);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCard(symbol, name) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.symbol = symbol;
  card.dataset.name = name;
  card.innerHTML = `
    <span class="back">?</span>
    <span class="symbol">${symbol}</span>
    <span class="poke-name" style="display:none;">${name}</span>
  `;
  card.addEventListener('click', onCardClick);
  return card;
}

function onCardClick(e) {
  if (lockBoard) return;
  const card = e.currentTarget;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  lockBoard = true;
  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;
    resetTurn();
    if (matchedPairs === PAIRS) {
      onWin();
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 900);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function onWin() {
  winMessage.innerHTML = `You Win!<br>Time: ${secondsElapsed}s`;
  winMessage.style.display = 'block';
  stopTimer();
}

async function setupGame() {
  winMessage.style.display = 'none';
  board.innerHTML = '';
  matchedPairs = 0;
  const pokemons = await getPokemonSymbols();
  let cardData = pokemons.concat(pokemons); // duplicate for pairs
  cardData = shuffle(cardData);
  cards = cardData.map(p => createCard(p.symbol, p.name));
  cards.forEach(card => board.appendChild(card));
  startTimer();
}

setupGame();
