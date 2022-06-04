import {
  AnimatedSprite,
  Container,
  DisplayObject,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import { Manager } from "../Manager";
import { Bullet } from "../elements/Bullet";
import { PlayerShip } from "../elements/PlayerShip";
import { Label } from "../elements/hud/Label";
import { explosionFrames } from "../assets";
import { PauseOverlay } from "../elements/hud/PauseOverlay";
import { Grid } from "../helpers/Grid";
import { EnemyBullet } from "../elements/EnemyBullet";
import { EnemyShip } from "../elements/EnemyShip";
import { Asteroid } from "../elements/Asteroid";
import { Particle } from "../elements/Particle";
import { Timer } from "eventemitter3-timer";
import { EndScene } from "./EndScene";
import { Drop } from "../elements/Drop";
import { createParticles, itemDrop } from "../helpers/helpers";
import { IScene, RandomDropItem } from "../types";

export class GameScene extends Container implements IScene {
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
    fontFamily: "digital",
    fontSize: 24,
    fill: 0xffc926,
    align: "center",
  });
  private scoreLabel: Label = new Label("Score: 0", {
    fontFamily: "digital",
    fontSize: 24,
    fill: 0xffc926,
    align: "center",
  });
  private bossHPBar: Container;
  private bossHPBarBack: Graphics;
  private bossHPBarFront: Graphics;
  private bossHP: number;
  private segmentWidth: number;
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
  private drops: Drop[];
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

    this.width = Manager.width;
    this.height = Manager.height;

    this.timer1 = new Timer(1000);
    this.timer2 = new Timer(1000);
    this.timer3 = new Timer(1000);

    this.background.width = Manager.width;
    this.winAudio.volume = 0.1;
    this.loseAudio.volume = 0.1;

    this.addEventListeners();

    this.bossHP = 0;
    this.waveCount = 1;
    this.segmentWidth = 0;
    this.bossHPBar = new Container();
    this.bossHPBarBack = new Graphics();
    this.bossHPBarFront = new Graphics();
    this.bossHPBarBack.beginFill(0x4287f5);
    this.bossHPBarBack.lineStyle(2, 0x4287f5);
    this.bossHPBarBack.drawRect(0, 0, 100, 8);
    this.bossHPBarBack.endFill();
    this.bossHPBarFront.beginFill(0xf51d45);
    this.bossHPBarFront.drawRect(0, 0, 100, 8);
    this.bossHPBarFront.endFill();
    this.bossHPBar.position.set(Manager.width / 2 - 50, 200);
    this.bossHPBar.addChild(this.bossHPBarBack, this.bossHPBarFront);
    this.bossHPBar.visible = false;

    this.pauseOverlay.zIndex = 100;

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
    this.drops = [];
    this.frames = 0;

    this.player.anchor.set(0.5);
    this.player.x = Manager.width / 2;
    this.player.y = Manager.height - 20;

    this.livesLabel.x = Manager.width - this.livesLabel.width - 5;
    this.livesLabel.y = 0;
    this.scoreLabel.x = 5;
    this.scoreLabel.y = 0;

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
      this.addChild(this.pauseOverlay);
      Manager.pause();

      this.pause = true;
    }

    if (Manager.tickerState && this.pause) {
      this.pause = false;
      this.removeChild(this.pauseOverlay);
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

      // remove bullet if it goes out of screen
      if (bullet.position.y < 0) this.bullets.removeChild(bullet);

      this.enemies.children.forEach((enemy: DisplayObject) => {
        // enemy vs bullet collision
        if (enemy.getBounds().intersects(bullet.getBounds())) {
          // boss level
          if (this.waveCount % 4 === 0) {
            this.bossHP--;

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
              this.effectPlay(this.explosionAudio, 0.005);
              this.scoreLabel.text = `Score: ${this.score}`;
              this.enemies.removeChild(enemy);
              this.removeChild(bullet);
              this.enemyCount--;
              this.score += 100;
            }
          } else {
            // normal level
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

      // asteroid vs bullet collision
      this.asteroids.forEach((asteroid: Asteroid) => {
        if (asteroid.getBounds().intersects(bullet.getBounds())) {
          const lineColor: number =
            asteroid.texture.textureCacheIds[0].includes("20")
              ? 0xffffff
              : 0x000000;
          const fillColor: number =
            asteroid.texture.textureCacheIds[0].includes("20")
              ? 0x00a3d9
              : 0x444444;
          createParticles(this.particles, asteroid, fillColor, lineColor);

          this.addChild(...this.particles);
          this.effectPlay(this.explosionAudio, 0.005);
          this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
          this.removeChild(asteroid);
          this.bullets.removeChild(bullet);
          this.score += 5;
          const drop: RandomDropItem = itemDrop(
            asteroid.texture.textureCacheIds[0]
          );
          if (drop !== "nothing") {
            const dropItem = new Drop(
              asteroid.x + asteroid.width / 2,
              asteroid.y + asteroid.height / 2,
              drop
            );
            // TODO add effect
            console.log(drop, dropItem);

            this.drops.push(dropItem);
            this.addChild(dropItem);
          }
        }
      });
    });

    this.drops.forEach((drop: Drop) => {
      // drop vs player collision - pickup
      if (drop.getBounds().intersects(this.player.getBounds())) {
        this.drops.splice(this.drops.indexOf(drop), 1);
        this.removeChild(drop);
        // TODO add effect, add the powerup to the player
        this.score += 25;
      }
    });

    this.enemyBullets.forEach((enemyBullet: EnemyBullet) => {
      enemyBullet.update(delay);

      // bullet vs player collision
      if (enemyBullet.getBounds().intersects(this.player.getBounds())) {
        createParticles(this.particles, enemyBullet, 0xf85c5c, 0xffffff, true);
        this.addChild(...this.particles);
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
        this.effectPlay(this.hitAudio, 0.05);
        this.playerLives--;
      }

      // bullet out of bounds
      if (enemyBullet.position.y > Manager.height) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
      }

      // wave end
      if (this.enemyCount === 0) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);

        this.timer1.stop();
        this.timer2.stop();
        this.timer3.stop();
        this.waveCount++;
        this.enemyShipBulletSpeed =
          this.waveCount === this.enemyShipBSNext &&
          this.enemyShipBulletSpeed < 8
            ? this.enemyShipBulletSpeed + 2
            : this.enemyShipBulletSpeed;

        this.removeChild(this.enemies, this.bossHPBar);
        this.bossHPBar.visible = false;
        this.enemies = new Grid(this.waveCount);

        this.startPos = {
          x: 0 + this.enemies.enemies[0].width / 2,
          y: 50,
        };
        this.enemies.x = this.startPos.x;
        this.enemies.y = this.enemies.height;
        this.addChild(this.enemies);
        this.enemyCount = this.enemies.enemies.length;

        // set boss hp
        if ((this.waveCount + 1) % 4 === 0) {
          this.bossHP = (this.waveCount + 1) * 2;
        }
      }
    });

    this.asteroids.forEach((asteroid) => {
      asteroid.update(delay);

      // asteroid vs player collision
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
          this.effectPlay(this.explosionAudio, 0.005);
          this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
          this.removeChild(asteroid);
          this.playerLives--;
          this.score += 5;
          itemDrop(asteroid.texture.textureCacheIds[0]);
        }

        // asteroid out of bounds
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
    });

    this.particles.forEach((particle) => {
      // remove particles
      if (particle.alpha <= 0) {
        this.particles.splice(this.particles.indexOf(particle), 1);
        this.removeChild(particle);
      }
      particle.update(delay);
    });

    this.drops.forEach((drop) => {
      // remove drops
      if (drop.alpha <= 0) {
        this.drops.splice(this.drops.indexOf(drop), 1);
        this.removeChild(drop);
      }
      drop.update(delay);
    });

    this.enemies.children.forEach((enemy: DisplayObject) => {
      // boss level
      if (this.waveCount % 4 === 0) {
        if (!this.bossHPBar.visible) {
          this.addChild(this.bossHPBar);
          this.bossHPBar.visible = true;
        }

        enemy.position.x = Math.floor(
          Manager.width / 2 - this.enemies.width / 2
        );
        enemy.position.y = Math.floor(
          Manager.height / 2 - 2 * this.enemies.height
        );
      } else {
        // normal level enemy movement
        enemy.position.x = Math.floor((enemy.position.x += this.enemySpeed));

        // enemy out of bounds >>
        if (enemy.position.x + 64 >= Manager.width) {
          this.enemySpeed = this.enemySpeed * -1;
          this.enemies.position.y += 30;
        }

        // enemy out of bounds <<
        if (enemy.position.x < 0) {
          this.enemySpeed = this.enemySpeed * -1;
          this.enemies.position.y += 30;
        }
      }

      // enemy vs player collision
      if (enemy.getBounds().intersects(this.player.getBounds())) {
        this.enemyExplosion(
          Math.floor(enemy.x) + 32,
          Math.floor(this.enemies.position.y + enemy.y)
        );
        this.effectPlay(this.explosionAudio, 0.005);
        this.enemies.removeChild(enemy);
        this.playerLives--;
        this.enemyCount--;
        this.score += 10;
      }
    });

    if (this.frames === 100000) this.frames = 0;

    if (this.waveCount % 3 === 0) this.enemyShipBSNext = this.waveCount + 1;

    if (this.frames % 100 === 0 && this.enemyCount > 0) {
      // garbage check
      /* console.log(
        this.enemies.children.length,
        this.bullets.children.length,
        this.enemyBullets.length,
        this.asteroids.length,
        this.particles.length,
        this.drops.length
      ); */

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
      this.segmentWidth = 100 / (this.waveCount * 2);
      this.bossHPBarFront.width = this.bossHP * this.segmentWidth;
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
