import { StandardFile } from 'standard-file-js';

export default class Utils {

  static async processUserInputtedKey(userInput) {
    // User inputted keys should be hashed, then base64ed
    let hash = await SFJS.crypto.sha256(userInput);
    // to generate shorter keys, split in third
    hash = hash.slice(0, hash.length/3);
    return SFJS.crypto.base64(hash);
  }

  static base64toBinary(dataURI) {
    var binary = atob(dataURI);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Uint8Array(array);
  }

  static async downloadData(base64, name, type) {
    let arrayBuffer = await SFJS.crypto.base64ToArrayBuffer(base64);
    return this.saveFile({data: arrayBuffer, name, type});
  }

  // via https://github.com/mozilla/send/blob/master/app/fileReceiver.js#L87
  static async saveFile(file) {
    return new Promise(function(resolve, reject) {
      const dataView = new DataView(file.data);
      const blob = new Blob([dataView], { type: file.type });

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, file.name);
        return resolve();
      } else if (/iPhone|fxios/i.test(navigator.userAgent)) {
        const reader = new FileReader();
        reader.addEventListener('loadend', function() {
          if (reader.error) {
            return reject(reader.error);
          }
          if (reader.result) {
            const a = document.createElement('a');
            a.href = reader.result;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
          }
          resolve();
        });
        reader.readAsDataURL(blob);
      } else {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl);
        setTimeout(resolve, 100);
      }
    });
  }

  static async sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, ms);
    })
  }

  // via https://github.com/mozilla/send
  static copyToClipboard(str) {
    const aux = document.createElement('input');
    aux.setAttribute('value', str);
    aux.contentEditable = true;
    aux.readOnly = true;
    document.body.appendChild(aux);
    if (navigator.userAgent.match(/iphone|ipad|ipod/i)) {
      const range = document.createRange();
      range.selectNodeContents(aux);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      aux.setSelectionRange(0, str.length);
    } else {
      aux.select();
    }
    const result = document.execCommand('copy');
    document.body.removeChild(aux);
    return result;
  }
}
