import React from 'react';
import FileInput from "./FileInput";
import FileManager from "../lib/FileManager";
import Download from "./Download";
import Upload from "./Upload";
import Header from "./Header";
import ServerManager from "../lib/ServerManager";

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    ServerManager.get().setHost(props.host);
  }

  render() {
    return (
      <Router>
        <div id="root">
          <div id="home" className={"sk-panel static"}>
            <div id="app-content">
              <div id="main-content" className="sk-panel-content">
                <Header />
                <div className="home-content">
                  <Route path={`/send/:token`} component={Download} />
                  <Route exact path={`/`} component={Upload} />
                </div>
              </div>

              <div className="sk-panel-footer">
                <div className="filesend-features">
                  FileSend secures files with client-side AES-256 encryption and does not log IP addresses.
                  Files are permanently deleted from our servers on download or after specified duration.
                </div>
              </div>
            </div>

            <div className="centered attribution">
              <div>
                <a href="https://github.com/standardnotes/filesend" target="_blank">Source code</a>
              </div>
              <div>
                <a href="https://standardnotes.com" target="_blank" className="by-sn">Powered by <span className="sn">Standard Notes</span></a>
              </div>
            </div>
          </div>
        </div>
      </Router>
    )
  }
}
