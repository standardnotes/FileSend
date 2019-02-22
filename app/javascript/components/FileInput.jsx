import "standard-file-js/dist/regenerator.js";
import { StandardFile, SFAbstractCrypto, SFItemTransformer, SFHttpManager, SFItem } from 'standard-file-js';

import React from 'react';

export default class FileInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.configureFileForm();

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      window.addEventListener(eventName, this.handleEvent, false)
    })
  }

  componentWillUnmount() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      window.removeEventListener(eventName, this.handleEvent);
    });
  }

  handleEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const dropContainer = document.getElementById("drop-container");

    var highlight = (e) => {
      dropContainer.classList.add('focused');
    }

    var unhighlight = (e) => {
      dropContainer.classList.remove('focused');
    }

    var handleDrop = (e) => {
      let dt = e.dataTransfer;
      let files = dt.files;

      this.handleDroppedFiles(files)
    }

    let eventName = event.type;

    if(['dragenter', 'dragover'].includes(eventName)) {
      highlight();
    }

    if(['dragleave', 'drop'].includes(eventName)) {
      unhighlight();
    }

    if(eventName == "drop") {
      handleDrop(event);
    }
  }

  get dropContainer() {
    return document.getElementById("files-view");
  }

  get fileInput() {
    return document.getElementById("file-input");
  }

  configureFileForm() {
    var fileInput = this.fileInput;
    var dropContainer = this.dropContainer;
    if(!fileInput) {
      return;
    }

    fileInput.onchange = (event) => {
      // On firefox, this event doesnt get triggered. INstead we handle it on window.addEventListener("drop")
      // Which gets called on all browsers
      let files = event.target.files;
      if(!this.handledFiles) {
        this.handleDroppedFiles(files);
      }
    };
  }
  async readFile(file) {
    const MegabyteLimit = 50;
    const BytesInMegabyte = 1000000; // 50mb
    const ByteLimit = MegabyteLimit * BytesInMegabyte;

    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      let decrypt = false;

      reader.onload = async (e) => {
        var data = e.target.result;
        var arrayBuffer = data;
        var bytes = arrayBuffer.byteLength;
        if(bytes > ByteLimit) {
          alert(`The maximum upload size is ${MegabyteLimit} megabytes per file.`);
          this.setState({status: null});
          resolve();
          return;
        }
        var base64 = await SFJS.crypto.arrayBufferToBase64(arrayBuffer);
        this.props.onFile({data: base64, name: file.name, type: file.type});
        resolve();
      }

      this.setState({status: "Reading file..."});
      reader.readAsArrayBuffer(file);
    })
  }

  handleDroppedFiles = async (files) => {
    for(let file of files) {
      if(!file) {
        // Can be the case if you're dragging some text or something
        continue;
      }

      await this.readFile(file);
    }

    setTimeout(() => {
      this.setState({status: null});
    }, 2000);
  }

  showFileSelector = () => {

  }

  render() {
    return (
      <label className="no-style">
        <input type="file" style={{display: "none"}} onChange={(event) => {this.handleDroppedFiles(event.target.files)}} />
        <div onClick={this.showFileSelector} id="drop-container">
          <div className="title">Drag and drop files to encrypt here</div>
          <div className="subtitle">Maximum 50MB total</div>
        </div>
      </label>
    )
  }

}
