import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import type { Material } from 'three/src/materials/Material';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { GridHelper } from 'three/src/helpers/GridHelper';

import { Scene } from 'three/src/scenes/Scene';
import { Mesh } from 'three/src/objects/Mesh';
import CameraControls from '@/CameraControls';
import { Fog } from 'three/src/scenes/Fog';
import Viewport from '@/utils/Viewport';
import { Color } from '@/utils/Color';

interface GridMaterial extends Material {
  transparent: boolean,
  opacity: number
}

export default class MainScene
{
  private readonly renderer = new WebGLRenderer({ antialias: true, alpha: false });
  private readonly camera = new PerspectiveCamera(45, Viewport.size.ratio, 1, 500);

  private readonly onRender = this.render.bind(this);
  private readonly onResize = this.resize.bind(this);

  private readonly scene = new Scene();
  private controls: CameraControls;
  private raf: number;

  public constructor (root: HTMLElement) {
    this.updateScene();
    this.updateCamera();

    this.createLights();
    this.createGround();

    const scene = this.updateRenderer(root);
    this.controls = new CameraControls(this.camera, scene);

    this.raf = requestAnimationFrame(this.onRender);
    Viewport.addResizeCallback(this.onResize);
  }

  private updateScene (): void {
    this.scene.background = Color.getClass(Color.LIGHT);
    this.scene.fog = new Fog(Color.LIGHT, 50, 250);
  }

  private updateCamera (): void {
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(0, 0, 0);
  }

  private createLights (): void {
    const directional = new DirectionalLight(Color.WHITE, 1);
    const ambient = new AmbientLight(Color.WHITE);

    directional.position.set(-5, 10, 15);
    directional.castShadow = true;

    directional.shadow.camera.bottom = -25;
    directional.shadow.camera.right = 25;
    directional.shadow.camera.left = -25;
    directional.shadow.camera.top = 15;

    directional.shadow.mapSize.x = 1024;
    directional.shadow.mapSize.y = 1024;

    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 50;

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  private createGround (): void {
    const ground = new Mesh(
      new BoxGeometry(500, 500, 1),
      new MeshPhongMaterial({
        color: Color.LIGHT,
        depthWrite: false
      })
    );

    ground.rotateX(-Math.PI / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new GridHelper(500, 50, 0, 0);
    (grid.material as GridMaterial).transparent = true;
    (grid.material as GridMaterial).opacity = 0.25;
    this.scene.add(grid);
  }

  private updateRenderer (root: HTMLElement): HTMLCanvasElement {
    const { width, height } = Viewport.size;
    const pixelRatio = window.devicePixelRatio;

    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setPixelRatio(pixelRatio || 1.0);
    this.renderer.outputEncoding = sRGBEncoding;

    root.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x222222, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(width, height);

    return this.renderer.domElement;
  }

  private render (): void {
    this.raf = requestAnimationFrame(this.onRender);
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }

  private resize (): void {
    const { width, height, ratio } = Viewport.size;
    this.renderer.setSize(width, height);

    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();
  }

  public destroy (): void {
    this.renderer.domElement.parentNode?.removeChild(this.renderer.domElement);
    Viewport.removeResizeCallback(this.onResize);
    cancelAnimationFrame(this.raf);

    this.controls.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
}
