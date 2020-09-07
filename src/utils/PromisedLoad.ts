import { TextureLoader, ObjectLoader, FontLoader, AudioLoader } from 'three';

// gonna let this class load in all our stuffz and promisify it all
export default class {

  static GenericLoader(loader, url, callback, progressCallback) {
    return new Promise((resolve, reject) => {
      loader.load(url, (object) => {
        if (callback) {
          callback(object);
        }
        resolve(object);
      }, (progress) => {
        if (progressCallback) {
          progressCallback(progress);
        } else {
          console.log(progress);
        }
      }, (error) => {
        console.log(error.target);
        reject(error);
      });
    });
  }

  static GetTexture(url, callback, progressCallback) {
    let texLoader = new TextureLoader();
    return this.GenericLoader(texLoader, url, callback, progressCallback);
  }

  static GetObject(url, callback, progressCallback) {
    let jsonLoader = new ObjectLoader();
    return this.GenericLoader(jsonLoader, url, callback, progressCallback);
  }

  static GetFont(url, callback, progressCallback) {
    let fontLoader = new FontLoader();
    return this.GenericLoader(fontLoader, url, callback, progressCallback);
  }

  static GetAudio(url, callback, progressCallback) {
    let audioLoader = new AudioLoader();
    return this.GenericLoader(audioLoader, url, callback, progressCallback);
  }

}
