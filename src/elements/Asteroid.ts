import { Sprite, Texture } from "pixi.js";
import { Manager } from "../Manager";

export class Asteroid extends Sprite {
  speed: number;
  directionPre: number;
  direction: number;
  asteroidType: number;
  constructor() {
    super();

    this.x = Math.floor(Math.random() * (Manager.width - 45));
    this.y = -30;
    this.speed = Math.floor(Math.random() * 3) + 1;
    // this.direction = 1;
    this.directionPre = this.x > Manager.width / 2 ? -1 : 1;
    this.direction =
      Math.floor(Math.random() * 2) === 0 ? 0 : this.directionPre;
    this.asteroidType = Math.floor(Math.random() * 4 + 1);
    this.texture = Texture.from(`asteroid${this.asteroidType}`);
  }

  update(_framesPassed: number): void {
    this.x += this.speed * this.direction;
    this.y += this.speed;
  }
}
