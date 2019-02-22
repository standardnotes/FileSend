import React from 'react';
import FileInput from "./FileInput";
import FileManager from "../lib/FileManager";
import Download from "./Download";
import ServerManager from "../lib/ServerManager";
import Utils from "../lib/Utils";

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

export default class Upload extends React.Component {

  constructor(props) {
    super(props);

    this.durationOptions = [
      { value: 0, label: "Immediately after download (Max 5 Days)" },
      { value: 24, label: "1 Day" },
      { value: 48, label: "2 Days" },
      { value: 72, label: "3 Days" },
      { value: 96, label: "4 Days" },
      { value: 120, label: "5 Days" }
    ]

    this.state = {inputFiles: [], duration: this.durationOptions[0].value, userKey: ""};

    this.generateKeyForUser();
  }

  onFile = ({data, name, type}) => {
    let files = this.state.inputFiles.slice();
    let file = {data, name, type};
    files.push(file);
    this.setState({inputFiles: files, error: null});
  }

  onKeyChange = (event) => {
    this.setState({userKey: event.target.value});
  }

  onDurationChange = (event) => {
    let option = event.target.value;
    this.setState({duration: option});
  }

  async createKeysFromUserKey(key) {
    let bits = 256;
    let identifer = await SFJS.crypto.generateRandomKey(bits);
    let credentials = await SFJS.crypto.generateInitialKeysAndAuthParamsForUser(identifer, key);
    return credentials;
  }

  generateKeyForUser = async () => {
    let length = 27;
    let key = await SFJS.crypto.generateRandomKey(128);
    key = await SFJS.crypto.base64(key);
    key = key.slice(0, length);
    this.setState({userKey: key});
  }

  async encryptFile({file, keys, authParams, deletionToken}) {
    return FileManager.get().encryptFile({
      rawData: file.data,
      fileName: file.name,
      fileType: file.type,
      deletionToken: deletionToken,
      keys: keys,
      authParams: authParams
    });
  }

  encryptAndUpload = async () => {
    if(this.state.inputFiles.length == 0) {
      this.setState({error: {message: "No files attached."}});
      return;
    }

    if(this.state.userKey.length == 0) {
      this.setState({error: {message: "Encryption key not set."}});
      return;
    }

    // Encrypt File
    this.setState({status: "Encrypting...", error: null, encrypting: true, uploading: false});

    let credentials = await this.createKeysFromUserKey(this.state.userKey);
    let keys = credentials.keys;
    let authParams = credentials.authParams;

    let encryptedItems = [];
    let deletionToken = await SFJS.crypto.generateRandomKey(128);
    for(let file of this.state.inputFiles) {
      let result = await this.encryptFile({file, keys, authParams, deletionToken});
      encryptedItems.push(result);
    }

    this.setState({status: "Uploading...", encrypting: false, uploading: true});

    // Upload to server
    FileManager.get().uploadFiles(encryptedItems, this.state.duration, deletionToken).then((response) => {
      this.setState({uploadComplete: true, shareUrl: response.share_url});
    }).catch((uploadError) => {
      this.setState({error: uploadError});
    })
  }

  compoundUrl() {
    return `${this.state.shareUrl}#${this.state.userKey}`
  }

  inputFilesListString() {
    let string = "";
    let files = this.state.inputFiles;
    files.forEach((file, index) => {
      string += file.name;
      if(files.length > 1) {
        if(index != files.length - 1) {
          string += ", ";
        }
      }
    })
    return string;
  }

  copySimpleLink = (event) => {
    this.copyTextForButton(this.compoundUrl(), event.target);
  }

  copyBareLink = (event) => {
    this.copyTextForButton(this.state.shareUrl, event.target);
  }

  copyKey = (event) => {
    this.copyTextForButton(this.state.userKey, event.target);
  }

  copyTextForButton = (text, button) => {
    Utils.copyToClipboard(text);
    let element = button;
    let label = button.querySelector(".sk-label");
    if(label) {
      // the input element can either be the label itself or the outer button, depending on where the mouse was clicked
      element = label;
    }
    let original = element.innerHTML;
    element.innerHTML = "Copied.";
    setTimeout(() => {
      element.innerHTML = original;
    }, 1000);
  }

  render() {
    return (
      <div id="upload">

        {this.state.uploadComplete &&
          <div>
            <div className="sk-panel-row sk-h2">
              {this.state.inputFiles.length > 1 &&
                <div><span className="sk-bold">Success! </span>Your files are ready to share.</div>
              }

              {this.state.inputFiles.length <= 1 &&
                <div><span className="sk-bold">Success! </span>Your file is ready to share.</div>
              }
            </div>

            <div className="sk-panel-row">
              <div className="sk-panel-column">
                <div className="sk-label sk-h3">Simple Link (recommended)</div>
                <div className="sk-panel-row">
                  Share the file and encryption key in one secure link.
                  The key is placed after the # symbol, which means it remains private in the browser.
                </div>

                <div className="sk-panel-column stretch">
                  <input className="sk-panel-row sk-input info" type="text" value={this.compoundUrl()} disabled={true} />
                </div>

                <div className="sk-button-group stretch">
                  <div onClick={this.copySimpleLink} className="sk-button info big" type="submit">
                    <div className="sk-label">
                      Copy Simple Link
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sk-panel-row">
              <div className="sk-panel-column">
                <div className="sk-label sk-h3">Bare Link</div>
                <div className="sk-panel-row">
                  Share the file link and encryption key via separate communication channels.
                </div>

                <div className="sk-panel-column stretch">
                  <input className="sk-panel-row sk-input info" type="text" value={this.state.shareUrl} disabled={true} />
                </div>

                <div className="sk-panel-column stretch">
                  <input className="sk-panel-row sk-input info" type="text" value={this.state.userKey} type="password" disabled={true} />
                </div>

                <div className="sk-button-group stretch">
                  <div onClick={this.copyBareLink} className="sk-button info big">
                    <div className="sk-label">
                      Copy Bare Link
                    </div>
                  </div>
                </div>

                <div className="sk-panel-row sk-button-group stretch">
                  <div onClick={this.copyKey} className="sk-button info big">
                    <div className="sk-label">
                      Copy Encryption Key
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        {!this.state.uploadComplete &&
          <div>
            <div className="sk-panel-row">
              <div className="sk-panel-column stretch">
                <FileInput onFile={this.onFile} />
              </div>
            </div>


            {this.state.inputFiles.length > 0 &&
              <div><span className="sk-bold">Attaching </span>{this.inputFilesListString()}</div>
            }

            <div>
              <div className="sk-panel-row">
                <div className="sk-panel-column stretch">
                  <div className="sk-panel-row sk-label">Choose key to encrypt files with</div>
                  <input className="sk-panel-row sk-input info" type="text" placeholder="Encryption key" value={this.state.userKey} onChange={this.onKeyChange} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"/>
                </div>
              </div>

              <div className="sk-panel-row">
                <div className="sk-panel-column stretch">
                  <div className="sk-panel-row sk-label">Delete after</div>
                  <select value={this.state.duration} onChange={this.onDurationChange}>
                    {this.durationOptions.map((option) =>
                      <option key={option.value} value={option.value}>{option.label}</option>
                    )}
                  </select>
                </div>
              </div>

              {!(this.state.encrypting || this.state.uploading) &&
                <div className="sk-panel-row">
                  <div className="sk-button-group stretch">
                    <div onClick={this.encryptAndUpload} className="sk-button info big">
                      <div className="sk-label">
                        Encrypt & Share
                      </div>
                    </div>
                  </div>
                </div>
              }

              {this.state.error &&
                <div className="sk-panel-row centered sk-bold danger">
                  {this.state.error.message}
                </div>
              }
            </div>

            {this.state.status &&
              <div className="sk-panel-row centered sk-bold upload-status">
                {this.state.status}
              </div>
            }
          </div>
        }
      </div>
    )
  }

}
