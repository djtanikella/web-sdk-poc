import React, { useRef, useEffect, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

import ErrorMessage from "./ErrorMessage";
import "./App.css";

function Webcam() {
  const webcamRef = useRef(null);
  const webcamReady = useRef(false);
  const [error, setError] = useState({
    state: true,
    message: "Looking for a face...",
  });

  useEffect(() => {
    requestAccessAndStartVideo(webcamRef.current);
    setInterval(() => {
      setupMesh();
    }, 350);
  }, []);

  async function setupMesh() {
    if (!webcamRef.current || !webcamReady.current) return;

    const model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );

    const predictions = await model.estimateFaces({
      input: webcamRef.current,
    });

    checkForOnlyOneFace(predictions.length);
  }

  function checkForOnlyOneFace(faces) {
    if (faces === 1) {
      setError({ state: false, message: "" });
    } else {
      setError({
        state: true,
        message: `It seems like there are ${faces} faces`,
      });
    }
  }

  useEffect(() => {
    if (webcamRef.current) {
      webcamRef.current.onloadeddata = (e) => {
        console.log("onloadedata fired ", e);
        webcamReady.current = true;
        setupMesh();
      };
    }
  }, [webcamRef.current]);

  const borderColor = error.state ? "#ff1744" : "#283593 ";

  const videoStyles = {
    transform: "scaleX(-1)",
    border: `10px solid ${borderColor}`,
    borderRadius: 50,
  };

  return (
    <div className="container">
      <video
        id="webcam"
        width="720"
        height="540"
        autoPlay
        style={videoStyles}
        muted
        ref={webcamRef}
      />
      <ErrorMessage {...error} />
    </div>
  );
}

function requestAccessAndStartVideo(videoElement) {
  const success = (stream) => (videoElement.srcObject = stream);
  const rejection = (err) => console.error(err);

  navigator.getUserMedia({ video: {} }, success, rejection);
}

export default Webcam;
