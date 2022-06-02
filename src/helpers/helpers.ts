import { Graphics, Sprite } from "pixi.js";
import { Particle } from "../elements/Particle";
import { IParticle } from "../Manager";

export const createParticles = (
  particles: Particle[],
  object: Sprite | Graphics | IParticle,
  color: number,
  lineColor: number,
  small?: boolean
): void => {
  small = small || false;

  for (let i: number = 0; small ? i < 5 : i < 15; i++) {
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
    );
  }
};
