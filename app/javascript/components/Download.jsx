import React from 'react';
import FileManager from "../lib/FileManager";
import ServerManager from "../lib/ServerManager";
import Utils from "../lib/Utils";

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

export default class Home extends React.Component {

  constructor(props) {
    super(props);

    let inputKey = props.location.hash.slice(1, props.location.hash.length);
    this.state = {userKey: inputKey, inputKey: inputKey};

    let token = props.match.params.token;
    ServerManager.get().getBundleInfo(token).then((response) => {
      this.setState({urls: response.urls, token: token});
    }).catch((response) => {
      this.setState({bundleError: response.error});
    })
  }

  onKeyChange = (event) => {
    this.setState({userKey: event.target.value});
  }

  flashError(error) {
    this.setState({status: error, statusClass: "danger"});
    setTimeout(() => {
      this.setState({status: null, statusClass: null});
    }, 2500);
  }

  downloadFiles = async (event) => {
    if(event) {
      event.preventDefault();
    }

    this.setState({status: "Downloading...", downloading: true, decryptionError: false});

    await Utils.sleep(250);

    if(this.state.userKey.length == 0) {
      this.setState({error: {message: "Encryption key not set."}});
      return;
    }

    // Download files
    let files = await ServerManager.get().downloadFileUrls(this.state.urls);

    // Decrypt Files
    this.setState({status: "Decrypting..."});
    await Utils.sleep(250);

    let authParamsData = await SFJS.crypto.base64Decode(SFJS.itemTransformer.encryptionComponentsFromString(files[0].content).authParams);
    let authParams = JSON.parse(authParamsData);
    let keyToUse;
    if(this.state.userKey != this.state.inputKey) {
      // Process it if it's user inputted text
      keyToUse = await Utils.processUserInputtedKey(this.state.userKey);
    } else {
      keyToUse = this.state.inputKey;
    }
    let keys = await SFJS.crypto.computeEncryptionKeysForUser(keyToUse, authParams);

    let decryptedFiles = [];
    Promise.all(files.map((file) => {
      return new Promise((resolve, reject) => {
        FileManager.get().decryptFile(file, keys).then(({data, item}) => {
          ServerManager.get().successfulDownload(this.state.token, item.content.deletionToken).then((response) => {
            Utils.downloadData(Utils.base64toBinary(data), item.content.fileName, item.content.fileType);
            this.setState({downloaded: true, downloading: false, decryptionError: false, status: null});
            resolve();
          })
        }).catch((decryptionError) => {
          this.flashError("Error decrypting file.");
          this.setState({decryptionError: true, downloading: false, status: null});
          reject(decryptionError);
        })
      })
    }))
  }

  render() {
    return (
      <div id="download">
        {!this.state.bundleError &&
          <div className="sk-panel-row">
            <div className="sk-panel-column stretch">

              {!this.state.urls && !this.state.bundleError &&
                <div className="sk-panel-row sk-label">Loading files...</div>
              }

              {this.state.urls && !this.state.downloaded &&
                <div>
                  <div className="sk-h2">
                    Downloading <span className="sk-bold">{this.state.urls.length}</span> files.
                  </div>

                  <div className="file-info">
                    Files and file names have been encrypted by the sender.
                    Please enter the decryption key below.
                    Your files will be download, then decrypted securely in your browser.
                  </div>

                  <div className="sk-panel-row">
                    <div className="sk-panel-column stretch">
                      <input className="sk-panel-row sk-input info" type="text" placeholder="Encryption key" value={this.state.userKey} onChange={this.onKeyChange} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"/>
                      {this.state.decryptionError &&
                        <div className="danger sk-bold">
                          The decryption key you entered is incorrect. Please try again.
                        </div>
                      }
                    </div>
                  </div>


                  {!this.state.downloading &&
                    <div className="sk-panel-row">
                      <div onClick={this.downloadFiles} className="sk-button-group stretch">
                        <div className="sk-button info big">
                          <div className="sk-label">
                            Download
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

            </div>
          </div>
        }

        {this.state.bundleError &&
          <div className="sk-panel-row centered">
            {this.state.bundleError.message}
          </div>
        }

        {this.state.downloaded &&
          <div className="sk-panel-row centered">
            Your files have been downloaded.
          </div>
        }

        {this.state.status &&
          <div className="sk-panel-row centered sk-bold">
            {this.state.status}
          </div>
        }
      </div>
    )
  }

}
