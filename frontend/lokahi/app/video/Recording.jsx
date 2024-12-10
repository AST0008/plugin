"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Recording() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

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

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "400px", height: "300px", backgroundColor: "#ccc" }}
      ></video>
      <div className="flex gap-2 mt-2 ">
        {!isRecording && (
          <button className="btn btn-primary " onClick={startRecording}>
            Start Recording
          </button>
        )}
        {isRecording && (
          <button className="btn btn-primary " onClick={stopRecording}>
            Stop Recording
          </button>
        )}
        {!isRecording && videoChunks.length > 0 && (
          <>
            <button
              className="btn btn-primary"
              onClick={downloadVideoRecording}
            >
              Download Video+Audio
            </button>
            {audioChunks.length > 0 && (
              <button className="btn btn-primary" onClick={downloadAudioOnly}>
                Download Audio Only
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
