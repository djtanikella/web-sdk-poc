import React from "react";
import "./App.scss";

function ErrorMessage({ state, message }) {
  const opacity = state ? 1 : 0;
  return (
    <div style={{ opacity }} className="errorBox">
      {message}
    </div>
  );
}

export default ErrorMessage;
