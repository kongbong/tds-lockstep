import GameModeInterface from "../gamemodes/gamemodeInterface";

export default class Score {
  scoreText: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene, gameMode: GameModeInterface, x: number, y: number) {
    this.scoreText = scene.add
    .bitmapText(
        x,
        y,
        "wendy",
        "Score: 0",
        100
    );
    this.scoreText.setOrigin(0, 0.5);
    this.scoreText.setScrollFactor(0);

    gameMode.onUpdateScore = (score: number) => {
      this.updateScore(score);
    };
  }

  updateScore(score: number) {
    // update score text
    this.scoreText.setText("Score: " + score);
  }
}