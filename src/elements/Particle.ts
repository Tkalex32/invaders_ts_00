import { Graphics } from "pixi.js";

export class Particle extends Graphics {
  speedX: number;
  speedY: number;
  radius: number;
  color: number;
  lineColor: number;
  constructor(
    x: number,
    y: number,
    speedX: number,
    speedY: number,
    radius: number,
    color: number,
    lineColor: number
  ) {
    super();

    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.radius = radius;
    this.color = color;
    this.lineColor = lineColor;

    this.lineStyle(1, this.lineColor);
    this.beginFill(this.color);
    this.drawCircle(0, 0, this.radius);
    this.alpha = 1;
    this.endFill();
  }

  update(_framesPassed: number): void {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.005;
  }
}
