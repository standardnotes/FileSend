import React from 'react';
import Utils from "../lib/Utils";
import Button from "./Button"
import ServerManager from "../lib/ServerManager";

export default class Share extends React.Component {

  constructor(props) {
    super(props);
    this.state = {extendedEmail: ""};
  }

  compoundUrl() {
    return `${this.props.shareUrl}#${this.props.userKey}`
  }

  copySimpleLink = (event) => {
    this.copyTextForButton(this.props.simpleLink, event.target);
  }

  copyBareLink = (event) => {
    this.copyTextForButton(this.props.shareUrl, event.target);
  }

  copyKey = (event) => {
    this.copyTextForButton(this.props.userKey, event.target);
  }

  onEmailChange = (event) => {
    this.setState({extendedEmail: event.target.value});
  }

  submitEmail = () => {
    this.setState({subscribing: true});
    ServerManager.get().subscribeToBundle(this.state.extendedEmail, this.props.bundleToken, this.props.adminToken)
    .then((success) => {
      this.setState({subscriptionSuccess: success == true, subscribing: false})
    }).catch((error) => {
      this.setState({subscriptionSuccess: false, subscribing: false})
    })
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
        <div className="sk-panel-row sk-h2">
          <div>
            <span className="sk-bold">Success! </span>
            Your {Utils.chooseNounGrouping("file is", "files are", this.props.numFiles)} ready to share.
          </div>
        </div>

        <div className="sk-panel-row">
          <div className="sk-panel-column">
            <div className="sk-label sk-h3">Simple Link (recommended)</div>
            <div className="sk-panel-row">
              Share the {Utils.pluralize("file", "s", this.props.numFiles)} and encryption key in one secure link.
              The key is placed after the # symbol, which means it remains private in the browser.
            </div>

            <div className="sk-panel-column stretch">
              <input className="sk-panel-row sk-input info" type="text" value={this.props.simpleLink} disabled={true} />
            </div>

            <Button label="Copy Simple Link" onClick={this.copySimpleLink} />
          </div>
        </div>

        <div className="sk-panel-row">
          <div className="sk-panel-column">
            <div className="sk-label sk-h3">Bare Link</div>
            <div className="sk-panel-row">
              Share the file link and encryption key via separate communication channels.
            </div>

            <div className="sk-panel-column stretch">
              <input className="sk-panel-row sk-input info" type="text" value={this.props.shareUrl} disabled={true} />
            </div>

            <div className="sk-panel-column stretch">
              <input className="sk-panel-row sk-input info" type="text" value={this.props.userKey} type="password" disabled={true} />
            </div>

            <Button label="Copy Bare Link" onClick={this.copyBareLink} />
            <Button className="sk-panel-row" label="Copy Encryption Key" onClick={this.copyKey} />
          </div>
        </div>

        <div id="extended-subscribe" className="sk-panel-section">
          <div className="sk-panel-row">
            <div className="sk-panel-column">
              <div className="sk-h2 sk-label">File Management + Email Notifications</div>
              <div>Get notified when your file is downloaded, with link to permanently delete the file at any time before expiration.</div>
              <div className="sk-panel-row">
                <div>Available with <a href="https://standardnotes.com/features" target="_blank" className="sk-bold">Standard Notes Extended</a>.</div>
              </div>

              {!this.state.subscriptionSuccess &&
                <div>
                  <div className="sk-panel-row sk-label">Your Extended email for notifications</div>
                  <input className="sk-panel-row sk-input info" type="text" placeholder="Enter Extended Email" value={this.state.extendedEmail} onChange={this.onEmailChange}/>
                  <Button label="Subscribe to File" onClick={this.submitEmail} />
                </div>
              }

              <div className="sk-panel-row">
                {this.state.subscribing &&
                  <div className="sk-panel-row centered sk-bold">Processing...</div>
                }

                {this.state.subscriptionSuccess == true &&
                  <div className="sk-panel-row centered sk-bold info">Succesfully subscribed to file.</div>
                }

                {this.state.subscriptionSuccess == false &&
                  <div className="sk-panel-row centered sk-bold">
                    <div>
                      Failed to subscribe to file. Ensure your <a href="https://standardnotes.com/features" target="_blank">Extended subscription</a> is valid and try again.
                    </div>
                  </div>
                }
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

}
