import { sound } from "@pixi/sound";
import { Container, Graphics, Loader } from "pixi.js";
import { fonts, sounds } from "../assets";
import { Manager } from "../Manager";
import { IScene } from "../types";
import { MainScene } from "./MainScene";

export class LoaderScene extends Container implements IScene {
  private screenWidth: number = Manager.width;
  private screenHeight: number = Manager.height;
  private container: Container = new Container();
  private loaderBar: Container = new Container();
  private loaderBarWidth: number = this.screenWidth * 0.6;
  private loaderBarBorder: Graphics = new Graphics();
  private loaderBarFill: Graphics = new Graphics();

  constructor() {
    super();

    Loader.shared.add(fonts);
    Loader.shared.add("atlas", "./atlas/atlas.json");

    sound.add(sounds);

    this.container.x = 0;
    this.container.y = 0;

    this.loaderBarFill = new Graphics();
    this.loaderBarFill.beginFill(0xbc93ff, 1);
    this.loaderBarFill.drawRect(0, 0, this.loaderBarWidth, 4);
    this.loaderBarFill.endFill();
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBorder = new Graphics();
    this.loaderBarBorder.lineStyle(2, 0xbc93ff, 1);
    this.loaderBarBorder.drawRect(0, 0, this.loaderBarWidth, 4);

    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderBarFill, this.loaderBarBorder);
    this.loaderBar.pivot.set(0.5);
    this.loaderBar.position.x = this.screenWidth / 2 - this.loaderBarWidth / 2;
    this.loaderBar.position.y = this.screenHeight - 60;

    this.container.addChild(this.loaderBar);
    this.addChild(this.container);

    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onComplete.once(this.gameLoaded, this);
    Loader.shared.load();
  }

  private downloadProgress = (loader: Loader): void => {
    const progressRatio = loader.progress / 100;
    this.loaderBarFill.scale.x = progressRatio;
  };

  private gameLoaded = (): void => {
    Manager.changeScene(new MainScene());
  };

  public update = (_framesPassed: number): void => {
    //
  };
}
