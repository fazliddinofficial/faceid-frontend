import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import {
  addFaceDetection,
  checkAttendanceByFace,
  checkTeacherAttendance,
  getEmployeeByNum,
} from "../api";
import { isInAllowedArea } from "../utils/checkUserLocation";

const FaceDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name, setName] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDetecting = useRef(false);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Model loading failed:", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) startVideo();
  }, [modelsLoaded]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        alert("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        alert("No camera found on this device.");
      }
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };

    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      if (isDetecting.current) return;
      isDetecting.current = true;
      try {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }),
        );

        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const resized = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawDetections(canvas, [resized]); // wrap in array — drawDetections expects array
        }
      } finally {
        isDetecting.current = false;
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) return alert("Enter a number first");

    const video = videoRef.current!;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
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
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
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
        await checkTeacherAttendance(name);
        if (data.status === "on_time") {
          alert("Siz vaqtida keldingiz");
        } else if (data.status === "late") {
          alert(`Siz ${data.minutesLate} daqiqa kech qoldingiz`);
        } else {
          alert("Siz dars o'tqazib yubordingiz");
        }
      } catch (error: any) {
        alert(error.response?.data?.message);
      }
    }
  };

  function getUserLocation(): Promise<{
    lat: number;
    lon: number;
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(error.message));
        },
        { timeout: 10000, maximumAge: 0 },
      );
    });
  }

  async function checkAccess() {
    try {
      const { lat, lon } = await getUserLocation();
      const allowed = isInAllowedArea(lat, lon);
      console.log(allowed ? "✅ Access granted" : "❌ Access denied");
      return allowed;
    } catch (error: any) {
      console.error("Could not get location:", error.message);
      return false;
    }
  }

  useEffect(() => {
    checkAccess().then((allowed) => {
      setStatus(allowed ? "allowed" : "denied");
    });
  }, []);

  if (status === "checking") {
    return (
      <div>
        <p>⏳ Checking your location...</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div>
        <p>🚫 Access denied. You are outside the allowed area.</p>
      </div>
    );
  }

  if (status === "allowed") {
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
  }
};

export default FaceDetector;
