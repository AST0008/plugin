"use client";

import React, { useRef, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { jsPDF } from "jspdf";
import { useRouter } from "next/navigation";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Report = () => {
  const router = useRouter();

  // Sample data, in practice, this data would likely come from an API or be passed as props
  const [rating, setRating] = useState(7); // Rating out of 10
  const [corrections, setCorrections] = useState(
    ' Grammar mistakes: "um" and "uh" are used incorrectly and repeatedly. Overuse of filler words: "like" is used too often. Unnatural pauses or hesitations: There are some pauses in the speech that seem unnatural'
  );
  const [thingsCouldBeBetter, setThingsCouldBeBetter] = useState(
    ' - Sentence variety: The speech could have been more engaging by using different sentence structures and varied vocabulary. Vocabulary usage: There are some words that are used too often, such as "like" and "um." Overall engagement: The speech could have been more engaging by using more body language and gestures. Using a more varied vocabulary would help capture the interviewers attention.'
  );
  const [suggestions, setSuggestions] = useState(
    " Practice exercises: The user could benefit from practicing more speaking exercises to improve their grammar, pronunciation, and fluency. Learning resources: The user could benefit from learning more about grammar, pronunciation, and fluency through online resources or tutoring. Interactive activities: The user could benefit from participating in interactive activities, such as speaking clubs or self-review, to improve their speaking skills. Expert guidance: The user could benefit from seeking expert guidance, such as from a tutor or workshop, to improve their speaking skills."
  );
  const [grammaticalErrors, setGrammaticalErrors] = useState(3); // Number of grammatical errors
  const [stuttering, setStuttering] = useState(2); // Number of stuttering occurrences

  // Refs to capture chart instances
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  // Pie Chart Data for Rating
  const ratingData = {
    labels: ["Rating", "Remaining"],
    datasets: [
      {
        label: "Rating out of 10",
        data: [rating, 10 - rating],
        backgroundColor: ["#4CAF50", "#E0E0E0"],
        borderColor: ["#388E3C", "#E0E0E0"],
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart Data for Grammatical Errors and Stuttering
  const errorsData = {
    labels: ["Grammatical Errors", "Stuttering"],
    datasets: [
      {
        label: "Errors/Issues",
        data: [grammaticalErrors, stuttering],
        backgroundColor: ["#FF5733", "#FF8C00"],
        borderColor: ["#C0392B", "#F39C12"],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: ["Grammatical Errors", "Stuttering"],
    datasets: [
      {
        label: "Count",
        data: [grammaticalErrors, stuttering],
        backgroundColor: "#FF9800", // Orange for both
        borderColor: "#F57C00",
        borderWidth: 1,
      },
    ],
  };

  const handleDownload = async () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Recording Report", 14, 20);

    doc.setFontSize(14);
    doc.text(`Rating: ${rating}/10`, 14, 30);
    doc.text(`Corrections: ${corrections}`, 14, 40);
    doc.text(
      `Things that could have been better: ${thingsCouldBeBetter}`,
      14,
      50
    );
    doc.text(`Suggestions: ${suggestions}`, 14, 60);

    // Delay to ensure charts are rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (pieChartRef.current && pieChartRef.current.chart) {
      const pieChartImage = pieChartRef.current.chart.toBase64Image();
      doc.addImage(pieChartImage, "PNG", 14, 70, 100, 60);
    } else {
      console.error("Pie chart not found or not rendered.");
    }

    if (barChartRef.current && barChartRef.current.chart) {
      const barChartImage = barChartRef.current.chart.toBase64Image();
      doc.addImage(barChartImage, "PNG", 14, 140, 180, 90);
    } else {
      console.error("Bar chart not found or not rendered.");
    }

    doc.save("recording_report.pdf");
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center py-8">
      <button
        onClick={() => router.push("/data")}
        className="absolute top-10 right-12 btn btn-secondary"
      >
        Previous Recordings
      </button>
      <h1 className="text-3xl font-bold text-center  mb-6">Recording Report</h1>
      <div className="w-full max-w-4xl bg-gray-800  p-6 rounded-lg shadow-lg">
        <div className="flex flex-1 gap-8 m-5 mt-14 ">
          {/* Rating Section with Pie Chart */}
          <div className=" mb-14 mx-10">
            <h2 className="text-xl font-semibold ">Rating: {rating}/10</h2>
            <div className="flex justify-center mt-4">
              {/* Pie Chart (Smaller size) */}
              <div className="w-48 h-48">
                <Pie
                  data={ratingData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false, // Hide legend for cleaner UI
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Grammatical Errors and Stuttering Section with Bar Chart */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold ">
              Grammatical Errors and Stuttering
            </h2>
            <div className="flex justify-center mt-4">
              {/* Bar Chart for grammatical errors and stuttering */}
              <div className="w-full max-w-md">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    scales: {
                      x: {
                        beginAtZero: true,
                      },
                      y: {
                        beginAtZero: true,
                      },
                    },
                    plugins: {
                      legend: {
                        display: false, // Hide legend for cleaner UI
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Corrections Section */}
        <div className="mb-6">
          <div className="alert alert-info shadow-lg">
            <div>
              <span className="font-semibold">
                Corrections/What Went Wrong:
              </span>{" "}
              {corrections}
            </div>
          </div>
        </div>

        {/* Things That Could Have Been Better */}
        <div className="mb-6">
          <div className="alert alert-warning shadow-lg">
            <div>
              <span className="font-semibold">
                Things That Could Have Been Better:
              </span>{" "}
              {thingsCouldBeBetter}
            </div>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="mb-6">
          <div className="alert alert-success shadow-lg">
            <div>
              <span className="font-semibold">Suggestions:</span> {suggestions}
            </div>
          </div>
        </div>

        {/* Grammatical Errors and Stuttering Section */}
        <div className="mb-6">
          <div className="alert alert-error shadow-lg">
            <div>
              <span className="font-semibold">Grammatical Errors:</span>{" "}
              {grammaticalErrors}
            </div>
            <div>
              <span className="font-semibold">Stuttering:</span> {stuttering}
            </div>
          </div>
        </div>

        {/* Additional Action Button */}
        <div className="flex justify-center">
          <button onClick={handleDownload} className="btn btn-primary">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
