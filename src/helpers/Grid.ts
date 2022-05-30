import { Container } from "pixi.js";
import { EnemyShip } from "../elements/EnemyShip";

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

  constructor(wave: number) {
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

    if (wave % 4 === 0) {
      const enemy: EnemyShip = new EnemyShip(0, 0, "boss");
      this.enemies.push(enemy);
    } else {
      let columns: number = 8;
      let rows: number = 1;

      if (wave === 1 || wave === 5 || wave === 9) {
        rows = 1;
      } else if (
        wave === 2 ||
        wave === 3 ||
        wave === 6 ||
        wave === 7 ||
        wave === 10 ||
        wave === 13 ||
        wave === 17 ||
        wave === 21
      ) {
        rows = 2;
      } else if (wave === 11 || wave === 14) {
        rows = 3;
      } else if (wave === 18 || wave === 22 || wave === 15) {
        rows = 4;
      } else if (wave === 19) {
        rows = 5;
      } else {
        rows = 6;
      }

      let shipType: string = "";

      for (let y: number = 0; y < rows; y++) {
        for (let x: number = 0; x < columns; x++) {
          shipType = "enemy2";
          if ((wave <= 11 && y === 0) || (wave >= 11 && y <= 1))
            shipType = "enemy1";
          if (
            (wave <= 11 && y === 1) ||
            (wave <= 15 && y === 2) ||
            (wave > 15 && (y === 2 || y === 3))
          )
            shipType = "enemy2";
          if (
            (wave === 11 && y === 2) ||
            (wave === 15 && y === 3) ||
            (wave > 15 && y >= 4)
          )
            shipType = "enemy3";

          const enemy: EnemyShip = new EnemyShip(x * 68, y * -68, shipType);
          this.enemies.push(enemy);
        }
      }
    }
    this.addChild(...this.enemies);
  }

  public update(_framesPassed: number): void {
    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;
  }
}
