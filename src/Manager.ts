import { Application } from "@pixi/app";
import { DisplayObject } from "@pixi/display";
import { Timer } from "eventemitter3-timer";

export class Manager {
  private constructor() {}

  private static app: Application;
  private static currentScene: IScene;

  private static _width: number;
  private static _height: number;
  private static _localStorageData: IStorage;

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

    Manager.getLocalStorageData();
  };

  public static pause = (): void => {
    Manager.app.ticker.stop();
  };

  public static resume = (): void => {
    Manager.app.ticker.start();
  };

  public static getLocalStorageData = (): void => {
    if (localStorage.getItem("invaders")) {
      this._localStorageData = JSON.parse(
        localStorage.getItem("invaders") as string
      );
    } else {
      Manager.setLocalStorageData(this._localStorageData);
      console.log(this._localStorageData);
    }
  };

  public static setLocalStorageData = (value: IStorage): void =>
    localStorage.setItem("invaders", JSON.stringify(value));
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
