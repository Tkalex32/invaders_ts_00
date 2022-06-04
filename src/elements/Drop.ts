import { GlowFilter } from "pixi-filters";
import { Sprite } from "pixi.js";

export class Drop extends Sprite {
  constructor(x: number, y: number, item: string) {
    super();
    this.texture = Sprite.from(`${item}.png`).texture;
    const filterColor: number =
      item === "heart" ? 0xff2626 : item === "shield" ? 0x26c9ff : 0xdc73ff;
    this.filters = [
      new GlowFilter({ distance: 15, outerStrength: 2, color: filterColor }),
    ];
    this.x = x;
    this.y = y;
    this.anchor.set(0.5);
    this.alpha = 1;
  }

  update(_framesPassed: number): void {
    this.alpha -= 0.001;
  }
}
