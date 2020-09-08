<template>
  <div class="three-container">
    <canvas class="three-canvas" ref="canvas"></canvas>
    <div class="controls-container">
      <a href="#" class="button" @click.prevent="hidingControls = !hidingControls">
        {{ hidingControls ? "Show Controls" : "Hide Controls" }}
      </a>
      <div v-if="!hidingControls" class="controls">
        <p>Universal Speed Limit: {{ speedlimit }}</p>
        <input class="slider" type="range" min="500" max="1000" step="1" v-model="speedlimit" />
        <p>Universal gravity: {{ universalGravity }}</p>
        <input class="slider" type="range"
          min="0.1" max="5" step="0.1" v-model="universalGravity" />
        <p>Sun gravity multiplier: {{ (2 * sunGravity).toFixed(1) }}</p>
        <input class="slider" type="range" min="0" max="5" step="0.1" style="margin-bottom: 20px"
          v-model="sunGravity" v-on:input="updateSunGravity" />
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  Mesh, Color, Clock, SphereBufferGeometry,
  PointLight,
  DoubleSide,
  MeshPhongMaterial,
  ReinhardToneMapping,
  Vector2,
  MeshBasicMaterial,
  AudioListener,
  PositionalAudio,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventBus } from '@/utils/EventBus';
import Graviton from './Graviton';

// Define the props by using Vue's canonical way.
const TrippingProps = Vue.extend({
  props: {
    begun: Boolean,
    bg: AudioBuffer,
    sounds: Array,
  },
});

@Component
export default class Tripping extends TrippingProps {
  public sunGravity = 2;

  public universalGravity = 2;

  public speedlimit = 600;

  private container!: HTMLElement;

  private canvas!: HTMLCanvasElement;

  private scene!: Scene;

  private camera!: PerspectiveCamera;

  private renderer!: WebGLRenderer;

  private listener: AudioListener;

  private bgAudio: PositionalAudio;

  private gravitons: Graviton[] = [];

  private sun: Graviton;

  private controls: OrbitControls;

  private composer: EffectComposer;

  private renderScene: RenderPass;

  private bloomPass: UnrealBloomPass;

  private exposure = 1;

  private bloomStrength = 1.5;

  private bloomRadius = 0.1;

  private skybox: Mesh<SphereBufferGeometry>;

  private skyCounter = 0;

  private timeElapsed = 0;

  private clock: Clock = new Clock();

  private hidingControls = true;

  mounted() {
    this.setup();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
  }

  updateSunGravity(event) {
    this.sun.gravity = Number(event.target.value) * 2;
  }

  setup() {
    this.canvas = this.$refs.canvas as HTMLCanvasElement;
    this.container = this.canvas.parentElement as HTMLElement;
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(75,
      this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
    this.camera.position.z = 30;
    this.camera.position.y = 0;

    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.toneMapping = ReinhardToneMapping;

    this.listener = new AudioListener();
    this.camera.add(this.listener);

    this.createSkybox();

    this.addComposer();

    this.createSun(0);

    this.addOrbitControls();
    for (let i = 0; i < 9; i += 1) {
      this.spawnPlanet();
    }

    this.renderUpdate();

    EventBus.$on('loaded', () => {
      this.bgAudio.setBuffer(this.bg);
      this.bgAudio.setRefDistance(20);
      this.bgAudio.loop = true;
      this.OnClick = this.OnClick.bind(this);
      window.addEventListener('touchstart', this.OnClick);
      document.addEventListener('click', this.OnClick);
    });
  }

  OnClick() {
    EventBus.$emit('clicked', true);
    window.removeEventListener('touchstart', this.OnClick);
    document.removeEventListener('click', this.OnClick);
    this.begin();
  }

  begin() {
    this.bgAudio.play();
    this.gravitons.forEach((object) => {
      object.setupSfx(this.listener, this.sounds);
    });
    this.animate();
  }

  addComposer() {
    const params = {
      exposure: this.exposure,
      bloomStrength: this.bloomStrength,
      bloomThreshold: 0,
      bloomRadius: this.bloomRadius,
    };

    this.renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth / 2, window.innerHeight / 2), 1.5, 0.4, 0.85,
    );
    this.bloomPass.threshold = params.bloomThreshold;
    this.bloomPass.strength = params.bloomStrength;
    this.bloomPass.radius = params.bloomRadius;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);
  }

  createSkybox() {
    const geometry = new SphereBufferGeometry(200);
    const material = new MeshPhongMaterial({
      color: new Color(
        0.3, 0.3, 0.5,
      ),
      opacity: 0.5,
      transparent: true,
      side: DoubleSide,
    });
    this.skybox = new Mesh(geometry, material);
    this.skybox.position.set(0, 0, 0);
    this.scene.add(this.skybox);
  }

  createSun(yPosition: number) {
    const geometry = new SphereBufferGeometry(1);
    const material = new MeshBasicMaterial({
      color: new Color(
        0.8, 0.8, 0,
      ),
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.y = yPosition;

    this.sun = new Graviton(mesh);
    this.sun.radius = 1;
    this.sun.gravity = this.sunGravity * 3;
    this.sun.static = true;

    // create the PositionalAudio object (passing in the listener)
    this.bgAudio = new PositionalAudio(this.listener);

    const pointLight = new PointLight(new Color(0xffffff), 1, 300);
    this.scene.add(pointLight);
    pointLight.parent = this.sun;

    this.scene.add(this.sun);
    this.sun.add(this.bgAudio);
    this.gravitons.push(this.sun);
  }

  addOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = this.sun.position;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 175;
    this.controls.autoRotate = true;
    this.controls.update();
  }

  spawnPlanet() {
    const scale = Math.random() + 0.1;
    const geometry = new SphereBufferGeometry(scale);
    const material = new MeshPhongMaterial({
      color: new Color(
        Math.random(), Math.random(), Math.random(),
      ),
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.x = Math.random() * 100 - (100 / 2);
    mesh.position.y = Math.random() * 100 - (100 / 2);
    mesh.position.z = Math.random() * 100 - (100 / 2);

    const ball = new Graviton(mesh);
    ball.radius = scale;
    this.scene.add(ball);

    this.gravitons.push(ball);
    return ball;
  }

  animate() {
    requestAnimationFrame(this.animate);

    this.gravitons.forEach((el: Graviton) => {
      el.update(this.gravitons, this.universalGravity, this.speedlimit);
    });

    this.controls.update();
    this.renderUpdate();
  }

  renderUpdate() {
    const skyMaterial = (this.skybox.material as MeshPhongMaterial);
    skyMaterial.color.setRGB(
      (1 + Math.sin(skyMaterial.color.r + this.skyCounter)) / 2,
      (1 + Math.cos(skyMaterial.color.g + this.skyCounter)) / 2,
      (1 + Math.sin(skyMaterial.color.b + (this.skyCounter - 1))) / 2,
    );
    this.skyCounter += 0.01;

    this.composer.render();
  }

  onWindowResize() {
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.composer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }
}
</script>

<style scoped lang="scss">
.three-canvas {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.controls {
  max-width: 250px;
  margin: 0 auto;
}

.controls-container {
  position: fixed;
  right: 0px;
  top: 0px;
  width: 250px;
  color: #efefef;
  background-color: rgba(0.3, 0.3, 0.3, 0.3);
  padding: 20px;
}

input[type=range].slider {
  width: 100%;
  margin: 0.7px 0;
  background-color: transparent;
  -webkit-appearance: none;
}
input[type=range].slider:focus {
  outline: none;
}
input[type=range].slider::-webkit-slider-runnable-track {
  background: #484d4d;
  border: 0;
  width: 100%;
  height: 25.6px;
  cursor: pointer;
}
input[type=range].slider::-webkit-slider-thumb {
  margin-top: -0.7px;
  width: 18px;
  height: 27px;
  background: rgba(255, 67, 95, 0.93);
  border: 0;
  cursor: pointer;
  -webkit-appearance: none;
}
input[type=range].slider:focus::-webkit-slider-runnable-track {
  background: #545a5a;
}
input[type=range].slider::-moz-range-track {
  background: #484d4d;
  border: 0;
  width: 100%;
  height: 25.6px;
  cursor: pointer;
}
input[type=range].slider::-moz-range-thumb {
  width: 18px;
  height: 27px;
  background: rgba(255, 67, 95, 0.93);
  border: 0;
  cursor: pointer;
}
input[type=range].slider::-ms-track {
  background: transparent;
  border-color: transparent;
  border-width: 0.7px 0;
  color: transparent;
  width: 100%;
  height: 25.6px;
  cursor: pointer;
}
input[type=range].slider::-ms-fill-lower {
  background: #3c4040;
  border: 0;
}
input[type=range].slider::-ms-fill-upper {
  background: #484d4d;
  border: 0;
}
input[type=range].slider::-ms-thumb {
  width: 18px;
  height: 27px;
  background: rgba(255, 67, 95, 0.93);
  border: 0;
  cursor: pointer;
  margin-top: 0px;
  /*Needed to keep the Edge thumb centred*/
}
input[type=range].slider:focus::-ms-fill-lower {
  background: #484d4d;
}
input[type=range].slider:focus::-ms-fill-upper {
  background: #545a5a;
}
/*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
how to remove the virtical space around the range input in IE*/
@supports (-ms-ime-align:auto) {
  /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
  input[type=range].slider {
    margin: 0;
    /*Edge starts the margin from the thumb, not the track as other browsers do*/
  }
}

@media all and (max-width:30em){
  .controls-container {
    width: 100%;
    padding: 0px;
  }
}
</style>
