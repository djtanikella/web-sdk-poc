/**
 * requestAccessAndstartVideo takes a video element and sets the stream to the user's webcam
 * @param {HTMLElement} videoElement takes in a video element
 */
export async function requestAccessAndStartVideo(videoElement) {
  const mediaConstraints = { video: true, audio: false };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    videoElement.srcObject = stream;
  } catch (e) {
    console.error(e);
  }
}

/**
 * calculateRoll takes two points and returns the roll in degrees
 * @param {number[]} pt1 coordinates in [x, y, z]
 * @param {number[]} pt2 cooridnates in [x, y, z]
 * @return {number} a number in degrees
 */
export function calculateRoll(pt1, pt2) {
  const deltaX = pt2[0] - pt1[0];
  const deltaY = pt2[1] - pt1[1];

  const radians = Math.atan2(deltaX, deltaY);
  const degrees = radians * (180 / Math.PI);

  return degrees - 90;
  // return roll;
}

/**
 * calculateYaw takes two points and returns the roll in degrees
 * @param {number[]} pt1 coordinates in [x, y, z]
 * @param {number[]} pt2 cooridnates in [x, y, z]
 * @return {number} a number in degrees
 */
export function calculateYaw(pt1, pt2) {
  const deltaX = pt2[0] - pt1[0];
  const deltaZ = pt2[2] - pt1[2];

  const radians = Math.atan2(deltaX, deltaZ);
  const degrees = radians * (180 / Math.PI);
  return degrees - 90;
}

/**
 * calculatePitch takes two points and returns the roll in degrees
 * @param {number[]} pt1 coordinates in [x, y, z]
 * @param {number[]} pt2 cooridnates in [x, y, z]
 * @return {number} a number in degrees
 */
export function calculatePitch(pt1, pt2) {
  const deltaY = pt2[1] - pt1[1];
  const deltaZ = pt2[2] - pt1[2];

  const radians = Math.atan2(deltaY, deltaZ);
  const degrees = radians * (180 / Math.PI);
  return degrees + 90;
}

export const THRESHOLDS = {
  YAW: 3,
  ROLL: 3,
  PITCH: 5,
};

// possible way to get position in one function if needed
// function calculatePosition({
//   chinPoint,
//   foreheadPoint,
//   leftEyePoint,
//   rightEyePoint,
// }) {
//   //cacluate roll and yaw using eyes
//   const deltaX = rightEyePoint[0] - leftEyePoint[0];
//   let deltaY = rightEyePoint[1] - leftEyePoint[1];
//   let deltaZ = rightEyePoint[2] - leftEyePoint[2];

//   const rollRadians = Math.atan2(deltaX, deltaY);
//   const roll = rollRadians * (180 / Math.PI) - 90;

//   const yawRadians = Math.atan2(deltaX, deltaZ);
//   const yaw = yawRadians * (180 / Math.PI) - 90;

//   // calculate pitch using chin and forehead
//   deltaY = chinPoint[1] - foreheadPoint[1];
//   deltaZ = chinPoint[2] - foreheadPoint[1];

//   const pitchRadians = Math.atan(deltaY, deltaZ);
//   const pitch = pitchRadians * (180 / Math.PI) + 90;

//   return {
//     roll,
//     yaw,
//     pitch,
//   };
// }
