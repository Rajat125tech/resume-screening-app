# Resume Screening & Candidate Ranking Web Application

This is a full-stack web application that automates the initial HR screening process by comparing uploaded candidate resumes against a Job Description (JD), assigning a matching score, and ranking candidates from highest to lowest fit.

## Architecture Overview
- **Framework:** [Next.js (App Router)](https://nextjs.org/) for both Frontend UI and Backend API Routes.
- **Styling:** Tailwind CSS + Lucide React for modern, responsive icons and layout.
- **Database:** SQLite (for zero-configuration local development) via [Prisma ORM](https://www.prisma.io/). *Note: You can easily switch this to PostgreSQL or MySQL by changing the `provider` in `prisma/schema.prisma`.*
- **NLP & Document Parsing:** Node.js backend uses `pdf-parse` (for PDFs), `mammoth` (for DOCX), and `natural` (for TF-IDF based keyword extraction and tokenization).

## Approach Used for Candidate Scoring
The application uses a **Traditional NLP Strategy** locally without relying on expensive 3rd-party LLM API calls:
1. **Keyword Extraction (JD Analysis):** The backend uses TF-IDF (`natural` library) to process the Job Description text. It removes standard stopwords (e.g., 'and', 'the', 'for') and extracts the top 30 most significant domain-specific keywords/skills.
2. **Resume Parsing:** Uploaded documents (PDF or DOCX) are parsed on the Next.js API server into raw text buffers.
3. **Keyword Intersection (Matching):** The resume text is tokenized into a `Set` of words. We then perform an intersection with the expected JD keywords.
4. **Scoring Logic:** 
   - `Match Score = (Matched Keywords / Total JD Keywords) * 100`
   - Candidates are then assigned a percentage score between 0 and 100.
   - The system also categorizes these keywords into `Matched Skills` and `Missing Skills`.
5. **Ranking:** Candidates are sorted by this score in descending order, displaying the best fits at the top of the Results Dashboard.

## Assumptions & Limitations
- **Skill Extraction:** Since we use TF-IDF rather than Semantic AI (LLMs), the keyword extraction looks for exact token matches. "ReactJS" and "React" might be seen as different tokens depending on document spacing.
- **Document Support:** PDFs and DOCX are officially supported. Legacy `.doc` files are attempted but might not parse fully depending on file encoding.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install
\`\`\`bash
git clone <repository-url>
cd resume-scanner
npm install
\`\`\`

### 2. Initialize the Database
This project uses SQLite for an out-of-the-box local experience. To create the local database (`dev.db`) and apply the schema:
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

*(Optional) To use MySQL instead:*
1. Change `provider = "sqlite"` to `provider = "mysql"` in `prisma/schema.prisma`.
2. Update `DATABASE_URL` in `.env` to your MySQL connection string.
3. Run `npx prisma db push`.

### 3. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented
- [x] Multi-file Resume Upload (Drag & Drop)
- [x] Job Description Input
- [x] Auto text extraction from PDFs and Word docs
- [x] TF-IDF based resume scoring and skill extraction
- [x] Results Dashboard with candidate ranking
- [x] Search candidates by name
- [x] Interactive Candidate Detail View (Matched vs Missing skills)
- [x] Export Results to CSV

---
*Built within 2-3 days as part of the Chiralai Task.*
