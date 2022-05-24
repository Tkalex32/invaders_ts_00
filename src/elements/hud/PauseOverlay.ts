import { Container, Graphics, Text } from "pixi.js";
import { Manager } from "../../Manager";
import { Button } from "./Button";
import { ButtonText } from "./ButtonText";

export class PauseOverlay extends Container {
  private screenWidth: number;
  private screenHeight: number;
  private overlay: Graphics = new Graphics();
  private pauseText: Text;
  private startButton: Graphics = new Button();
  private startButtonText: ButtonText;

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;

    this.overlay.beginFill(0x000000, 0.5);
    this.overlay.drawRect(0, 0, this.screenWidth, this.screenHeight);
    this.overlay.endFill();

    this.pauseText = new Text("Paused", {
      fontFamily: "Arial",
      fontSize: 36,
      fill: 0xcc9933,
      align: "center",
    });
    this.pauseText.x = (this.screenWidth - this.pauseText.width) / 2;
    this.pauseText.y = 50;

    this.startButtonText = new ButtonText("Continue", {
      fontFamily: "Arial",
      fontSize: 32,
      fill: 0xcc9933,
      align: "center",
    });

    this.startButton.x = this.screenWidth / 2 - 100;
    this.startButton.y = this.screenHeight / 2 - 25;
    this.startButton.interactive = true;
    this.startButton.buttonMode = true;

    this.startButton.on("click", this.startOnClick, this);

    this.startButton.on("pointerover", () => {
      this.startButton.tint = 0xcc9933;
      this.startButtonText.style.fill = 0xffffff;
    });

    this.startButton.on("pointerout", () => {
      this.startButton.tint = 0xffffff;
      this.startButtonText.style.fill = 0xcc9933;
    });

    this.startButton.addChild(this.startButtonText);
    this.addChild(this.overlay, this.pauseText, this.startButton);
  }

  private startOnClick(): void {
    Manager.resume();
  }

  public update(_framesPassed: number): void {
    // cuz
  }
}
