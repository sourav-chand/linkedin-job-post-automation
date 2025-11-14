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
  const [postContent, setPostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [tone, setTone] = useState("professional");
  const [linkedinToken, setLinkedinToken] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [username, setUsername] = useState("");

  const handleGenerateAndPost = async () => {
    if (!postContent.trim()) {
      setMessage({ type: "error", text: "Please enter post content" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await api.post("/generate-and-post", {
        postContent,
        tone,
        date,
        time,
        linkedinToken,
        geminiApiKey,
        username,
      });

      if (data.success) {
        setGeneratedPost(data.generatedPost);
        console.log("cheduled");
        
        setMessage({
          type: "success",
          text: "Post scheduled successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to generate and schedule post",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to generate and schedule post";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">LinkedIn Access Token</label>
          <input
            type="text"
            value={linkedinToken}
            onChange={(e) => setLinkedinToken(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Gemini API Key</label>
          <input
            type="text"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              LinkedIn Content Poster
            </h1>
            <p className="text-gray-600">
              Generate AI-powered content and post it to LinkedIn
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

          {/* Post Input Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Create a Post
            </h2>
            <div className="flex flex-col gap-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="e.g., What are your thoughts on the future of AI?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                disabled={loading}
              />
              <div className="flex gap-4 items-center">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="professional">Professional</option>
                  <option value="funny">Funny</option>
                  <option value="inspirational">Inspirational</option>
                </select>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleGenerateAndPost}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {loading ? "Processing..." : "Generate & Schedule"}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Post */}
          {generatedPost && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Generated Post
              </h2>
              <div className="text-gray-600 whitespace-pre-line">
                {generatedPost}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
