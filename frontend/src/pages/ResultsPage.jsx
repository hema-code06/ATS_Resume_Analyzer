import { useRef, useState, useEffect } from "react";
import JDMatchModal from "../components/JDMatchModal";
import Tooltip from "../components/Tooltip";
import "./ResultsPage.css";

const scoreMeta = (s) => {
  if (s >= 85) return { label: "Excellent", color: "var(--color-success)" };
  if (s >= 70) return { label: "Good", color: "var(--color-primary)" };
  if (s >= 55) return { label: "Fair", color: "var(--color-warning)" };
  return { label: "Poor", color: "var(--color-danger)" };
};

const LOADING_MESSAGES = [
  "Analyzing your new resume...",
  "Extracting skills and keywords...",
  "Matching against job roles...",
  "This can take a moment on first load...",
];

function LoadingOverlay() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rp-loading-overlay">
      <div className="rp-loading-box">
        <div className="rp-spinner" />
        <p className="rp-loading-msg">{LOADING_MESSAGES[msgIndex]}</p>
      </div>
    </div>
  );
}

function SkillTagList({ skills, className, limit = 3 }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? skills : skills.slice(0, limit);
  const hidden = skills.length - limit;

  return (
    <div className="rp-tag-row">
      {visible.map((s, i) => (
        <span key={i} className={`rp-tag ${className}`}>
          {s}
        </span>
      ))}
      {!expanded && hidden > 0 && (
        <button
          className="rp-tag rp-tag--more rp-tag-more-btn"
          onClick={() => setExpanded(true)}
        >
          +{hidden} more
        </button>
      )}
      {expanded && hidden > 0 && (
        <button
          className="rp-tag rp-tag--more rp-tag-more-btn"
          onClick={() => setExpanded(false)}
        >
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
      <div
        className="rp-fill"
        style={{ width: `${width}%`, background: color }}
      />
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

function FormattingStrip({ formatting }) {
  if (!formatting) return null;
  const friendly = formatting.is_ats_friendly;
  const density = formatting.skill_density;

  const densityColor =
    {
      Strong: "var(--color-success)",
      Moderate: "var(--color-warning)",
      Low: "var(--color-danger)",
    }[density?.label] || "var(--color-text-muted)";

  return (
    <div className="rp-card rp-fmt-strip">
      <div className="rp-fmt-strip-row">
        <span
          className={`rp-fmt-badge ${friendly ? "rp-fmt-badge--good" : "rp-fmt-badge--warn"}`}
        >
          {friendly ? "ATS Friendly" : "Needs Attention"}
        </span>

        <span className="rp-fmt-chip">
          {formatting.page_count ?? "-"} pages
        </span>
        <span className="rp-fmt-chip">{formatting.word_count} words</span>
        <span className="rp-fmt-chip">
          {formatting.has_tables ? "Has tables" : "No tables"}
        </span>
        <span className="rp-fmt-chip">
          {formatting.has_images ? "Has images" : "No images"}
        </span>
        <span
          className="rp-fmt-chip"
          style={{ color: densityColor, fontWeight: 700 }}
        >
          {density?.label} skill density ({density?.percentage}%)
        </span>
        <span
          className={`rp-fmt-chip ${formatting.contact_info?.has_email ? "rp-fmt-chip--yes" : "rp-fmt-chip--no"}`}
        >
          {formatting.contact_info?.has_email ? "✓" : "✕"} Email
        </span>
        <span
          className={`rp-fmt-chip ${formatting.contact_info?.has_phone ? "rp-fmt-chip--yes" : "rp-fmt-chip--no"}`}
        >
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

function RoleCard({ role, index }) {
  const missingTotal =
    role.missing_required_skills.length + role.missing_preferred_skills.length;

  return (
    <div
      className="rp-card rp-role-card"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="rp-badge-row">
        <span className="rp-rank-badge">#{index + 1} Match</span>
      </div>
      <h2 className="rp-role-name">{role.role_title}</h2>
      <p className="rp-role-cat">{role.role_category}</p>

      <div className="rp-tally-row">
        <div className="rp-tally rp-tally--green">
          {role.total_matched_skills} matched
        </div>
        <div className="rp-tally rp-tally--amber">{missingTotal} to learn</div>
      </div>

      <div className="rp-rates">
        <div className="rp-rate-row">
          <span className="rp-rate-lbl">Required</span>
          <AnimatedBar
            value={role.required_match_rate}
            color="var(--color-primary)"
            delay={80}
          />
          <span
            className="rp-rate-pct"
            style={{ color: "var(--color-primary)" }}
          >
            {role.required_match_rate}%
          </span>
        </div>
        <div className="rp-rate-row">
          <span className="rp-rate-lbl">Preferred</span>
          <AnimatedBar
            value={role.preferred_match_rate}
            color="var(--color-success)"
            delay={160}
          />
          <span
            className="rp-rate-pct"
            style={{ color: "var(--color-success)" }}
          >
            {role.preferred_match_rate}%
          </span>
        </div>
      </div>

      <div className="rp-skills-stack">
        {role.skills_you_have?.length > 0 && (
          <div className="rp-skill-block">
            <p className="rp-skill-block-title rp-sbt--green">
              You Have
              <span className="rp-sbt-cnt">{role.total_matched_skills}</span>
            </p>
            <SkillTagList
              skills={role.skills_you_have}
              className="rp-tag--green"
            />
          </div>
        )}

        {role.missing_required_skills?.length > 0 && (
          <div className="rp-skill-block">
            <p className="rp-skill-block-title rp-sbt--red">
              Missing Required
              <span className="rp-sbt-cnt">
                {role.missing_required_skills.length}
              </span>
            </p>
            <SkillTagList
              skills={role.missing_required_skills}
              className="rp-tag--red"
            />
          </div>
        )}

        {role.missing_preferred_skills?.length > 0 && (
          <div className="rp-skill-block">
            <p className="rp-skill-block-title rp-sbt--amber">
              Missing Preferred
              <span className="rp-sbt-cnt">
                {role.missing_preferred_skills.length}
              </span>
            </p>
            <SkillTagList
              skills={role.missing_preferred_skills}
              className="rp-tag--amber"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage({
  data,
  onAnalyzeNew,
  isLoading,
  onMatchJD,
}) {
  const { analysis, filename, formatting_check } = data;
  const fileInputRef = useRef(null);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [jdHistory, setJdHistory] = useState([]);

  const sMeta = scoreMeta(analysis.ats_score);

  return (
    <div className="rp" style={{ "--accent": sMeta.color }}>
      {isLoading && <LoadingOverlay />}

      <header className="rp-bar">
        <div className="rp-bar-file">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 1h6l3 3v9H3V1z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M9 1v3h3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <span>{filename}</span>
        </div>
        <div className="rp-bar-score">
          <span className="rp-bar-score-label">ATS Score</span>
          <div className="rp-bar-score-track">
            <div
              className="rp-bar-score-fill"
              style={{
                width: `${analysis.ats_score}%`,
                background: sMeta.color,
              }}
            />
          </div>
          <span className="rp-bar-score-num" style={{ color: sMeta.color }}>
            <AnimatedScore target={analysis.ats_score} />
            <span className="rp-bar-score-denom">/100</span>
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={(e) =>
            e.target.files?.[0] && onAnalyzeNew(e.target.files[0])
          }
          disabled={isLoading}
          hidden
        />
        <Tooltip text="Match Job Description" align="right">
          <button
            className="rp-bar-btn rp-bar-btn--icon rp-bar-btn--ghost"
            onClick={() => setIsJDModalOpen(true)}
            disabled={isLoading}
            aria-label="Match Job Description"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.25 2A1.75 1.75 0 007.5 3.75V5H4.75A2.75 2.75 0 002 7.75v7.65c1.9.85 4.5 1.4 7.15 1.55a6.47 6.47 0 011.13-8.9 6.5 6.5 0 018.72.62V7.75A2.75 2.75 0 0016.25 5H13.5V3.75A1.75 1.75 0 0011.75 2h-2.5zM9.5 5V3.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V5h-3z"
              />
              <path d="M2 16.95V18.25A2.75 2.75 0 004.75 21h6.5a6.47 6.47 0 01-1.9-4.3c-2.6-.1-5.1-.65-7.35-1.75z" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.5 12a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm-2.5 4.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z"
              />
              <path d="M20.7 20.6a1 1 0 011.4 0l1.6 1.6a1 1 0 01-1.4 1.4l-1.6-1.6a1 1 0 010-1.4z" />
            </svg>
          </button>
        </Tooltip>
        <Tooltip text="Upload New Resume" align="right">
          <button
            className="rp-bar-btn rp-bar-btn--icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Upload New Resume"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.5 3a5.5 5.5 0 015.44 4.72A5 5 0 0117 17.5H7a5 5 0 01-1.15-9.86 3.5 3.5 0 015.9-3.9A5.47 5.47 0 0112.5 3zm-.85 4.4a.75.75 0 011.2 0l3.2 4.2a.75.75 0 01-.6 1.2h-1.7v3.2a.75.75 0 01-.75.75h-2a.75.75 0 01-.75-.75v-3.2H8.55a.75.75 0 01-.6-1.2l3.2-4.2z"
              />
            </svg>
          </button>
        </Tooltip>
      </header>

      <div className="rp-body">
        <FormattingStrip formatting={formatting_check} />

        <div className="rp-role-grid">
          {analysis.top_roles.map((role, i) => (
            <RoleCard key={role.role_title} role={role} index={i} />
          ))}
        </div>
      </div>

      <JDMatchModal
        isOpen={isJDModalOpen}
        onClose={() => setIsJDModalOpen(false)}
        onMatchJD={onMatchJD}
        history={jdHistory}
        onAddToHistory={(item) =>
          setJdHistory((prev) => [item, ...prev].slice(0, 5))
        }
      />
    </div>
  );
}
