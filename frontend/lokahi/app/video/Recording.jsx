"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Recording() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isUploading, setUploading] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false); // Indicates that a recording was completed

  const videoRef = useRef(null);

  // Request access to camera and microphone
  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
    getMedia();
  }, []);

  // Initialize MediaRecorders when we have a stream
  useEffect(() => {
    if (mediaStream) {
      // Recorder for video + audio
      const videoAudioRecorder = new MediaRecorder(mediaStream);
      videoAudioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setVideoChunks((prev) => [...prev, event.data]);
        }
      };
      videoAudioRecorder.onstop = () => {
        // When this fires, all video chunks have been added
        // We'll rely on the user to click "Upload Recordings"
      };

      setMediaRecorder(videoAudioRecorder);

      // Extract audio track only
      const audioTracks = mediaStream.getAudioTracks();
      const audioOnlyStream = new MediaStream(audioTracks);
      const audioOnlyRecorder = new MediaRecorder(audioOnlyStream);
      audioOnlyRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };
      audioOnlyRecorder.onstop = () => {
        // All audio chunks ready here as well
      };

      setAudioRecorder(audioOnlyRecorder);
    }
  }, [mediaStream]);

  const startRecording = () => {
    if (
      mediaRecorder &&
      audioRecorder &&
      mediaRecorder.state !== "recording" &&
      audioRecorder.state !== "recording"
    ) {
      setVideoChunks([]);
      setAudioChunks([]);
      setIsRecorded(false);
      mediaRecorder.start();
      audioRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && audioRecorder) {
      if (mediaRecorder.state === "recording") mediaRecorder.stop();
      if (audioRecorder.state === "recording") audioRecorder.stop();
      setIsRecording(false);
      setIsRecorded(true);
    }
  };

  const downloadVideoRecording = () => {
    if (videoChunks.length) {
      const blob = new Blob(videoChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "recording_with_audio.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadAudioOnly = () => {
    if (audioChunks.length) {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "audio_only.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const uploadRecordings = async () => {
    if (videoChunks.length === 0 && audioChunks.length === 0) {
      console.warn("No recordings to upload.");
      return;
    }

    setUploading(true);

    try {
      const videoBlob = new Blob(videoChunks, { type: "video/webm" });
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("video", videoBlob, "recording_with_audio.webm");
      formData.append("audio", audioBlob, "audio_only.webm");

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Recordings uploaded successfully!");
        // Reset chunks after successful upload
        setVideoChunks([]);
        setAudioChunks([]);
        setIsRecorded(false);
      } else {
        console.error("Upload failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading recordings:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "400px", height: "300px", backgroundColor: "#ccc" }}
      ></video>
      <div className="flex gap-2 mt-2">
        {!isRecording && !isUploading && (
          <button className="btn btn-primary" onClick={startRecording}>
            Start Recording
          </button>
        )}
        {isRecording && (
          <button className="btn btn-primary" onClick={stopRecording}>
            Stop Recording
          </button>
        )}

        {/* Only show download buttons if we have recorded something and aren't recording now */}
        {!isRecording && isRecorded && videoChunks.length > 0 && (
          <>
            <button className="btn btn-primary" onClick={downloadVideoRecording}>
              Download Video+Audio
            </button>
            {audioChunks.length > 0 && (
              <button className="btn btn-primary" onClick={downloadAudioOnly}>
                Download Audio Only
              </button>
            )}
            {!isUploading && (
              <button className="btn btn-primary" onClick={uploadRecordings}>
                Upload Recordings
              </button>
            )}
          </>
        )}

        {isUploading && (
          <div className="mt-2 text-sm text-gray-500">
            Uploading recordings...
          </div>
        )}
      </div>
    </div>
  );
}
