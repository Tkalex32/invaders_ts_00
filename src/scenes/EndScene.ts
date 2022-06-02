import { Container, Sprite, Text } from "pixi.js";
import { IScene, IStorage, Manager } from "../Manager";
import { MainScene } from "./MainScene";

export class EndScene extends Container implements IScene {
  private screenWidth: number;
  private screenHeight: number;
  private version: string;
  private container: Container = new Container();
  private background: Sprite = Sprite.from("background1");
  private infoBox: Sprite = Sprite.from("popup");
  private highScoreLabel: Text;
  private scoreLabel: Text;
  private highScoreText: Text;
  private scoreText: Text;
  private title: Text;
  private title2: Text;
  private newHS: Text;
  private versionText: Text;
  private highScore: number = 0;
  private score: number = 0;
  private menuButton: Sprite = Sprite.from("menu");

  private getHighScore = (): void => {
    const localData: IStorage = Manager.localStorageData;
    if (localData.highScore) {
      this.highScore = localData.highScore;
    }
  };

  constructor(score: number) {
    super();

    this.score = score;
    this.getHighScore();
    Manager.saveScoreToLocalStorage(this.score);

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

    this.infoBox.x = 144;
    this.infoBox.y = 93;

    this.title = new Text(`game over`, {
      fontFamily: "digital",
      fontSize: 59,
      fill: "0xFDF36D",
      align: "center",
      stroke: "black",
    });
    this.title.x = 275;
    this.title.y = 17;

    this.title2 = new Text(`game over`, {
      fontFamily: "digital",
      fontSize: 59,
      fill: "0xFFC926",
      align: "center",
      stroke: "black",
    });
    this.title2.x = 275;
    this.title2.y = 22;

    this.scoreLabel = new Text(`Score:`, {
      fontFamily: "digital",
      fontSize: 46,
      fill: "0xBA92FF",
      align: "center",
      stroke: "black",
    });
    this.scoreLabel.x = 347;
    this.scoreLabel.y = 134;

    this.scoreText = new Text(`${this.score}`, {
      fontFamily: "digital",
      fontSize: 50,
      fill: "0xFFC926",
      align: "center",
      stroke: "black",
    });
    this.scoreText.x = this.screenWidth / 2;
    this.scoreText.y = 202;
    this.scoreText.anchor.set(0.5);

    this.highScoreLabel = new Text(`High Score:`, {
      fontFamily: "digital",
      fontSize: 46,
      fill: "0xBA92FF",
      align: "center",
      stroke: "black",
    });
    this.highScoreLabel.x = 303;
    this.highScoreLabel.y = 271;

    this.highScoreText = new Text(
      this.score >= this.highScore ? `${this.score}` : `${this.highScore}`,
      {
        fontFamily: "digital",
        fontSize: 50,
        fill: "0xFFC926",
        align: "center",
        stroke: "black",
      }
    );
    this.highScoreText.x = this.screenWidth / 2;
    this.highScoreText.y = 339;
    this.highScoreText.anchor.set(0.5);

    this.newHS = new Text(`new`, {
      fontFamily: "digital",
      fontSize: 50,
      fill: "0xFFC926",
      align: "center",
      stroke: "black",
      dropShadow: true,
      dropShadowColor: "#dedede",
    });
    this.newHS.x = 279;
    this.newHS.y = 273;
    this.newHS.anchor.set(0.5);
    this.newHS.rotation = Math.PI * 2 * -0.125;

    this.versionText = new Text(`${this.version}`, {
      fontFamily: "digital",
      fontSize: 20,
      fill: "0xFFC926",
      align: "center",
      stroke: "black",
    });
    this.versionText.x = this.screenWidth - this.versionText.width - 10;
    this.versionText.y = this.screenHeight - this.versionText.height - 10;

    this.menuButton.x = 344;
    this.menuButton.y = 422;
    this.menuButton.scale.set(0.5);
    this.menuButton.interactive = true;
    this.menuButton.buttonMode = true;
    this.menuButton.on("click", this.startOnClick, this);

    this.container.addChild(
      this.background,
      this.title2,
      this.title,
      this.infoBox,
      this.highScoreLabel,
      this.highScoreText,
      this.scoreLabel,
      this.scoreText,
      this.menuButton,
      this.newHS,
      this.versionText
    );
    this.highScore > this.score
      ? (this.newHS.visible = false)
      : (this.newHS.visible = true);
    this.addChild(this.container);
  }

  private startOnClick = (): void => {
    Manager.changeScene(new MainScene());
  };

  public update = (_framesPassed: number): void => {
    //
  };
}
