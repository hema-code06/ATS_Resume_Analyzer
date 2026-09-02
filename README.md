# ATS Resume Analyzer

Upload a resume and get an instant ATS score, your top 3 matching job roles out of 40+, and a clear breakdown of which required and preferred skills you have — and which ones you're missing. No sign-up, no resume storage, everything is processed in memory and discarded once the response is sent.

## 🚀 Features

- **Resume Upload** — `.pdf` / `.docx`
- **ATS Score** — a 0–100 score from a 3-tier weighted skill system (High / Medium / Low value skills)
- **Top 3 Role Matches** — ranked across 40 roles in 19 categories, using independent required-skill and preferred-skill scoring per role
- **Skill Gap Report** — per role, shows the skills you already have, the required skills you're missing, and the preferred skills you're missing
- **Required vs Preferred Match Rates** — shown as two separate percentages per role rather than one blended number, since they answer different questions
- **ATS Formatting Check** — flags real structural issues that trip up ATS parsers: embedded images, tables, page count, and skill keyword density, plus contact info detection
- **Privacy First** — resumes are never written to disk or persisted anywhere

## 📊 How the ATS Score Works

Every detected skill is worth points based on its tier. Low-value skills (generic soft skills like "Communication" or "Time Management") are filtered out entirely before scoring and don't count toward or against the score.

| Tier | Points per skill | Examples |
|---|---|---|
| High | 6 | React, Python, AWS, Diagnosis, Contract Drafting |
| Medium | 3 | Redux, Git, CSS, Medical Documentation, CRM Software |
| Low | Filtered out — not scored | Communication, Time Management, Adaptability |

The final score is the total points earned, normalized against the maximum possible points for the number of skills detected, capped at 100.

## 🎯 Role Matching

Each resume is scored against all 40 roles, and the top 3 highest-matching roles are returned. Within each role, required and preferred skills are weighted by tier — missing a core (High-tier) required skill costs more than missing a minor one — and a fairness curve softens the old strictly-linear scoring, so a resume with roughly half the weighted skill value doesn't read as a harsh 50%.

- **Required-skill match rate** — weighted at 60% toward internal ranking
- **Preferred-skill match rate** — weighted at 40% toward internal ranking

Role matching runs against the *full* set of detected skills, including soft skills — because some roles (Product Manager, Business Analyst, Sales Manager) genuinely list skills like "Communication" as required, and it would be wrong to strip those out before matching just because they don't count toward the separate ATS score.

## 🩺 ATS Formatting Check

Separate from skill scoring, this checks structural traits that commonly break real ATS parsers:

- Page count and word count
- Whether the file contains embedded images or tables (both can cause ATS parsers to drop or scramble content)
- **Skill Density** — the percentage of the resume's words that are recognized skill keywords, labeled Strong / Moderate / Low
- Whether an email address and phone number are detected

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Hot Toast | Toast notifications for errors and validation feedback |

Animations (score counter, progress bars, card transitions) are hand-built with React state and CSS transitions rather than an animation library, and icons are inline SVGs — no icon or charting library dependency.

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| pdfplumber | PDF text extraction and structural analysis |
| python-docx | DOCX text extraction and structural analysis |
| Regex (`re`) | Custom skill detection engine with a skill-variation map |
| Uvicorn | ASGI server |

## 🔧 Local Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
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

The frontend reads the backend URL from `VITE_API_URL`. Create a `.env.local` file in `frontend/` for local development:
```
VITE_API_URL=http://localhost:8000
```
Production builds use `.env.production`, which points at the deployed Render backend.

## 🔮 Future Improvements

- [ ] Paste-a-job-description mode to score a resume against a specific listing, not just the built-in role set
- [ ] Downloadable PDF export of the full analysis
- [ ] Continued expansion of role and skill coverage across more domains
- [ ] AI-powered suggestions for closing specific skill gaps
- [ ] Multi-language resume support

---

Built with React · FastAPI · Python
