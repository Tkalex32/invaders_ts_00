import {
  AnimatedSprite,
  Container,
  DisplayObject,
  Sprite,
  Texture,
} from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Bullet } from "../elements/Bullet";
import { PlayerShip } from "../elements/PlayerShip";
import { Label } from "../elements/hud/Label";
// import { WinScene } from "./WinScene";
import { LoseScene } from "./LoseScene";
import { explosionFrames } from "../assets";
import { PauseOverlay } from "../elements/hud/PauseOverlay";
import { writeHighScore } from "../helpers/helpers";
import { Grid } from "../elements/Grid";
import { EnemyBullet } from "../elements/EnemyBullet";
import { EnemyShip } from "../elements/EnemyShip";

export class GameScene extends Container implements IScene {
  private screenWidth: number;
  private pauseOverlay: PauseOverlay = new PauseOverlay();
  private pause: boolean = false;
  private background: Sprite = Sprite.from("bg.png");
  private player: Sprite = new PlayerShip();
  private bullets: Container = new Container();
  private enemies: Grid;
  private startPos: {
    x: number;
    y: number;
  };
  private explosionOffset: number = 0;
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
  private vaweCount: number;
  private frames: number;
  private enemyBullets: EnemyBullet[];
  private laserAudio: HTMLAudioElement = new Audio("laser.mp3");
  private explosionAudio: HTMLAudioElement = new Audio("explosion.mp3");
  private winAudio: HTMLAudioElement = new Audio("win.mp3");
  private loseAudio: HTMLAudioElement = new Audio("lose.mp3");

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.background.width = this.screenWidth;
    this.winAudio.volume = 0.1;
    this.loseAudio.volume = 0.1;

    this.addEventListeners();

    this.enemies = new Grid();
    this.startPos = {
      x: this.screenWidth / 2 - this.enemies.width / 2 + 30,
      y: 50,
    };
    this.enemies.x = this.startPos.x;
    this.enemies.y = this.startPos.y;
    this.enemyCount = this.enemies.enemies.length;
    this.vaweCount = 0;
    this.enemyBullets = [];
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

  private onKeyDown(e: KeyboardEvent): void {
    this.keysMaps[e.code] = true;
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keysMaps[e.code] = false;
  }

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
        this.effectPlay(this.laserAudio, 0.05);
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
          this.enemyExplosion(
            enemy.position.x + this.startPos.x,
            enemy.position.y + this.startPos.y + this.explosionOffset
          );
          this.effectPlay(this.explosionAudio, 0.01);
          this.enemies.removeChild(enemy);
          this.bullets.removeChild(bullet);
          this.enemyCount--;
          this.score += 10;
        }
      });
    });

    this.enemyBullets.forEach((bullet) => bullet.update(delay));

    if (this.frames === 1000) this.frames = 0;

    this.enemies.children.forEach((enemy: DisplayObject) => {
      enemy.position.x = Math.floor((enemy.position.x += this.enemySpeed));

      if (enemy.position.x + 220 > Manager.width) {
        this.enemySpeed = this.enemySpeed * -1;
        this.enemies.position.y += 30;
        this.explosionOffset += 30;
      }

      if (enemy.position.x <= -160) {
        this.enemySpeed = this.enemySpeed * -1;
        this.enemies.position.y += 30;
        this.explosionOffset += 30;
      }

      if (enemy.getBounds().intersects(this.player.getBounds())) {
        this.enemyExplosion(
          enemy.position.x + this.startPos.x,
          enemy.position.y + this.startPos.y + this.explosionOffset
        );
        this.effectPlay(this.explosionAudio, 0.01);
        this.enemies.removeChild(enemy);
        this.playerLives--;
        this.enemyCount--;
        this.score += 10;
      }
    });

    if (this.frames % 100 === 0 && this.enemyCount > 0) {
      const shooter: EnemyShip = this.enemies.children[
        Math.floor(Math.random() * this.enemies.children.length)
      ] as EnemyShip;

      const x: number = Math.floor(shooter.x) + 160;
      const y: number = Math.floor(this.enemies.position.y);
      const speed = this.vaweCount + 2;
      const bullet: EnemyBullet = new EnemyBullet({ x, y, speed });

      this.enemyBullets.push(bullet);
      this.addChild(bullet);
      // TODO: normalize bullet speed. it's too fast on higher waves

      // console.log(this.enemyBullets.length);
    }

    this.enemyBullets.forEach((bullet) => {
      if (bullet.getBounds().intersects(this.player.getBounds())) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(bullet), 1);
        this.removeChild(bullet);
        this.playerLives--;
        // TODO: add effects
      }

      if (bullet.position.y > Manager.height) {
        this.enemyBullets.splice(this.enemyBullets.indexOf(bullet), 1);
        this.removeChild(bullet);
      }
    });

    if (this.enemyCount === 0) {
      this.removeChild(this.enemies);
      this.enemies = new Grid();
      this.enemies.x = this.startPos.x;
      this.enemies.y = this.startPos.y;
      this.addChild(this.enemies);
      this.enemyCount = this.enemies.enemies.length;
      this.explosionOffset = 0;
      this.vaweCount++;

      // TODO: add sfx maybe?
      // check if need more reset
    }

    if (this.playerLives === 0) {
      this.laserAudio.pause();
      this.laserAudio.currentTime = 0;
      this.explosionAudio.pause();
      this.laserAudio.currentTime = 0;
      writeHighScore(this.score);
      this.removeChild(
        this.player,
        this.bullets,
        this.enemies,
        this.livesLabel,
        this.scoreLabel
      );
      Manager.changeScene(new LoseScene());
      this.loseAudio.play();
    }
  }
}
