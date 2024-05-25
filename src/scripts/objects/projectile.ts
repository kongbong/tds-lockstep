import SimulationProjectile from '../simulation/simulationProjectile';
export default class Projectile extends Phaser.GameObjects.Sprite {  
  simulationProjectile: SimulationProjectile;

  update() {
    this.x = this.simulationProjectile.x;
    this.y = this.simulationProjectile.y;
    this.angle = this.simulationProjectile.angle;
  }
}