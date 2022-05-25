import { Container } from "pixi.js";
import { EnemyShip } from "./EnemyShip";

export class Grid extends Container {
  private pos: {
    x: number;
    y: number;
  };
  private speed: {
    x: number;
    y: number;
  };
  public enemies: EnemyShip[];

  constructor() {
    super();

    this.pos = {
      x: 0,
      y: 0,
    };

    this.speed = {
      x: 0,
      y: 0,
    };

    this.enemies = [];

    // const columns: number = Math.floor(Math.random() * 10 + 5);
    // const rows: number = Math.floor(Math.random() * 5 + 2);
    const columns: number = 8;
    const rows: number = 1;

    for (let x: number = 0; x < columns; x++) {
      for (let y: number = 0; y < rows; y++) {
        const enemy: EnemyShip = new EnemyShip({
          x: x * 50,
          y: y * 50,
        });
        enemy.scale.set(0.8);
        this.enemies.push(enemy);
      }
    }
    this.addChild(...this.enemies);
    console.log(this.enemies);
  }

  public update(_framesPassed: number): void {
    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;
  }
}
