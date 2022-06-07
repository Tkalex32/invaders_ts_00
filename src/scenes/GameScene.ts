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
import { createParticles, effectPlay, itemDrop } from "../helpers/helpers";
import { IScene, RandomDropItem } from "../types";
import * as CONSTANT from "../constants";
import { ForceField } from "../elements/ForceField";

export class GameScene extends Container implements IScene {
  private pauseOverlay: PauseOverlay = new PauseOverlay();
  private pause: boolean = false;
  private background: Sprite = Sprite.from("background.png");
  private player: Sprite = new PlayerShip();
  private bullets: Container = new Container();
  private forceField: Sprite = new ForceField();
  private forcefieldIsActive: boolean;
  private multishootIsActive: boolean;
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
  private shieldBar: Container;
  private shieldBarBack: Graphics;
  private shieldBarFront: Graphics;
  private multishootBar: Container;
  private multishootBarBack: Graphics;
  private multishootBarFront: Graphics;
  private bossHP: number;
  private segmentWidth: number;
  private isMouseFlag: boolean = false;
  private lastBulletSpawnTime: number = 0;
  private spawnSpeed: number = 400;
  private keysMaps: { [key: string]: boolean } = {};
  private playerRotation = 0;
  private playerSpeed: number = CONSTANT.PLAYER_SPEED;
  private bulletSpeed: number = CONSTANT.BULLET_SPEED;
  private enemyCount: number;
  private playerLives: number = CONSTANT.START_LIVES;
  private enemySpeed: number = CONSTANT.ENEMY_SPEED;
  private score: number = CONSTANT.START_SCORE;
  private waveCount: number;
  private enemyShipBulletSpeed: number;
  private enemyShipBSNext: number;
  private frames: number;
  private enemyBullets: EnemyBullet[];
  private asteroids: Asteroid[];
  private particles: Particle[];
  private drops: Drop[];
  private laserAudio: string = "laser.mp3";
  private explosionAudio: string = "explosion.mp3";
  private dropAudio: string = "drop.mp3";
  private hitAudio: string = "hit.wav";
  private timer1: Timer;
  private timer2: Timer;
  private timer3: Timer;
  private shieldTimer: Timer;
  private multishootTimer: Timer;
  private shieldCounter: number;
  private miniShield: Sprite = Sprite.from("shield.png");
  private multishootCounter: number;
  private miniMultishoot: Sprite = Sprite.from("multishoot.png");

  constructor() {
    super();

    this.width = Manager.width;
    this.height = Manager.height;

    this.timer1 = new Timer(1000);
    this.timer2 = new Timer(1000);
    this.timer3 = new Timer(1000);

    this.shieldTimer = new Timer(5000);
    this.forcefieldIsActive = false;
    this.shieldCounter = 600;
    this.miniShield.anchor.set(0.5);
    this.miniShield.scale.set(0.5);
    this.miniShield.x = 200;
    this.miniShield.y = 12;

    this.multishootTimer = new Timer(5000);
    this.multishootIsActive = false;
    this.multishootCounter = 600;
    this.miniMultishoot.anchor.set(0.5);
    this.miniMultishoot.scale.set(0.5);
    this.miniMultishoot.x = 500;
    this.miniMultishoot.y = 12;

    this.background.width = Manager.width;

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

    this.shieldBar = new Container();
    this.shieldBarBack = new Graphics();
    this.shieldBarFront = new Graphics();
    this.shieldBarBack.beginFill(0x021934);
    this.shieldBarBack.lineStyle(1, 0x4287f5);
    this.shieldBarBack.drawRect(0, 0, 100, 8);
    this.shieldBarBack.endFill();
    this.shieldBarFront.beginFill(0x4287f5);
    this.shieldBarFront.drawRect(0, 0, 100, 8);
    this.shieldBarFront.endFill();
    this.shieldBarFront.width = 0;
    this.shieldBar.position.set(220, 7);
    this.shieldBar.addChild(this.shieldBarBack, this.shieldBarFront);

    this.multishootBar = new Container();
    this.multishootBarBack = new Graphics();
    this.multishootBarFront = new Graphics();
    this.multishootBarBack.beginFill(0x021934);
    this.multishootBarBack.lineStyle(1, 0x7b02a3);
    this.multishootBarBack.drawRect(0, 0, 100, 8);
    this.multishootBarBack.endFill();
    this.multishootBarFront.beginFill(0xc49e04);
    this.multishootBarFront.drawRect(0, 0, 100, 8);
    this.multishootBarFront.endFill();
    this.multishootBarFront.width = 0;
    this.multishootBar.position.set(520, 7);
    this.multishootBar.addChild(
      this.multishootBarBack,
      this.multishootBarFront
    );

    // ?
    this.pauseOverlay.zIndex = 100;

    this.enemies = new Grid(this.waveCount);

    this.startPos = {
      x: 0 + this.enemies.enemies[0].width / 2,
      y: 50,
    };
    this.enemies.x = this.startPos.x;
    this.enemies.y = this.enemies.height;
    this.enemyCount = this.enemies.enemies.length;
    this.enemyShipBulletSpeed = CONSTANT.ENEMY_BULLET_SPEED;
    this.enemyShipBSNext = 0;
    this.enemyBullets = [];
    this.asteroids = [];
    this.particles = [];
    this.drops = [];
    this.frames = 0;

    this.player.anchor.set(0.5);
    this.player.x = Manager.width / 2;
    this.player.y = Manager.height - 20;

    this.forceField.x = this.player.x;
    this.forceField.y = this.player.y;

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
      this.scoreLabel,
      this.multishootBar,
      this.shieldBar,
      this.miniMultishoot,
      this.miniShield
    );
  }

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

  enemyExplosion = (x: number, y: number): void => {
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

  public update = (delay: number): void => {
    this.player.rotation = this.playerRotation;
    this.forceField.x = this.player.x;
    this.forceField.y = this.player.y;

    if (this.forcefieldIsActive) {
      this.shieldCounter -= delay;
      this.shieldBarFront.width = this.shieldCounter / 6;
    }

    if (this.multishootIsActive) {
      this.multishootCounter -= delay;
      this.multishootBarFront.width = this.multishootCounter / 6;
    }

    this.frames++;

    // garbage check
    /* if (this.frames % 100 === 0) {
      console.log(
        this.enemies.children.length,
        this.bullets.children.length,
        this.enemyBullets.length,
        this.asteroids.length,
        this.particles.length,
        this.drops.length,
        this.enemies
      );
    } */

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
      this.player.position.y > 20
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
        effectPlay(this.laserAudio, 0.15);
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
              effectPlay(this.explosionAudio, 0.08);
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
            effectPlay(this.explosionAudio, 0.08);
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
          this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
          this.removeChild(asteroid);
          this.bullets.removeChild(bullet);
          this.score += 5;
          const drop: RandomDropItem = itemDrop(this.playerLives);
          if (drop !== "nothing") {
            const dropItem = new Drop(
              asteroid.x + asteroid.width / 2,
              asteroid.y + asteroid.height / 2,
              drop
            );
            this.drops.push(dropItem);
            this.addChild(dropItem);
            // TODO add effect
            effectPlay(this.dropAudio, 0.3);
          } else {
            effectPlay(this.explosionAudio, 0.08);
          }
        }
      });
    });

    this.drops.forEach((drop: Drop) => {
      // drop vs player collision - pickup
      if (drop.getBounds().intersects(this.player.getBounds())) {
        if (drop.type === "heart" && this.playerLives < CONSTANT.MAX_LIVES) {
          this.playerLives++;
          effectPlay("heartPickUp.mp3", 0.3);
        } else if (drop.type === "shield") {
          effectPlay("shieldUp.wav", 0.3);
          // if shield is active, reset the timer and scale it up the shield
          if (this.forcefieldIsActive) {
            this.shieldTimer.reset();
            this.forceField.scale.x += 0.5;
            this.forceField.scale.y += 0.5;
          } else {
            // if shield is not active, create shield and start timer
            this.shieldTimer = new Timer(5000);
            this.shieldTimer.repeat = 1;

            this.shieldTimer.on("start", (): void => {
              this.addChild(this.forceField, this.miniShield, this.shieldBar);
              this.shieldCounter = 600;
              this.forceField.visible = true;
              this.forcefieldIsActive = true;
            });
            this.shieldTimer.on("end", (): void => {
              this.shieldCounter = 0;
              this.forceField.visible = false;
              this.forcefieldIsActive = false;
              this.forceField.scale.set(0.5);
              this.removeChild(this.forceField);
              effectPlay("shieldDown.wav", 0.3);
            });
            this.shieldTimer.start();
          }
        } else if (drop.type === "multishoot") {
          effectPlay("multishootOn.ogg", 0.3);
          // if multishoot is active, reset the timer
          if (this.multishootIsActive) {
            this.multishootTimer.reset();
          } else {
            // if multishoot is not active, activate multishoot and start timer
            this.multishootTimer = new Timer(5000);
            this.multishootTimer.repeat = 1;

            this.multishootTimer.on("start", (): void => {
              this.bulletSpeed *= 2;
              this.spawnSpeed = 100;
              this.addChild(this.miniMultishoot, this.multishootBar);
              this.multishootCounter = 600;
              this.multishootIsActive = true;
            });
            this.multishootTimer.on("end", (): void => {
              this.bulletSpeed = CONSTANT.BULLET_SPEED;
              this.spawnSpeed = 400;
              this.multishootCounter = 0;
              this.multishootIsActive = false;
              effectPlay("multishootOff.ogg", 0.3);
            });
            this.multishootTimer.start();
          }
        }
        this.drops.splice(this.drops.indexOf(drop), 1);
        this.removeChild(drop);
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
        effectPlay(this.hitAudio, 0.15);
        this.playerLives--;
      }

      // bullet vs shield/force field collision
      if (this.forcefieldIsActive) {
        if (enemyBullet.getBounds().intersects(this.forceField.getBounds())) {
          this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
          this.removeChild(enemyBullet);
          // TODO add effect
        }
      }

      // bullet out of bounds
      if (enemyBullet.position.y > Manager.height) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
      }

      // wave end, remove bullets
      if (this.enemyCount === 0) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1);
        this.removeChild(enemyBullet);
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
          effectPlay(this.explosionAudio, 0.08);
          this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
          this.removeChild(asteroid);
          this.playerLives--;
          this.score += 5;
          itemDrop(this.playerLives);
        }

        // asteroid vs shield/force field collision
        if (this.forcefieldIsActive) {
          if (asteroid.getBounds().intersects(this.forceField.getBounds())) {
            effectPlay(this.explosionAudio, 0.08);
            this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
            this.removeChild(asteroid);
            this.score += 5;
            // TODO add effect
          }
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

      // enemy (exclude boss) vs player collision
      if (
        enemy.getBounds().intersects(this.player.getBounds()) &&
        this.waveCount % 4 !== 0
      ) {
        this.enemyExplosion(
          Math.floor(enemy.x) + 32,
          Math.floor(this.enemies.position.y + enemy.y)
        );
        effectPlay(this.explosionAudio, 0.08);
        this.enemies.removeChild(enemy);
        this.playerLives--;
        this.enemyCount--;
        this.score += 10;
      }

      // enemy (exclude boss) vs shield/force field collision
      if (this.forcefieldIsActive && this.waveCount % 4 !== 0) {
        if (enemy.getBounds().intersects(this.forceField.getBounds())) {
          this.enemyExplosion(
            Math.floor(enemy.x) + 32,
            Math.floor(this.enemies.position.y + enemy.y)
          );
          effectPlay(this.explosionAudio, 0.08);
          this.enemies.removeChild(enemy);
          this.enemyCount--;
          this.score += 10;
          // TODO add effect
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

        const enemyBulletAudio: string = `enemyBullet${type.slice(-1)}.wav`;
        effectPlay(enemyBulletAudio, 0.2);
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
      const enemyBulletAudio: string = `enemyBullet${type}.wav`;
      effectPlay(enemyBulletAudio, 0.2);
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

      const enemyBulletAudio: string = `enemyBullet${type}.wav`;
      effectPlay(enemyBulletAudio, 0.2);
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
      const enemyBulletAudio: string = `enemyBullet${type}.wav`;
      effectPlay(enemyBulletAudio, 0.15);
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

    // wave end
    if (this.enemyCount === 0) {
      this.timer1.stop();
      this.timer2.stop();
      this.timer3.stop();
      this.waveCount++;
      this.enemyShipBulletSpeed =
        this.waveCount === this.enemyShipBSNext && this.enemyShipBulletSpeed < 8
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

    // player lost and game over
    if (this.playerLives <= 0) {
      this.removeChild(
        this.player,
        this.bullets,
        this.enemies,
        this.livesLabel,
        this.scoreLabel
      );
      Manager.changeScene(new EndScene(this.score));
    }
  };
}
