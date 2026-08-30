import { useRef, useState, useEffect, useMemo } from "react";
import "./ResultsPage.css";

const scoreMeta = (s) => {
  if (s >= 85) return { label: "Excellent", color: "#16a34a" };
  if (s >= 70) return { label: "Good", color: "#4f46e5" };
  if (s >= 55) return { label: "Fair", color: "#d97706" };
  return { label: "Poor", color: "#dc2626" };
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

function highlightResumeText(text, skills) {
  if (!text || !skills?.length) return text;

  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  const escaped = [...skillSet]
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    skillSet.has(part.toLowerCase())
      ? <mark key={i} className="rp-highlight">{part}</mark>
      : <span key={i}>{part}</span>
  );
}

function FormattingCheck({ formatting }) {
  if (!formatting) return null;
  const friendly = formatting.is_ats_friendly;

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

function HighImpactBanner({ skills }) {
  if (!skills?.length) return null;
  const top = skills[0];
  const rest = skills.slice(1);

  return (
    <div className="rp-card rp-impact-card">
      <p className="rp-section-title">Highest-Leverage Skill To Learn</p>
      <div className="rp-impact-main">
        <span className="rp-impact-skill">{top.skill}</span>
        <span className="rp-impact-detail">unlocks {top.roles_unlocked} more role{top.roles_unlocked === 1 ? "" : "s"}</span>
      </div>
      {rest.length > 0 && (
        <div className="rp-impact-rest">
          {rest.map((s, i) => (
            <span key={i} className="rp-impact-chip">{s.skill} · {s.roles_unlocked}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function CrossRoleSkills({ skills }) {
  if (!skills?.length) return null;

  return (
    <div className="rp-card rp-crossrole-card">
      <p className="rp-section-title">Skills Working Across Multiple Roles</p>
      <div className="rp-tag-row">
        {skills.map((s, i) => (
          <span key={i} className="rp-tag rp-tag--indigo">
            {s.skill} <span className="rp-crossrole-cnt">×{s.roles.length}</span>
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
          <span className="rp-rank-badge">#{index + 1} Match</span>
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

function ResumePreview({ text, skills }) {
  const [open, setOpen] = useState(false);
  const highlighted = useMemo(() => highlightResumeText(text, skills), [text, skills]);

  if (!text) return null;

  return (
    <div className="rp-card rp-preview-card">
      <button className="rp-preview-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="rp-section-title">Resume Preview With Matched Skills</span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="rp-preview-body">{highlighted}</div>}
    </div>
  );
}

export default function ResultsPage({ data, onAnalyzeNew }) {
  const { analysis, filename, formatting_check, resume_text } = data;
  const fileInputRef = useRef(null);

  const sMeta = scoreMeta(analysis.ats_score);

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
        <FormattingCheck formatting={formatting_check} />
        <HighImpactBanner skills={analysis.high_impact_missing_skills} />
        <CrossRoleSkills skills={analysis.cross_role_skills} />

        <div className="rp-role-list">
          {analysis.top_roles.map((role, i) => (
            <RoleCard key={role.role_title} role={role} index={i} />
          ))}
        </div>

        <ResumePreview text={resume_text} skills={analysis.found_skills} />
      </div>
    </div>
  );
}
