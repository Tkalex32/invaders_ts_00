import { Container, Graphics, Text } from "pixi.js";
import { IScene } from "../Manager";

export class WelcomeScreen extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private bgColor: number;
  state: string;
  private startButton: Graphics;
  private startButtonText: Text;

  constructor() {
    super();

    this.screenWidth = 800;
    this.screenHeight = 600;
    this.bgColor = 0xffffff;
    this.state = "welcome";

    this.startButton = new Graphics();
    this.startButtonText = new Text("Start", {
      fontFamily: "Arial",
      fontSize: 36,
      fill: 0x000000,
      align: "center",
    });

    this.startButton
      .beginFill(this.bgColor)
      .lineStyle(2, 0x000000)
      .drawRect(0, 0, 200, 50)
      .endFill();
    this.startButton.x = this.screenWidth / 2 - 100;
    this.startButton.y = this.screenHeight / 2 - 25;

    this.startButtonText.x = 100;
    this.startButtonText.y = 25;
    this.startButtonText.anchor.set(0.5);

    this.startButton.addChild(this.startButtonText);
    this.addChild(this.startButton);

    this.startButton.on("click", this.startOnClick, this);
    this.startButton.interactive = true;
    this.startButton.buttonMode = true;
  }

  private startOnClick(): void {
    this.state = "play";
  }

  public update(_framesPassed: number): void {
    // To be a scene we must have the update method even if we don't use it.
  }
}
