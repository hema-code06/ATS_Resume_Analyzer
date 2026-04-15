import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const Toast = ({ message, type, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50, x: "-50%" }}
      className={`toast toast-${type}`}
    >
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
    </motion.div>
  );
};

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
      <motion.div
        className="upload-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className={`upload-zone ${dragActive ? "drag-active" : ""} ${isLoading ? "loading" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            disabled={isLoading}
          />

          <motion.div
            className="upload-icon"
            animate={{
              rotate: isLoading ? 360 : 0,
              scale: isLoading ? [1, 1.1, 1] : 1,
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity },
            }}
          >
            {isLoading ? (
              <svg
                className="upload-icon-svg loading"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="2"
                  strokeDasharray="31.4"
                  strokeDashoffset="10"
                />
              </svg>
            ) : (
              <svg
                className="upload-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </motion.div>

          <h2 className="upload-title">
            {isLoading ? "Analyzing..." : "Analyze Your Resume"}
          </h2>

          {!isLoading && (
            <>
              <p className="upload-text">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="upload-formats">Supported formats: PDF, DOCX</p>
            </>
          )}

          {isLoading && (
            <div className="loading-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              <p className="loading-text">Processing your resume with AI...</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

const ResultsPage = ({ data, onAnalyzeNew }) => {
  const { analysis, feedback, filename } = data;
  const fileInputRef = useRef(null);

  const getScoreColor = (score) => {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 55) return "fair";
    return "poor";
  };

  const getLevelBadge = (level) => {
    const badges = {
      Excellent: { color: "#059669", bg: "#d1fae5" },
      Good: { color: "#2563eb", bg: "#dbeafe" },
      Fair: { color: "#d97706", bg: "#fef3c7" },
      Poor: { color: "#dc2626", bg: "#fee2e2" },
    };
    return badges[level] || badges["Fair"];
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyzeNew(e.target.files[0]);
    }
  };

  return (
    <div className="results-page">
      <motion.div
        className="results-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="header-content">
          <div className="header-right">
            <p className="results-filename">
              <svg
                className="file-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {filename}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <button
              className="analyze-new-button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new resume"
            >
              <svg
                className="button-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </button>
          </div>
        </div>

        <motion.div
          className="score-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="score-header">
            <div>
              <h2 className="score-label">
                ATS Score{" "}
                <p className="results-filename">
                  <svg
                    className="file-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {filename}
                </p>
              </h2>
            </div>
            <div
              className="level-badge"
              style={{
                backgroundColor: getLevelBadge(feedback.level).bg,
                color: getLevelBadge(feedback.level).color,
              }}
            >
              {feedback.emoji} {feedback.level}
            </div>
          </div>

          <div className="score-display">
            <motion.div
              className={`score-circle score-${getScoreColor(analysis.ats_score)}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
            >
              <motion.div
                className="score-number"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                {analysis.ats_score}
              </motion.div>
              <div className="score-max">/100</div>
            </motion.div>

            <div className="score-info">
              <p className="score-message">{feedback.message}</p>
              <div className="skill-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Skills</span>
                  <span className="stat-value">
                    {analysis.total_skills_found}
                  </span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-label">High Value</span>
                  <span className="stat-value high-value">
                    {feedback.skill_breakdown.high_value_count}
                  </span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-label">Medium Value</span>
                  <span className="stat-value medium-value">
                    {feedback.skill_breakdown.medium_value_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {feedback.insights && feedback.insights.length > 0 && (
          <motion.div
            className="insights-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="section-title">
              <svg
                className="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI-Powered Insights
            </h2>
            <div className="insights-grid">
              {feedback.insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  className="insight-card"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <div className="insight-marker"></div>
                  <p className="insight-text">{insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="roles-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="section-title">
            <svg
              className="section-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Top Role Matches
          </h2>
          <div className="roles-grid">
            {analysis.top_roles.map((role, idx) => (
              <motion.div
                key={idx}
                className="role-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="role-header">
                  <div className="role-rank">#{idx + 1}</div>
                  <div className="role-info">
                    <h3 className="role-title">{role.role_title}</h3>
                    <p className="role-category">{role.role_category}</p>
                  </div>
                  <div className="role-match">
                    <div
                      className={`match-percentage match-${getScoreColor(role.match_percentage)}`}
                    >
                      {role.match_percentage}%
                    </div>
                    <span className="match-label">Match</span>
                  </div>
                </div>

                <div className="role-details">
                  <div className="match-rates">
                    <div className="match-rate-item">
                      <span className="rate-label">Required Skills</span>
                      <div className="rate-bar">
                        <motion.div
                          className="rate-fill required"
                          initial={{ width: 0 }}
                          animate={{ width: `${role.required_match_rate}%` }}
                          transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                        />
                      </div>
                      <span className="rate-value">
                        {role.required_match_rate}%
                      </span>
                    </div>
                    <div className="match-rate-item">
                      <span className="rate-label">Preferred Skills</span>
                      <div className="rate-bar">
                        <motion.div
                          className="rate-fill preferred"
                          initial={{ width: 0 }}
                          animate={{ width: `${role.preferred_match_rate}%` }}
                          transition={{ duration: 1, delay: 0.7 + idx * 0.1 }}
                        />
                      </div>
                      <span className="rate-value">
                        {role.preferred_match_rate}%
                      </span>
                    </div>
                  </div>

                  {role.skills_you_have && role.skills_you_have.length > 0 && (
                    <div className="skills-section">
                      <h4 className="skills-heading">
                        <svg
                          className="heading-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Your Matching Skills
                      </h4>
                      <div className="skills-tags">
                        {role.skills_you_have.map((skill, skillIdx) => (
                          <motion.span
                            key={skillIdx}
                            className="skill-tag matched"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.7 + idx * 0.1 + skillIdx * 0.05,
                            }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                        {role.total_matched_skills >
                          role.skills_you_have.length && (
                          <span className="skill-tag more">
                            +
                            {role.total_matched_skills -
                              role.skills_you_have.length}{" "}
                            more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {role.missing_required_skills &&
                    role.missing_required_skills.length > 0 && (
                      <div className="skills-section">
                        <h4 className="skills-heading critical">
                          <svg
                            className="heading-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Missing Required Skills
                        </h4>
                        <div className="skills-tags">
                          {role.missing_required_skills.map(
                            (skill, skillIdx) => (
                              <motion.span
                                key={skillIdx}
                                className="skill-tag missing required"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.8 + idx * 0.1 + skillIdx * 0.05,
                                }}
                              >
                                {skill}
                              </motion.span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {role.missing_preferred_skills &&
                    role.missing_preferred_skills.length > 0 && (
                      <div className="skills-section">
                        <h4 className="skills-heading">
                          <svg
                            className="heading-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          Missing Preferred Skills
                        </h4>
                        <div className="skills-tags">
                          {role.missing_preferred_skills.map(
                            (skill, skillIdx) => (
                              <motion.span
                                key={skillIdx}
                                className="skill-tag missing preferred"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.9 + idx * 0.1 + skillIdx * 0.05,
                                }}
                              >
                                {skill}
                              </motion.span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  <div className="role-footer">
                    <span className="footer-stat">
                      <svg
                        className="footer-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {role.total_matched_skills} skills matched
                    </span>
                    <span className="footer-divider">•</span>
                    <span className="footer-stat">
                      <svg
                        className="footer-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {role.total_missing_skills} to learn
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="all-skills-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="section-title">
            <svg
              className="section-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            All Detected Skills ({analysis.total_skills_found})
          </h2>
          <div className="all-skills-container">
            <div className="skills-tags-grid">
              {analysis.found_skills.map((skill, idx) => (
                <motion.span
                  key={idx}
                  className="skill-tag all-skills"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.6 + idx * 0.02 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <motion.div
            className="suggestions-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="section-title">
              <svg
                className="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Role-Specific Recommendations
            </h2>
            <div className="suggestions-list">
              {feedback.suggestions.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  className="suggestion-item"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                >
                  <div className="suggestion-number">{idx + 1}</div>
                  <div className="suggestion-text">{suggestion}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
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
      <AnimatePresence mode="wait">
        {currentPage === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UploadPage onUpload={handleUpload} isLoading={isLoading} />
          </motion.div>
        )}

        {currentPage === "results" && analysisData && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsPage data={analysisData} onAnalyzeNew={handleAnalyzeNew} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
