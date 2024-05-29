import { EndGameType } from "../gamemodes/endGameType";

export default class EndGameScene extends Phaser.Scene { 
  endGameType: EndGameType;

  constructor() {
    super({ key: "EndGame" });
  }

  init(data: any) {
    this.endGameType = data.endGameType;
  }

  create() {
    let message: string = "";
    switch (this.endGameType) {
      case EndGameType.WIN:
        message = "You win!"
        break;
      case EndGameType.LOSE:
        message = "You lose!"
        break;
      case EndGameType.DISCONNECTED:
        message = "Disconnected"
        break;
    }

    const width = +this.sys.game.config.width;
    const height = +this.sys.game.config.height;
    const center_width = width / 2;
    const center_height = height / 2;
    this.sound.add("stageclear2").play();
    this.add
    .bitmapText(
        center_width,
        center_height - 50,
        "wendy",
        message,
        100
    )
    .setOrigin(0.5);
    this.time.delayedCall(2000, () => this.loadNext(), undefined, this);
  }

  loadNext() {
    this.scene.start("splash");
  }
}