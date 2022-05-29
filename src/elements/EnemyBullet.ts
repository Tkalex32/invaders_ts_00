import { Sprite, Texture } from "pixi.js";

export class EnemyBullet extends Sprite {
  speed: number;
  constructor({
    x,
    y,
    speed,
    type,
  }: {
    x: number;
    y: number;
    speed: number;
    type: string;
  }) {
    super();

    this.x = x;
    this.y = y;
    this.speed = speed;
    const bulletType = type.slice(-1);
    this.texture = Texture.from(`ebullet${bulletType}`);
  }

  update(_framesPassed: number): void {
    this.y += this.speed;
  }
}
