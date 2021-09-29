import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { CircleGeometry } from 'three/src/geometries/CircleGeometry';

import type { Group } from 'three/src/objects/Group';
import { CustomEvents } from '@/utils/CustomEvents';

import { Assets } from '@/utils/AssetsLoader';
import { Mesh } from 'three/src/objects/Mesh';

import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';
import anime from 'animejs';

export default class Island
{
  private readonly radius = 2.5;
  private readonly start = -PI.d6;
  private readonly segments = 32.0;

  private readonly model = 'island.gltf';

  private land!: Group;

  private readonly base = new Mesh(
    new CircleGeometry(this.radius, this.segments, this.start, 0),
    new MeshBasicMaterial({ color: Color.SAND })
  );

  public constructor () {
    this.base.rotation.z = 0.25;
    this.base.rotation.x = -PI.d2;
    this.base.scale.setScalar(0.0);
    this.base.position.set(0, -1, 0);
    CustomEvents.dispatch('Add:GameObject', this.base);

    this.createBase();
    this.loadModel();
  }

  private createBase (): void {
    anime({
      update: ({ animations }) => {
        const theta = +animations[0].currentValue / this.radius * PI.m2;

        this.base.geometry.dispose();
        this.base.geometry = new CircleGeometry(
          this.radius, this.segments, this.start, theta
        );
      },

      targets: this.base.scale,
      easing: 'linear',
      duration: 1000,
      x: this.radius,
      y: this.radius,
      z: this.radius
    });
  }

  private async loadModel (): Promise<void> {
    this.land = await (await Assets.Loader.loadGLTF(this.model)).scene;
    const map = await Assets.Loader.loadTexture('texture.png');

    this.land.scale.setScalar(0.0);

    this.land.traverse(child => {
      const childMesh = child as Mesh;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;
        childMesh.material = new MeshLambertMaterial({
          color: Color.SAND,
          map
        });
      }
    });

    CustomEvents.dispatch('Add:GameObject', this.land);

    anime({
      targets: this.land.position,
      easing: 'linear',
      duration: 1000,
      y: -2.5
    });

    anime({
      targets: this.land.scale,
      easing: 'linear',
      duration: 1000,
      x: this.radius / 20,
      y: this.radius / 20,
      z: this.radius / 20
    });
  }
}
