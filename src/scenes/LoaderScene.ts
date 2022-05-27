import { Container, Graphics, Loader, Sprite, Text } from "pixi.js";
import { assets } from "../assets";
import { IScene, Manager } from "../Manager";
import { WelcomeScreen } from "./WelcomeScreen";

export class LoaderScene extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private loaderBarWidth: number;
  private background: Sprite = Sprite.from("background.png");
  private loaderBar: Container;
  private loaderBarBorder: Graphics;
  private loaderBarFill: Graphics;
  private loaderText: Text;

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;
    this.background.width = this.screenWidth;
    this.loaderBarWidth = this.screenWidth * 0.6;
    this.loaderBarFill = new Graphics();
    this.loaderBarFill.beginFill(0x706ca3, 1);
    this.loaderBarFill.drawRect(0, 0, this.loaderBarWidth, 20);
    this.loaderBarFill.endFill();
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBorder = new Graphics();
    this.loaderBarBorder.lineStyle(2, 0x4d4a7a, 1);
    this.loaderBarBorder.drawRect(0, 0, this.loaderBarWidth, 20);

    this.loaderText = new Text("Loading...", {
      fontFamily: "Arial",
      fontSize: 40,
      fill: 0xffffff,
      align: "center",
    });
    this.loaderText.x = this.loaderBarWidth / 2;
    this.loaderText.y = 35;
    this.loaderText.anchor.set(0.5);
    this.loaderText.scale.set(0.5);

    this.loaderBar = new Container();
    this.loaderBar.addChild(
      this.loaderText,
      this.loaderBarFill,
      this.loaderBarBorder
    );

    this.loaderBar.position.x = (this.screenWidth - this.loaderBar.width) / 2;
    this.loaderBar.position.y = (this.screenHeight - this.loaderBar.height) / 2;
    this.addChild(this.background, this.loaderBar);

    Loader.shared.add(assets);

    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onComplete.once(this.gameLoaded, this);

    Loader.shared.load();
  }

  private downloadProgress(loader: Loader): void {
    const progressRatio = loader.progress / 100;
    this.loaderBarFill.scale.x = progressRatio;
    // console.log(`progress: ${loader.progress}`);
  }

  private gameLoaded(): void {
    // console.log("Loaded!");
    // Change scene
    Manager.changeScene(new WelcomeScreen());
  }

  public update(_framesPassed: number): void {
    // must have the update method (even if we don't use it)
  }
}
