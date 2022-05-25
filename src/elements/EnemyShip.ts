import { Sprite } from "pixi.js";

export class EnemyShip extends Sprite {
  constructor({ x, y }: { x: number; y: number }) {
    super();

    this.texture = Sprite.from("enemy.png").texture;
    this.anchor.set(0.5);
    this.x = x;
    this.y = y;
  }
}
