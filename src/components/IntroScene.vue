<template>
  <div class="three-container">
    <canvas class="three-canvas" ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  Scene, PerspectiveCamera, WebGLRenderer, MeshBasicMaterial,
  Mesh, DirectionalLight, Color, Clock, SphereBufferGeometry,
  BoxBufferGeometry,
  MeshToonMaterial,
  SpotLight,
  PointLight,
} from 'three';
import Graviton from './Graviton';
import MouseFollower from './MouseFollower';
import { Dimensions } from './Interfaces';

@Component
export default class IntroScene extends Vue {
  private container!: HTMLElement;

  private canvas!: HTMLCanvasElement;

  private scene!: Scene;

  private camera!: PerspectiveCamera;

  private renderer!: WebGLRenderer;

  private roomDimensions: Dimensions = { x: 60, y: 40, z: 20 };

  private gravitons: Graviton[] = [];

  private earth: MouseFollower;

  private directional: DirectionalLight = new DirectionalLight(new Color(0xffffff), 0.75);

  private spotLight: SpotLight = new SpotLight(new Color(0xffffff), 0.5, 100, 0.25);

  private timeElapsed = 0;

  private clock: Clock = new Clock();

  mounted() {
    this.setup();
    this.animate();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
  }

  setup() {
    this.canvas = this.$refs.canvas as HTMLCanvasElement;
    this.container = this.canvas.parentElement as HTMLElement;
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(75,
      this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);

    this.renderer = new WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

    this.createRoom(this.roomDimensions.x, this.roomDimensions.y, this.roomDimensions.z);

    this.createEarth(0);

    this.spotLight.position.set(
      0, 0, 20,
    );
    this.spotLight.target = this.earth;
    this.scene.add(this.spotLight);

    const pointLight = new PointLight(new Color(0xffffff), 1, 50);
    this.scene.add(pointLight);

    for (let i = 0; i < 10; i += 1) {
      this.spawnBall();
    }

    this.camera.position.z = 40;
    this.camera.position.y = 0;
  }

  createEarth(yPosition: number) {
    const geometry = new SphereBufferGeometry();
    const material = new MeshBasicMaterial({
      color: new Color(
        0, 0.2, 0.9,
      ),
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.y = yPosition;

    this.earth = new MouseFollower(this.container, mesh, true);

    this.scene.add(this.earth);
  }

  static createPlane(width, height, length, x, y, z) {
    const geometry = new BoxBufferGeometry(width, height, length);
    const material = new MeshToonMaterial({
      color: new Color(
        0.3, 0.6, 0.9,
      ),
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    return mesh;
  }

  createRoom(width: number, height: number, length: number) {
    const floor = IntroScene.createPlane(width, 0.1, length, 0, -height / 2, 0);
    const westWall = IntroScene.createPlane(0.1, height, length, -width / 2, 0, 0);
    const eastWall = IntroScene.createPlane(0.1, height, length, width / 2, 0, 0);
    const roof = IntroScene.createPlane(width, 0.1, length, 0, height / 2, 0);
    const backWall = IntroScene.createPlane(width, height, 0.1, 0, 0, -length / 2);
    this.scene.add(floor);
    this.scene.add(westWall);
    this.scene.add(eastWall);
    this.scene.add(roof);
    this.scene.add(backWall);
  }

  spawnBall() {
    const geometry = new SphereBufferGeometry();
    const material = new MeshToonMaterial({
      color: new Color(
        Math.random(), Math.random(), Math.random(),
      ),
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.x = Math.random() * this.roomDimensions.x - (this.roomDimensions.x / 2);
    mesh.position.y = Math.random() * this.roomDimensions.y - (this.roomDimensions.y / 2);
    mesh.position.z = Math.random() * -this.roomDimensions.z;

    const ball = new Graviton(mesh);
    this.scene.add(ball);

    this.gravitons.push(ball);
    return ball;
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.gravitons.forEach((el: Graviton) => {
      el.update(this.gravitons, [...this.gravitons, this.earth], this.roomDimensions);
    });

    this.earth.update(this.roomDimensions);

    this.renderer.render(this.scene, this.camera);

    // this.timeElapsed += this.clock.getDelta();
    // if (this.timeElapsed % 4 > 0 && this.timeElapsed % 4 < 0.1) console.log(this.gravitons);
  }

  onWindowResize() {
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }
}
</script>

<style scoped lang="scss">
.three-canvas {
  height: 100%;
  width: 100%;
}
</style>
