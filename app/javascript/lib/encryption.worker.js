import _ from 'lodash';
import "standard-file-js/dist/regenerator.js";
import { StandardFile, SFAbstractCrypto, SFCryptoWeb, SFItemTransformer, SFHttpManager, SFItem, SFItemParams } from 'standard-file-js';
import ServerManager from "./ServerManager";

self.addEventListener('message', async function(e) {
  var data = e.data;
  try {
    if(data.operation == "encrypt") {
      var fileItem = new SFItem({
        content_type: data.contentType,
        content: {
          rawData: data.rawData,
          fileName: data.fileName,
          fileType: data.fileType,
          deletionToken: data.deletionToken
        }
      });

      var itemParamsObject = new SFItemParams(fileItem, data.keys, data.authParams);
      itemParamsObject.paramsForSync().then((itemParams) => {
        // Encryption complete
        self.postMessage({
          item: JSON.stringify(itemParams)
        });
      })
    } else if(data.operation == "decrypt") {
      SFJS.itemTransformer.decryptItem(data.item, data.keys).then(() => {
        var decryptedItem = new SFItem(data.item);
        var decryptedData = decryptedItem.content.rawData;
        if(decryptedItem.errorDecrypting) {
          self.postMessage({error: {message: "Error decrypting."}});
        } else {
          self.postMessage({
            decryptedData: decryptedData,
            decryptedItem: decryptedItem
          });
        }
      }).catch((error) => {
        console.log("Decryption error:", error);
        self.postMessage({error: {message: error}});
      })
    } else if(data.operation == "upload") {
      ServerManager.get().setHost(data.host);
      ServerManager.get().uploadFiles(data.files, data.duration, data.downloadLimit, data.deletionToken).then((response) => {
        self.postMessage({response});
      }).catch((error) => {
        self.postMessage({error: error});
        console.log("Upload exception", error);
      });
    }
  } catch (e) {
    console.error("Worker exception:", e);
    self.postMessage({error: {message: "Error processing file."}});
  }

}, false);
