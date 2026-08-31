import { useRef, useState, useEffect } from "react";
import "./ResultsPage.css";

const scoreMeta = (s) => {
  if (s >= 85) return { label: "Excellent", color: "var(--color-success)" };
  if (s >= 70) return { label: "Good", color: "var(--color-primary)" };
  if (s >= 55) return { label: "Fair", color: "var(--color-warning)" };
  return { label: "Poor", color: "var(--color-danger)" };
};

function SkillTagList({ skills, className }) {
  const LIMIT = 5;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? skills : skills.slice(0, LIMIT);
  const hidden = skills.length - LIMIT;

  return (
    <div className="rp-tag-row">
      {visible.map((s, i) => (
        <span key={i} className={`rp-tag ${className}`}>{s}</span>
      ))}
      {!expanded && hidden > 0 && (
        <button className="rp-tag rp-tag--more rp-tag-more-btn"
          onClick={() => setExpanded(true)}>
          +{hidden} more
        </button>
      )}
      {expanded && hidden > 0 && (
        <button className="rp-tag rp-tag--more rp-tag-more-btn"
          onClick={() => setExpanded(false)}>
          Show less
        </button>
      )}
    </div>
  );
}

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
    const step = Math.ceil(target / 40) || 1;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setScore(current);
      if (current >= target) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [target]);
  return score;
}

function FormattingCheck({ formatting }) {
  if (!formatting) return null;
  const friendly = formatting.is_ats_friendly;

  const sectionLabels = {
    summary: "Summary",
    skills: "Skills",
    experience: "Experience",
    education: "Education",
    certifications: "Certifications",
  };

  return (
    <div className="rp-card rp-fmt-card">
      <div className="rp-fmt-head">
        <div>
          <p className="rp-section-title">ATS Formatting Check</p>
          <p className="rp-section-sub">How well your file structure survives real ATS parsers</p>
        </div>
        <span className={`rp-fmt-badge ${friendly ? "rp-fmt-badge--good" : "rp-fmt-badge--warn"}`}>
          {friendly ? "ATS Friendly" : "Needs Attention"}
        </span>
      </div>

      <div className="rp-fmt-stats">
        {formatting.page_count != null && (
          <div className="rp-fmt-stat">
            <span className="rp-fmt-stat-num">{formatting.page_count}</span>
            <span className="rp-fmt-stat-lbl">Pages</span>
          </div>
        )}
        <div className="rp-fmt-stat">
          <span className="rp-fmt-stat-num">{formatting.word_count}</span>
          <span className="rp-fmt-stat-lbl">Words</span>
        </div>
        <div className="rp-fmt-stat">
          <span className="rp-fmt-stat-num">{formatting.has_tables ? "Yes" : "No"}</span>
          <span className="rp-fmt-stat-lbl">Tables</span>
        </div>
        <div className="rp-fmt-stat">
          <span className="rp-fmt-stat-num">{formatting.has_images ? "Yes" : "No"}</span>
          <span className="rp-fmt-stat-lbl">Images</span>
        </div>
      </div>

      <div className="rp-fmt-checks">
        {Object.entries(formatting.sections || {}).map(([key, present]) => (
          <span key={key} className={`rp-check-chip ${present ? "rp-check-chip--yes" : "rp-check-chip--no"}`}>
            {present ? "✓" : "✕"} {sectionLabels[key] || key}
          </span>
        ))}
        <span className={`rp-check-chip ${formatting.contact_info?.has_email ? "rp-check-chip--yes" : "rp-check-chip--no"}`}>
          {formatting.contact_info?.has_email ? "✓" : "✕"} Email
        </span>
        <span className={`rp-check-chip ${formatting.contact_info?.has_phone ? "rp-check-chip--yes" : "rp-check-chip--no"}`}>
          {formatting.contact_info?.has_phone ? "✓" : "✕"} Phone
        </span>
      </div>

      {formatting.warnings?.length > 0 && (
        <ul className="rp-fmt-warnings">
          {formatting.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FuzzyCorrections({ corrections }) {
  if (!corrections?.length) return null;

  return (
    <div className="rp-card rp-fuzzy-card">
      <p className="rp-section-title">Possible Typos Auto-Corrected</p>
      <p className="rp-section-sub">These were matched even though the spelling was slightly off</p>
      <div className="rp-tag-row">
        {corrections.map((c, i) => (
          <span key={i} className="rp-fuzzy-chip">
            {c.typo} <span className="rp-fuzzy-arrow">→</span> {c.matched_to}
          </span>
        ))}
      </div>
    </div>
  );
}

function RoleCard({ role, index }) {
  const missingTotal = role.missing_required_skills.length + role.missing_preferred_skills.length;

  return (
    <div className="rp-card rp-role-card" style={{ animationDelay: `${index * 90}ms` }}>
      <div className="rp-overview">
        <div className="rp-overview-text">
          <div className="rp-badge-row">
            <span className="rp-rank-badge">#{index + 1} Match</span>
            {role.prioritized && <span className="rp-priority-badge">Prioritized</span>}
          </div>
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
              {missingTotal} skills to learn
            </div>
          </div>
        </div>
      </div>

      <div className="rp-divider" />
      <div className="rp-rates">
        <div className="rp-rate-row">
          <span className="rp-rate-lbl">Required Skills</span>
          <AnimatedBar value={role.required_match_rate} color="var(--color-primary)" delay={80} />
          <span className="rp-rate-pct" style={{ color: "var(--color-primary)" }}>{role.required_match_rate}%</span>
        </div>
        <div className="rp-rate-row">
          <span className="rp-rate-lbl">Preferred Skills</span>
          <AnimatedBar value={role.preferred_match_rate} color="var(--color-success)" delay={160} />
          <span className="rp-rate-pct" style={{ color: "var(--color-success)" }}>{role.preferred_match_rate}%</span>
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
            <SkillTagList skills={role.skills_you_have} className="rp-tag--green" />
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
            <SkillTagList skills={role.missing_required_skills} className="rp-tag--red" />
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
            <SkillTagList skills={role.missing_preferred_skills} className="rp-tag--amber" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage({ data, onAnalyzeNew }) {
  const { analysis, filename, formatting_check } = data;
  const fileInputRef = useRef(null);

  const sMeta = scoreMeta(analysis.ats_score);

  return (
    <div className="rp" style={{ "--accent": sMeta.color }}>
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
        <FormattingCheck formatting={formatting_check} />
        <FuzzyCorrections corrections={analysis.fuzzy_corrections} />

        <div className="rp-role-list">
          {analysis.top_roles.map((role, i) => (
            <RoleCard key={role.role_title} role={role} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
