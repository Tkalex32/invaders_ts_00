import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Button } from "../elements/hud/Button";
import { ButtonText } from "../elements/hud/ButtonText";
import { IScene, Manager } from "../Manager";
import { GameScene } from "./GameScene";

export class LoseScene extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private background: Sprite = Sprite.from("bg.png");
  private loseText: Text;
  private startButton: Graphics = new Button();
  private startButtonText: ButtonText;

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;
    this.background.width = this.screenWidth;

    this.loseText = new Text("You Lose!", {
      fontFamily: "Arial",
      fontSize: 36,
      fill: 0xcc9933,
      align: "center",
    });
    this.loseText.x = (this.screenWidth - this.loseText.width) / 2;
    this.loseText.y = 50;

    this.startButtonText = new ButtonText("Play Again", {
      fontFamily: "Arial",
      fontSize: 32,
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

    this.startButton.addChild(this.startButtonText);
    this.addChild(this.background, this.loseText, this.startButton);
  }

  private startOnClick(): void {
    Manager.changeScene(new GameScene());
  }

  public update(_framesPassed: number): void {
    // cuz
  }
}
