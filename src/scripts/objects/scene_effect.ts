export default class SceneEffect {
    scene: Phaser.Scene;
    width: number;
    height: number;

    constructor(scene) {
        this.scene = scene;
        this.width = +this.scene.game.config.width;
        this.height = +this.scene.game.config.height;
    }

  /*
   This adds a rectangle to the scene, and then we tween it to make it move from the left to the right.
    */
    simpleClose(callback) {
        const rectangleWidth = this.width / 2;
        const rectangle1 = this.scene.add
        .rectangle(
            0 - rectangleWidth,
            0,
            this.width,
            this.height,
            0x000000
        )
        .setOrigin(0.5, 0);

        this.scene.tweens.add({
            targets: rectangle1,
            duration: 500,
            x: {from: -rectangleWidth / 2, to: rectangleWidth },
            onComplete: () => {
                callback();
            },            
        });
    }

  /*
    This adds a rectangle to the scene, and then we tween it to make it move from the right to the left.
    */
    simpleOpen(callback) {
        const rectangleWidth = this.width / 2;
        const rectangle1 = this.scene.add
        .rectangle(
            rectangleWidth,
            0,
            this.width,
            this.height,
            0x000000
        )
        .setOrigin(0.5, 0);

        this.scene.tweens.add({
            targets: rectangle1,
            duration: 500,
            x: {from: rectangleWidth, to: -rectangleWidth },
            onComplete: () => {
                callback();
            },            
        });
    }
    
    /*
    This adds two rectangles to the scene, and then we tween them to make them move from the center to the left and right.
    */
    close(callback) {
        const rectangleWidth = this.width / 2;
        const rectangle1 = this.scene.add
        .rectangle(
            0 - rectangleWidth / 2,
            0,
            this.width / 2,
            this.height,
            0x000000
        )
        .setOrigin(0.5, 0);

        const rectangle2 = this.scene.add
        .rectangle(
            this.width,
            0,
            this.width / 2,
            this.height,
            0x000000
        )
        .setOrigin(0, 0);

        this.scene.tweens.add([
            {
                targets: rectangle1,
                duration: 1000,
                x: {from: -rectangleWidth / 2, to: rectangleWidth / 2 },
            },
            {
                targets: rectangle2,
                duration: 1000,
                x: {from: this.width, to: rectangleWidth },
                onComplete: () => {
                    callback();
                },            
            }]);
    }
}