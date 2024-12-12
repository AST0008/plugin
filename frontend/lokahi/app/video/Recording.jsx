"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Questions = [
  "What is your favorite color?",
  "What is your favorite food?",
  "What is your favorite movie?",
  "What is your favorite book?",
];

export default function Recording() {
  const router = useRouter();
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
  const [recordingTime, setRecordingTime] = useState(0); // Recording timer

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

  const handleStartStop = () => {
    if (isRecording) {
      mediaRecorder.stop();
      audioRecorder.stop();
      setIsRecording(false);
    } else {
      mediaRecorder.start();
      audioRecorder.start();
      setIsRecording(true);
      setRecordingTime(0); // Reset recording time
    }
  };
  const handleNextQuestion = () => {
    setResponses([...responses, { video: videoChunks, audio: audioChunks }]);
    setVideoChunks([]); // Reset video chunks
    setAudioChunks([]); // Reset audio chunks
    setCurrentQuestion((prev) => (prev + 1) % Questions.length); // Loop through questions
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);
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
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Recordings uploaded successfully!");
        router.push("/feedback");
      } else {
        alert("Failed to upload recordings.");
      }
    } catch (error) {
      console.error("Error uploading recordings:", error);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-base-200 justify-center  p-4">
      <div className=" w-screen max-w-md bg-slate-600 rounded-lg shadow-lg p-6">
        {/* Video Preview */}
        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full  rounded-lg border-2 border-gray-300"
          ></video>
        </div>

        {/* Question */}
        <div className="mb-6 text-center text-xl font-semibold">
          <p>{Questions[currentQuestion]}</p>
        </div>

        {/* Recording Timer */}
        <div className="mb-6 text-center">
          <p className="text-lg">
            {isRecording ? `Recording: ${recordingTime}s` : "Ready to Record"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStartStop}
            className={`btn w-24 ${isRecording ? "btn-danger" : "btn-success"}`}
          >
            {isRecording ? "Stop" : "Start"}
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={isRecording || isUploading}
            className="btn w-24 btn-primary"
          >
            Next
          </button>
        </div>

        {/* Uploading Feedback */}
        {isUploading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Uploading...</p>
            <div className="w-16 h-16 mx-auto border-t-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={uploadRecordings}
            disabled={isUploading || responses.length != 4}
            className="btn py-2 px-4 rounded-lg text-white bg-purple-500 hover:bg-purple-600"
          >
            Upload Response
          </button>
        </div>
      </div>
    </div>
  );
}
