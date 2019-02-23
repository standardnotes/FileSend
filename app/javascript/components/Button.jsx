import React from 'react';
const Button = (props) => {
  return (
    <div className={"sk-button-group stretch " + props.className}>
      <div onClick={props.onClick} className="sk-button info big">
        <div className="sk-label">
          {props.label}
        </div>
      </div>
    </div>
  )
}

export default Button;
