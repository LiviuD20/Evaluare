// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart");

let score = 0;
let gameOver = false;
let animationId;

// Player (navă)
const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 50,
  height: 60,
  speed: 6,
  color: "#a0d2ff",
};

// Meteoriți
let meteors = [];
// Stele bonus (opțional)
let stars = [];

// Taste
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

// Funcție pentru a crea meteor
function createMeteor() {
  const size = Math.random() * 30 + 20;
  meteors.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size: size,
    speed: Math.random() * 3 + 2.5,
    rotation: 0,
    rotSpeed: Math.random() * 0.08 - 0.04,
  });
}

// Stea bonus
function createStar() {
  stars.push({
    x: Math.random() * canvas.width,
    y: -20,
    size: 18,
    speed: 1.8,
  });
}

// Desenare player (simplu triunghi + opțional imagine)
function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.rotate(Math.sin(Date.now() / 300) * 0.15); // mică oscilație

  ctx.beginPath();
  ctx.moveTo(0, -player.height / 2);
  ctx.lineTo(-player.width / 2, player.height / 2);
  ctx.lineTo(player.width / 2, player.height / 2);
  ctx.closePath();
  ctx.fillStyle = player.color;
  ctx.shadowColor = "#7dd3fc";
  ctx.shadowBlur = 20;
  ctx.fill();

  ctx.restore();
}

// Desenare meteor (cu rotație)
function drawMeteor(m) {
  ctx.save();
  ctx.translate(m.x + m.size / 2, m.y + m.size / 2);
  ctx.rotate(m.rotation);

  ctx.beginPath();
  ctx.arc(0, 0, m.size / 2, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${Math.sin(Date.now() / 400) * 30 + 15}, 90%, 60%)`;
  ctx.fill();

  // cratere simple
  ctx.fillStyle = "#4a1d96";
  ctx.beginPath();
  ctx.arc(-8, -6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, 4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Stea simplă
function drawStar(s) {
  ctx.fillStyle = "#fefcbf";
  ctx.shadowColor = "#fef08a";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Bucla principală de animație
function gameLoop() {
  if (gameOver) return;

  ctx.fillStyle = "rgba(10, 0, 31, 0.15)"; // trail ușor
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mișcare player
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;
  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;

  // Limite player
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  drawPlayer();

  // Meteoriți
  if (Math.random() < 0.025) createMeteor(); // dificultate crește cu scorul

  meteors.forEach((m, i) => {
    m.y += m.speed;
    m.rotation += m.rotSpeed;

    drawMeteor(m);

    // coliziune cu player
    const dx = m.x + m.size / 2 - (player.x + player.width / 2);
    const dy = m.y + m.size / 2 - (player.y + player.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) < m.size / 2 + (player.width / 2) * 0.7) {
      gameOver = true;
      restartBtn.style.display = "inline-block";
      // Efect final – cercuri concentrice
      for (let r = 20; r < 200; r += 30) {
        setTimeout(() => {
          ctx.beginPath();
          ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            r,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = `rgba(249, 115, 22, ${1 - r / 200})`;
          ctx.lineWidth = 6;
          ctx.stroke();
        }, r * 2);
      }
    }

    if (m.y > canvas.height + m.size) meteors.splice(i, 1);
  });

  // Stele bonus
  if (Math.random() < 0.008) createStar();

  stars.forEach((s, i) => {
    s.y += s.speed;
    drawStar(s);

    const dx = s.x - (player.x + player.width / 2);
    const dy = s.y - (player.y + player.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 30) {
      score += 10;
      stars.splice(i, 1);
    }

    if (s.y > canvas.height) stars.splice(i, 1);
  });

  score += 0.1;
  scoreElement.textContent = Math.floor(score);

  // Efect glow când sunt meteoriți aproape de jos
  const danger = meteors.some((m) => m.y > canvas.height - 120);
  canvas.classList.toggle("glow", danger);

  animationId = requestAnimationFrame(gameLoop);
}

// Start
function startGame() {
  gameOver = false;
  score = 0;
  meteors = [];
  stars = [];
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
  restartBtn.style.display = "none";
  gameLoop();
}

restartBtn.addEventListener("click", startGame);

// Pornire inițială
startGame();
