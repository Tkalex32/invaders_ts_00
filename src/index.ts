import { Manager } from "./Manager";
import { LoaderScene } from "./scenes/LoaderScene";

Manager.initialize(640, 480, 0x424242);

// We no longer need to tell the scene the size because we can ask Manager!
const loader: LoaderScene = new LoaderScene();
Manager.changeScene(loader);
