# Sınav Analiz Uzmanı - AI Agent Context

This file defines the project structure, technology stack, and coding conventions for AI agents working on the **Sınav Analiz Uzmanı** project.

## I. Codebase
- **Language:** TypeScript (~5.8.2)
- **Framework:** React 19 (Functional Components + Hooks)
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS 3.4
- **Architecture:** Client-side Single Page Application (SPA)
- **Project Structure:**
  - `/src`: Source code
    - `/components`: UI components (Functional, Modular)
    - `/services`: Business logic, API calls, PDF generation
    - `/types`: TypeScript interfaces and type definitions
    - `/data`: Static data (MEB scenarios, etc.)

## II. Dependencies
Key libraries and their purposes:

- **UI & Icons:**
  - `lucide-react`: Icon library (Use consistent stroke width)
  - `recharts`: Data visualization (Bar, Pie, Radar charts)

- **Data Processing & Export:**
  - `jspdf` & `jspdf-autotable`: PDF generation (Professional reports)
  - `docx`: Word document generation
  - `html2canvas`: Converting DOM elements to images for reports
  - `file-saver`: Client-side file saving

- **Backend & AI:**
  - `@supabase/supabase-js`: Authentication and Database (PostgreSQL via Supabase)
  - `@google/genai`: Google Gemini AI integration for pedagogical analysis

## III. Config
Configuration is managed via environment variables and config files.

- **Environment Variables (.env):**
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase public anonymous key
  - `VITE_GEMINI_API_KEY`: Google Gemini API key (User provided or env)

- **Config Files:**
  - `vite.config.ts`: Build configuration
  - `tailwind.config.js`: Style configuration (Colors, Fonts)
  - `tsconfig.json`: TypeScript compiler options

## IV. Backing Services
External services required for full functionality:

### Database & Auth (Supabase)
- **Service:** Supabase (PostgreSQL)
- **Tables:** `analyses` (JSONB storage for reports), `profiles` (User data)
- **Auth:** Email/Password, Google Auth

### AI Service
- **Provider:** Google Gemini (via `@google/genai`)
- **Model:** gemini-1.5-flash (Optimized for speed/cost)

## V. Build & Run
Standard Vite workflow:

- **Install:** `npm install`
- **Dev Server:** `npm run dev` (Starts local server with HMR)
- **Build:** `npm run build` (Production build to `/dist`)
- **Preview:** `npm run preview` (Preview production build)

## VI. Port Binding
- **5173:** Default development server port (http://localhost:5173)

## VII. Coding Conventions & Logs
- **Logging:** Use `console.error` for critical failures, `console.warn` for non-blocking issues. Avoid excessive `console.log` in production.
- **Type Safety:** Strict TypeScript usage. Avoid `any` where possible. Define interfaces in `/types`.
- **Components:** Use functional components with typed props (`React.FC<Props>`).
- **State Management:** React Context or local state (useState/useReducer).
- **Styling:** Utility-first with Tailwind CSS. Avoid inline styles unless dynamic.
- **PDF Generation:** Use `exportServiceAdvanced.ts` for all PDF logic. Do NOT use legacy export services.
