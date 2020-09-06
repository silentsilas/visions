<template>
  <div class="three-container">
    <canvas class="three-canvas" ref="canvas"></canvas>
    <div class="controls">
      <a href="#" class="button" @click.prevent="hidingControls = !hidingControls">
        {{ hidingControls ? "Show Controls" : "Hide Controls" }}
      </a>
      <div v-show="!hidingControls">
        <p>Universal Speed Limit: {{ speedlimit }}</p>
        <input class="slider" type="range" min="20" max="1000" step="1" v-model="speedlimit" />
        <p>Their gravity: {{ universalGravity }}</p>
        <input class="slider" type="range" min="0" max="3" step="0.1" v-model="universalGravity" />
        <p>Your gravity: {{ (3 * sunGravity).toFixed(1) }}</p>
        <input class="slider" type="range" min="0" max="10" step="0.1" style="margin-bottom: 20px"
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
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Graviton from './Graviton';

@Component
export default class IntroScene extends Vue {
  private container!: HTMLElement;

  private canvas!: HTMLCanvasElement;

  private scene!: Scene;

  private camera!: PerspectiveCamera;

  private renderer!: WebGLRenderer;

  private gravitons: Graviton[] = [];

  private sun: Graviton;

  private controls: OrbitControls;

  private composer: EffectComposer;

  private renderScene: RenderPass;

  private bloomPass: UnrealBloomPass;

  private exposure = 1;

  private bloomStrength = 1.5;

  private bloomRadius = 0.1;

  public sunGravity = 1;

  public universalGravity = 1;

  public speedlimit = 300;

  private skybox: Mesh<SphereBufferGeometry>;

  private skyCounter = 0;

  private timeElapsed = 0;

  private clock: Clock = new Clock();

  private hidingControls = true;

  mounted() {
    this.setup();
    this.animate();
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, false);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
  }

  updateExposure(event) {
    this.exposure = Number(event.target.value);
    this.renderer.toneMappingExposure = this.exposure ** 4.0;
  }

  updateStrength(event) {
    this.bloomStrength = Number(event.target.value);
    this.bloomPass.strength = this.bloomStrength;
  }

  updateRadius(event) {
    this.bloomRadius = Number(event.target.value);
    this.bloomPass.radius = this.bloomRadius;
  }

  updateSunGravity(event) {
    this.sun.gravity = Number(event.target.value) * 3;
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

    this.createSun(0);

    this.addOrbitControls();

    this.createSkybox();

    for (let i = 0; i < 8; i += 1) {
      this.spawnPlanet();
    }

    this.addComposer();
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

    const pointLight = new PointLight(new Color(0xffffff), 1, 300);
    this.scene.add(pointLight);
    pointLight.parent = this.sun;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.sun.OnCollisionCallback = (object: Graviton) => {
      // TODO: Implement collision sounds
    };

    this.scene.add(this.sun);
    this.gravitons.push(this.sun);
  }

  addOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = this.sun.position;
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

    this.composer.render();
    this.controls.update();

    const skyMaterial = (this.skybox.material as MeshPhongMaterial);
    skyMaterial.color.setRGB(
      (1 + Math.sin(skyMaterial.color.r + this.skyCounter)) / 2,
      (1 + Math.cos(skyMaterial.color.g + this.skyCounter)) / 2,
      (1 + Math.sin(skyMaterial.color.b + (this.skyCounter - 1))) / 2,
    );
    this.skyCounter += 0.01;
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
  position: absolute;
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

a.button{
  display:inline-block;
  padding:0.35em 1.2em;
  border:0.1em solid #FFFFFF;
  margin:0 0.3em 0.3em 0;
  border-radius:0.12em;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Roboto',sans-serif;
  font-weight:300;
  color:#FFFFFF;
  text-align:center;
  transition: all 0.2s;
}
a.button:hover{
  color:#000000;
  background-color:#FFFFFF;
}
@media all and (max-width:30em){
  a.button{
    display:block;
    margin:0.4em auto;
  }
  .controls {
    width: 100%;
    padding: 0px;
  }
}
</style>
