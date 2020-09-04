import { Mesh, MathUtils, Quaternion, Camera, Vector3 } from 'three';
import { Dimensions } from './Interfaces';

interface Directional {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface Pan {
  x: number;
  y: number;
}

export default class KeyFollower extends Mesh {
  private container: HTMLElement;
  private pressed: Directional = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  private mouse: Pan = {
    x: 0,
    y: 0
  };
  private initialClick: Pan = {
    x: 0,
    y: 0
  };
  private touching: boolean = false;
  private mathVector: Vector3 = new Vector3();

  constructor(container, element) {
    super();

    this.geometry = element.geometry;
    this.material = element.material;
    this.position.set(element.position.x, element.position.y, element.position.z);

    this.container = container;

    this.setupListeners();
  }

  setupListeners() {
    this.OnKeyUp = this.OnKeyUp.bind(this);
    this.OnKeyDown = this.OnKeyDown.bind(this);

    window.addEventListener('keydown', this.OnKeyDown);
    window.addEventListener('keyup', this.OnKeyUp);


    this.OnMouseDown = this.OnMouseDown.bind(this);
    this.OnMouseMove = this.OnMouseMove.bind(this);
    this.OnTouchStart = this.OnTouchStart.bind(this);
    this.OnTouchMove = this.OnTouchMove.bind(this);
    this.OnMouseUp = this.OnMouseUp.bind(this);
    this.container.addEventListener('mousedown', this.OnMouseDown);
    this.container.addEventListener('mousemove', this.OnMouseMove);
    this.container.addEventListener('mouseup', this.OnMouseUp);
    document.addEventListener('touchstart', this.OnTouchStart, false);
    document.addEventListener('touchmove', this.OnTouchMove, false);
    document.addEventListener('touchend', this.OnMouseUp, false);
  }

  OnMouseDown(e) {
    // this.touching = true;
    this.initialClick.x = (e.clientX / this.container.clientWidth) * 2 - 1;
    this.initialClick.y = - (e.clientY / this.container.clientHeight) * 2 + 1;
  }

  OnTouchStart(e) {
    this.touching = true;
    this.initialClick.x = (e.changedTouches[0].clientX / this.container.clientWidth) * 2 - 1;
    this.initialClick.y = - (e.changedTouches[0].clientY / this.container.clientHeight) * 2 + 1;
    this.mouse.x = (e.changedTouches[0].clientX / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - (e.changedTouches[0].clientY / this.container.clientHeight) * 2 + 1;
  }

  OnMouseUp(e) {
    this.touching = false;
    this.initialClick.x = 0;
    this.initialClick.y = 0;
  }

  OnMouseMove(e) {
    this.mouse.x = (e.clientX / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - (e.clientY / this.container.clientHeight) * 2 + 1;

    this.mouse.x = this.mouse.x - this.initialClick.x;
    this.mouse.y = this.mouse.y - this.initialClick.y;
  }

  OnTouchMove(e) {
    this.mouse.x = (e.changedTouches[0].clientX / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - (e.changedTouches[0].clientY / this.container.clientHeight) * 2 + 1;

    this.mouse.x = this.mouse.x - this.initialClick.x;
    this.mouse.y = this.mouse.y - this.initialClick.y;
  }

  handleKey(key: String, pressing: boolean) {
    switch (key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
      case "s":
        this.pressed.down = pressing;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
      case "w":
        this.pressed.up = pressing;
        break;
      case "Left": // IE/Edge specific value
      case "ArrowLeft":
      case "a":
        this.pressed.left = pressing;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
      case "d":
        this.pressed.right = pressing;
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
  }

  OnKeyDown(e) {
    console.log(e.key, true);
    this.handleKey(e.key, true);
  }

  OnKeyUp(e) {
    this.handleKey(e.key, false);
  }

  update(camera: Camera) {
    var speed = 0.5;
    let xDirection = this.pressed.left ? - speed : 0;
    xDirection = this.pressed.right ? xDirection + speed : xDirection;

    let yDirection = this.pressed.down ? - speed : 0;
    yDirection = this.pressed.up ? yDirection + speed : yDirection;

    let xDirectionTouch = this.touching ? this.mouse.x * speed : 0;
    let yDirectionTouch = this.touching ? this.mouse.y * speed : 0;
    // this.rotateX(this.mouse.x * 0.1);
    // this.rotateY(this.mouse.y * 0.1);

    if (this.touching) {
      this.translateX(xDirectionTouch);
      this.translateY(yDirectionTouch);
    }

    this.translateX(xDirection);
    this.translateY(yDirection);

    // camera.position.copy(
    //   this.mathVector.set( 0, 0, 1 ).applyQuaternion( this.quaternion ).multiplyScalar(20)
    // );
    // camera.lookAt(this.position);
    // this.position.add(this.mathVector.set(1, 0, 0).multiplyScalar(xDirection));

    // this.position.add(this.mathVector.set(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(xDirection));
    // this.position.add(this.mathVector.set(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(yDirection));
  }
}
