import { Text } from "pixi.js";

export class ButtonText extends Text {
  constructor(text: string, style: any) {
    super(text, style);

    this.x = 100;
    this.y = 25;
    this.anchor.set(0.5);
  }
}
