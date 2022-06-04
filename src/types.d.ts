import { DisplayObject } from "pixi.js";

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

export type RandomDropItem = "heart" | "multishoot" | "shield" | "nothing";
