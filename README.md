# ATS Resume Analyzer

Analyze your resume with ATS Resume Analyzer, get an ATS score, identify missing skills, and improve your chances of getting hired — completely FREE.

---

## What It Does

Upload your resume (PDF or DOCX) and instantly get:

- **ATS Score** — a 0–100 score based on the quality and value of your skills
- **Top 3 Role Matches** — the best-fitting job roles from 30+ categories
- **Match Percentage** — how well your skills match each role's requirements
- **Skills You Have** — matched required and preferred skills
- **Missing Required Skills** — high-priority gaps to fill
- **Missing Preferred Skills** — bonus skills that boost your profile
- **Required & Preferred Match Rates** — percentage bars per skill category

---

## Features

### 📄 Resume Upload & Parsing
- Upload `.pdf` and `.docx` resumes
- Drag & drop upload support
- Extracts and cleans resume text automatically
- Detects skill variations intelligently

### 📊 ATS Resume Analysis
- Calculates ATS score out of 100
- Weighted scoring system for high-value skills
- Filters low-impact resume keywords
- Provides detailed feedback levels

### 🎯 Role Matching
- Matches resumes against 30+ job roles
- Shows top 3 best-fit roles
- Displays role match percentage
- Highlights required and preferred skill gaps

### 📈 Interactive Analytics UI
- Animated ATS score progress bar
- Animated SVG role match circles
- Dynamic skill match bars
- Expandable skill tags
- Smooth transitions & role switching animations

### 📱 Responsive Design
- Mobile responsive
- Tablet optimized
- Desktop & 4K support
- Clean modern UI

### 🔒 Privacy First
- Resume files are never stored
- Secure processing
- Instant analysis only

---

## Tech Stack

### Frontend

| Tech | Purpose |
|------|---------|
| React (Vite) | UI framework |
| CSS Modules | Styling |
| Framer Motion | Animations |
| React Icons | Icons |
| Plus Jakarta Sans | Font |
| Vercel | Frontend hosting |

### Backend

| Tech | Purpose |
|------|---------|
| FastAPI | REST API framework |
| pdfplumber | PDF text extraction |
| python-docx | DOCX text extraction |
| Regex + Custom Skill Engine | Skill detection |
| Render | Backend hosting |

---

## How It Works

### 1️⃣ Resume Parsing (`resume_parser.py`)

- Accepts `.pdf` and `.docx` files
- Extracts text using:
  - `pdfplumber` for PDFs
  - `python-docx` for DOCX
- Cleans and normalizes text
- Removes unnecessary formatting and symbols

---

### 2️⃣ Skill Detection (`ai_analyzer.py`)

- Builds a skill map from `skills_data.json`
- Detects:
  - Required skills
  - Preferred skills
  - Skill variations
- Uses regex word-boundary matching
- Prevents duplicate skill counting

Example:

```python
ReactJS → React
React.js → React
react → React
```

---

### 3️⃣ ATS Scoring

Skills are weighted by value tier:

| Tier | Examples | Points |
|------|----------|--------|
| HIGH | React, Python, AWS, ML | 6 |
| MEDIUM | Git, REST API, CSS | 3 |
| LOW | Filing, Scheduling | 1 |

---

### 4️⃣ Role Matching

Compares detected skills against 30+ job roles.

Returns:

- Top 3 matching roles
- Missing required skills
- Missing preferred skills
- Match percentage
- Skill overlap

---

### 5️⃣ Score Feedback

| Score | Level |
|-------|-------|
| ≥ 85 | 🎉 Excellent |
| ≥ 70 | ✅ Good |
| ≥ 55 | ⚠️ Fair |
| < 55 | ❌ Poor |

---

## UI Features

- Drag & drop upload area
- Animated ATS score bar
- SVG animated circular match ring
- Dynamic skill progress bars
- Role tabs with animations
- Expandable skill tags
- Fully responsive design
- Smooth modern UI

---

## Running Locally

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at:

```bash
http://localhost:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
```

---

## Future Improvements

- User authentication
- Resume history tracking
- AI-powered resume suggestions
- Resume keyword optimization
- LinkedIn profile analysis
- Export analysis reports

---


## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

---

⭐ If you like this project, consider giving it a star on GitHub!

---
