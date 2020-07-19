import { Mesh, MathUtils } from 'three';
import { Dimensions } from './Interfaces';

interface Pan {
  x: number;
  y: number;
}

export default class MouseFollower extends Mesh {
  private container: HTMLElement;

  private mouse: Pan;

  private touching = false;

  private always: boolean;

  constructor(container, element, always = false) {
    super();
    this.always = always;

    this.geometry = element.geometry;
    this.material = element.material;
    this.position.set(element.position.x, element.position.y, element.position.z);

    this.container = container;
    this.mouse = {x: 0, y: 0};

    this.setupListeners();
  }

  setupListeners() {
    this.OnMouseDown = this.OnMouseDown.bind(this);
    this.OnMouseMove = this.OnMouseMove.bind(this);
    this.OnTouchMove = this.OnTouchMove.bind(this);
    this.OnMouseUp = this.OnMouseUp.bind(this);
    this.container.addEventListener('mousedown', this.OnMouseDown);
    this.container.addEventListener('mousemove', this.OnMouseMove);
    this.container.addEventListener('mouseup', this.OnMouseUp);
    document.addEventListener('touchstart', this.OnMouseDown, false);
    document.addEventListener('touchmove', this.OnTouchMove, false);
    document.addEventListener('touchend', this.OnMouseUp, false);
  }

  OnMouseDown(e) {
    this.touching = true;
  }

  OnMouseUp(e) {
    this.touching = false;
  }

  OnMouseMove(e) {
    if (!this.touching && !this.always) return;
    this.mouse.x = (e.clientX / this.container.clientWidth) * 2 - 1;
    this.mouse.y = - (e.clientY / this.container.clientHeight) * 2 + 1;
  }

  OnTouchMove(event) {
    if (!this.touching && !this.always) return;
    this.mouse.x = (event.changedTouches[0].clientX / this.container.clientWidth ) * 2 - 1;
    this.mouse.y = - ( event.changedTouches[0].clientY / this.container.clientHeight ) * 2 + 1;
  }

  update(dimensions: Dimensions) {
    this.position.set(
      MathUtils.clamp(this.mouse.x * 1.5, -1, 1) * (dimensions.x / 2),
      MathUtils.clamp(this.mouse.y * 1.5, -1, 1) * (dimensions.y / 2),
      0,
    );
  }
}
