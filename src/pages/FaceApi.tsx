import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import {
  addFaceDetection,
  checkAttendanceByFace,
  getEmployeeByNum,
} from "../api";

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

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };

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

  const handleRegister = async () => {
    if (!name.trim()) return alert("Enter a number first");

    const video = videoRef.current!;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return alert("No face detected!");

    const descriptor = Array.from(detection.descriptor);

    console.log("Saving:", { name, descriptor });

    try {
      await addFaceDetection({
        des: descriptor,
        employeeNo: name,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRecognize = async () => {
    const employee = await getEmployeeByNum(name);

    const video = videoRef.current!;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return alert("No face detected!");

    const compareDescriptors = (
      incoming: Float32Array,
      fromDB: number[] | Record<number, number>,
      threshold = 0.6,
    ): boolean => {
      const dbArray = Array.isArray(fromDB)
        ? new Float32Array(fromDB)
        : new Float32Array(Object.values(fromDB));

      const distance = faceapi.euclideanDistance(incoming, dbArray);
      return distance < threshold;
    };

    const isSame = compareDescriptors(
      detection.descriptor,
      employee.descriptor,
    );

    if (isSame) {
      try {
        const data = await checkAttendanceByFace(name);
        alert(data.message);
      } catch (error: any) {
        alert(error.response?.data?.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Video */}
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "auto", display: "block" }}
          autoPlay
          muted
          onPlay={handleVideoPlay}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Register */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Employee number to register"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              flex: "1 1 200px",
              padding: "10px 12px",
              borderRadius: 8,
              border: "0.5px solid #ccc",
              fontSize: 14,
              minWidth: 0,
            }}
          />
          <button
            onClick={handleRegister}
            disabled={!modelsLoaded}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: modelsLoaded ? "#1D9E75" : "#ccc",
              color: "#fff",
              cursor: modelsLoaded ? "pointer" : "not-allowed",
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Register Face
          </button>
        </div>

        {/* Recognize */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Employee number to check"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              flex: "1 1 200px",
              padding: "10px 12px",
              borderRadius: 8,
              border: "0.5px solid #ccc",
              fontSize: 14,
              minWidth: 0,
            }}
          />
          <button
            onClick={handleRecognize}
            disabled={!modelsLoaded}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: modelsLoaded ? "#378ADD" : "#ccc",
              color: "#fff",
              cursor: modelsLoaded ? "pointer" : "not-allowed",
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Check Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceDetector;
