const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const scoreEl = document.querySelector("#scoreEl");
const startButtonEl = document.querySelector("#startButtonEl");
const modalEl = document.querySelector("#modalEl");
const modalScoreEl = document.querySelector("#modalScoreEl");
let intervalId;

canvas.width = innerWidth;
canvas.height = innerHeight;

console.log(innerHeight, innerWidth)

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.98;

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

let player;
let projectiles = [];
let enemies = [];
let particles = [];

function resetScore() {
  score = 0;
  scoreEl.innerHTML = score;
  modalScoreEl.innerHTML = score;
}

function init() {
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  clearInterval(intervalId);
}

function spawnEnemies() {
  // intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 7) + 7;
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.height;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  // }, 1000);
}

onblur = windowBlur;
onfocus = windowFocus;

function windowBlur() {
  if (!paused) {
    paused = !paused;
    clearInterval(intervalId);
    cancelAnimationFrame(animationId);
  }
}

function windowFocus() {
  if (paused) {
    paused = !paused;
    if (modalEl.style.display === "none") {
      animate();
      spawnEnemies();
    }
  }
}

let animationId;
let paused = false;
let score = 0;
let frame = 0;
let highScore = 0;

// function setHighScore() {

// }

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  frame++ 

  if (frame % 70 === 0) {
    spawnEnemies();
  }


  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.draw();
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.width
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      modalScoreEl.innerHTML = score;
      modalEl.style.display = "flex";

      if (highScore <= 0) {
        highScore = score;
        console.log(highScore)
      } else if (highScore > score) {
        console.log(highScore)
        console.log("no new high score")
        return
      } else if (highScore < score) {
        
        highScore = score
        console.log(highScore)
        console.log("New high score!")
      }

    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        if (enemy.radius - 10 > 10) {
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          score += 250;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

canvas.addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init()
  player.draw()
})

startButtonEl.addEventListener("click", () => {
  init();
  resetScore();
  animate();
  modalEl.style.display = "none";
});