import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";

const FaceDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) startVideo();
  }, [modelsLoaded]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  };

  const handleVideoPlay = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
    }, 100);
  };

  // ✅ This is the new function you needed
  const handleRegister = async () => {
    if (!name.trim()) return alert("Enter a name first");

    const video = videoRef.current!;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor(); // ← gives you the 128D vector

    if (!detection) return alert("No face detected!");

    const descriptor = Array.from(detection.descriptor); // Float32Array → number[]

    console.log("Saving:", { name, descriptor });

    // TODO: send to your backend
    // await fetch('/api/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, descriptor }),
    // });

    alert(`Face registered for ${name}!`);
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          width={720}
          height={560}
          autoPlay
          muted
          onPlay={handleVideoPlay}
        />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>

      {/* Register controls */}
      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Enter person's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleRegister} disabled={!modelsLoaded}>
          Register Face
        </button>
      </div>
    </div>
  );
};

export default FaceDetector;
