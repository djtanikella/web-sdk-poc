import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import "./App.css";

const images = [];

function App() {
  const webcamRef = useRef(null);

  const props = {
    mirrored: true,
  };

  useEffect(() => {
    setInterval(() => {
      const newImage = webcamRef.current.getScreenshot();
      images.push(newImage);
      console.log(images);
    }, 10000);
  }, []);

  return (
    <div className="App">
      <Webcam {...props} ref={webcamRef} />
    </div>
  );
}

export default App;
