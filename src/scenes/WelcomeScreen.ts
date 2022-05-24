import {
  AnimatedSprite,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { Bullet } from "../elements/Bullet";
import { IScene, IStorage, Manager } from "../Manager";
import { PlayerShip } from "../elements/PlayerShip";
import { EnemyShip } from "../elements/EnemyShip";
import { GameScene } from "./GameScene";
import { Button } from "../elements/hud/Button";
import { ButtonText } from "../elements/hud/ButtonText";
import { explosionFrames } from "../assets";

export class WelcomeScreen extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private background: Sprite = Sprite.from("bg.png");
  private startButton: Graphics = new Button();
  private startButtonText: ButtonText;
  private player: Sprite;
  private bullet: Sprite;
  private enemy: Sprite;
  private highScore: number = 0;
  private highScoreText: Text;
  private playerSpeed: number = 1;
  private bulletSpeed: number = 5;
  private enemySpeed: number = 1;

  private movePlayer = (): void => {
    this.player.x += this.playerSpeed;
    if (this.player.x > this.screenWidth - 20) this.playerSpeed = -1;
    if (this.player.x < 20) this.playerSpeed = 1;
  };

  private moveBullet = (): void => {
    this.bullet.y -= this.bulletSpeed;
    if (this.bullet.y < 0) {
      this.bullet.x = this.player.x;
      this.bullet.y = this.player.y;
    }
  };

  private moveEnemy = (): void => {
    this.enemy.x += this.enemySpeed;
    if (this.enemy.x > this.screenWidth - 20) this.enemySpeed = -1;
    if (this.enemy.x < 20) this.enemySpeed = 1;
  };

  explosionFrames: Array<String> = explosionFrames;

  public colission = (): void => {
    if (this.enemy.getBounds().intersects(this.bullet.getBounds())) {
      this.bullet.x = this.player.x;
      this.bullet.y = this.player.y;

      let explosion: AnimatedSprite = new AnimatedSprite(
        this.explosionFrames.map((str) => Texture.from(str as string))
      );
      explosion.x = this.enemy.x;
      explosion.y = this.enemy.y;
      explosion.anchor.set(0.5);
      explosion.animationSpeed = 0.3;
      explosion.scale.set(0.7);
      explosion.loop = false;

      explosion.play();
      this.addChild(explosion);

      explosion.onComplete = () => {
        this.removeChild(explosion);
      };

      this.enemy.x = Math.random() * this.screenWidth;
      this.enemy.y = Math.random() * 150 + 40;
    }
  };

  private getHighScore(): void {
    const localData: IStorage = Manager.localStorageData;
    if (localData.highScore) {
      this.highScore = localData.highScore;
    }
  }

  constructor() {
    super();

    this.getHighScore();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;
    this.background.width = this.screenWidth;

    this.highScoreText = new Text(`High Score: ${this.highScore}`, {
      fontFamily: "Arial",
      fontSize: 20,
      fill: "white",
      align: "center",
      stroke: "black",
      strokeThickness: 2,
    });
    this.highScoreText.x = this.screenWidth / 2;
    this.highScoreText.y = 20;
    this.highScoreText.anchor.set(0.5);

    this.startButtonText = new ButtonText("Start", {
      fontFamily: "Arial",
      fontSize: 36,
      fill: 0xcc9933,
      align: "center",
    });

    this.startButton.x = this.screenWidth / 2 - 100;
    this.startButton.y = this.screenHeight / 2 - 25;

    this.startButton.on("click", this.startOnClick, this);

    this.startButton.on("pointerover", () => {
      this.startButton.tint = 0xcc9933;
      this.startButtonText.style.fill = 0xffffff;
    });

    this.startButton.on("pointerout", () => {
      this.startButton.tint = 0xffffff;
      this.startButtonText.style.fill = 0xcc9933;
    });

    this.player = new PlayerShip();
    this.player.x = this.screenWidth / 2;
    this.player.y = this.screenHeight - 30;

    this.enemy = new EnemyShip();
    this.enemy.x = this.screenWidth / 2 + 20;
    this.enemy.y = 40;

    this.bullet = new Bullet();
    this.bullet.x = this.player.x;
    this.bullet.y = this.player.y;
    this.bullet.scale.set(0.25);

    this.startButton.addChild(this.startButtonText);
    this.addChild(
      this.background,
      this.player,
      this.bullet,
      this.enemy,
      this.startButton,
      this.highScoreText
    );
  }

  private startOnClick(): void {
    Manager.changeScene(new GameScene());
  }

  public update(_framesPassed: number): void {
    this.movePlayer();
    this.moveBullet();
    this.moveEnemy();
    this.colission();
  }
}
