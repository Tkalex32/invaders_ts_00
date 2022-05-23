import { Manager } from "./Manager";
import { LoaderScene } from "./scenes/LoaderScene";

Manager.initialize(640, 480, 0x424242);

const loader: LoaderScene = new LoaderScene();
Manager.changeScene(loader);
