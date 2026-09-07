import { useState } from "react";
import "./Tooltip.css";

export default function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tt-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      <svg className="tt-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 6.2v3.6M7 4.4h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      {visible && (
        <span className="tt-bubble">
          {text}
          <span className="tt-arrow" />
        </span>
      )}
    </span>
  );
}
