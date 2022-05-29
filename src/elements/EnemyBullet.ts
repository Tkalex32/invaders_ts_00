import { Sprite, Texture } from "pixi.js";

export class EnemyBullet extends Sprite {
  speed: number;
  constructor({
    x,
    y,
    speed,
    type,
    angle,
  }: {
    x: number;
    y: number;
    speed: number;
    type: string;
    angle: number;
  }) {
    super();

    this.x = x;
    this.y = y;
    this.speed = speed;
    const bulletType = type.slice(-1);
    this.texture = Texture.from(`ebullet${bulletType}`);
    this.angle = angle;
  }

  update(_framesPassed: number): void {
    this.x += 2 * Math.cos(this.angle);
    this.y += 2 * Math.sin(this.angle);
  }
}
