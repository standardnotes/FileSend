import React from 'react';
import FileInput from "./FileInput";
import FileManager from "../lib/FileManager";
import Download from "./Download";
import ServerManager from "../lib/ServerManager";
import Utils from "../lib/Utils";
import Share from "./Share"
import Button from "./Button"

const UploadLimit = 50; // MB

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

  totalFilesSize = () => {
    let sum = 0;
    for(let file of this.state.inputFiles) {
      sum += file.size;
    }
    return sum;
  }

  onFile = ({data, name, type, size}) => {
    let files = this.state.inputFiles.slice();
    if(this.totalFilesSize() + size > UploadLimit) {
      alert(`Attaching this file would exceed the total upload limit of ${UploadLimit} MB.`);
    } else {
      files.push({data, name, type, size});
      this.setState({inputFiles: files, error: null});
    }
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
    this.setState({userKey: key, pregeneratedKey: key});
  }

  async encryptFile({file, keys, authParams, deletionToken}) {
    return FileManager.get().encryptFile({
      rawData: file.data,
      fileName: file.name,
      fileType: file.type,
      deletionToken: deletionToken,
      keys: keys,
      authParams: authParams
    })
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

    let keyToUse = await Utils.processUserInputtedKey(this.state.userKey);
    let keyToShare = this.state.userKey;

    let credentials = await this.createKeysFromUserKey(keyToUse);
    let keys = credentials.keys;
    let authParams = credentials.authParams;

    let encryptedItems = [];
    let deletionToken = await SFJS.crypto.generateRandomKey(128);
    for(let file of this.state.inputFiles) {
      let result = await this.encryptFile({file, keys, authParams, deletionToken}).catch((e) => {
        return null;
      })

      if(!result) {
        // abort
        this.setState({error: {message: "Error processing file."}, encrypting: false, uploading: false, status: null});
        return;
      }

      encryptedItems.push(result);
    }

    this.setState({status: "Uploading...", encrypting: false, uploading: true});

    let downloadLimit;
    if(this.state.duration == 0) {
      downloadLimit = 1;
    }

    // Upload to server
    FileManager.get().uploadFiles(encryptedItems, this.state.duration, downloadLimit, deletionToken).then((response) => {
      let shareUrl = response.share_url;
      let simpleLink = `${shareUrl}#${keyToUse}`
      this.setState({
        uploadComplete: true,
        shareUrl: shareUrl,
        simpleLink: simpleLink,
        bundleToken: response.bundle_token,
        adminToken: response.admin_token
      });
    }).catch((uploadError) => {
      console.log("Upload exception", uploadError);
      this.setState({error: uploadError, encrypting: false, uploading: false, status: null});
    })
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

  render() {
    return (
      <div id="upload">
        {this.state.uploadComplete &&
          <Share
            simpleLink={this.state.simpleLink}
            numFiles={this.state.inputFiles.length}
            shareUrl={this.state.shareUrl}
            userKey={this.state.userKey}
            bundleToken={this.state.bundleToken}
            adminToken={this.state.adminToken}
          />
        }

        {!this.state.uploadComplete &&
          <div>
            <div className="sk-panel-row extra-mb">
              <div className="sk-panel-column stretch">
                <FileInput onFile={this.onFile} />
              </div>
            </div>

            {this.state.inputFiles.length > 0 &&
              <div><span className="sk-bold">Attaching </span>{this.inputFilesListString()}</div>
            }

            <div>
              <div className="sk-panel-row extra-mb">
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
                <Button className="sk-panel-row" label="Encrypt & Share" onClick={this.encryptAndUpload} />
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
