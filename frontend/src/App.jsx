import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;
  const feedback = result?.feedback;

  return (
    <div className="app">
      <div className="container">
        <h1>🚀 ATS Resume Analyzer</h1>

        <div className="card">
          <input
            type="file"
            accept=".pdf,.docx"
            ref={fileInputRef}
            hidden
            onChange={(e) => setFile(e.target.files?.[0])}
          />

          <button onClick={() => fileInputRef.current.click()}>
            Select Resume
          </button>

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </div>

        {result && (
          <div className="results">
            {/* Score */}
            <div className="card center">
              <h2>ATS Score</h2>
              <div className="score">{analysis.ats_score}%</div>
              <p className="level">{feedback.level}</p>
            </div>

            <div className="card">
              <h3>Skills Found ({analysis.total_skills_found})</h3>
              <div className="skills">
                {analysis.found_skills.length > 0 ? (
                  analysis.found_skills.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills detected</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3>Top Role Matches</h3>

              {analysis.top_roles.map((role, index) => (
                <div key={index} className="role">
                  <div className="role-header">
                    <span>{role.role.replaceAll("_", " ")}</span>
                    <span>{role.match_percentage}%</span>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${role.match_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Feedback</h3>
              <p>{feedback.message}</p>

              <ul>
                {feedback.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
