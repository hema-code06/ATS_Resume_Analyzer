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

  useEffect(() => {
    fetch(`${API_URL}/`).catch(() => { });
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF or DOCX");
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

  return (
    <div className="app">
      <Toaster position="top-center" />
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
