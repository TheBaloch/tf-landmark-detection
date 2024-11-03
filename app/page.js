"use client";
import dynamic from "next/dynamic";

// Import FaceDetection with SSR disabled
const FaceDetection = dynamic(() => import("@/components/faceDetector"), {
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <h1>Face Detection with Wig Overlay</h1>
      <FaceDetection />
    </div>
  );
}
