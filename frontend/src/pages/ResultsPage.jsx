import { useRef, useState } from "react";
import "./ResultsPage.css";

const ResultsPage = ({ data, onAnalyzeNew }) => {
  const { analysis, feedback, filename } = data;
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

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

  const activeRole = analysis.top_roles[activeTab];

  return (
    <div className="results-page-full">
      <div className="results-topbar">
        <div className="filename-section">
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
          <span className="filename">{filename}</span>
        </div>
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
          Upload New
        </button>
      </div>

      <div className="results-grid">
        <div className="results-left">
          <div className="score-card-compact">
            <div className="score-card-top">
              <div className="score-right">
                <div className="score-label-row">
                  <span className="score-label">ATS Score</span>
                  <div
                    className={`score-circle score-${getScoreColor(analysis.ats_score)}`}
                  >
                    <div className="score-number">{analysis.ats_score}</div>
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
                <div className="skill-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Skills</span>
                    <span className="stat-value">
                      {analysis.total_skills_found}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">High Value</span>
                    <span className="stat-value high-value">
                      {feedback.skill_breakdown.high_value_count}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Medium Value</span>
                    <span className="stat-value medium-value">
                      {feedback.skill_breakdown.medium_value_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
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
              All Skills ({analysis.total_skills_found})
            </h2>
            <div className="skills-scroll">
              <div className="skills-tags-grid">
                {analysis.found_skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag all-skills">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="results-right">
          <div className="panel panel-full">
            <div className="roles-header-row">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
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
              <div className="role-tabs">
                {analysis.top_roles.map((role, idx) => (
                  <button
                    key={idx}
                    className={`role-tab ${activeTab === idx ? "active" : ""}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    #{idx + 1}{" "}
                    {role.role_title.split(" ").slice(0, 2).join(" ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="role-detail-scroll">
              <div className="role-card-inline">
                <div className="role-header-inline">
                  <div className="role-rank">#{activeTab + 1}</div>
                  <div className="role-info">
                    <h3 className="role-title">{activeRole.role_title}</h3>
                    <p className="role-category">{activeRole.role_category}</p>
                  </div>
                  <div className="role-match">
                    <div
                      className={`match-percentage match-${getScoreColor(activeRole.match_percentage)}`}
                    >
                      {activeRole.match_percentage}%
                    </div>
                    <span className="match-label">Match</span>
                  </div>
                </div>

                <div className="match-rates">
                  <div className="match-rate-item">
                    <span className="rate-label">Required Skills</span>
                    <div className="rate-bar">
                      <div
                        className="rate-fill required"
                        style={{ width: `${activeRole.required_match_rate}%` }}
                      />
                    </div>
                    <span className="rate-value">
                      {activeRole.required_match_rate}%
                    </span>
                  </div>
                  <div className="match-rate-item">
                    <span className="rate-label">Preferred Skills</span>
                    <div className="rate-bar">
                      <div
                        className="rate-fill preferred"
                        style={{ width: `${activeRole.preferred_match_rate}%` }}
                      />
                    </div>
                    <span className="rate-value">
                      {activeRole.preferred_match_rate}%
                    </span>
                  </div>
                </div>

                <div className="role-skills-grid">
                  {activeRole.skills_you_have &&
                    activeRole.skills_you_have.length > 0 && (
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
                          {activeRole.skills_you_have.map((skill, skillIdx) => (
                            <span key={skillIdx} className="skill-tag matched">
                              {skill}
                            </span>
                          ))}
                          {activeRole.total_matched_skills >
                            activeRole.skills_you_have.length && (
                            <span className="skill-tag more">
                              +
                              {activeRole.total_matched_skills -
                                activeRole.skills_you_have.length}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {activeRole.missing_required_skills &&
                    activeRole.missing_required_skills.length > 0 && (
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
                          Missing Required
                        </h4>
                        <div className="skills-tags">
                          {activeRole.missing_required_skills.map(
                            (skill, skillIdx) => (
                              <span
                                key={skillIdx}
                                className="skill-tag missing required"
                              >
                                {skill}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {activeRole.missing_preferred_skills &&
                    activeRole.missing_preferred_skills.length > 0 && (
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
                          Missing Preferred
                        </h4>
                        <div className="skills-tags">
                          {activeRole.missing_preferred_skills.map(
                            (skill, skillIdx) => (
                              <span
                                key={skillIdx}
                                className="skill-tag missing preferred"
                              >
                                {skill}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="role-footer">
                  <span className="footer-stat">
                    ✓ {activeRole.total_matched_skills} skills matched
                  </span>
                  <span className="footer-divider">•</span>
                  <span className="footer-stat">
                    + {activeRole.total_missing_skills} to learn
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
