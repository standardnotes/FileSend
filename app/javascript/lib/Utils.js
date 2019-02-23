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

  static downloadData(data, name, type) {
    var link = document.createElement('a');
    link.setAttribute('download', name);
    link.href = this.hrefForData(data, type);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  static hrefForData(data, type) {
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (this.textFile !== null) {
      window.URL.revokeObjectURL(this.textFile);
    }

    this.textFile = window.URL.createObjectURL(new Blob([data], {type: type ? type : 'text/json'}));

    // returns a URL you can use as a href
    return this.textFile;
  }

  static async sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, ms);
    })
  }

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
