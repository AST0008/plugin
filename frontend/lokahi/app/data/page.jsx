"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/components/supabase"; // Adjust the path to your Supabase client file

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedRecordings, setGroupedRecordings] = useState({});

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("recordings").select("*");

      if (error) {
        console.error("Error fetching recordings:", error);
      } else {
        setRecordings(data);
        groupBySession(data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const groupBySession = (data) => {
    const grouped = data.reduce((acc, recording) => {
      const sessionId = recording.session_id || "No Session ID";
      if (!acc[sessionId]) {
        acc[sessionId] = [];
      }
      acc[sessionId].push(recording);
      return acc;
    }, {});
    setGroupedRecordings(grouped);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Recordings</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 animate-pulse rounded-lg p-6 h-40"
            ></div>
          ))}
        </div>
      ) : (
        Object.keys(groupedRecordings).map((sessionId) => (
          <div key={sessionId} className="mb-8">
            {/* Session Header */}
            <h2 className="text-xl font-bold text-gray-400 mb-4">
              Session ID: {sessionId}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedRecordings[sessionId].map((recording) => (
                <div
                  key={recording.id}
                  className="bg-base-300 shadow-md rounded-lg p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-400 mb-4">
                    Recording ID: {recording.id}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Created At:</strong>{" "}
                    {new Date(recording.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Question ID:</strong>{" "}
                    {recording.question_id || "N/A"}
                  </p>

                  <div className="flex justify-between mt-4">
                    <a
                      href={recording.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md"
                    >
                      Listen Audio
                    </a>
                    <a
                      href={recording.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-white bg-green-500 hover:bg-green-700 px-4 py-2 rounded-md"
                    >
                      Watch Video
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
