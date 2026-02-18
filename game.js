const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  transparent: true,
  scene: { preload, create, update },
};

let score = 0;
let timeLeft = 30;
let scoreText;
let timeText;
let spawnEvent;
let timerEvent;
let gameActive = false;

// AUDIO REFERENCES
let bgMusic;
let clickSound;
let popSound;

function preload() {
  this.load.audio("bgMusic", "/assets/bg-music.mp3");
  this.load.audio("click", "/assets/btn-click.mp3");
  this.load.audio("pop", "/assets/balloon-pop.mp3");
}

function create() {
  // Create sounds only once
  if (!bgMusic) {
    bgMusic = this.sound.add("bgMusic", { volume: 0.2, loop: true });
    clickSound = this.sound.add("click", { volume: 0.6 });
    popSound = this.sound.add("pop", { volume: 0.8 });
  }

  // Mobile browser audio unlock
  this.input.once("pointerdown", () => {
    if (!bgMusic.isPlaying) bgMusic.play();
  });

  if (!gameActive) showStartScreen(this);
  else startGame(this);
}

function update() {}

// ======================
// START SCREEN
// ======================

function showStartScreen(scene) {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  scene.add
    .text(centerX, centerY - 80, "Pop The Balloons", {
      fontSize: "38px",
      fontStyle: "bold",
      stroke: "#1B1B1B",
      strokeThickness: 4,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  const startBtn = scene.add
    .text(centerX, centerY, "Start Game", {
      fontSize: "24px",
      fontStyle: "bold",
      backgroundColor: "#ffffff",
      padding: { x: 24, y: 12 },
      color: "#000000",
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  scene.add
    .rectangle(centerX, centerY, startBtn.width + 12, startBtn.height + 8)
    .setStrokeStyle(3, 0xffffff)
    .setOrigin(0.5);

  startBtn.setDepth(1);

  startBtn.on("pointerdown", () => {
    clickSound.play();
    gameActive = true;
    scene.scene.restart();
  });
}

// ======================
// START GAME
// ======================

function startGame(scene) {
  score = 0;
  timeLeft = 30;

  scoreText = scene.add.text(20, 20, "Score: 0", {
    fontSize: "24px",
    fontStyle: "bold",
    stroke: "#1B1B1B",
    strokeThickness: 4,
    color: "#ffffff",
  });

  timeText = scene.add
    .text(scene.scale.width - 20, 20, "Time: 30", {
      fontSize: "24px",
      fontStyle: "bold",
      stroke: "#1B1B1B",
      strokeThickness: 4,
      color: "#ffffff",
    })
    .setOrigin(1, 0);

  spawnEvent = scene.time.addEvent({
    delay: 1000,
    callback: () => spawnBalloon(scene),
    loop: true,
  });

  timerEvent = scene.time.addEvent({
    delay: 1000,
    callback: () => {
      timeLeft--;
      timeText.setText("Time: " + timeLeft);

      if (timeLeft <= 0) {
        timerEvent.remove();
        spawnEvent.remove();

        scene.time.delayedCall(4000, () => {
          endGame(scene);
          gameActive = false;
        });
      }
    },
    loop: true,
  });
}

// ======================
// SPAWN BALLOON
// ======================

function spawnBalloon(scene) {
  if (!gameActive) return;

  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const x = Phaser.Math.Between(50, scene.scale.width - 50);
  const color = Phaser.Utils.Array.GetRandom(colors);

  const container = scene.add.container(x, scene.scale.height + 100);

  const balloon = scene.add
    .ellipse(0, 0, 60, 80, color)
    .setInteractive({ useHandCursor: true });

  const string = scene.add.line(0, 40, 0, 40, 0, 110, 0x000000).setLineWidth(2);
  const knot = scene.add.triangle(0, 40, 0, 12, 12, 12, 6, 0, color);

  container.add([balloon, string, knot]);

  scene.tweens.add({
    targets: container,
    y: -200,
    // duration: timeLeft > 20 ? 4000 : timeLeft > 10 ? 3000 : 2000,
    duration: 5000,
    ease: "Linear",
    onComplete: () => container.destroy(),
  });

  balloon.on("pointerdown", () => {
    if (!gameActive) return;

    popSound.play();
    score++;
    scoreText.setText("Score: " + score);
    container.destroy();
  });
}

// ======================
// END GAME
// ======================

function endGame(scene) {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  // stop music
  if (bgMusic && bgMusic.isPlaying) bgMusic.stop();

  scene.add
    .text(centerX, centerY - 80, "Game Over", {
      fontSize: "48px",
      fontStyle: "bold",
      stroke: "#1B1B1B",
      strokeThickness: 4,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  const restartBtn = scene.add
    .text(centerX, centerY, "Restart", {
      fontSize: "24px",
      fontStyle: "bold",
      backgroundColor: "#ffffff",
      padding: { x: 24, y: 12 },
      color: "#000000",
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  scene.add
    .rectangle(centerX, centerY, restartBtn.width + 12, restartBtn.height + 8)
    .setStrokeStyle(3, 0xffffff)
    .setOrigin(0.5);

  restartBtn.setDepth(1);

  restartBtn.on("pointerdown", () => {
    clickSound.play();
    gameActive = true;
    scene.scene.restart();
  });
}

new Phaser.Game(config);
