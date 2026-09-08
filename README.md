# ATS Resume Analyzer

Upload a resume and get an instant ATS score, your top 3 matching job roles out of 40+, and a clear breakdown of which required and preferred skills you have — and which ones you're missing. Paste a specific job description for a custom match against that exact posting, complete with AI-backed suggestions on what to learn next. No sign-up, no resume storage — everything is processed in memory and discarded once the response is sent.

## 🚀 Features

- **Privacy First** — resumes are never written to disk or persisted anywhere
- **Resume Upload** — `.pdf`, `.docx`, `.jpg`, or `.png`
- **ATS Score** — a 0–100 score from a 3-tier weighted skill system (High / Medium / Low value skills)
- **Top 3 Role Matches** — ranked across 40 roles in 19 categories, using independent required-skill and preferred-skill scoring per role
- **Skill Gap Report** — per role, shows the skills you already have, the required skills, and the preferred skills you're missing
- **Required vs Preferred Match Rates** — shown as two separate percentages per role rather than one blended number, since they answer different questions
- **Match Against a Job Description** — paste a real posting and get a custom score against that exact listing, with AI-generated (or smart rule-based fallback) suggestions on which missing skills to prioritize
- **ATS Formatting Check** — flags real structural issues that trip up ATS parsers: embedded images, tables, page count, and skill keyword density, plus contact info detection

## 📊 How the ATS Score Works

Every detected skill is worth points based on its tier. Low-value skills (generic soft skills like "Communication" or "Time Management") are filtered out entirely before scoring and don't count toward or against the score.

| Tier | Points per skill | Examples |
|---|---|---|
| High | 6 | React, Python, AWS, Diagnosis, Contract Drafting |
| Medium | 3 | Redux, Git, CSS, Medical Documentation, CRM Software |
| Low | Filtered out — not scored | Communication, Time Management, Adaptability |

The final score is the total points earned, normalized against the maximum possible points for the number of skills detected, capped at 100.

## 🎯 Role Matching

Role matching runs against the *full* set of detected skills, including soft skills — because some roles (Product Manager, Sales Manager) genuinely list skills like "Communication" as required, and it would be wrong to strip those out before matching just because they don't count toward the separate ATS score.

## 🎯 Match Against a Job Description

Beyond the 40 built-in roles, you can paste any real job posting and get a custom analysis using the exact same detection and weighting engine:

- Skills are extracted from the pasted JD using the same regex-based engine used for resumes
- The resume is scored against *that specific listing's* skill set, not a generic template
- Suggestions on what to learn next come from a live LLM call (Groq) when configured, with an automatic fallback to rule-based suggestions — generated using the same skill-tier and skill-cluster data that powers the main matching engine — if no key is set or the call fails. The source is always labeled honestly in the response.

## 🩺 ATS Formatting Check

Separate from skill scoring, this checks structural traits that commonly break real ATS parsers:

- Page count and word count
- Whether the file contains embedded images or tables (both can cause ATS parsers to drop or scramble content) — and a distinct, stronger warning if the entire resume was submitted as an image file
- **Skill Density** — the percentage of the resume's words that are recognized skill keywords, labeled Strong / Moderate / Low
- Whether an email address and phone number are detected

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Hot Toast | Toast notifications for errors and validation feedback |

Animations (score counter, progress bars, card transitions, tooltips) are hand-built with React state and CSS transitions rather than an animation library, and icons are inline SVGs — no icon or charting library dependency.

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| pdfplumber | PDF text extraction and structural analysis |
| python-docx | DOCX text extraction and structural analysis |
| pytesseract + Pillow | OCR text extraction for image-based resumes |
| Groq | LLM-generated skill-gap suggestions for the JD-match feature |
| Regex (`re`) | Custom skill detection engine with a skill-variation map |
| Uvicorn | ASGI server |
 
---

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

- [ ] Downloadable PDF export of the full analysis
- [ ] Continued expansion of role and skill coverage across more domains
- [ ] Multi-language resume support
- [ ] Resume formatting suggestions beyond keyword scoring (e.g. bullet structure, action verbs)
- [ ] Support for comparing multiple resumes against the same job description

---

*Built with ❤️ React · FastAPI · Python*
