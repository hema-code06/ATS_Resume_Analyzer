import { useRef, useState, useEffect } from "react";
import "./ResultsPage.css";

const scoreMeta = (s) => {
  if (s >= 85) return { label: "Excellent", color: "#16a34a" };
  if (s >= 70) return { label: "Good", color: "#4f46e5" };
  if (s >= 55) return { label: "Fair", color: "#d97706" };
  return { label: "Poor", color: "#dc2626" };
};

function AnimatedBar({ value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="rp-track">
      <div className="rp-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

function AnimatedScore({ target }) {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setScore(current);
      if (current >= target) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [target]);
  return score;
}

export default function ResultsPage({ data, onAnalyzeNew }) {
  const { analysis, filename } = data;
  const fileInputRef = useRef(null);
  const [activeRole, setActiveRole] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const role = analysis.top_roles[activeRole];
  const sMeta = scoreMeta(analysis.ats_score);
  const rMeta = scoreMeta(role.match_percentage);

  const handleRoleChange = (i) => {
    setActiveRole(i);
    setAnimKey(k => k + 1);
  };

  return (
    <div className="rp">

      <header className="rp-bar">
        <div className="rp-bar-file">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 1h6l3 3v9H3V1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M9 1v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span>{filename}</span>
        </div>

        <div className="rp-bar-score">
          <span className="rp-bar-score-label">ATS Score</span>
          <div className="rp-bar-score-track">
            <div
              className="rp-bar-score-fill"
              style={{ width: `${analysis.ats_score}%`, background: sMeta.color }}
            />
          </div>
          <span className="rp-bar-score-num" style={{ color: sMeta.color }}>
            <AnimatedScore target={analysis.ats_score} /><span className="rp-bar-score-denom">/100</span>
          </span>
        </div>

        <input
          ref={fileInputRef} type="file" accept=".pdf,.docx"
          onChange={(e) => e.target.files?.[0] && onAnalyzeNew(e.target.files[0])}
          hidden
        />
        <button className="rp-bar-btn" onClick={() => fileInputRef.current?.click()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 9V2M7 2L4.5 4.5M7 2l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10v1.5A.5.5 0 002.5 12h9a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Upload New
        </button>
      </header>

      <div className="rp-body">

        <div className="rp-role-tabs">
          {analysis.top_roles.map((r, i) => (
            <button
              key={i}
              className={`rp-role-tab ${activeRole === i ? "active" : ""}`}
              onClick={() => handleRoleChange(i)}
            >
              <span className="rp-tab-rank">#{i + 1}</span>
              {r.role_title.split(" ").slice(0, 3).join(" ")}
            </button>
          ))}
        </div>

        <div className="rp-card" key={animKey}>

          <div className="rp-overview">
            <div className="rp-overview-text">
              <span className="rp-rank-badge">#{activeRole + 1} Match</span>
              <h2 className="rp-role-name">{role.role_title}</h2>
              <div className="rp-tally-row">
                <p className="rp-role-cat">{role.role_category}</p>
                <div className="rp-tally rp-tally--green">
                  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {role.total_matched_skills} skills matched
                </div>
                <div className="rp-tally rp-tally--amber">
                  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                    <path d="M6 3v4M6 8.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  {role.total_missing_skills} skills to learn
                </div>
              </div>

            </div>

            <div className="rp-match-circle" style={{ "--mc": rMeta.color }}>
              <span className="rp-mc-pct">{role.match_percentage}%</span>
              <span className="rp-mc-lbl">match</span>
            </div>
          </div>

          <div className="rp-divider" />

          <div className="rp-rates">
            <div className="rp-rate-row">
              <span className="rp-rate-lbl">Required Skills</span>
              <AnimatedBar value={role.required_match_rate} color="#4f46e5" delay={80} />
              <span className="rp-rate-pct" style={{ color: "#4f46e5" }}>{role.required_match_rate}%</span>
            </div>
            <div className="rp-rate-row">
              <span className="rp-rate-lbl">Preferred Skills</span>
              <AnimatedBar value={role.preferred_match_rate} color="#16a34a" delay={160} />
              <span className="rp-rate-pct" style={{ color: "#16a34a" }}>{role.preferred_match_rate}%</span>
            </div>
          </div>

          <div className="rp-divider" />

          <div className="rp-skills-grid">

            {role.skills_you_have?.length > 0 && (
              <div className="rp-skill-block">
                <p className="rp-skill-block-title rp-sbt--green">
                  <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

            {role.missing_required_skills?.length > 0 && (
              <div className="rp-skill-block">
                <p className="rp-skill-block-title rp-sbt--red">
                  <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                    <path d="M6 3v4M6 8.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
                  <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                    <path d="M6 1v2M6 9v2M1 6h2M9 6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
        </div>
      </div>
    </div>
  );
}