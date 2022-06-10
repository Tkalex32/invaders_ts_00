import { sound } from "@pixi/sound";
import { Graphics, Sprite } from "pixi.js";
import { MAX_LIVES } from "../constants";
import { Particle } from "../elements/Particle";
import { Manager } from "../Manager";
import { IParticle, RandomDropItem } from "../types";

/**
 * Create particle effect
 *
 * Using simple random calculation to generate random particles
 *
 * @param particles - Particle array
 * @param object - Object from drop, can be a Sprite, Graphics or an IParticle
 * @param color - Color of the particle
 * @param lineColor - Color of the outer line
 * @param small - If the particle is small
 * @return Nothing - Particle is added to the particles array
 */
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

/**
 * Calculate the drop item
 *
 * Using simple random calculation to generate a random drop item
 *
 * @param currentLives - Current lives of the player
 * @return A random drop item (nothing, heart, shield or multishoot)
 */
export const itemDrop: (currentLives: number) => RandomDropItem = (
  currentLives: number
) => {
  const randomNumber: number = Math.random();
  // 60% chance to drop
  /* let drop: RandomDropItem =
    +randomNumber.toFixed(1) <= 1
      ? "heart"
      : +randomNumber.toFixed(1) > 1 && +randomNumber.toFixed(1) < 4
      ? "shield"
      : +randomNumber.toFixed(1) >= 4 && +randomNumber.toFixed(1) < 6
      ? "multishoot"
      : "nothing"; */
  // test case for drop item - 100% drop rate, 36% multishoot, 18% shield, 46% heart
  let drop: RandomDropItem =
    +randomNumber.toFixed(1) < 0.4
      ? "multishoot"
      : +randomNumber.toFixed(1) < 0.6
      ? "heart"
      : "shield";

  if (drop === "heart" && currentLives === MAX_LIVES) {
    drop = +randomNumber.toFixed(1) < 0.5 ? "shield" : "multishoot";
  }
  return drop;
};

/**
 * Play the sound, if not muted
 *
 *
 * @param audio The sound to play
 * @param volume The volume to play the sound at
 * @return Returns nothing
 */
export const effectPlay = (audio: string, volume: number = 0.5): void => {
  sound.add(audio.split(".")[0], {
    url: `./sounds/${audio}`,
    volume: volume,
  });
  sound.play(audio.split(".")[0], {
    volume: volume,
    muted: Manager.localStorageData.muteSFX,
  });
};
