import { Graphics, Sprite } from "pixi.js";
import { Particle } from "../elements/Particle";
import { IParticle, RandomDropItem } from "../types";

export const createParticles = (
  particles: Particle[],
  object: Sprite | Graphics | IParticle,
  color: number,
  lineColor: number,
  small?: boolean
): void => {
  small = small || false;

  Array(small ? 5 : 15)
    .fill(0)
    .forEach(() =>
      particles.push(
        new Particle(
          Math.floor(object.position.x + object.width / 2),
          Math.floor(object.position.y + object.height / 2),
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          small ? Math.random() * 3 : Math.random() * 6 + 2,
          color,
          lineColor
        )
      )
    );
};

export const itemDrop: (_dropFrom: string) => RandomDropItem = (
  _dropFrom: string
) => {
  const foo = Math.random();
  const drop: RandomDropItem =
    +foo.toFixed(1) === 0
      ? "heart"
      : +foo.toFixed(1) === 0.1
      ? "shield"
      : +foo.toFixed(1) === 0.2
      ? "multishoot"
      : "nothing";
  return drop;
};
