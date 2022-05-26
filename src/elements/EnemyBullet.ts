import { Graphics } from "pixi.js";

export class EnemyBullet extends Graphics {
  speed: number;
  constructor({
    x,
    y,
    speed,
    color = 0xffffff,
  }: {
    x: number;
    y: number;
    speed: number;
    color?: number;
  }) {
    super();

    this.x = x;
    this.y = y;
    this.speed = speed;
    this.beginFill(color);
    this.drawRect(0, 0, 4, 10);
    this.endFill();
  }

  update(_framesPassed: number): void {
    this.y += this.speed;
  }
}
