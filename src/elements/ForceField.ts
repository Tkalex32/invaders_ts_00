import { Sprite } from "pixi.js";

export class ForceField extends Sprite {
  constructor() {
    super();
    this.texture = Sprite.from("forcefield").texture;
    this.anchor.set(0.5);
    this.scale.set(0.5);
    this.visible = false;
  }

  update(_framesPassed: number): void {
    //
  }
}
