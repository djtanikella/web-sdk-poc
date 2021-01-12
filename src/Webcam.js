import React, { useRef, useEffect, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

import {
  calculateRoll,
  calculateYaw,
  calculatePitch,
  THRESHOLDS,
  requestAccessAndStartVideo,
} from "./utils";
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
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);

  const [leftEye, setLeftEye] = useState([]);
  const [rightEye, setRightEye] = useState([]);
  const [forehead, setForehead] = useState([]);
  const [chin, setChin] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    requestAccessAndStartVideo(webcamRef.current);
    scan = setInterval(() => {
      setupMesh();
    }, 300);

    return () => stopWebcam();
  }, []);

  useEffect(() => {
    if (webcamRef.current) {
      webcamRef.current.onloadeddata = (e) => {
        console.log("onloadedata fired ", e);
        webcamReady.current = true;
        setupMesh();
      };
    }
  }, [webcamRef.current]);

  function stopWebcam() {
    console.log("stopwebcam called");
    clearInterval(scan);
    webcamRef.current = null;
  }

  async function setupMesh() {
    const start = Date.now();
    if (!webcamRef.current || !webcamReady.current) return;

    try {
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { shouldLoadIrisModel: false }
      );

      const predictions = await model.estimateFaces({
        input: webcamRef.current,
        predictIrises: false,
      });

      const scaledMesh = predictions[0] && predictions[0].scaledMesh;
      if (scaledMesh) {
        const leftEyePoint = scaledMesh[133];
        const rightEyePoint = scaledMesh[362];
        const chinPoint = scaledMesh[199];
        const foreheadPoint = scaledMesh[151];

        const now = Date.now();

        if (now > lastUpdated) {
          setLeftEye(leftEyePoint);
          setRightEye(rightEyePoint);
          setForehead(foreheadPoint);
          setChin(chinPoint);

          const roll = calculateRoll(leftEyePoint, rightEyePoint);
          const yaw = calculateYaw(leftEyePoint, rightEyePoint);
          const pitch = calculatePitch(chinPoint, foreheadPoint);
          const faces = predictions.length;

          setRoll(roll);
          setYaw(yaw);
          setPitch(pitch);
          setLastUpdated(now);

          errorHandling({ roll, yaw, pitch, faces });
        }
      }
      const end = Date.now();
      console.log("ms: ", end - start);
    } catch (err) {
      console.error("error in the setup mesh fn", err);
    }
  }

  function errorHandling({ roll, yaw, pitch, faces }) {
    if (faces !== 1) {
      setError({
        state: true,
        message: `It seems like there are ${faces} faces`,
      });
    } else if (Math.abs(roll) > THRESHOLDS.ROLL) {
      const correction = roll > 0 ? "counter clockwise ↪️" : "clockwise ↩️";
      setError({
        state: true,
        message: `Turn your head ${correction}`,
      });
    } else if (Math.abs(yaw) > THRESHOLDS.YAW) {
      const correction = yaw > 0 ? "left ⬅️" : "right ➡️";
      setError({
        state: true,
        message: `Turn your head to the ${correction}`,
      });
    } else if (Math.abs(pitch) > THRESHOLDS.PITCH) {
      const correction = pitch > 0 ? "down ⬇️" : "up ⬆️";
      setError({
        state: true,
        message: `Turn your head ${correction}`,
      });
    } else {
      setError({
        state: false,
        message: "",
      });
    }
  }

  const videoStyles = {
    border: error.state ? "10px solid #ff1744" : "15px solid teal",
    transform: "scaleX(-1)",
    borderRadius: "40%",
    objectFit: "cover",
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

  const yawProps = {
    metric: {
      name: "Yaw",
      value: yaw.toFixed(0),
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

  const pitchProps = {
    metric: {
      name: "Pitch",
      value: pitch.toFixed(0),
    },
    pointOne: {
      name: "Forehead",
      value: forehead,
    },
    pointTwo: {
      name: "Chin",
      value: chin,
    },
  };

  return (
    <div className="container">
      <video
        id="webcam"
        width="550"
        height="500"
        autoPlay
        style={videoStyles}
        muted
        ref={webcamRef}
      />
      <button onClick={() => stopWebcam()}>stop</button>
      <button onClick={() => setupMesh()}>capture</button>
      <ErrorMessage {...error} />
      <div className="positioningBoxes">
        <Position {...rollProps} />
        <Position {...yawProps} />
        <Position {...pitchProps} />
      </div>
    </div>
  );
}

export default Webcam;
