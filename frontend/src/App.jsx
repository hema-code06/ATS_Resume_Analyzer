import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a file!!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error uploading file!!");
    } finally {
      setLoading(false);
    }
  };
  const generateAI = async () => {
    const res = await axios.post("http://127.0.0.1:8000/ai-feedback", {
      text: result.resume_text,
    });

    setAiFeedback(res.data.ai_feedback);
  };

  return (
    <div className="container">
      <h1>ATS Resume Analyzer</h1>
      <div className="card">
        <input
          type="file"
          accept=".pdf, .docx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload}>
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      {result && (
        <div className="result-card">
          <h2>ATS Score</h2>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${result.ats_score}%` }}
            ></div>
          </div>
          <p className="score-text">{result.ats_score}%</p>

          <div className="section">
            <h3>✅ Found Skills</h3>
            <p>{result.found_skills.join(", ")}</p>
          </div>

          <div className="section">
            <h3>❌ Missing Skills</h3>
            <p>{result.missing_skills.join(", ")}</p>
          </div>

          <div className="section">
            <h3>💡 Feedback</h3>
            <ul>
              {result.basic_feedback?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <button onClick={generateAI}>Generate AI Feedback</button>
          {aiFeedback && (
            <div className="section">
              <h3>🤖 AI Feedback</h3>
              <ul>
                {aiFeedback.split("\n").map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
