import { Sprite } from "pixi.js";

export class EnemyShip extends Sprite {
  constructor() {
    super();
    this.texture = Sprite.from("enemy.png").texture;
    this.anchor.set(0.5);
    this.x = 0;
    this.y = 0;
  }
}
