import SimulationProjectile from '../simulation/simulationProjectile';
import { DrawDepth } from './drawDepth';

export default class Projectile extends Phaser.GameObjects.Sprite {  
  simulationProjectile: SimulationProjectile;
  
  create() {    
    this.depth = DrawDepth.PROJECTILE;
  }

  update() {
    this.x = this.simulationProjectile.x;
    this.y = this.simulationProjectile.y;
    this.angle = this.simulationProjectile.angle;
  }
}