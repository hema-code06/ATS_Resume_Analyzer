import { useState } from "react";
import "./JDMatchModal.css";

const scoreColor = (rate) => {
  if (rate >= 80) return "var(--color-success)";
  if (rate >= 60) return "var(--color-primary)";
  if (rate >= 40) return "var(--color-warning)";
  return "var(--color-danger)";
};

export default function JDMatchModal({ isOpen, onClose, onMatchJD, history, onAddToHistory }) {
  const [jdText, setJdText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jdText.trim()) return;
    setIsMatching(true);
    setError(null);
    try {
      const data = await onMatchJD(jdText.trim());
      setResult(data);
      onAddToHistory({ preview: jdText.trim().slice(0, 48), jobDescription: jdText.trim(), data });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleSelectHistory = (item) => {
    setJdText(item.jobDescription);
    setResult(item.data);
    setError(null);
  };

  const handleNewCheck = () => {
    setJdText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="jdm-overlay" onClick={onClose}>
      <div className="jdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="jdm-header">
          <div>
            <h2 className="jdm-title">Match Against a Job Description</h2>
          </div>
          <button className="jdm-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="jdm-body">
          {history.length > 0 && (
            <div className="jdm-history">
              <p className="jdm-history-label">Checked earlier this session</p>
              <div className="jdm-history-row">
                {history.map((item, i) => (
                  <button key={i} className="jdm-history-chip" onClick={() => handleSelectHistory(item)}>
                    {item.preview}...
                    <span style={{ color: scoreColor(item.data.match_rate) }}> {item.data.match_rate}%</span>
                  </button>
                ))}
                <button className="jdm-history-chip jdm-history-chip--new" onClick={handleNewCheck}>
                  + New check
                </button>
              </div>
            </div>
          )}

          {!result && (
            <>
              <textarea
                className="jdm-textarea"
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                disabled={isMatching}
              />
              {error && <p className="jdm-error">{error}</p>}
              <button className="jdm-generate-btn" onClick={handleGenerate} disabled={isMatching || !jdText.trim()}>
                {isMatching ? (
                  <>
                    <span className="jdm-spinner" />
                    Analyzing match...
                  </>
                ) : (
                  "Generate Match"
                )}
              </button>
            </>
          )}

          {result && (
            <div className="jdm-result">
              <div className="jdm-result-top">
                <div
                  className="jdm-score-ring"
                  style={{
                    background: `conic-gradient(${scoreColor(result.match_rate)} ${result.match_rate * 3.6}deg, var(--color-border) 0deg)`,
                  }}
                >
                  <div className="jdm-score-ring-inner">
                    <span className="jdm-score-num" style={{ color: scoreColor(result.match_rate) }}>
                      {result.match_rate}%
                    </span>
                  </div>
                </div>
                <div className="jdm-result-summary">
                  <p className="jdm-result-title">Match Score</p>
                  <p className="jdm-result-sub">
                    {result.skills_matched.length} skills matched · {result.skills_missing.length} skills missing
                  </p>
                  <button className="jdm-edit-btn" onClick={handleNewCheck}>Try another JD</button>
                </div>
              </div>

              <div className="jdm-skills-grid">
                <div>
                  <p className="jdm-skill-title jdm-skill-title--green">You Have</p>
                  <div className="jdm-tag-row">
                    {result.skills_matched.length > 0 ? (
                      result.skills_matched.map((s, i) => (
                        <span key={i} className="jdm-tag jdm-tag--green">{s}</span>
                      ))
                    ) : (
                      <p className="jdm-empty-note">No overlap detected</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="jdm-skill-title jdm-skill-title--red">Missing</p>
                  <div className="jdm-tag-row">
                    {result.skills_missing.length > 0 ? (
                      result.skills_missing.map((s, i) => (
                        <span key={i} className="jdm-tag jdm-tag--red">{s}</span>
                      ))
                    ) : (
                      <p className="jdm-empty-note">Nothing missing - full coverage</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="jdm-ai-section">
                <p className="jdm-ai-title">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.2 3.8L12 6l-3.8 1.2L7 11l-1.2-3.8L2 6l3.8-1.2L7 1z" fill="currentColor" />
                  </svg>
                  AI Suggestions
                </p>
                {result.ai_suggestions.available && result.ai_suggestions.suggestions.length > 0 && (
                  <ul className="jdm-ai-list">
                    {result.ai_suggestions.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
                {result.ai_suggestions.available && result.ai_suggestions.suggestions.length === 0 && (
                  <p className="jdm-ai-empty">No specific gaps to flag - this resume already covers what the job description asks for.</p>
                )}
                {!result.ai_suggestions.available && (
                  <p className="jdm-ai-empty">AI suggestions are currently unavailable.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
