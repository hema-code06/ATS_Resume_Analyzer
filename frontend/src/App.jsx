import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin } from "lucide-react";

const getColor = (color = "red") => {
  switch (color.toLowerCase()) {
    case "green":
      return "#22c55e";
    case "orange":
      return "#f59e0b";
    default:
      return "#ef4444";
  }
};

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a resume file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);
      setAiFeedback("");

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        { timeout: 30000 },
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error uploading resume");
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    if (!result?.resume_preview) return;

    try {
      setAiLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/ai-feedback",
        {
          text: result.resume_preview,
        },
        { timeout: 30000 },
      );

      setAiFeedback(res.data.ai_feedback || "");
    } catch (error) {
      console.error(error);
      alert("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const skills = result?.analysis?.found_skills || {};
  const roleMatch = result?.analysis?.role_match || {};

  const roleData = Object.entries(roleMatch).map(([role, score]) => ({
    name: role.replaceAll("_", " "),
    value: score,
  }));

  const topRole = Object.entries(roleMatch).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["", 0],
  )[0];

  return (
    <div className={`app ${result ? "active" : ""}`}>
      <img src="/logo.png" alt="Logo" className="app-logo" />

      <div className={`upload-wrapper ${result ? "moved" : ""}`}>
        <div className="upload-card">
          <p>Upload your resume (PDF / DOCX)</p>

          <input
            type="file"
            accept=".pdf,.docx"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0])}
          />

          <button onClick={() => fileInputRef.current.click()}>
            Select Resume
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>

          {result && (
            <div className="ats-box">
              <h2>Your ATS Score</h2>

              <div className="score-bar-wrap">
                <div className="score-bar-bg">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${result.analysis.ats_score || 0}%`,
                      transition: "width 0.6s ease-in-out",
                    }}
                  />

                  <div
                    className="score-marker"
                    style={{
                      left: `calc(${result.analysis.ats_score || 0}% - 10px)`,
                    }}
                  >
                    <MapPin size={20} color="#ef4444" />
                  </div>
                </div>

                <div className="score-label">
                  <span style={{ color: getColor(result.analysis.color) }}>
                    {result.analysis.ats_score || 0}%
                  </span>
                </div>
              </div>

              {topRole && (
                <p style={{ marginTop: 10 }}>
                  🏆 Best Match: <b>{topRole.replaceAll("_", " ")}</b>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="right-panel">
          <div className="result-card">
            <div className="skills-container">
              {Object.entries(skills).length > 0 ? (
                Object.entries(skills).map(([skill, score]) => (
                  <span key={skill} className="skill-chip">
                    {skill} ({score})
                  </span>
                ))
              ) : (
                <p className="empty-state">No strong skills detected yet</p>
              )}
            </div>

            <div className="section">
              <h3>🎯 Role Match</h3>

              {roleData.length > 0 ? (
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={roleData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label
                      >
                        {roleData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={index === 0 ? "#111827" : "#3b82f6"}
                            opacity={entry.value / 100}
                            stroke="#0f172a"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p>No role match data available</p>
              )}
            </div>

            <div className="section">
              <h3>💡 Feedback</h3>
              <ul>
                {(result.feedback?.basic || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <button onClick={generateAI} disabled={aiLoading}>
              {aiLoading ? "Generating AI..." : "Generate AI Feedback"}
            </button>

            {aiFeedback && (
              <div className="section fade-in">
                <h3>🤖 AI Feedback</h3>
                <ul>
                  {(aiFeedback || "")
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
              </div>
            )}

            <div className="section">
              <h3>📄 Resume Preview</h3>
              <p>{result.resume_preview}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
