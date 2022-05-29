import { Sprite } from "pixi.js";

export class EnemyShip extends Sprite {
  constructor(x: number, y: number, shipType: string) {
    super();

    this.texture = Sprite.from(shipType).texture;
    this.anchor.set(0.5);
    this.x = x;
    this.y = y;
  }
}
