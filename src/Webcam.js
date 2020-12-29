import React, { useRef, useEffect } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

const styles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
};

function Webcam() {
  const webcamRef = useRef(null);

  useEffect(() => {
    requestAccessAndStartVideo(webcamRef.current);
  }, []);

  async function setupMesh() {
    if (!webcamRef.current) return;

    const model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );

    const predictions = await model.estimateFaces({
      input: webcamRef.current,
    });

    console.log("🌷", predictions);

    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].scaledMesh;

        // Log facial keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];

          console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
        }
      }
    }
  }

  useEffect(() => {
    if (webcamRef.current) {
      webcamRef.current.onloadeddata = (e) => {
        console.log("onloadedata fired ", e);
        setupMesh();
      };
    }
  }, [webcamRef.current]);

  const mirror = { transform: "scaleX(-1)" };

  return (
    <div style={styles}>
      <video
        id="webcam"
        width="720"
        height="560"
        autoPlay
        style={mirror}
        muted
        ref={webcamRef}
      />
    </div>
  );
}

function requestAccessAndStartVideo(videoElement) {
  const success = (stream) => (videoElement.srcObject = stream);
  const rejection = (err) => console.error(err);

  navigator.getUserMedia({ video: {} }, success, rejection);
}

export default Webcam;
