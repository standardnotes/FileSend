import React from 'react';

export default class Header extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="header">
        <h1 className="title">
          <a href="https://standardnotes.com" target="_blank" className="sn">SN</a>
          <div className="rule">
          </div>
          <a href="/">
            <span className="name">FileSend</span>
          </a>
        </h1>
        <h2 className="subtitle">Simple, encrypted file sharing.</h2>
      </div>
    )
  }
}
