export default class Transition extends Phaser.Scene {
    next: string;
    data: any;
    constructor() {
        super({ key: "transition" });
    }

    init(data: any) {
        this.next = data.next;
        this.data = data.data;
    }

    create() {
        const messages = "Fire at will";

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
            messages,
            100
        )
        .setOrigin(0.5);
        this.add
        .bitmapText(
            center_width,
            center_height + 50,
            "wendy",
            "Ready player 1",
            80
        )
        .setOrigin(0.5);

        this.playMusic("muzik1");
        this.time.delayedCall(2000, () => this.loadNext(), undefined, this);
    }

    loadNext() {
        this.scene.start(this.next, this.data);
    }

    playMusic(name = "muzik1") {
        const theme = this.sound.add(name);
        theme.play({
            mute: false,
            volume: 0.4,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0,
        });
    }
}