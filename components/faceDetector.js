"use client";
import { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const wigRef = useRef(new Image());

  // Load the wig image once on component mount
  useEffect(() => {
    wigRef.current.src = "/wig.png"; // Path to your wig image
  }, []);

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
      // Clear the canvas for each frame
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // Use forehead landmarks for wig positioning
        const leftForehead = landmarks[9]; // Approximate forehead left
        const rightForehead = landmarks[107]; // Approximate forehead right
        const centerForehead = landmarks[10]; // Center of forehead for positioning

        // Calculate position for wig
        const wigX = centerForehead.x * canvasElement.width;
        const wigY = centerForehead.y * canvasElement.height;

        // Calculate width based on forehead width
        const wigWidth = 200;
        const wigHeight = 400;

        // Optional: calculate rotation angle based on forehead tilt
        const angle =
          Math.atan2(
            rightForehead.y - leftForehead.y,
            rightForehead.x - leftForehead.x
          ) *
          (180 / Math.PI);

        // Draw the wig image on the canvas
        canvasCtx.save();
        canvasCtx.translate(wigX, wigY); // Move to forehead position
        canvasCtx.rotate(((angle * Math.PI) / 180) * 2); // Rotate based on tilt
        canvasCtx.drawImage(
          wigRef.current,
          -wigWidth / 2, // Offset by half width for center positioning
          -wigHeight / 2, // Offset by half height for center positioning
          wigWidth,
          wigHeight
        );
        canvasCtx.restore();
      }
    });

    // Set up the camera
    cameraRef.current = new cam.Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
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
          visibility: "block",
        }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          border: "1px solid black",
          position: "absolute",
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
};

export default FaceDetection;
