import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
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

  return (
    <div style={{ padding: "40px", fontFamily: "Cambria" }}>
      <h1>ATS Resume Analyzer</h1>

      <input
        type="file"
        accept=".pdf, .docx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleUpload}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>ATS Score: {result.ats_score}%</h2>
          <h3>Found Skills:</h3>
          <p>{result.found_skills.join(", ")}</p>

          <h3>Missing Skills:</h3>
          <p>{result.missing_skills.join(", ")}</p>

          <h3>Feedback:</h3>
          <ul>
            {result.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
