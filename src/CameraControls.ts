import type { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class CameraControls extends OrbitControls
{
  public constructor (camera: PerspectiveCamera, scene: HTMLElement) {
    super(camera, scene);
    this.target.set(0.0, 0.0, 0.0);
  }

  public override update (): boolean {
    return super.update();
  }

  public override dispose (): void {
    super.dispose();
  }
}
