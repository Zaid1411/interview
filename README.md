# InterviewLab — Technical Interview Practice Platform

**InterviewLab** is a full-stack, production-ready web application designed for students, freshers, and engineers to practice technical interviews under authentic clock constraints. It features structured coding rooms, Monaco code editing, multi-language unprivileged isolated execution, server-authoritative timed interviews, deterministic scoring, and database-backed analytics.

---

## 🌟 Key Features

### 1. Monaco Coding Workspace
- **Editor**: Embedded VS Code Monaco editor with syntax highlighting, autocomplete, and a customized dark charcoal developer theme (`interviewLabDark`).
- **Language Support**: JavaScript (Node.js 18) and Python (Python 3.10) with starter templates.
- **Run vs Submit Isolation**:
  - **Run Code**: Tests against visible sample test cases without marking problems as solved. Shows live output, expected output, and stdout logs.
  - **Submit Solution**: Evaluates code against the full server-side test suite (hidden test cases are strictly guarded and never exposed to the client). Saves persistent submissions in PostgreSQL.
- **Draft Persistence**: Auto-saves code drafts with debounced sync.

### 2. Timed Interview Rooms
- **Configurable Durations**: 15, 30, 45, or 60-minute technical rounds.
- **Dynamic Question Assignment**: Curated or filtered by difficulty (Easy, Medium, Hard, Mixed) and topic focus.
- **Server-Authoritative Clock**:
  - Start and expiry times are stored in PostgreSQL (`startTime`, `expiresAt`).
  - Frontend timer displays time remaining and progress; server enforces expiry strictly and rejects late submissions.
  - Refreshes, disconnects, and tab reloads preserve session state seamlessly.
- **Auto-Finish**: Automatically finalizes and scores when the clock expires.

### 3. Transparent Deterministic Scoring
- Documented scoring formula:
  $$\text{Score} = (\text{Solved} / \text{Total} \times 75) + \text{Time Efficiency Bonus (up to 15)} + \text{First-Pass Bonus (up to 10)} - \text{Failed Attempt Penalties}$$
- Comprehensive post-interview summary:
  - Completion rate, accuracy rate, time spent vs allocated clock.
  - Topic-wise performance matrix and areas for targeted improvement.
  - Automated assessment disclaimer clarifying automated coding metrics vs human evaluations.

### 4. 18 Original Algorithmic Practice Problems
The database is seeded with 18 original challenges across all 9 core technical interview categories:
1. **Arrays**: *Subarray Maximum Profit* (Easy), *Find Minimum in Rotated Sorted Array* (Medium)
2. **Strings**: *Valid Palindrome After Single Deletion* (Easy), *Longest Substring Without Repeating Characters* (Medium)
3. **Hash Maps**: *Two Sum Target Pair Finder* (Easy), *Group Anagram Signatures* (Medium)
4. **Searching**: *Find First Bad Version* (Easy), *Search in Sorted 2D Matrix* (Medium)
5. **Sorting**: *Merge Overlapping Intervals* (Medium), *Kth Largest Element in an Array* (Medium)
6. **Two Pointers**: *Move Zeroes In-Place* (Easy), *Container With Most Stored Water* (Medium)
7. **Stacks**: *Valid Parentheses and Brackets* (Easy), *Daily Temperatures Warmer Forecast* (Medium)
8. **Recursion / Backtracking**: *Generate Balanced Parentheses* (Medium), *Power Set Subsets Generator* (Medium)
9. **Dynamic Programming**: *Min Cost Climbing Stairs* (Easy), *Coin Change Minimum Count* (Medium)

Each problem includes problem statement, I/O formats, constraints, sample test cases, hidden edge-case test cases, progressive hints, and an official editorial with time/space complexity analysis.

### 5. Database-Backed Progress Analytics
All dashboard and analytics figures are calculated from live database records:
- **Questions Solved vs Attempted**
- **Current Practice Streak**: Daily consecutive activity calculation.
- **Average Execution Time**: Real-time measurement across test runs.
- **Weekly Activity Chart**: Recharts bar chart showing daily attempts and solves over the past 7 days.
- **Cumulative Growth Area Chart**: 30-day trajectory of problems solved.
- **Topic-Wise Accuracy & Language Distribution**.

### 6. Authentication & Security
- **JWT Authentication**: Stored in secure, HTTP-only, SameSite cookies. Never stored in localStorage.
- **Password Security**: Salted hashing with `bcryptjs`.
- **Forgot Password Flow**: Secure crypto-token generation and time-bounded reset.
- **Rate Limiting**: Express rate limiters applied to auth endpoints and execution requests.
- **Secret Isolation**: Child processes and sandbox runners strip parent environment variables, preventing secret leakage.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Monaco Editor, TanStack Query v5, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, bcryptjs, jsonwebtoken, Zod, express-rate-limit |
| **Code Runner** | Pluggable Runner Adapter: `PistonRunnerAdapter` (containerized isolation), `IsolatedProcessRunnerAdapter` (subprocess sandbox), `MockRunnerAdapter` |
| **Testing** | Vitest, Supertest, React Testing Library, `@testing-library/jest-dom` |
| **Deployment** | Render Static Site (Frontend), Render Web Service (Backend), Render PostgreSQL |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL running locally (port 5432) or a connection URL

### 1. Database Setup
```bash
# Create local database if not already created
createdb interviewlab
```

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://username:password@localhost:5432/interviewlab?schema=public"
JWT_SECRET="interviewlab_super_secret_jwt_key_2026_dev_prod_key"
JWT_EXPIRES_IN="7d"
COOKIE_SECURE="false"
CODE_RUNNER_PROVIDER="piston"
PISTON_API_URL="https://emkc.org/api/v2/piston"
EXECUTION_TIMEOUT_MS=5000
```

### 3. Install & Seed
```bash
# In server directory:
cd server
npm install
npm run prisma:generate
npx prisma db push
npm run seed     # Seeds 18 problems, demo users, sample sessions
```

### 4. Run the Dev Servers
In two separate terminals:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev      # Starts on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm install
npm run dev      # Starts on http://localhost:5173
```

Visit **http://localhost:5173** in your browser!

### Demo User Credentials
- **Email**: `alex.developer@interviewlab.dev`
- **Password**: `Password123!`

---

## 🧪 Running Tests

```bash
# Run server API tests (Supertest + Vitest)
cd server && npm test

# Run client component tests (React Testing Library + Vitest)
cd client && npm test
```

---

## 🌐 Production Deployment (Render)

The included [`render.yaml`](./render.yaml) file enables one-click Infrastructure-as-Code deployment to Render:
1. Connect your repository to [Render](https://render.com).
2. Select **Blueprint** and point to `render.yaml`.
3. Render will provision:
   - PostgreSQL database `interviewlab-postgres`
   - Backend web service `interviewlab-api`
   - Frontend static site `interviewlab-frontend`
