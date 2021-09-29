import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import type { Group } from 'three/src/objects/Group';
import { CustomEvents } from '@/utils/CustomEvents';
import type { Mesh } from 'three/src/objects/Mesh';
import { Assets } from '@/utils/AssetsLoader';

export default class BaseShip
{
  protected async loadModel (model: string, texture: string): Promise<Group> {
    const ship = await (await Assets.Loader.loadGLTF(model)).scene;
    const map = await Assets.Loader.loadTexture(texture);

    ship.traverse(child => {
      const childMesh = child as Mesh;

      if (childMesh.isMesh) {
        childMesh.material = new MeshPhongMaterial({ map });
        childMesh.castShadow = true;
      }
    });

    CustomEvents.dispatch('Add:GameObject', ship);
    ship.scale.setScalar(0.25);
    return ship;
  }
}
