// 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9XHBNlUuSARj8cXD73-KEITYPZLCNffs",
  authDomain: "game-babdd.firebaseapp.com",
  databaseURL: "https://game-babdd-default-rtdb.firebaseio.com",
  projectId: "game-babdd",
  storageBucket: "game-babdd.firebasestorage.app",
  messagingSenderId: "594577067727",
  appId: "1:594577067727:web:fd9f690a8c58713e2bf1ba"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 遊戲變數
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
let snake = [{ x: 200, y: 200 }];
let food = randomFood();
let dx = box;
let dy = 0;
let score = 0;
let startTime = Date.now();
let gameInterval;

document.addEventListener("keydown", direction);
startGame();

function startGame() {
  gameInterval = setInterval(draw, 100);
}

function direction(event) {
  if (event.key === "ArrowLeft" && dx === 0) {
    dx = -box;
    dy = 0;
  } else if (event.key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -box;
  } else if (event.key === "ArrowRight" && dx === 0) {
    dx = box;
    dy = 0;
  } else if (event.key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = box;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "green" : "lime";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFood();
  } else {
    snake.pop();
  }

  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    collision(head, snake)
  ) {
    clearInterval(gameInterval);
    document.getElementById("game-over-form").classList.remove("hidden");
    return;
  }

  snake.unshift(head);
}

function randomFood() {
  const x = Math.floor(Math.random() * (canvas.width / box)) * box;
  const y = Math.floor(Math.random() * (canvas.height / box)) * box;
  return { x, y };
}

function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

// 提交成績至 Firebase
function submitScore() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) {
    alert("請輸入名稱！");
    return;
  }

  const playTime = Math.floor((Date.now() - startTime) / 1000);
  const timeNow = new Date().toLocaleString();

  const scoreData = {
    name,
    score,
    time: playTime,
    savedAt: timeNow
  };

  db.ref("scores").push(scoreData);
  document.getElementById("game-over-form").classList.add("hidden");
  loadLeaderboard();
}

// 載入排行榜
function loadLeaderboard() {
  db.ref("scores")
    .orderByChild("score")
    .limitToLast(10)
    .once("value", (snapshot) => {
      const data = snapshot.val();
      const list = document.getElementById("leaderboard");
      list.innerHTML = "";

      const sorted = Object.values(data).sort((a, b) => b.score - a.score);
      sorted.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name} - ${entry.score} 分 - ${entry.time} 秒 (${entry.savedAt})`;
        list.appendChild(li);
      });
    });
}

// 初次讀取排行榜
loadLeaderboard();
