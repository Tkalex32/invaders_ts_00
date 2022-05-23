import { Container, DisplayObject, Sprite } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Bullet } from "../elements/Bullet";
import { EnemyShip } from "../elements/EnemyShip";
import { PlayerShip } from "../elements/PlayerShip";
import { Label } from "../elements/hud/Label";
import { WinScene } from "./WinScene";
import { LoseScene } from "./LoseScene";

export class GameScene extends Container implements IScene {
  private screenWidth: number;
  private background: Sprite = Sprite.from("bg.png");
  private player: Sprite = new PlayerShip();
  private bullets: Container = new Container();
  private enemies: Container = new Container();
  private livesLabel: Label = new Label("Lives: 3", {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
    align: "center",
  });
  private scoreLabel: Label = new Label("Score: 0", {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
    align: "center",
  });
  private isMouseFlag: boolean = false;
  private lastBulletSpawnTime: number = 0;
  private spawnSpeed: number = 400;
  private keysMaps: { [key: string]: boolean } = {};
  private playerSpeed: number = 4;
  private bulletSpeed: number = 15;
  private enemyCount: number = 10;
  private playerLives: number = 3;
  private enemiesLeft: number = 10;
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

    [...Array(this.enemyCount)].forEach((_, index) => {
      const enemy = new EnemyShip();
      enemy.position.x = index * 65 + 30;
      enemy.position.y = 40;
      enemy.scale.set(0.8);
      this.enemies.addChild(enemy);
    });

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
    console.log(this.keysMaps, e.code);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keysMaps[e.code] = false;
  }

  public update(delay: number): void {
    if (this.keysMaps["ArrowLeft"] || this.keysMaps["KeyA"]) {
      if (this.player.position.x > 20) {
        this.player.position.x -= delay * this.playerSpeed;
      }
    }
    if (this.keysMaps["ArrowRight"] || this.keysMaps["KeyD"]) {
      if (this.player.position.x < Manager.width - this.player.width + 10) {
        this.player.position.x += delay * this.playerSpeed;
      }
    }
    if (this.keysMaps["ArrowUp"] || this.keysMaps["KeyW"]) {
      if (this.player.position.y > 50) {
        this.player.position.y -= delay * this.playerSpeed;
      }
    }
    if (this.keysMaps["ArrowDown"] || this.keysMaps["KeyS"]) {
      if (this.player.position.y < Manager.height - this.player.height + 20) {
        this.player.position.y += delay * this.playerSpeed;
      }
    }

    if (this.isMouseFlag || this.keysMaps["Space"]) {
      const currentTime: number = Date.now();

      if (currentTime - this.lastBulletSpawnTime > this.spawnSpeed) {
        const bullet = new Bullet();
        bullet.position.x = this.player.position.x;
        bullet.position.y = this.player.position.y;
        bullet.scale.x = 0.25;
        bullet.scale.y = 0.25;
        this.effectPlay(this.laserAudio, 0.05);
        this.bullets.addChild(bullet);

        if (bullet.position.x < 0) {
          this.bullets.removeChild(bullet);
        }

        this.lastBulletSpawnTime = currentTime;
      }
    }

    this.scoreLabel.text = `Score: ${this.enemyCount - this.enemiesLeft}`;
    this.livesLabel.text = `Lives: ${this.playerLives}`;

    this.bullets.children.forEach((bullet: DisplayObject) => {
      bullet.position.y -= this.bulletSpeed * delay;

      if (bullet.position.y < 0) {
        this.bullets.removeChild(bullet);
      }

      this.enemies.children.forEach((enemy: DisplayObject) => {
        if (enemy.getBounds().intersects(bullet.getBounds())) {
          this.effectPlay(this.explosionAudio, 0.01);
          this.enemies.removeChild(enemy);
          this.bullets.removeChild(bullet);
          this.enemiesLeft--;
          console.log(this.enemiesLeft);
        }
      });
    });

    this.enemies.children.forEach((enemy: DisplayObject) => {
      enemy.position.y += Math.floor(Math.random() + 1) * delay;

      if (enemy.position.y > Manager.height + 20) enemy.position.y = -30;

      if (enemy.getBounds().intersects(this.player.getBounds())) {
        this.effectPlay(this.explosionAudio, 0.01);
        this.enemies.removeChild(enemy);
        this.playerLives--;
        this.enemiesLeft--;
      }
    });

    if (this.enemiesLeft === 0) {
      this.laserAudio.pause();
      this.laserAudio.currentTime = 0;
      this.explosionAudio.pause();
      this.laserAudio.currentTime = 0;
      // state = "end";
      this.removeChild(
        this.player,
        this.bullets,
        this.enemies,
        this.livesLabel,
        this.scoreLabel
      );
      Manager.changeScene(new WinScene());
      this.winAudio.play();
    }

    if (this.playerLives === 0) {
      this.laserAudio.pause();
      this.laserAudio.currentTime = 0;
      this.explosionAudio.pause();
      this.laserAudio.currentTime = 0;
      // state = "end";
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
