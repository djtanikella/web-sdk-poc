import React, { useRef, useEffect, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

import ErrorMessage from "./ErrorMessage";
import Position from "./Position";
import "./App.scss";

let scan;

function Webcam() {
  const webcamRef = useRef(null);
  const webcamReady = useRef(false);
  const [error, setError] = useState({
    state: true,
    message: "Looking for a face...",
  });

  const [roll, setRoll] = useState(0);

  const [leftEye, setLeftEye] = useState([]);
  const [rightEye, setRightEye] = useState([]);

  useEffect(() => {
    requestAccessAndStartVideo(webcamRef.current);
    scan = setInterval(() => {
      setupMesh();
    }, 1000);

    return () => stopWebcam();
  }, []);

  function stopWebcam() {
    console.log("stopwebcam called");
    clearInterval(scan);
    webcamRef.current = null;
  }

  async function setupMesh() {
    if (!webcamRef.current || !webcamReady.current) return;

    try {
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
      );

      const predictions = await model.estimateFaces({
        input: webcamRef.current,
        predictIrisies: false,
      });

      const scaledMesh = predictions[0] && predictions[0].scaledMesh;
      if (scaledMesh) {
        const leftEyePoint = scaledMesh[133];
        const rightEyePoint = scaledMesh[362];
        setLeftEye(leftEyePoint);
        setRightEye(rightEyePoint);
        setRoll(calculateRoll(leftEyePoint, rightEyePoint));
      }

      checkForOnlyOneFace(predictions.length);
    } catch (err) {
      console.error("error in the setup mesh fn", err);
    }
  }

  function calculateRoll(pt1, pt2) {
    // debugger;
    const deltaX = pt2[0] - pt1[0];
    const deltaY = pt2[1] - pt1[1];
    const deltaZ = pt2[2] - pt2[2];

    // calc roll
    const radians = Math.atan2(deltaX, deltaY);
    const degrees = radians * (180 / Math.PI);

    return degrees - 90;
  }

  function calculateYaw(pt1, pt2) {
    const deltaY = pt2[1] - pt1[1];
    const deltaZ = pt2[2] - pt2[2];

    const radians = Math.atan2(deltaY, deltaZ);
    const degrees = radians * (180 / Math.PI);

    return degrees;
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

  const rollProps = {
    metric: {
      name: "Roll",
      value: roll.toFixed(0),
    },
    pointOne: {
      name: "Left Eye",
      value: leftEye,
    },
    pointTwo: {
      name: "Right Eye",
      value: rightEye,
    },
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
      <button onClick={() => stopWebcam()}>stop</button>
      <ErrorMessage {...error} />
      <div className="positioningBoxes">
        <Position {...rollProps} />
      </div>
    </div>
  );
}

async function requestAccessAndStartVideo(videoElement) {
  const mediaConstraints = { video: true, audio: false };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    videoElement.srcObject = stream;
  } catch (e) {
    console.error(e);
  }
}

export default Webcam;
