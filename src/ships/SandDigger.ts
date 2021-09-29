import type { Group } from 'three/src/objects/Group';
import BaseShip from '@/ships/BaseShip';
import { PI } from '@/utils/Number';
import anime from 'animejs';

export default class SandDigger extends BaseShip
{
  private ship!: Group;

  private readonly map = 'LRX.png';
  private readonly model = 'sandDigger.gltf';

  public constructor () {
    super();
    this.create();
  }

  private async create (): Promise<void> {
    this.ship = await super.loadModel(this.model, this.map);

    this.ship.position.set(-25.0, -2.0, 100.0);
    this.ship.rotation.y = -PI.d6;
    this.arrive();
  }

  private arrive (): void {
    anime({
      targets: this.ship.position,
      easing: 'easeOutQuad',
      duration: 3000,
      x: 25,
      y: -2,
      z: 25
    });

    anime({
      targets: this.ship.rotation,
      easing: 'easeInOutQuad',
      duration: 1500,
      delay: 1500,
      y: -PI.d4
    });
  }
}
