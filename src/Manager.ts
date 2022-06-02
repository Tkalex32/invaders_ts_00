import { Application } from "@pixi/app";
import { DisplayObject } from "@pixi/display";
import { Timer } from "eventemitter3-timer";

export class Manager {
  private constructor() {}

  private static app: Application;
  private static currentScene: IScene;
  private static loaded: boolean;

  private static _width: number;
  private static _height: number;
  private static _localStorageData: IStorage;
  private static _version: string = "0.0.7 alpha";

  public static get width(): number {
    return Manager._width;
  }
  public static get height(): number {
    return Manager._height;
  }

  public static get tickerState(): boolean {
    return Manager.app.ticker.started;
  }

  public static get localStorageData(): IStorage {
    return Manager._localStorageData;
  }

  public static set localStorageData(data: IStorage) {
    Manager._localStorageData = data;
  }

  public static get version(): string {
    return Manager._version;
  }

  public static initialize = (
    width: number,
    height: number,
    background: number
  ): void => {
    Manager._width = width;
    Manager._height = height;
    Manager._localStorageData = {
      highScore: 0,
      muteSFX: false,
    };
    Manager.loaded = false;

    Manager.app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resolution: 4,
      autoDensity: true,
      backgroundColor: background,
      width: width,
      height: height,
    });
    Manager.app.ticker.add(
      () => Timer.timerManager.update(Manager.app.ticker.elapsedMS),
      this
    );
    Manager.app.ticker.add(Manager.update);
  };

  public static changeScene = (newScene: IScene): void => {
    if (Manager.currentScene) {
      Manager.app.stage.removeChild(Manager.currentScene);
      Manager.currentScene.destroy();
    }

    Manager.currentScene = newScene;
    Manager.app.stage.addChild(Manager.currentScene);
  };

  private static update = (framesPassed: number): void => {
    if (Manager.currentScene) {
      Manager.currentScene.update(framesPassed);
    }

    if (!this.loaded) this.getLocalStorageData();
  };

  public static pause = (): void => {
    Manager.app.ticker.stop();
  };

  public static resume = (): void => {
    Manager.app.ticker.start();
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
    Manager.localStorageData = value;
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

export interface IScene extends DisplayObject {
  update(framesPassed: number): void;
}

export interface IStorage {
  highScore: number;
  muteSFX: boolean;
}

export interface IParticle {
  position: {
    x: number;
    y: number;
    z: number;
  };
  width: number;
  height: number;
}
