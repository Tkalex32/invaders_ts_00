import { Container, Graphics, Loader, Text } from "pixi.js";
import { assets } from "../assets";
import { IScene, Manager } from "../Manager";
import { WelcomeScreen } from "./WelcomeScreen";

export class LoaderScene extends Container implements IScene {
  private loaderBar: Container;
  private loaderBarBoder: Graphics;
  private loaderBarFill: Graphics;
  private loaderText: Text;
  constructor() {
    super();

    const loaderBarWidth = Manager.width * 0.6;

    this.loaderBarFill = new Graphics();
    this.loaderBarFill.beginFill(0x706ca3, 1);
    this.loaderBarFill.drawRect(0, 0, loaderBarWidth, 20);
    this.loaderBarFill.endFill();
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBoder = new Graphics();
    this.loaderBarBoder.lineStyle(2, 0x4d4a7a, 1);
    this.loaderBarBoder.drawRect(0, 0, loaderBarWidth, 20);

    this.loaderText = new Text("Loading...", {
      fontFamily: "Arial",
      fontSize: 40,
      fill: 0x43406b,
      align: "center",
    });
    this.loaderText.x = loaderBarWidth / 2;
    this.loaderText.y = 35;
    this.loaderText.anchor.set(0.5);
    // this.loaderText.resolution = 2;
    this.loaderText.scale.set(0.5);
    // this.loaderText.resolution = window.devicePixelRatio;

    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderText);
    this.loaderBar.addChild(this.loaderBarFill);
    this.loaderBar.addChild(this.loaderBarBoder);
    this.loaderBar.position.x = (Manager.width - this.loaderBar.width) / 2;
    this.loaderBar.position.y = (Manager.height - this.loaderBar.height) / 2;
    this.addChild(this.loaderBar);

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
