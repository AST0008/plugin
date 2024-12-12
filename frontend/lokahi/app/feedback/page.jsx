"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    experience: "",
    suggestions: "",
    easeOfUse: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback Submitted:", formData);
    setSubmitted(true);

    // Simulate a 1.5-minute delay to transition to the report page
    setTimeout(() => {
      router.push("/report"); // Navigate to the report page
    }, 1500); // 1.5 seconds delay (adjustable for actual report generation time)
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-base-200 p-6">
      {!submitted ? (
        <div className="bg-base-300 rounded-lg shadow-md p-8 w-full max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-4">
            Your Feedback Matters!
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Please help us improve by providing your feedback while we generate
            your report.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Experience Feedback */}
            <div>
              <label
                htmlFor="experience"
                className="block mb-3 text-gray-400 font-medium"
              >
                How was your experience with the recording process?
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                placeholder="Your feedback here..."
                required
              ></textarea>
            </div>

            {/* Suggestions */}
            <div>
              <label
                htmlFor="suggestions"
                className="block mb-3 text-gray-400 font-medium"
              >
                Do you have any suggestions for improvement?
              </label>
              <textarea
                id="suggestions"
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                placeholder="Your suggestions here..."
              ></textarea>
            </div>

            {/* Ease of Use Rating */}
            <div>
              <label
                htmlFor="easeOfUse"
                className=" mb-3 text-gray-400 font-medium"
              >
                How easy was it to use the app? (1 = Difficult, 10 = Very Easy)
              </label>
              <input
                type="range"
                id="easeOfUse"
                name="easeOfUse"
                min="1"
                max="10"
                value={formData.easeOfUse}
                onChange={handleChange}
                className="range range-primary"
              />
              <div className="text-center mt-2">{formData.easeOfUse}/10</div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button type="submit" className="btn btn-primary w-full">
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Thank You for Your Feedback!</h1>
          <p className="text-gray-600 mb-6">
            We appreciate your input. Your report will be ready shortly.
          </p>
          <div className="loader"></div> {/* Optional loader animation */}
        </div>
      )}
    </div>
  );
}
