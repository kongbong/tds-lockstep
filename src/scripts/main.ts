import 'phaser'
import GameScene from './scenes/gameScene'
import PreloadScene from './scenes/preloadScene'
import Splash from './scenes/splash'
import Transition from './scenes/transition'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, Splash, Transition, GameScene]
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
