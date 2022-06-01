import { Container, Graphics, Loader, Sprite, Text } from "pixi.js";
import { assets } from "../assets";
import { IScene, Manager } from "../Manager";
import { MainScene } from "./MainScene";

export class LoaderScene extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private container: Container = new Container();
  private background: Sprite = Sprite.from("background1.png");
  private logo: Sprite = Sprite.from("logo.png");
  private ptwLogo: Sprite = Sprite.from("ptwLogo.png");
  private loaderBar: Container;
  private loaderBarWidth: number;
  private loaderBarBorder: Graphics;
  private loaderBarFill: Graphics;
  private loaderText: Sprite = Sprite.from("loading.png");
  private versionText: Text;
  private version: string;

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;
    this.background.width = this.screenWidth;
    this.version = Manager.version;

    this.container.width = this.screenWidth;
    this.container.height = this.screenHeight;
    this.container.pivot.set(
      this.container.width / 2,
      this.container.height / 2
    );
    this.container.x = 0;
    this.container.y = 0;

    this.logo.x = 269;
    this.logo.y = 17;

    this.ptwLogo.x = 241;
    this.ptwLogo.y = 175;

    this.loaderBarWidth = this.screenWidth * 0.6;
    this.loaderBarFill = new Graphics();
    this.loaderBarFill.beginFill(0xbc93ff, 1);
    this.loaderBarFill.drawRect(0, 0, this.loaderBarWidth, 4);
    this.loaderBarFill.endFill();
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBorder = new Graphics();
    this.loaderBarBorder.lineStyle(2, 0xbc93ff, 1);
    this.loaderBarBorder.drawRect(0, 0, this.loaderBarWidth, 4);

    this.loaderText.x = this.screenWidth / 2 + 20;
    this.loaderText.y = this.screenHeight - 30;
    this.loaderText.anchor.set(0.5);

    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderBarFill, this.loaderBarBorder);
    this.loaderBar.pivot.set(0.5);
    this.loaderBar.position.x = this.screenWidth / 2 - this.loaderBarWidth / 2;
    this.loaderBar.position.y = this.screenHeight - 60;

    this.versionText = new Text(`${this.version}`, {
      fontFamily: "digital",
      fontSize: 20,
      fill: "0xFFC926",
      align: "center",
      stroke: "black",
    });
    this.versionText.x = this.screenWidth - this.versionText.width - 10;
    this.versionText.y = this.screenHeight - this.versionText.height - 10;

    this.container.addChild(
      this.background,
      this.logo,
      this.ptwLogo,
      this.loaderBar,
      this.loaderText
    );
    this.addChild(this.container);

    Loader.shared.add(assets);

    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onComplete.once(this.gameLoaded, this);

    Loader.shared.load();
  }

  private downloadProgress(loader: Loader): void {
    const progressRatio = loader.progress / 100;
    this.loaderBarFill.scale.x = progressRatio;
  }

  private gameLoaded(): void {
    Manager.changeScene(new MainScene());
  }

  public update(_framesPassed: number): void {
    //
  }
}
