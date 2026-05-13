import { useRef, useState } from "react";
import "./ResultsPage.css";

const scoreMeta = (s) => {
  if (s >= 85) return { label: "Excellent", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", track: "#dcfce7" };
  if (s >= 70) return { label: "Good", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", track: "#dbeafe" };
  if (s >= 55) return { label: "Fair", color: "#d97706", bg: "#fffbeb", border: "#fde68a", track: "#fef3c7" };
  return { label: "Poor", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", track: "#fee2e2" };
};

export default function ResultsPage({ data, onAnalyzeNew }) {
  const { analysis, feedback, filename } = data;
  const fileInputRef = useRef(null);
  const [activeRole, setActiveRole] = useState(0);

  const meta = scoreMeta(analysis.ats_score);
  const role = analysis.top_roles[activeRole];
  const rmeta = scoreMeta(role.match_percentage);

  const R = 34, circ = 2 * Math.PI * R;
  const arc = circ * (analysis.ats_score / 100);

  return (
    <div className="rp">

      <header className="rp-bar">
        <span className="rp-bar-file">📄{filename}</span>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={(e) =>
            e.target.files?.[0] && onAnalyzeNew(e.target.files[0])
          }
          style={{ display: "none" }}
        />

        <div className="rp-score-card">
          <span className="rp-eyebrow">ATS Score</span>

          <div className="rp-score-row">
            <div className="rp-score-bar">
              <div
                className="rp-score-fill"
                style={{ width: `${analysis.ats_score}%` }}
              />
            </div>

            <div className="rp-score-text">
              <span className="rp-score-big">{analysis.ats_score}</span>
              <span className="rp-score-of">/100</span>
            </div>
          </div>
        </div>

        <button
          className="rp-bar-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 20h16" />
          </svg>

          Upload New
        </button>
      </header>

      <div className="rp-main">
        <main className="rp-right">
          <div className="rp-role-selector">
            <span className="rp-card-label">Top Role Matches</span>
            <div className="rp-role-tabs">
              {analysis.top_roles.map((r, i) => (
                <button key={i}
                  className={`rp-role-tab ${activeRole === i ? "active" : ""}`}
                  onClick={() => setActiveRole(i)}>
                  <span className="rp-tab-idx">#{i + 1}</span>
                  {r.role_title.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>
          </div>

          <div className="rp-sections">

            <section className="rp-section rp-section--overview">
              <div className="rp-sec-label">
                <span className="rp-sec-dot rp-dot--blue" />
                Role Overview
              </div>

              <div className="rp-overview-body">
                <div className="rp-overview-text">
                  <span className="rp-rank-badge">#{activeRole + 1} Match</span>
                  <h2 className="rp-role-name">{role.role_title}</h2>
                  <p className="rp-role-cat">{role.role_category}</p>
                </div>

                <div className="rp-match-circle"
                  style={{ "--mc": rmeta.color, "--mc-bg": rmeta.bg, "--mc-b": rmeta.border }}>
                  <span className="rp-mc-pct">{role.match_percentage}%</span>
                  <span className="rp-mc-lbl">match</span>
                </div>
              </div>

              <div className="rp-tally-row">
                <div className="rp-tally rp-tally--green">
                  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {role.total_matched_skills} skills matched
                </div>
                <div className="rp-tally rp-tally--amber">
                  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                    <path d="M6 3v4M6 8.5h.01" stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" />
                  </svg>
                  {role.total_missing_skills} to learn
                </div>
              </div>
            </section>

            <section className="rp-section rp-section--rates">
              <div className="rp-sec-label">
                <span className="rp-sec-dot rp-dot--purple" />
                Skill Match Rates
              </div>

              <div className="rp-rate-list">
                <div className="rp-rate-row">
                  <div className="rp-rate-meta">
                    <span className="rp-rate-lbl">Required Skills</span>
                    <span className="rp-rate-pct" style={{ color: "#2563eb" }}>
                      {role.required_match_rate}%
                    </span>
                  </div>
                  <div className="rp-track">
                    <div className="rp-fill rp-fill--blue"
                      style={{ width: `${role.required_match_rate}%` }} />
                  </div>
                </div>

                <div className="rp-rate-row">
                  <div className="rp-rate-meta">
                    <span className="rp-rate-lbl">Preferred Skills</span>
                    <span className="rp-rate-pct" style={{ color: "#16a34a" }}>
                      {role.preferred_match_rate}%
                    </span>
                  </div>
                  <div className="rp-track">
                    <div className="rp-fill rp-fill--green"
                      style={{ width: `${role.preferred_match_rate}%` }} />
                  </div>
                </div>
              </div>

              {role.skills_you_have?.length > 0 && (
                <div className="rp-skill-block">
                  <p className="rp-skill-block-title rp-sbt--green">
                    <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    You Have
                    <span className="rp-sbt-cnt">{role.total_matched_skills}</span>
                  </p>
                  <div className="rp-tag-row">
                    {role.skills_you_have.map((s, i) => (
                      <span key={i} className="rp-tag rp-tag--green">{s}</span>
                    ))}
                    {role.total_matched_skills > role.skills_you_have.length && (
                      <span className="rp-tag rp-tag--more">
                        +{role.total_matched_skills - role.skills_you_have.length} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rp-section rp-section--gaps">
              <div className="rp-sec-label">
                <span className="rp-sec-dot rp-dot--red" />
                Skill Gaps
              </div>

              <div className="rp-gap-grid">
                {role.missing_required_skills?.length > 0 && (
                  <div className="rp-skill-block">
                    <p className="rp-skill-block-title rp-sbt--red">
                      <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                        <path d="M6 3v4M6 8.5h.01" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" />
                      </svg>
                      Missing Required
                      <span className="rp-sbt-cnt">{role.missing_required_skills.length}</span>
                    </p>
                    <div className="rp-tag-row">
                      {role.missing_required_skills.map((s, i) => (
                        <span key={i} className="rp-tag rp-tag--red">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {role.missing_preferred_skills?.length > 0 && (
                  <div className="rp-skill-block">
                    <p className="rp-skill-block-title rp-sbt--amber">
                      <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                        <path d="M6 1v2M6 9v2M1 6h2M9 6h2" stroke="currentColor"
                          strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Missing Preferred
                      <span className="rp-sbt-cnt">{role.missing_preferred_skills.length}</span>
                    </p>
                    <div className="rp-tag-row">
                      {role.missing_preferred_skills.map((s, i) => (
                        <span key={i} className="rp-tag rp-tag--amber">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}