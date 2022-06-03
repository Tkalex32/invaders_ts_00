import { ColorOverlayFilter } from "pixi-filters";
import { Container, Graphics, Sprite } from "pixi.js";
import { Manager } from "../../Manager";
import { MainScene } from "../../scenes/MainScene";

export class PauseOverlay extends Container {
  private screenWidth: number;
  private screenHeight: number;
  private overlay: Graphics = new Graphics();
  private pauseHeader: Sprite = Sprite.from("pauseHeader");
  private resumeButton: Sprite = Sprite.from("resume");
  private menuButton: Sprite = Sprite.from("menu");
  private restartButton: Sprite = Sprite.from("restart");
  private sfxOnButton: Sprite = Sprite.from("sfxOn");
  private sfxOffButton: Sprite = Sprite.from("sfxOff");
  private sfxStatus: boolean;
  private infoBox: Sprite = Sprite.from("popup");

  constructor() {
    super();

    this.screenWidth = Manager.width;
    this.screenHeight = Manager.height;

    this.overlay.beginFill(0x000000, 0.5);
    this.overlay.drawRect(0, 0, this.screenWidth, this.screenHeight);
    this.overlay.endFill();

    this.infoBox.x = 144;
    this.infoBox.y = 93;

    this.pauseHeader.x = this.screenWidth / 2;
    this.pauseHeader.y = 144;
    this.pauseHeader.anchor.set(0.5);

    this.sfxStatus = Manager.localStorageData.muteSFX;
    this.sfxOnButton.x = 20;
    this.sfxOnButton.y = 20;
    this.sfxOnButton.scale.set(0.5);
    this.sfxOnButton.interactive = true;
    this.sfxOnButton.buttonMode = true;
    this.sfxOnButton.on("click", this.changeSfxStatus, this);
    this.sfxOffButton.x = 20;
    this.sfxOffButton.y = 20;
    this.sfxOffButton.scale.set(0.5);
    this.sfxOffButton.interactive = true;
    this.sfxOffButton.buttonMode = true;
    this.sfxOffButton.on("click", this.changeSfxStatus, this);
    if (this.sfxStatus) {
      this.sfxOnButton.visible = false;
      this.sfxOffButton.visible = true;
    } else {
      this.sfxOnButton.visible = true;
      this.sfxOffButton.visible = false;
    }

    this.resumeButton.x = this.infoBox.width / 2;
    this.resumeButton.y =
      this.infoBox.height / 2 - this.resumeButton.height / 2 + 160;
    this.resumeButton.scale.set(0.5);
    this.resumeButton.anchor.set(0.5);
    this.resumeButton.interactive = true;
    this.resumeButton.buttonMode = true;
    this.resumeButton.on("click", this.resumeGame, this);

    this.restartButton.x = this.infoBox.width / 2;
    this.restartButton.y =
      this.infoBox.height / 2 - this.restartButton.height / 2 + 70;
    this.restartButton.scale.set(0.5);
    this.restartButton.anchor.set(0.5);
    this.restartButton.filters = [new ColorOverlayFilter(0xffffff, 0.4)];

    this.menuButton.x = this.infoBox.width / 2;
    this.menuButton.y = this.infoBox.height / 2 - this.menuButton.height / 2;
    this.menuButton.anchor.set(0.5);
    this.menuButton.scale.set(0.5);
    this.menuButton.interactive = true;
    this.menuButton.buttonMode = true;
    this.menuButton.on("click", this.gotoMain, this);

    this.infoBox.addChild(
      this.resumeButton,
      this.restartButton,
      this.menuButton
    );
    this.addChild(
      this.overlay,
      this.infoBox,
      this.pauseHeader
      /* this.sfxOnButton,
      this.sfxOffButton */
    );
  }

  private resumeGame(): void {
    Manager.resume();
  }

  private gotoMain(): void {
    Manager.resume();
    Manager.changeScene(new MainScene());
  }

  private changeSfxStatus = (): void => {
    this.sfxStatus = !this.sfxStatus;
    Manager.saveMutedToLocalStorage();
    if (this.sfxStatus) {
      this.sfxOnButton.visible = false;
      this.sfxOffButton.visible = true;
    } else {
      this.sfxOnButton.visible = true;
      this.sfxOffButton.visible = false;
    }
  };

  public update(_framesPassed: number): void {
    // cuz
  }
}
