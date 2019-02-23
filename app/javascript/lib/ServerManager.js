import "standard-file-js/dist/regenerator.js";
import { StandardFile, SFAbstractCrypto, SFItemTransformer, SFHttpManager } from 'standard-file-js';

export default class ServerManager {

  /* Singleton */
  static instance = null;
  static get() {
    if (this.instance == null) { this.instance = new ServerManager(); }
    return this.instance;
  }

  constructor() {
    this.httpManger = new SFHttpManager();
    this.httpManger.setJWTRequestHandler(() => {});
  }

  setHost(host) {
    this.host = host;
  }

  async uploadFiles(files, duration, deletionToken) {
    let url = `${this.host}/api/files/save`;
    let params = {files: files, duration: duration, deletion_token: deletionToken}

    return new Promise((resolve, reject) => {
      this.httpManger.postAbsolute(url, params, (response) => {
        resolve(response);
      }, (errorResponse) => {
        var error = errorResponse.error;
        if(!error) {
          error = {message: "File upload failed."};
        }
        console.log("Upload error response", error);
        reject(error);
      })
    });
  }

  async getBundleInfo(token) {
    let url = `${this.host}/api/files/download/${token}`;
    return new Promise(async (resolve, reject) => {
      this.httpManger.getAbsolute(url, {}, async (response) => {
        resolve(response);
      }, (errorResponse) => {
        var error = errorResponse.error;
        if(!error) {
          error = {message: "Get bundle info failed."};
        }
        console.error("Bundle info error", errorResponse);
        reject(error);
      })
    });
  }

  async successfulDownload(token, deletionToken) {
    let url = `${this.host}/api/files/successful_download`;
    let params = {token: token, deletion_token: deletionToken};

    return new Promise((resolve, reject) => {
      this.httpManger.postAbsolute(url, params, (response) => {
        resolve(response);
      }, (errorResponse) => {
        var error = errorResponse.error;
        if(!error) {
          error = {message: "File upload failed."};
        }
        console.error("On successful download error", error);
        resolve(error);
      })
    });
  }

  async downloadFileUrls(urls) {
    return Promise.all(urls.map((url) => {
      return new Promise((resolve, reject) => {
        this.httpManger.getAbsolute(url, {}, (response) => {
          resolve(response);
        }, (errorResponse) => {
          var error = errorResponse.error;
          console.error("Download data error", errorResponse);
          reject(error);
        })
      })
    }))
  }
}
