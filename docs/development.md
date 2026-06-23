# 🛠️ Development & Contribution Guide

This guide explains how to set up the local development environment, run the project, configure mock datasets, and prepare code for production.

---

## 🚀 Setup & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version 18.0.0 or higher recommended)
*   `npm` (automatically installed with Node.js)

### Installation Steps

1.  **Clone the workspace** and navigate to the project directory:
    ```bash
    cd gen_rpt_review-frontend-main
    ```

2.  **Install Node Modules**:
    ```bash
    npm install
    ```

3.  **Start Development Server**:
    Launch Vite's local dev server:
    ```bash
    npm run dev
    ```
    *   The app will run at [http://localhost:5173](http://localhost:5173).
    *   Vite handles Hot Module Replacement (HMR) for instant source updates.

---

## 📁 Project Structure

Here is a map of the codebase files:

*   **`src/assets/`**: Static files like PNG logos or SVG graphics.
*   **`src/components/`**: Reusable React UI blocks.
    *   `comments/`: Review thread comment layouts.
    *   `common/`: Generic widgets like status badges, toast panels, collapsibles, and fallback empty screens.
    *   `dashboard/`: KPI blocks and main aggregate listing tables.
    *   `layout/`: Core page frames and toggleable side navigation menus.
    *   `report/`: Interactive paper-preview, section render engine, and the annotation side drawer.
    *   `review/`: Humans decision selectors and page header navigation bars.
*   **`src/hooks/`**: Data fetching and mutation controllers.
    *   `useReports.ts`: Fetches reports and dashboard aggregates.
    *   `useReviewActions.ts`: Handles editorial reviews, status saves, and resolution flags.
    *   `useReviewHighlighter.ts`: Hooks the parser and node highlighter into report render events.
*   **`src/pages/`**: Page views mapped by the router layout slots.
*   **`src/routes/`**: Declarative routing mapping URLs to pages.
*   **`src/services/`**: Simulated database APIs.
    *   `mockData.ts`: Central database mock entries for reports and AI reviews.
*   **`src/store/`**: Global Zustand stores for lightweight states.
*   **`src/types/`**: TypeScript interfaces defining reports, comments, publications, and dashboard stats.
*   **`src/utils/`**: Helper methods for slug generation, status styles, coordinate mapping, and date formatting.

---

## 🛠️ Build & Linting Scripts

Use these npm commands to verify style guides and build output:

### 1. Code Style Linting
Uses ESLint configured in [eslint.config.js](file:///d:/BlueOcean/gen_rpt_review-frontend-main/eslint.config.js):
```bash
npm run lint
```

### 2. Production Compilation
Runs TypeScript compiler safety check and compiles optimized static asset bundles:
```bash
npm run build
```
*   The production code will be bundled in the `/dist` directory.

### 3. Local Production Preview
Serves the compiled production bundle locally to test build output:
```bash
npm run preview
```

---

## 💾 Customizing Mock Datasets

Since the application is running purely in the browser client, all dashboard metrics, report text sections, and AI scores are read from **[src/services/mockData.ts](file:///d:/BlueOcean/gen_rpt_review-frontend-main/src/services/mockData.ts)**.

### Adding a New Report
To add another document to the list, insert an object into the `MOCK_REPORTS` array conforming to the `Report` interface:

```typescript
export interface Report {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  status: string;        // 'Generated' | 'AI Reviewed' | 'Needs Revision' | 'Approved' | 'Published' | 'Rejected'
  humanStatus: string;   // 'Not Started' | 'Pending' | 'In Progress' | 'Approved' | 'Needs Revision' | 'Rejected'
  publishReady: boolean;
  aiScore: number;
  commentCount: number;
  comments: Comment[];
  reportContent: {
    brand: string;       // e.g. "BlueOcean"
    label: string;       // e.g. "Deep Research Report"
    date: string;        // e.g. "June 2026"
    sections: ReportSection[];
  };
  aiReview?: AIReview;
}
```
