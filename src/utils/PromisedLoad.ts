import { TextureLoader, ObjectLoader, FontLoader, AudioLoader } from 'three';

// gonna let this class load in all our stuffz and promisify it all
export default class {

  static GenericLoader(loader, url, callback) {
    return new Promise((resolve, reject) => {
      loader.load(url, (object) => {
        if (callback) {
          callback(object, resolve);
        } else {
          resolve(object);
        }
      }, (progress) => {
        console.log(progress);
      }, (error) => {
        console.log(error.target);
        reject(error);
      });
    });
  }

  static GetTexture(url, callback) {
    let texLoader = new TextureLoader();
    return this.GenericLoader(texLoader, url, callback);
  }

  static GetObject(url, callback) {
    let jsonLoader = new ObjectLoader();
    return this.GenericLoader(jsonLoader, url, callback);
  }

  static GetFont(url, callback) {
    let fontLoader = new FontLoader();
    return this.GenericLoader(fontLoader, url, callback);
  }

  static GetAudio(url, callback) {
    let audioLoader = new AudioLoader();
    return this.GenericLoader(audioLoader, url, callback);
  }

}
