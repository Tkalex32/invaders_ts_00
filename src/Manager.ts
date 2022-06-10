import { Application } from "@pixi/app";
import { Timer } from "eventemitter3-timer";
import { GAME_VERSION } from "./constants";
import { IScene, IStorage } from "./types";

export class Manager {
  private constructor() {}

  private static app: Application;
  private static currentScene: IScene;
  private static loaded: boolean;

  private static _width: number;
  private static _height: number;
  private static _localStorageData: IStorage;
  private static _version: string = GAME_VERSION;

  public static get width(): number {
    return this._width;
  }
  public static get height(): number {
    return this._height;
  }

  public static get tickerState(): boolean {
    return this.app.ticker.started;
  }

  public static get localStorageData(): IStorage {
    return this._localStorageData;
  }

  public static set localStorageData(data: IStorage) {
    this._localStorageData = data;
  }

  public static get version(): string {
    return this._version;
  }

  public static initialize = (
    width: number,
    height: number,
    background: number
  ): void => {
    this._width = width;
    this._height = height;
    this._localStorageData = {
      highScore: 0,
      muteSFX: false,
    };
    this.loaded = false;

    this.app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: 4,
      autoDensity: true,
      backgroundColor: background,
      width: width,
      height: height,
    });
    this.app.ticker.add(
      () => Timer.timerManager.update(this.app.ticker.elapsedMS),
      this
    );
    this.app.ticker.add(this.update);
  };

  public static changeScene = (newScene: IScene): void => {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene);
      this.currentScene.destroy();
    }

    this.currentScene = newScene;
    this.app.stage.addChild(this.currentScene);
  };

  private static update = (framesPassed: number): void => {
    if (this.currentScene) {
      this.currentScene.update(framesPassed);
    }

    if (!this.loaded) this.getLocalStorageData();
  };

  public static pause = (): void => {
    this.app.ticker.stop();
  };

  public static resume = (): void => {
    this.app.ticker.start();
  };

  public static getLocalStorageData = (): void => {
    if (localStorage.getItem("invaders")) {
      const data = JSON.parse(localStorage.getItem("invaders") as string);
      this.setLocalStorageData(data);
      this.loaded = true;
    } else {
      this.localStorageData = {
        highScore: 0,
        muteSFX: false,
      };
      this.loaded = true;
    }
  };

  public static setLocalStorageData = (value: IStorage): void => {
    this.localStorageData = value;
  };

  public static saveScoreToLocalStorage = (value: number): void => {
    let { highScore, muteSFX } = this.localStorageData;
    highScore = highScore > value ? highScore : value;
    localStorage.setItem("invaders", JSON.stringify({ highScore, muteSFX }));
    this.setLocalStorageData({ highScore, muteSFX });
  };

  public static saveMutedToLocalStorage = (): void => {
    let { highScore, muteSFX } = this.localStorageData;
    muteSFX = !muteSFX;
    localStorage.setItem("invaders", JSON.stringify({ highScore, muteSFX }));
    this.setLocalStorageData({ highScore, muteSFX });
  };
}
