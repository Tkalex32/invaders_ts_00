import { Sprite } from "pixi.js";
import { Particle } from "../elements/Particle";
import { IStorage, Manager } from "../Manager";

export const writeHighScore = (score: number): void => {
  const data: IStorage = Manager.localStorageData;

  if (score > data.highScore) {
    data.highScore = score;
    Manager.setLocalStorageData(data);
  } else {
    Manager.setLocalStorageData(data);
  }
};

export const createParticles = (
  particles: Particle[],
  object: Sprite,
  color: number,
  lineColor: number
) => {
  for (let i: number = 0; i < 15; i++) {
    particles.push(
      new Particle(
        object.position.x + object.width / 2,
        object.position.y + object.height / 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        Math.random() * 6 + 2,
        color,
        lineColor
      )
    );
  }
};
