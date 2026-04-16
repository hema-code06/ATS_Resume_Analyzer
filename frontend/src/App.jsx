import { useState } from "react";
import "./App.css";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "loading" && "⟳"}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpload = async (file) => {
    if (!file) {
      showToast("Please select a file", "error");
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      showToast("Invalid file type. Please upload PDF or DOCX", "error");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
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
      showToast("Failed to analyze resume. Please try again.", "error");
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
