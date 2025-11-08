import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function App() {
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedJob, setGeneratedJob] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Load cached job data from localStorage on component mount
  useEffect(() => {
    const cachedJob = localStorage.getItem("cachedJobData");
    if (cachedJob) {
      try {
        const parsedJob = JSON.parse(cachedJob);
        setGeneratedJob(parsedJob);
        setMessage({
          type: "success",
          text: "Loaded cached job description!",
        });
      } catch (e) {
        console.error("Failed to parse cached job data", e);
      }
    }
  }, []);

  const handleGenerateJob = async () => {
    if (!jobRole.trim()) {
      setMessage({ type: "error", text: "Please enter a job role" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await api.post("/generate", { jobRole });
      console.log(data);

      if (data.success) {
        setGeneratedJob(data.data);
        // Cache the job data in localStorage
        localStorage.setItem("cachedJobData", JSON.stringify(data.data));

        setMessage({
          type: "success",
          text: "Job description generated successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to generate job description",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to generate job description";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePostToLinkedIn = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await api.post("/post-to-linkedin", {
        jobs: generatedJob,
        date,
        time,
      });

      if (data.success) {
        setMessage({
          type: "success",
          text: "Job posted to LinkedIn successfully!",
        });
        // Clear cached job data after successful post
        localStorage.removeItem("cachedJobData");
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to post to LinkedIn",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to post to LinkedIn";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              LinkedIn Job Poster
            </h1>
            <p className="text-gray-600">
              Generate AI-powered job descriptions and post them to LinkedIn
            </p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Job Role Input Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Enter Job Role
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Developer"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                onKeyPress={(e) => e.key === "Enter" && handleGenerateJob()}
              />
              <button
                onClick={handleGenerateJob}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          {/* Generated Job Description */}
          {generatedJob && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {generatedJob.title}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  >
                    {showScheduleForm ? "Cancel Scheduling" : "Schedule Post"}
                  </button>
                  {showScheduleForm && (
                    <form
                      onSubmit={handlePostToLinkedIn}
                      className="flex flex-col gap-4"
                    >
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="border rounded-lg p-2"
                      />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        className="border rounded-lg p-2"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                      >
                        Schedule
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {generatedJob.description}
                </p>
              </div>

              {/* Responsibilities */}
              {generatedJob.responsibilities &&
                generatedJob.responsibilities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Key Responsibilities
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {generatedJob.responsibilities.map((resp, index) => (
                        <li key={index} className="text-gray-600">
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Requirements */}
              {generatedJob.requirements &&
                generatedJob.requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Requirements
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {generatedJob.requirements.map((req, index) => (
                        <li key={index} className="text-gray-600">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Skills */}
              {generatedJob.skills && generatedJob.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedJob.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedJob.experience && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-1">
                      Experience
                    </h4>
                    <p className="text-gray-600">{generatedJob.experience}</p>
                  </div>
                )}
                {generatedJob.education && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-1">
                      Education
                    </h4>
                    <p className="text-gray-600">{generatedJob.education}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            <p>Powered by Gemini AI and LinkedIn API</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
