export default class PreloadScene extends Phaser.Scene {
  loadBar: Phaser.GameObjects.Graphics;
  progressBar: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {    
    this.createBars();
    this.setLoadEvents();

    for (let i = 0; i < 6; i++) {
      this.load.audio(`muzik${i}`, `assets/sounds/muzik${i}.mp3`);
    }

    this.load.image("logo", "assets/images/pigeon_logo.png");
    this.load.image("background", "assets/images/background.png");
    this.load.image("ship1_1", "assets/images/bird_topview.png");    
    this.load.image("foeship", "assets/images/foeship.png");
    this.load.image("pello", "assets/images/pello.png");
    this.load.image("hex", "assets/images/hex64.png");
    this.load.image("asteroid", "assets/images/asteroid.png");
    this.load.audio("splash", "assets/sounds/splash.mp3");
    this.load.audio("game-over", "assets/sounds/game-over.mp3");
    this.load.audio("explosion", "assets/sounds/explosion.mp3");
    this.load.audio("shot", "assets/sounds/shot.mp3");
    this.load.audio("foeshot", "assets/sounds/foeshot.mp3");
    this.load.audio("pick", "assets/sounds/pick.mp3");
    this.load.audio("asteroid", "assets/sounds/asteroid.mp3");
    this.load.audio("stageclear2", "assets/sounds/stageclear2.mp3");

    this.load.bitmapFont(
      "arcade",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );
    this.load.bitmapFont(
      "wendy",
      "assets/fonts/wendy.png",
      "assets/fonts/wendy.xml"
    );
    this.load.bitmapFont(
      "starshipped",
      "assets/fonts/starshipped.png",
      "assets/fonts/starshipped.xml"
    );
    this.load.spritesheet("shot", "assets/images/shot.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("shotfoe", "assets/images/shotfoe.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("energy", "assets/images/energy.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }
  
  createBars() {
    this.loadBar = this.add.graphics();
    this.loadBar.fillStyle(0xd40000, 1);
    this.loadBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }

  setLoadEvents() {
    this.load.on(
      "progress",
      (value: any) => {
        this.loadBar.clear();
        this.loadBar.fillStyle(0x00ff00, 1);
        this.loadBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    this.load.on(
      "complete",
      () => {
        this.scene.start("splash");
      },
      this
    );
  }


  create() {
    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainScene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
