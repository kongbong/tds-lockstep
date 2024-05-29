import 'phaser'
import GameScene from './scenes/gameScene'
import PreloadScene from './scenes/preloadScene'
import Splash from './scenes/splash'
import Transition from './scenes/transition'
import EndGameScene from './scenes/endGame'
import MainMenuScene from './scenes/mainmenu'

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
  scene: [PreloadScene, Splash, MainMenuScene, Transition, GameScene, EndGameScene]
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
