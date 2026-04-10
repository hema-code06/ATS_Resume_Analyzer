import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MapPin } from "lucide-react";

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

              <div className="score-bar-wrap">
                <div className="score-bar-bg">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${result.analysis.ats_score}%` }}
                  />

                  <div
                    className="score-marker"
                    style={{
                      left: `calc(${result.analysis.ats_score}% - 10px)`,
                    }}
                  >
                    <MapPin size={20} color="#ef4444" />
                  </div>
                </div>

                <div className="score-label">
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
            <div className="skills-container">
              {(Array.isArray(result?.analysis?.found_skills)
                ? result.analysis.found_skills
                : Object.keys(result?.analysis?.found_skills || {})
              ).length > 0 ? (
                (Array.isArray(result?.analysis?.found_skills)
                  ? result.analysis.found_skills
                  : Object.keys(result?.analysis?.found_skills || {})
                ).map((skill, i) => (
                  <span key={i} className="skill-chip">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="empty-state">No skills detected</p>
              )}
            </div>

            <div className="section">
              <h3>📄 Missing Sections</h3>
              <p>
                {(result.analysis?.missing_sections || []).join(", ") || "None"}
              </p>
            </div>

            <div className="section">
              <h3>🎯 Role Match</h3>

              <div style={{ width: "100%", height: 420 }}>
                <ResponsiveContainer>
                  <PieChart
                    margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Pie
                      data={Object.entries(result.analysis.role_match).map(
                        ([role, score]) => ({
                          name: role.replaceAll("_", " "),
                          value: score,
                        }),
                      )}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={450}
                      innerRadius={0}
                      outerRadius={120}
                      paddingAngle={2}
                      isAnimationActive={true}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {Object.entries(result.analysis.role_match).map(
                        ([role, score], index) => {
                          const maxScore = 100; 
                          const sizeFactor = score / maxScore;

                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                score ===
                                Math.max(
                                  ...Object.values(result.analysis.role_match),
                                )
                                  ? "#111827"
                                  : "#3b82f6"
                              }
                              opacity={score / 100}
                              stroke="#0f172a"
                              strokeWidth={1}
                              style={{
                                transform: `scale(${0.6 + sizeFactor * 0.8})`,
                                transformOrigin: "center",
                              }}
                            />
                          );
                        },
                      )}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
