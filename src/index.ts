import { Application, Container, Sprite } from "pixi.js";

const app = new Application({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: 0x6495ed,
  width: 640,
  height: 480,
});

const container = new Container();
app.stage.addChild(container);

const player: Sprite = Sprite.from("player.png");
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
player.anchor.set(0.5);
container.addChild(player);
