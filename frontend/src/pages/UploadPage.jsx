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
        className={`up-zone ${dragActive ? "up-zone--drag" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        role='button'
        tableIndex={0}
      >
        {isLoading ? (
          <p className='up-loading-title'>Analyzing Resume...</p>
        ) : (
          <>
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