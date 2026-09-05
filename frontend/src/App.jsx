import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [currentPage, setCurrentPage] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/`).catch(() => {});
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, DOCX, JPG, or PNG");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();

      setAnalysisData(data);
      setResumeFile(file);
      setCurrentPage("results");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeNew = (file) => {
    handleUpload(file);
  };

  const handleMatchJD = async (jobDescription) => {
    if (!resumeFile) {
      throw new Error("No resume available to match. Please upload again.");
    }

    const formData = new FormData();
    formData.append("file", resumeFile);
    formData.append("job_description", jobDescription);

    const response = await fetch(`${API_URL}/match-jd`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.detail || "Could not match against this job description",
      );
    }

    return response.json();
  };

  return (
    <div className="app">
      <Toaster position="top-center" />
      {currentPage === "upload" && (
        <UploadPage onUpload={handleUpload} isLoading={isLoading} />
      )}

      {currentPage === "results" && analysisData && (
        <ResultsPage
          key={analysisData.filename}
          data={analysisData}
          onAnalyzeNew={handleAnalyzeNew}
          isLoading={isLoading}
          onMatchJD={handleMatchJD}
        />
      )}
    </div>
  );
}

export default App;
