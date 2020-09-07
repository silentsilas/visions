import { Object3D, Vector3, Clock, Mesh, AudioListener, PositionalAudio, AudioLoader } from 'three';
import * as Tone from 'tone';

interface AudioBufferNodeSourceShim extends OscillatorNode {
  buffer: any;
  loop: any;
  loopEnd: any;
  loopStart: any;
  playbackRate: any;
}

export default class Graviton extends Mesh {
  public radius: number = 1;
  public gravity: number = 1;
  public debug: boolean = false;
  public attractor: Object3D;
  public static: boolean = false;
  public OnCollisionCallback: (object: Graviton) => void;
  public oscillator: AudioBufferNodeSourceShim;
  public sfxs: PositionalAudio[] = [];

  private clock: Clock;
  private goalVelocity: Vector3 = new Vector3();
  private goalDirection: Vector3 = new Vector3();
  private currentVelocity: Vector3 = new Vector3();
  private relativeVelocity: Vector3 = new Vector3();
  private normal: Vector3 = new Vector3();
  private vec: Vector3 = new Vector3();
  private maxDistance: Vector3 = new Vector3(200, 200, 200);


  constructor(element: Mesh) {
    super();
    this.geometry = element.geometry;
    this.material = element.material;
    this.position.set(element.position.x, element.position.y, element.position.z);
    this.clock = new Clock();
  }

  setupSfx(listener: AudioListener, sounds: any[]) {
    sounds.forEach((audioBuffer) => {
      const sfxAudio = new PositionalAudio(listener);
      sfxAudio.setBuffer(audioBuffer);
      sfxAudio.setRefDistance(20);
      this.sfxs.push(sfxAudio);
      this.add(sfxAudio);
    });
  }

  OnCollision(object: Graviton) {
    if (object.sfxs.length > 0) {
      const sfx = object.sfxs[Math.floor(Math.random() * object.sfxs.length)];
      const volume = Math.min(object.currentVelocity.length(), 500) / 500;
      if (!sfx.isPlaying) {
        sfx.setVolume(volume / 2);
        sfx.play();
      }
    }
  }

  handleCollision(object: Graviton) {
    if (object.id == this.id) return;

    this.normal.copy( this.position ).sub( object.position );
    var distance = this.normal.length();

    if ( distance < (object.radius + this.radius) ) {
      this.normal.multiplyScalar( 0.5 * (distance - ((this.radius + object.radius))) );

      // push away from each other
      if (!this.static) this.position.sub( this.normal );
      if (!object.static) object.position.add( this.normal );

      this.normal.normalize();

      this.relativeVelocity.copy( this.currentVelocity ).sub( object.currentVelocity );

      this.normal = this.normal.multiplyScalar( this.relativeVelocity.dot( this.normal ) );

      this.currentVelocity.sub( this.normal );
      object.currentVelocity.add( this.normal );

      object.OnCollision(this);
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

  update(objects: Graviton[], gravity: number, speedlimit: number) {
    let delta = this.clock.getDelta();

    if (delta > 1) return;

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
