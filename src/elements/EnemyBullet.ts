import { Graphics } from "pixi.js";

export class EnemyBullet extends Graphics {
  speed: number;
  constructor({ x, y, speed }: { x: number; y: number; speed: number }) {
    super();

    this.x = x;
    this.y = y;
    this.speed = speed;
    this.beginFill(0xffffff);
    this.drawRect(0, 0, 5, 10);
    this.endFill();
  }

  update(_framesPassed: number): void {
    this.y += this.speed;
  }
}
