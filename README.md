# ATS Resume Analyzer

> Upload your resume and instantly get an ATS score, top 3 job role matches from 30+ roles, skill gap analysis, and actionable insights — completely free, with zero data storage.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | [ats-resume-analyzer-neon.vercel.app](https://ats-resume-analyzer-neon.vercel.app/) |
| Backend API | Render (FastAPI + Python) |

---

## 📌 About the Project

ATS Resume Analyzer parses uploaded resumes (PDF or DOCX), detects skills using a custom regex-based skill engine, and scores the resume against 30+ real-world job roles across 8 categories.

Skills are detected using **word-boundary regex matching** with a variation map — so "ReactJS", "React.js", and "React JS" all map to the same skill. Resumes are **never stored** — all processing is done in memory.

---

## 🚀 Features

- **Resume Upload** — Drag & drop or click to upload `.pdf` / `.docx`
- **ATS Score** — 0–100 score using a 3-tier weighted skill system (HIGH / MEDIUM / LOW)
- **Top 3 Role Matches** — Matched against 30+ job roles with required & preferred skill scoring
- **Skill Gap Report** — Shows skills you have, missing required skills, and missing preferred skills
- **Match Percentage** — Per role, with required and preferred match rates shown separately
- **Animated Results UI** — Animated score counter, progress bars, expandable skill tags, role tabs
- **Privacy First** — Resume files never stored or shared

---

## 📊 ATS Scoring

| Tier | Examples | Points |
|------|----------|--------|
| HIGH | React, Python, AWS | 6 |
| MEDIUM | Redux, Git, CSS | 3 |
| LOW | Filing, Scheduling, Documentation | Filtered out |

**Score Levels:** 🎉 Excellent (≥85) · ✅ Good (≥70) · ⚠️ Fair (≥55) · ❌ Poor (<55)

---

## 🎯 Role Matching

Matches against **30 job roles** across Technology, Design, Marketing, Finance, HR, Healthcare, Engineering, and more.

**Scoring weights:** Required skills 60% · Preferred skills 25% · Experience 10% · Education 5%

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js + Vite | UI framework & build tool |
| Framer Motion | Animations |
| Recharts | Data visualization |
| Axios | HTTP client |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| pdfplumber | PDF text extraction |
| python-docx | DOCX text extraction |
| Regex (re) | Custom skill detection engine |
| Uvicorn | ASGI server |

---

## 🔧 Local Setup

### Backend
```bash
cd backend
pip install fastapi uvicorn pdfplumber python-docx
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## 🔮 Future Improvements

- [ ] AI-powered resume rewrite suggestions
- [ ] Export analysis report as PDF
- [ ] Resume history tracking with user authentication
- [ ] LinkedIn profile analysis

---

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub — it motivates me to keep building!

---

*Built with ❤️ using React · FastAPI · Python · Vite*
