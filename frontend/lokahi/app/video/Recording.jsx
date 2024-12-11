"use client";

import React, { useEffect, useRef, useState } from "react";

const Questions = [
  "What is your favorite color?",
  "What is your favorite food?",
  "What is your favorite movie?",
  "What is your favorite book?",
];

export default function Recording() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [responses, setResponses] = useState([]); // Store all video/audio responses
  const [isUploading, setUploading] = useState(false);
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
      videoAudioRecorder.onstop = () => {
        // When this fires, all video chunks have been added
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

  // Start recording for a specific question
  const startRecording = () => {
    if (mediaRecorder && audioRecorder && mediaRecorder.state !== "recording") {
      setIsRecording(true);
      setVideoChunks([]); // Reset video chunks for the new question
      setAudioChunks([]); // Reset audio chunks for the new question
      mediaRecorder.start();
      audioRecorder.start();
    }
  };

  // Stop recording for the current question
  const stopRecording = () => {
    if (mediaRecorder && audioRecorder) {
      setIsRecording(false);
      mediaRecorder.stop();
      audioRecorder.stop();
      // Store the recording data in responses for the current question
      setResponses((prev) => [
        ...prev,
        { video: videoChunks, audio: audioChunks },
      ]);
    }
  };

  // Move to the next question
  const nextQuestion = () => {
    if (currentQuestion < Questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert("You have completed the quiz!");
    }
  };

  // Upload the responses to the server
  const uploadRecordings = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      responses.forEach((response, index) => {
        const videoBlob = new Blob(response.video, { type: "video/webm" });
        const audioBlob = new Blob(response.audio, { type: "audio/webm" });

        formData.append("files", videoBlob, `video_${index + 1}.webm`);
        formData.append("files", audioBlob, `audio_${index + 1}.webm`);
      });
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1].name}`);
      }

      // Example API call (you can replace with your own backend URL)
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Recordings uploaded successfully!");
      } else {
        alert("Failed to upload recordings.");
      }
    } catch (error) {
      console.error("Error uploading recordings:", error);
    }
    setUploading(false);
  };

  return (
    <div>
      <h1>{Questions[currentQuestion]}</h1>
      <video ref={videoRef} autoPlay muted />
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
      <div>
        {currentQuestion < Questions.length - 1 ? (
          <button onClick={nextQuestion} disabled={isRecording}>
            Next Question
          </button>
        ) : (
          <button onClick={uploadRecordings} disabled={isUploading}>
            Upload Recordings
          </button>
        )}
      </div>
    </div>
  );
}
