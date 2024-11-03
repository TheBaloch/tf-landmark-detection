"use client";

import { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  if (typeof navigator === "undefined") return;

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    // Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      // Clear the canvas
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw the face landmarks
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          for (const landmark of landmarks) {
            canvasCtx.beginPath();
            canvasCtx.arc(
              landmark.x * canvasElement.width,
              landmark.y * canvasElement.height,
              1, // Radius of the landmark dot
              0,
              2 * Math.PI
            );
            canvasCtx.fillStyle = "red"; // Color for the landmarks
            canvasCtx.fill();
          }
        }
      }
    });

    // Set up the camera
    cameraRef.current = new cam.Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 480,
      height: 480,
    });
    cameraRef.current.start();

    // Clean up on component unmount
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      faceMesh.close();
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          marginLeft: 0,
          marginRight: 0,
        }}
      />
      <canvas
        ref={canvasRef}
        width={480}
        height={480}
        style={{
          border: "1px solid black",
          position: "absolute",
          left: 0,
          right: 0,
          marginLeft: 0,
          marginRight: 0,
        }}
      />
    </div>
  );
};

export default FaceDetection;
