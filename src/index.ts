import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { Manager } from "./Manager";
import { LoaderScene } from "./scenes/LoaderScene";

Manager.initialize(GAME_WIDTH, GAME_HEIGHT, 0x424242);

const loader: LoaderScene = new LoaderScene();
Manager.changeScene(loader);
