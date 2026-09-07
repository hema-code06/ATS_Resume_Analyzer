import { useState } from "react";
import "./Tooltip.css";

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tt-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="tt-bubble">
          {text}
          <span className="tt-arrow" />
        </span>
      )}
    </span>
  );
}
