import { Object3D, Vector3, Clock, Mesh, MathUtils } from 'three';
import { Dimensions } from './Interfaces';

export default class Graviton extends Mesh {
  public radius: number = 1;
  public gravity: number = 1;
  public debug: boolean = false;
  public attractor: Object3D;
  public static: boolean = false;
  public OnCollisionCallback: (object: Graviton) => void;

  private clock: Clock;
  private goalVelocity: Vector3 = new Vector3();
  private goalDirection: Vector3 = new Vector3();
  private currentVelocity: Vector3 = new Vector3();
  private relativeVelocity: Vector3 = new Vector3();
  private normal: Vector3 = new Vector3();
  private vec: Vector3 = new Vector3();
  private maxDistance: Vector3 = new Vector3(200, 200, 200);
  private zeroVec: Vector3 = new Vector3(0, 0, 0);

  constructor(element: Mesh) {
    super();
    this.geometry = element.geometry;
    this.material = element.material;
    this.position.set(element.position.x, element.position.y, element.position.z);
    this.clock = new Clock();
  }

  OnCollision(object: Graviton) {
    if (this.OnCollisionCallback) {
      this.OnCollisionCallback(object);
    }
  }

  handleBounds(xRange: number, yRange: number, zRange: number) {
    if ( this.position.x < - xRange + this.radius || this.position.x > xRange - this.radius ) {
      this.position.x = MathUtils.clamp( this.position.x, - xRange + this.radius, xRange - this.radius );
      this.currentVelocity.x = - this.currentVelocity.x;
      this.currentVelocity.x *= 0.9;
    }

    if ( this.position.y < -yRange + this.radius || this.position.y > yRange - this.radius ) {
      this.position.y = MathUtils.clamp( this.position.y, -yRange + this.radius, yRange - this.radius );
      this.currentVelocity.y = - this.currentVelocity.y;
      this.currentVelocity.y *= 0.9;
    }

    if ( this.position.z < - zRange + this.radius || this.position.z > zRange - this.radius ) {
      this.position.z = MathUtils.clamp( this.position.z, - zRange + this.radius, zRange - this.radius );
      this.currentVelocity.z = - this.currentVelocity.z;
      this.currentVelocity.z *= 0.9;
    }
  }

  handleCollision(object: Graviton) {
    if (object.id == this.id) return;

    let currentVelocity = this.zeroVec;
    let objectRadius = 1;
    if (object instanceof Graviton) {
      currentVelocity = object.currentVelocity;
      objectRadius = object.radius;
    }

    this.normal.copy( this.position ).sub( object.position );
    var distance = this.normal.length();

    if ( distance < (objectRadius + this.radius) ) {
      this.normal.multiplyScalar( 0.5 * (distance - ((this.radius + objectRadius))) );

      // push away from each other
      if (!this.static) this.position.sub( this.normal );
      if (!object.static) object.position.add( this.normal );

      this.normal.normalize();

      this.relativeVelocity.copy( this.currentVelocity ).sub( currentVelocity );

      this.normal = this.normal.multiplyScalar( this.relativeVelocity.dot( this.normal ) );

      this.currentVelocity.sub( this.normal );
      currentVelocity.add( this.normal );

      object.OnCollision(this);
      return;
    }
  }

  handleGravity(object: Mesh, delta: number) {
    if (object.id == this.id) return;

    // get direction
    this.goalDirection.subVectors(object.position, this.position).normalize();

    // get max distance
    this.vec.multiplyVectors(this.goalDirection, this.maxDistance);

    // get current distance
    this.goalVelocity.subVectors(object.position, this.position);

    // max - current = strength of gravity
    this.goalVelocity.subVectors(this.vec, this.goalVelocity);

    this.goalVelocity.clampLength(-50, 50)

    this.currentVelocity.add(
      this.goalVelocity.multiplyScalar(delta)
    );
  }

  update(objects: Graviton[], ranges: Dimensions, gravity: number, speedlimit: number) {
    let delta = this.clock.getDelta();

    if (delta > 1) return;

    this.handleBounds(ranges.x / 2, ranges.y / 2, ranges.z / 2);

    for (var i = 0; i < objects.length; i++) {
      this.handleCollision(objects[i]);
      this.handleGravity(objects[i], delta * gravity * objects[i].gravity);
    }

    if (!this.static) {
      this.position.add(
        this.vec.copy(this.currentVelocity.clampLength(-speedlimit, speedlimit)).multiplyScalar(delta * 0.1)
      );
    }
  }
}
