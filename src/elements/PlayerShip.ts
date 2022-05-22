import { Sprite } from "pixi.js";

export class PlayerShip extends Sprite {
  constructor() {
    super();
    this.texture = Sprite.from("player.png").texture;
    this.anchor.set(0.5);
    this.x = 0;
    this.y = 0;
  }
}
