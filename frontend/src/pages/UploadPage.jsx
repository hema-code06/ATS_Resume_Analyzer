import { useState, useRef } from "react";
import "./UploadPage.css";

const UploadPage = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div
          className={`upload-zone ${dragActive ? "drag-active" : ""} ${isLoading ? "loading" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            disabled={isLoading}
          />

          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <h2>{isLoading ? "Analyzing..." : "Analyze Your Resume"}</h2>

          {!isLoading && (
            <>
              <p>Drag and drop your resume here, or click to browse</p>
              <p>Supported formats: PDF, DOCX</p>
            </>
          )}

          {isLoading && (
            <div>
              <p>Processing your resume with AI...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
