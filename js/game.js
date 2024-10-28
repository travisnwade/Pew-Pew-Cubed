// Select the canvas and set up context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let isPaused = true; // Game starts paused with the menu shown
let animationFrameId; // Track the animation frame ID
let lastShotTime = 0;
let player = { x: canvas.width / 2 - 15, width: 30, height: 30 };
let bullets = [];
let blocks = [];

// Get menu elements
const menuOverlay = document.getElementById('menu-overlay');
const playButton = document.getElementById('play-button');

// Array of neon colors for cyberpunk effect
const neonColors = ['#FF007F', '#00FFFF', '#FF00FF', '#00FF00', '#FF9900', '#66FF66', '#00CCFF'];

// Function to toggle pause
function togglePause() {
    if (!isPaused) {
      isPaused = true;
      menuOverlay.style.display = 'flex'; // Show the menu
      cancelAnimationFrame(animationFrameId); // Stop the game loop
    } else {
      isPaused = false;
      menuOverlay.style.display = 'none'; // Hide the menu
      animationFrameId = requestAnimationFrame(gameLoop); // Resume the game loop
    }
  }

// Pause/Resume with "ESC" or "P" keys
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
    togglePause();
  }
});  

// Event listener for "PLAY GAME" button
playButton.addEventListener('click', () => {
    menuOverlay.style.display = 'none';
    isPaused = false;
    requestAnimationFrame(gameLoop);
  });

// Pause game if clicked outside the canvas
document.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const isOutsideCanvas = (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  
    if (isOutsideCanvas && !isPaused) {
      togglePause(); // Pause the game
    }
  });
  

// Player controls for keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && player.x > 0) {
    player.x -= 15;
  } else if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) {
    player.x += 15;
  } else   if (e.key === ' ') {
    bullets.push({ x: player.x + player.width / 2, y: canvas.height - player.height - 10 });
  }
});

// Player controls for mouse movement
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  player.x = Math.max(0, Math.min(mouseX - player.width / 2, canvas.width - player.width));
});

// Shooting with mouse clicks
canvas.addEventListener('click', () => {
  bullets.push({ x: player.x + player.width / 2, y: canvas.height - player.height - 10 });
});

// Draw player cube
function drawPlayer() {
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, canvas.height - player.height - 10, player.width, player.height);
}

// Handle bullets
function drawBullets() {
  ctx.fillStyle = '#0ff';
  bullets.forEach((bullet, index) => {
    bullet.y -= 5; // Bullet speed
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    // Remove bullets that go off screen
    if (bullet.y < 0) bullets.splice(index, 1);
  });
}

// Handle blocks
function drawBlocks() {
  blocks.forEach((block, index) => {
    ctx.fillStyle = block.color; // Use the block's assigned color
    block.y += 1; // Slow block falling speed
    ctx.fillRect(block.x, block.y, block.size, block.size);
    
    // Remove blocks that go off screen
    if (block.y > canvas.height) blocks.splice(index, 1);
  });
}

// Spawn blocks at intervals
function spawnBlock() {
  let size = 20;
  let x = Math.random() * (canvas.width - size);
  let color = neonColors[Math.floor(Math.random() * neonColors.length)]; // Random color
  blocks.push({ x: x, y: -size, size: size, color: color });
}

// Detect collision
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    blocks.forEach((block, blIndex) => {
      if (
        bullet.x > block.x &&
        bullet.x < block.x + block.size &&
        bullet.y > block.y &&
        bullet.y < block.y + block.size
      ) {
        // Remove bullet and block, increase score
        bullets.splice(bIndex, 1);
        blocks.splice(blIndex, 1);
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
        // Add particle effect here in the future
      }
    });
  });
}

// Main game loop
function gameLoop() {
  if (isPaused) return; // Stop the loop if paused

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawBlocks();
  checkCollisions();
  
  animationFrameId = requestAnimationFrame(gameLoop); // Save the ID of the next frame
}

// Spawn blocks every second
setInterval(spawnBlock, 1000);