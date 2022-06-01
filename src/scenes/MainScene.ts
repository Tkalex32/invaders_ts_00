import { Container, Sprite, Text } from "pixi.js";
import { IScene, IStorage, Manager } from "../Manager";
import { GameScene } from "./GameScene";

export class MainScene extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private container: Container = new Container();
  private background: Sprite = Sprite.from("background1");
  private logo: Sprite = Sprite.from("logo");
  private welcomeBox: Sprite = Sprite.from("welcomebox");
  private playButton: Sprite = Sprite.from("play");
  private highScore: number = 0;
  private highScoreText: Text;
  private sfxButton: Sprite;
  private versionText: Text;
  private version: string;

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

    this.welcomeBox.x = 110;
    this.welcomeBox.y = 173;

    this.highScoreText = new Text(`High Score: ${this.highScore}`, {
      fontFamily: "digital",
      fontSize: 30,
      fill: "0xFFC926",
      align: "center",
      stroke: "black",
    });
    this.highScoreText.x = this.screenWidth / 2;
    this.highScoreText.y = this.screenHeight - 40;
    this.highScoreText.anchor.set(0.5);

    this.playButton.x = this.screenWidth / 2;
    this.playButton.y = 480;
    this.playButton.scale.set(0.5);
    this.playButton.anchor.set(0.5);
    this.playButton.interactive = true;
    this.playButton.buttonMode = true;
    this.playButton.on("click", this.startOnClick, this);

    this.sfxButton = Sprite.from("sfxOn");
    this.sfxButton.x = 20;
    this.sfxButton.y = 20;
    this.sfxButton.scale.set(0.5);
    this.sfxButton.interactive = true;
    this.sfxButton.buttonMode = true;

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
      this.welcomeBox,
      this.highScoreText,
      this.playButton,
      this.sfxButton,
      this.versionText
    );
    this.addChild(this.container);
  }

  private startOnClick(): void {
    Manager.changeScene(new GameScene());
  }

  public update(_framesPassed: number): void {
    //
  }
}
