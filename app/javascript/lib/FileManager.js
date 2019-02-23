import "standard-file-js/dist/regenerator.js";
import { StandardFile, SFAbstractCrypto, SFItemTransformer, SFHttpManager, SFItem } from 'standard-file-js';
import ServerManager from "./ServerManager";
import EncryptionWorker from './encryption.worker.js';

export default class FileManager {
  /* Singleton */
  static instance = null;
  static get() {
    if (this.instance == null) { this.instance = new FileManager(); }
    return this.instance;
  }

  async uploadFiles(files, duration, deletionToken) {
    return new Promise((resolve, reject) => {
      const worker = new EncryptionWorker();

      worker.addEventListener("message", (event) => {
        if(event.data.error) {
          reject(event.data.error);
          return;
        }

        resolve(event.data.response);
      });

      var params = {
        operation: "upload",
        files: files,
        duration: duration,
        deletionToken: deletionToken,
        host: ServerManager.get().host
      };
      worker.postMessage(params);
    })
  }

  async encryptFile({rawData, fileName, fileType, deletionToken, keys, authParams}) {
    return new Promise((resolve, reject) => {
      const worker = new EncryptionWorker();

      worker.addEventListener("message", function (event) {
        if(event.data.error) {
          reject(event.data.error);
          return;
        }
        resolve(event.data.item);
      });

      worker.postMessage({
        operation: "encrypt",
        keys: keys,
        authParams: authParams,
        contentType: "SN|FileSafe|File",
        rawData: rawData,
        fileName: fileName,
        fileType: fileType,
        deletionToken: deletionToken
      });
    })
  }

  async decryptFile(item, keys) {
    return new Promise((resolve, reject) => {
      const worker = new EncryptionWorker();

      worker.addEventListener("message", function (event) {
        if(event.data.error) {
          reject(event.data.error);
          return;
        }

        resolve({data: event.data.decryptedData, item: event.data.decryptedItem});
      });

      worker.postMessage({
        operation: "decrypt",
        keys: keys,
        item: item
      });
    })
  }

}
