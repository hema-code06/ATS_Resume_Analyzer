import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const getColor = (color) => {
  if (color === "green") return "#22c55e";
  if (color === "orange") return "#f59e0b";
  return "#ef4444";
};

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleUpload = async (selectedFile) => {
    const fileToUpload = selectedFile || file;

    if (!fileToUpload) return alert("Please upload a file!!");

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
      );
      setResult(response.data);
      setAiFeedback("");
    } catch (error) {
      console.error(error);
      alert("Error uploading file!!");
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    try {
      setAiLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/ai-feedback", {
        text: result?.resume_preview || "",
      });
      setAiFeedback(res.data.ai_feedback);
    } catch (error) {
      console.error(error);
      alert("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`app ${result ? "active" : ""}`}>
      <img src="/logo.png" alt="Logo" className="app-logo" />

      <div className={`upload-wrapper ${result ? "moved" : ""}`}>
        <div className="upload-card">
          <p>Drop your resume here or choose a file. PDF & DOCX only.</p>
          <input
            type="file"
            accept=".pdf,.docx"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              setFile(selectedFile);

              if (selectedFile) {
                handleUpload(selectedFile);
              }
            }}
          />

          <button onClick={() => fileInputRef.current.click()}>
            {loading ? "Analyzing..." : "Analyze your resume"}
          </button>

          {result && (
            <div className="ats-box">
              <h2>Your Score</h2>

              <div className="circle-wrap">
                <svg className="circle" viewBox="0 0 36 36">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  <path
                    className="circle-progress"
                    strokeDasharray={`${result.analysis.ats_score}, 100`}
                    d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="circle-text">
                  <span style={{ color: getColor(result.analysis.color) }}>
                    {result.analysis.ats_score}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="right-panel">
          <div className="result-card">
            <div className="section">
              <h3>✅ Found Skills</h3>
              <p>
                {Array.isArray(result?.analysis?.found_skills)
                  ? result.analysis.found_skills.join(", ")
                  : Object.keys(result?.analysis?.found_skills || {}).join(
                      ", ",
                    ) || "None"}
              </p>
            </div>

            <div className="section">
              <h3>📄 Missing Sections</h3>
              <p>
                {(result.analysis?.missing_sections || []).join(", ") || "None"}
              </p>
            </div>

            <div className="section">
              <h3>🎯 Role Match</h3>
              {Object.entries(result.analysis.role_match).map(
                ([role, score]) => (
                  <p key={role}>
                    {role.replace("_", " ")}: <strong>{score}%</strong>
                  </p>
                ),
              )}
            </div>
            <div className="section">
              <h3>💡 Feedback</h3>
              <ul>
                {result.feedback.basic?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <button onClick={generateAI}>
              {aiLoading ? "Generating..." : "Generate AI Feedback"}
            </button>

            {aiFeedback && (
              <div className="section fade-in">
                <h3>🤖 AI Feedback</h3>
                <ul>
                  {aiFeedback.split("\n").map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
