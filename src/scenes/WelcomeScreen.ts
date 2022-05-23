import { Container, Graphics, Sprite } from "pixi.js";
import { Bullet } from "../elements/Bullet";
import { IScene, Manager } from "../Manager";
import { PlayerShip } from "../elements/PlayerShip";
import { EnemyShip } from "../elements/EnemyShip";
import { GameScene } from "./GameScene";
import { Button } from "../elements/hud/Button";
import { ButtonText } from "../elements/hud/ButtonText";

export class WelcomeScreen extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  state: string;
  private background: Sprite = Sprite.from("bg.png");
  private startButton: Graphics = new Button();
  private startButtonText: ButtonText;
  private player: Sprite;
  private bullet: Sprite;
  private enemy: Sprite;
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

  public colission = (): void => {
    if (this.enemy.getBounds().intersects(this.bullet.getBounds())) {
      this.bullet.x = this.player.x;
      this.bullet.y = this.player.y;
      this.enemy.x = Math.random() * this.screenWidth;
      this.enemy.y = Math.random() * 150 + 40;
    }
  };

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;
    this.background.width = this.screenWidth;
    this.state = "welcome";

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
      this.startButtonText.tint = 0x7d5d1e;
    });

    this.startButton.on("pointerout", () => {
      this.startButton.tint = 0xffffff;
      this.startButtonText.tint = 0xcc9933;
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
      this.startButton
    );
  }

  private startOnClick(): void {
    // this.state = "play";
    Manager.changeScene(new GameScene());
  }

  public update(_framesPassed: number): void {
    // must have the update method (even if we don't use it)
    this.movePlayer();
    this.moveBullet();
    this.moveEnemy();
    this.colission();
  }
}
