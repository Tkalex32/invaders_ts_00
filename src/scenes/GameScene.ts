import {
  AnimatedSprite,
  Container,
  DisplayObject,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Bullet } from "../elements/Bullet";
import { PlayerShip } from "../elements/PlayerShip";
import { Label } from "../elements/hud/Label";
import { explosionFrames } from "../assets";
import { PauseOverlay } from "../elements/hud/PauseOverlay";
import { createParticles } from "../helpers/helpers";
import { Grid } from "../helpers/Grid";
import { EnemyBullet } from "../elements/EnemyBullet";
import { EnemyShip } from "../elements/EnemyShip";
import { Asteroid } from "../elements/Asteroid";
import { Particle } from "../elements/Particle";
import { Timer } from "eventemitter3-timer";
import { EndScene } from "./EndScene";

export class GameScene extends Container implements IScene {
  private screenWidth: number;
  private pauseOverlay: PauseOverlay = new PauseOverlay();
  private pause: boolean = false;
  private background: Sprite = Sprite.from("background.png");
  private player: Sprite = new PlayerShip();
  private bullets: Container = new Container();
  private enemies: Grid;
  private startPos: {
    x: number;
    y: number;
  };
  private livesLabel: Label = new Label("Lives: 3", {
    fontFamily: "Arial",
    fontSize: 20,
    fill: 0xffffff,
    align: "center",
  });
  private scoreLabel: Label = new Label("Score: 0", {
    fontFamily: "Arial",
    fontSize: 20,
    fill: 0xffffff,
    align: "center",
  });
  private bossShieldLabel: Label = new Label("HP: 0", {
    fontFamily: "Arial",
    fontSize: 20,
    fill: 0xffffff,
    align: "center",
  });
  private bossHPBar: Container;
  private bossHPBarBack: Graphics;
  private bossHPBarFront: Graphics;
  private bossHP: number;
  private isMouseFlag: boolean = false;
  private lastBulletSpawnTime: number = 0;
  private spawnSpeed: number = 400;
  private keysMaps: { [key: string]: boolean } = {};
  private playerRotation = 0;
  private playerSpeed: number = 4;
  private bulletSpeed: number = 15;
  private enemyCount: number;
  private playerLives: number = 3;
  private enemySpeed: number = 1;
  private score: number = 0;
  private waveCount: number;
  private enemyShipBulletSpeed: number;
  private enemyShipBSNext: number;
  private frames: number;
  private enemyBullets: EnemyBullet[];
  private asteroids: Asteroid[];
  private particles: Particle[];
  private laserAudio: HTMLAudioElement = new Audio("laser.mp3");
  private explosionAudio: HTMLAudioElement = new Audio("explosion.mp3");
  private winAudio: HTMLAudioElement = new Audio("win.mp3");
  private loseAudio: HTMLAudioElement = new Audio("lose.mp3");
  private hitAudio: HTMLAudioElement = new Audio("hit.wav");
  private timer1: Timer;
  private timer2: Timer;
  private timer3: Timer;

  constructor() {
    super();

    this.timer1 = new Timer(1000);
    this.timer2 = new Timer(1000);
    this.timer3 = new Timer(1000);

    this.screenWidth = Manager.width;
    this.background.width = this.screenWidth;
    this.winAudio.volume = 0.1;
    this.loseAudio.volume = 0.1;

    this.addEventListeners();

    this.bossHPBar = new Container();
    this.bossHPBarBack = new Graphics();
    this.bossHPBarFront = new Graphics();

    this.bossHP = 0;
    this.waveCount = 1;
    this.enemies = new Grid(this.waveCount);

    this.startPos = {
      x: 0 + this.enemies.enemies[0].width / 2,
      y: 50,
    };
    this.enemies.x = this.startPos.x;
    this.enemies.y = this.enemies.height;
    this.enemyCount = this.enemies.enemies.length;
    this.enemyShipBulletSpeed = 2;
    this.enemyShipBSNext = 0;
    this.enemyBullets = [];
    this.asteroids = [];
    this.particles = [];
    this.frames = 0;

    this.player.anchor.set(0.5);
    this.player.x = Manager.width / 2;
    this.player.y = Manager.height - 20;

    this.livesLabel.x = Manager.width - 50;
    this.livesLabel.y = 10;
    this.livesLabel.anchor.set(0.5);
    this.scoreLabel.x = 50;
    this.scoreLabel.y = 10;
    this.scoreLabel.anchor.set(0.5);

    this.addChild(
      this.background,
      this.player,
      this.bullets,
      this.enemies,
      this.livesLabel,
      this.scoreLabel
    );
  }

  private effectPlay = (audio: HTMLAudioElement, volume: number = 1) => {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.muted = Manager.localStorageData.muteSFX;
    audio.play();
  };

  public addEventListeners = (): void => {
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
  };

  public removeEventListeners = (): void => {
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keysMaps[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysMaps[e.code] = false;
  };

  explosionFrames: Array<String> = explosionFrames;

  enemyExplosion = (x: number, y: number) => {
    const explosion: AnimatedSprite = new AnimatedSprite(
      this.explosionFrames.map((str) => Texture.from(str as string))
    );
    explosion.x = x;
    explosion.y = y;
    explosion.anchor.set(0.5);
    explosion.animationSpeed = 0.3;
    explosion.scale.set(0.7);
    explosion.loop = false;

    explosion.play();
    this.addChild(explosion);

    explosion.onComplete = () => {
      this.removeChild(explosion);
    };
  };

  public update(delay: number): void {
    this.player.rotation = this.playerRotation;

    this.frames++;

    if (
      (this.keysMaps["ArrowLeft"] || this.keysMaps["KeyA"]) &&
      this.player.position.x > 20
    ) {
      this.player.rotation -= 0.2;
      this.player.position.x -= delay * this.playerSpeed;
    }

    if (
      (this.keysMaps["ArrowRight"] || this.keysMaps["KeyD"]) &&
      this.player.position.x < Manager.width - this.player.width + 10
    ) {
      this.player.rotation += 0.2;
      this.player.position.x += delay * this.playerSpeed;
    }

    if (
      (this.keysMaps["ArrowUp"] || this.keysMaps["KeyW"]) &&
      this.player.position.y > 50
    )
      this.player.position.y -= delay * this.playerSpeed;

    if (
      (this.keysMaps["ArrowDown"] || this.keysMaps["KeyS"]) &&
      this.player.position.y < Manager.height - this.player.height + 20
    )
      this.player.position.y += delay * this.playerSpeed;

    if (this.keysMaps["KeyP"]) {
      Manager.pause();
      this.addChild(this.pauseOverlay);
      this.pause = true;
    }

    if (Manager.tickerState && this.pause) {
      this.removeChild(this.pauseOverlay);
      this.pause = false;
    }

    if (this.isMouseFlag || this.keysMaps["Space"]) {
      const currentTime: number = Date.now();

      if (currentTime - this.lastBulletSpawnTime > this.spawnSpeed) {
        const bullet: Bullet = new Bullet();
        bullet.position.x = this.player.position.x;
        bullet.position.y = this.player.position.y;
        bullet.scale.x = 0.25;
        bullet.scale.y = 0.25;
        this.effectPlay(this.laserAudio, 0.02);
        this.bullets.addChild(bullet);

        if (bullet.position.x < 0) this.bullets.removeChild(bullet);

        this.lastBulletSpawnTime = currentTime;
      }
    }

    this.scoreLabel.text = `Score: ${this.score}`;
    this.livesLabel.text = `Lives: ${this.playerLives}`;

    this.bullets.children.forEach((bullet: DisplayObject) => {
      bullet.position.y -= this.bulletSpeed * delay;

      if (bullet.position.y < 0) this.bullets.removeChild(bullet);

      this.enemies.children.forEach((enemy: DisplayObject) => {
        if (enemy.getBounds().intersects(bullet.getBounds())) {
          if (this.waveCount % 4 === 0) {
            this.bossHP--;
            this.bossShieldLabel.text = `HP: ${this.bossHP}`;

            if (this.bossHP > 0) {
              createParticles(
                this.particles,
                {
                  position: {
                    x: enemy.position.x,
                    y: enemy.position.y + 128,
                    z: 100,
                  },
                  width: 256,
                  height: 256,
                },
                0xf85c5c,
                0xffffff,
                true
              );

              this.addChild(...this.particles);
              this.bullets.removeChild(bullet);
            } else {
              this.enemyExplosion(enemy.position.x, enemy.position.y);
              this.enemies.removeChild(enemy);
              this.enemyCount--;
              this.score += 100;
              this.scoreLabel.text = `Score: ${this.score}`;
              this.effectPlay(this.explosionAudio, 0.3);
              this.removeChild(bullet, this.bossShieldLabel);
            }
          } else {
            this.enemyExplosion(
              Math.floor(enemy.x) + 32,
              Math.floor(this.enemies.position.y + enemy.y)
            );
            this.effectPlay(this.explosionAudio, 0.005);
            this.enemies.removeChild(enemy);
            this.bullets.removeChild(bullet);
            this.enemyCount--;
            this.score += 10;
          }
        }
      });

      // bullet vs bullet collision
      this.enemyBullets.forEach((enemyBullet: EnemyBullet) => {
        if (enemyBullet.getBounds().intersects(bullet.getBounds())) {
          this.bullets.removeChild(bullet);
          this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
          this.removeChild(enemyBullet);
          this.score += 10;
        }
      });

      this.asteroids.forEach((asteroid: Asteroid) => {
        if (asteroid.getBounds().intersects(bullet.getBounds())) {
          const lineColor = asteroid.texture.textureCacheIds[0].includes("20")
            ? 0xffffff
            : 0x000000;
          const fillColor = asteroid.texture.textureCacheIds[0].includes("20")
            ? 0x00a3d9
            : 0x444444;
          createParticles(this.particles, asteroid, fillColor, lineColor);

          this.addChild(...this.particles);
          this.effectPlay(this.explosionAudio, 0.01);
          this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
          this.removeChild(asteroid);
          this.bullets.removeChild(bullet);
          this.score += 5;
        }
      });
    });

    this.enemyBullets.forEach((bullet) => bullet.update(delay));
    this.asteroids.forEach((asteroid) => asteroid.update(delay));
    this.particles.forEach((particle) => {
      if (particle.alpha <= 0) {
        this.particles.splice(this.particles.indexOf(particle), 1);
        this.removeChild(particle);
      }
      particle.update(delay);
    });

    if (this.frames === 100000) this.frames = 0;

    this.enemies.children.forEach((enemy: DisplayObject) => {
      if (this.waveCount % 4 === 0) {
        this.bossShieldLabel.text = `Boss Shield: ${this.bossHP}`;
        this.bossShieldLabel.anchor.set(0.5);
        this.bossShieldLabel.x = enemy.position.x + this.enemies.width / 2;
        this.bossShieldLabel.y = 450; //50
        this.addChild(this.bossShieldLabel);
        enemy.position.x = Math.floor(
          Manager.width / 2 - this.enemies.width / 2
        );
        enemy.position.y = Math.floor(
          Manager.height / 2 - 2 * this.enemies.height
        );
      } else {
        enemy.position.x = Math.floor((enemy.position.x += this.enemySpeed));

        if (enemy.position.x + 64 >= Manager.width) {
          this.enemySpeed = this.enemySpeed * -1;
          this.enemies.position.y += 30;
        }

        if (enemy.position.x < 0) {
          this.enemySpeed = this.enemySpeed * -1;
          this.enemies.position.y += 30;
        }

        if (enemy.getBounds().intersects(this.player.getBounds())) {
          this.enemyExplosion(
            Math.floor(enemy.x) + 32,
            Math.floor(this.enemies.position.y + enemy.y)
          );
          this.effectPlay(this.explosionAudio, 0.01);
          this.enemies.removeChild(enemy);
          this.playerLives--;
          this.enemyCount--;
          this.score += 10;
        }
      }
    });

    if (this.waveCount % 3 === 0) this.enemyShipBSNext = this.waveCount + 1;

    if (this.frames % 100 === 0 && this.enemyCount > 0) {
      if (this.waveCount % 4 === 0) {
        //
      } else {
        const shooter: EnemyShip = this.enemies.children[
          Math.floor(Math.random() * this.enemies.children.length)
        ] as EnemyShip;

        let x: number = Math.floor(shooter.x + shooter.width / 2) - 6;
        const y: number = Math.floor(this.enemies.position.y + shooter.y + 32);
        const speed: number = this.enemyShipBulletSpeed;
        const type: string = shooter.texture.textureCacheIds[0];
        let dx: number = 0;
        let dy: number = 600 - y;
        let angle: number = Math.atan2(dy, dx);
        let bullet: EnemyBullet;

        if (type.slice(-1) === "3") {
          dx = this.player.position.x - x;
          dy = this.player.position.y - y;
          angle = Math.atan2(dy, dx);
        }

        if (type.slice(-1) === "2") {
          Array(2)
            .fill(0)
            .forEach((_, i) => {
              x = x - 24 + i * 64;
              bullet = new EnemyBullet({ x, y, speed, type, angle });
              this.enemyBullets.push(bullet);
              this.addChild(bullet);
            });
        } else {
          bullet = new EnemyBullet({
            x,
            y,
            speed,
            type,
            angle,
          });
          this.enemyBullets.push(bullet);
          this.addChild(bullet);
        }
        const enemyBulletAudio: HTMLAudioElement = new Audio(
          `enemyBullet${type.slice(-1)}.wav`
        );

        this.effectPlay(enemyBulletAudio, 0.05);
      }
    }

    if (this.waveCount % 4 === 0 && this.frames % 100 === 0) {
      this.timer1 = new Timer(80);
      this.timer1.delay = 10;
      this.timer1.repeat = 1;
      this.timer1.on("start", (): void => shoot1());
      this.timer1.on("end", (): void => shoot1());
      this.timer1.start();

      this.timer2 = new Timer(1000);
      this.timer2.delay = 80;
      this.timer2.repeat = 1;
      this.timer2.on("start", (): void => shoot2());
      this.timer2.on("end", (): void => shoot2());
      this.timer2.start();

      this.timer3 = new Timer(1000);
      this.timer3.delay = 160;
      this.timer3.repeat = 1;
      this.timer3.on("start", (): void => shoot3());
      this.timer3.start();
    }

    const shoot1 = (): void => {
      const shooter: EnemyShip = this.enemies.children[0] as EnemyShip;

      let x: number = Math.floor(shooter.x + shooter.width / 2) - 6;
      const y: number = Math.floor(this.enemies.position.y + shooter.y + 32);
      const speed: number = this.enemyShipBulletSpeed;
      const type: string = "1";
      let dx: number = 0;
      let dy: number = 600 - y;
      let angle: number = Math.atan2(dy, dx);
      let bullet: EnemyBullet;

      bullet = new EnemyBullet({
        x,
        y,
        speed,
        type,
        angle,
      });
      this.enemyBullets.push(bullet);
      this.addChild(bullet);
      const enemyBulletAudio: HTMLAudioElement = new Audio(
        `enemyBullet${type}.wav`
      );
      this.effectPlay(enemyBulletAudio, 0.05);
    };

    const shoot2 = (): void => {
      const shooter: EnemyShip = this.enemies.children[0] as EnemyShip;
      let x: number = Math.floor(shooter.x + shooter.width / 2);
      const y: number = Math.floor(this.enemies.position.y + shooter.y + 70);
      const speed: number = this.enemyShipBulletSpeed;
      const type: string = "2";
      let dx: number = 0;
      let dy: number = 600 - y;
      let angle: number = Math.atan2(dy, dx);
      let bullet: EnemyBullet;
      Array(2)
        .fill(0)
        .forEach((_, i) => {
          x = x - 60 + i * 160 + 5;
          bullet = new EnemyBullet({ x, y, speed, type, angle });
          this.enemyBullets.push(bullet);
          this.addChild(bullet);
        });

      const enemyBulletAudio: HTMLAudioElement = new Audio(
        `enemyBullet${type}.wav`
      );
      this.effectPlay(enemyBulletAudio, 0.05);
    };

    const shoot3 = (): void => {
      const shooter: EnemyShip = this.enemies.children[0] as EnemyShip;
      let x: number = Math.floor(shooter.x + shooter.width / 2);
      const y: number = Math.floor(this.enemies.position.y + shooter.y + 70);
      const speed: number = this.enemyShipBulletSpeed;
      const type: string = "3";
      let dx: number = 0;
      let dy: number = 600 - y;
      let angle: number = Math.atan2(dy, dx);
      let bullet: EnemyBullet;
      dx = this.player.position.x - x;
      dy = this.player.position.y - y;
      angle = Math.atan2(dy, dx);

      bullet = new EnemyBullet({
        x,
        y,
        speed,
        type,
        angle,
      });
      this.enemyBullets.push(bullet);
      this.addChild(bullet);
      const enemyBulletAudio: HTMLAudioElement = new Audio(
        `enemyBullet${type}.wav`
      );
      this.effectPlay(enemyBulletAudio, 0.05);
    };

    if (this.frames % 800 === 0 && this.enemyCount > 0) {
      const asteroid = new Asteroid();
      asteroid.scale.set(0.75);
      this.asteroids.push(asteroid);
      this.addChild(asteroid);
    }

    if (this.waveCount % 4 === 0 && this.enemyCount > 0) {
      const segmentWidth = 100 / (this.waveCount * 2);
      this.removeChild(this.bossHPBar);
      this.bossHPBar = new Container();

      this.bossHPBarBack.beginFill(0x4287f5);
      this.bossHPBarBack.lineStyle(2, 0x4287f5);
      this.bossHPBarBack.drawRect(0, 0, 100, 8);
      this.bossHPBarBack.endFill();
      this.bossHPBarBack.position.set(this.width / 2 - 50, 200);
      this.bossHPBarFront.beginFill(0xf51d45);
      this.bossHPBarFront.drawRect(0, 0, 100, 8);
      this.bossHPBarFront.endFill();
      this.bossHPBarFront.width = this.bossHP * segmentWidth;
      this.bossHPBarFront.position.set(this.width / 2 - 50, 200);

      this.bossHPBar.addChild(this.bossHPBarBack, this.bossHPBarFront);
      this.addChild(this.bossHPBar);
    }

    this.asteroids.forEach((asteroid) => {
      if (asteroid.getBounds().intersects(this.player.getBounds())) {
        const lineColor = asteroid.texture.textureCacheIds[0].includes("20")
          ? 0xffffff
          : 0x000000;
        const fillColor = asteroid.texture.textureCacheIds[0].includes("20")
          ? 0x00a3d9
          : 0x444444;
        createParticles(this.particles, asteroid, fillColor, lineColor);
        this.addChild(...this.particles);
        this.effectPlay(this.explosionAudio, 0.01);
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
        this.removeChild(asteroid);
        this.playerLives--;
        this.score += 5;
      }

      if (
        asteroid.position.x < -50 ||
        asteroid.position.x > Manager.width ||
        asteroid.position.y < -50 ||
        asteroid.position.y > Manager.height
      ) {
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
        this.removeChild(asteroid);
      }
    });

    this.enemyBullets.forEach((enemyBullet: EnemyBullet) => {
      if (enemyBullet.getBounds().intersects(this.player.getBounds())) {
        createParticles(this.particles, enemyBullet, 0xf85c5c, 0xffffff, true);
        this.addChild(...this.particles);
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
        this.effectPlay(this.hitAudio, 0.05);
        this.playerLives--;
      }

      if (enemyBullet.position.y > Manager.height) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
      }
    });

    if (this.enemyCount === 0) {
      this.enemyBullets.forEach((enemyBullet: EnemyBullet) => {
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
      });
      this.timer1.stop();
      this.timer2.stop();
      this.timer3.stop();
      this.waveCount++;
      this.enemyShipBulletSpeed =
        this.waveCount === this.enemyShipBSNext && this.enemyShipBulletSpeed < 8
          ? this.enemyShipBulletSpeed + 2
          : this.enemyShipBulletSpeed;

      this.removeChild(this.enemies, this.bossHPBar);
      this.enemies = new Grid(this.waveCount);

      this.startPos = {
        x: 0 + this.enemies.enemies[0].width / 2,
        y: 50,
      };
      this.enemies.x = this.startPos.x;
      this.enemies.y = this.enemies.height;
      this.addChild(this.enemies);
      this.enemyCount = this.enemies.enemies.length;

      if ((this.waveCount + 1) % 4 === 0) {
        this.bossHP = (this.waveCount + 1) * 2;
      }
    }

    if (this.playerLives <= 0) {
      this.laserAudio.pause();
      this.laserAudio.currentTime = 0;
      this.explosionAudio.pause();
      this.laserAudio.currentTime = 0;
      this.removeChild(
        this.player,
        this.bullets,
        this.enemies,
        this.livesLabel,
        this.scoreLabel
      );
      Manager.changeScene(new EndScene(this.score));
      this.effectPlay(this.loseAudio, 0.1);
    }
  }
}
