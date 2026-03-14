import React from "react";
import "./Spinner.css"

function Spinner() {
  return (
    <div className="loadingSpinnerContainer">
      <div className="logoLoader">
        <span className="logoLetter">D</span>
        <div className="logoRing"></div>
      </div>
    </div>
  );
}

export default Spinner;
