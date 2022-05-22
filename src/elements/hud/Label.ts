import { Text } from "pixi.js";

export class Label extends Text {
  constructor(text: string, style: any) {
    super(text, style);
    this.anchor.set(0.5);
  }
}
