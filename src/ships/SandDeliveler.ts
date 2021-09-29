import type { Group } from 'three/src/objects/Group';
import BaseShip from '@/ships/BaseShip';
import { PI } from '@/utils/Number';
import anime from 'animejs';

export default class SandDeliveler extends BaseShip
{
  private ship!: Group;

  private readonly map = 'texture.png';
  private readonly model = 'sandDeliveler.gltf';

  public constructor () {
    super();
    this.create();
  }

  private async create (): Promise<void> {
    this.ship = await super.loadModel(this.model, this.map);
    this.ship.position.set(-35.0, -0.65, -35.0);

    this.ship.rotation.x = 0.045;
    this.ship.rotation.y = PI.d6;

    this.getSand();
  }

  private getSand (): void {
    anime({
      targets: this.ship.position,
      easing: 'easeOutQuad',
      duration: 5000,
      delay: 1000,
      x: 26.5,
      z: 18
    });

    anime({
      targets: this.ship.rotation,
      easing: 'easeInOutQuad',
      y: Math.PI / 1.3,
      duration: 2500,
      delay: 3500
    });
  }
}
