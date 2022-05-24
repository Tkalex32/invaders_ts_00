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
