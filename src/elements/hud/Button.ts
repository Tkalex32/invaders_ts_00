import { Graphics } from "pixi.js";

export class Button extends Graphics {
  constructor() {
    super();

    this.beginFill(0xffffff);
    this.lineStyle(2, 0xcc9933);
    this.drawRoundedRect(0, 0, 200, 50, 10);
    this.endFill();

    this.buttonMode = true;
    this.interactive = true;
  }
}
