import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { PCFSoftShadowMap, sRGBEncoding } from 'three/src/constants';

import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AmbientLight } from 'three/src/lights/AmbientLight';
import { Event, CustomEvents } from '@/utils/CustomEvents';

import type { Group } from 'three/src/objects/Group';
import SandDeliveler from '@/ships/SandDeliveler';
import { Scene } from 'three/src/scenes/Scene';
import { Mesh } from 'three/src/objects/Mesh';

import CameraControls from '@/CameraControls';
import SandDigger from '@/ships/SandDigger';
import { Fog } from 'three/src/scenes/Fog';
import Viewport from '@/utils/Viewport';

import { Color } from '@/utils/Color';
import { PI } from '@/utils/Number';
import Island from '@/Island';

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
    new SandDeliveler();
    new SandDigger();
    new Island();

    this.createSea();
    this.createLights();

    this.updateEnvironment();
    this.addEventListeners();

    const scene = this.updateRenderer(root);
    this.raf = requestAnimationFrame(this.onRender);
    this.controls = new CameraControls(this.camera, scene);
  }

  private updateEnvironment (): void {
    this.scene.background = Color.getClass(Color.SKY);
    this.scene.fog = new Fog(Color.SKY, 100, 300);

    this.camera.position.set(0, 50, -75);
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

  private createSea (): void {
    const seabed = new Mesh(
      new PlaneGeometry(750, 750),
      new MeshBasicMaterial({
        color: Color.SEABED
      })
    );

    const sea = new Mesh(
      new PlaneGeometry(500, 500),
      new MeshBasicMaterial({
        transparent: true,
        color: Color.SEA,
        opacity: 0.75
      })
    );

    sea.receiveShadow = true;
    seabed.position.y = -5.0;
    seabed.rotateX(-PI.d2);
    sea.rotateX(-PI.d2);

    this.scene.add(seabed);
    this.scene.add(sea);
  }

  private addEventListeners (): void {
    Viewport.addResizeCallback(this.onResize);
    CustomEvents.add('Add:GameObject', this.addGameObject.bind(this));
    CustomEvents.add('Remove:GameObject', this.removeGameObject.bind(this));
  }

  private addGameObject (event: Event): void {
    this.scene.add(event.data as Group);
  }

  private removeGameObject (event: Event): void {
    this.scene.remove(event.data as Group);
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

    CustomEvents.dispose();
    this.scene.clear();
  }
}
