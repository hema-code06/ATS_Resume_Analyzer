import { useState, useRef } from 'react';
import './UploadPage.css';

const UploadPage = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="up">
      <h1 className='up-headline'>
        Get Clear Insight, Into Your Skills.
      </h1>

      <input
        type="file"
        ref={fileInputRef}
        accept='.pdf,.docx'
        onChange={handleFileSelect}
        disabled={isLoading}
        hidden
      />

      <div
        className={`up-zone ${dragActive ? "up-zone--drag" : ""} ${isLoading ? "up-zone--loading" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isLoading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role='button'
        tabIndex={0}
      >
        {isLoading ? (
          <div className="up-loading">
            <div className="up-loading-spinner" />
            <p className='up-loading-title'>Analyzing Resume...</p>
            <p className="up-loading-sub">Extracting skills and matching roles</p>
          </div>
        ) : (
          <>
            <div className="up-zone-icon">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M17 22V6M17 6l-6.5 6.5M17 6l6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 24v2.5A1.5 1.5 0 007.5 28h19a1.5 1.5 0 001.5-1.5V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="up-zone-title">
              {dragActive ? "Release to analyze" : "Drag & Drop your resume"}
            </p>

            <p className='up-zone-sub'>
              or click anywhere to browse
            </p>

            <div className='up-pills'>
              <span className='up-pill'>PDF</span>
              <span className='up-pill'>DOCX</span>
            </div>
          </>
        )}
      </div>

      <p className='up-trust'>
        🔒 Your resume is never stored or shared
      </p>
    </div>
  )
}

export default UploadPage;
