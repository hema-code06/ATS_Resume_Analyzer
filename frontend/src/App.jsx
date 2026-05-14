import { useState } from "react";
import "./App.css";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const [currentPage, setCurrentPage] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload PDF or DOCX", "error");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://ats-resume-analyzer-pgjt.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();

      setAnalysisData(data);
      setCurrentPage("results");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeNew = (file) => {
    handleUpload(file);
  };

  return (
    <div className="app">
      {currentPage === "upload" && (
        <UploadPage onUpload={handleUpload} isLoading={isLoading} />
      )}

      {currentPage === "results" && analysisData && (
        <ResultsPage data={analysisData} onAnalyzeNew={handleAnalyzeNew} />
      )}
    </div>
  );
}

export default App;
