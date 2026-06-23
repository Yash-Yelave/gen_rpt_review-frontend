# 🌊 BlueOcean Report Review Dashboard Documentation

Welcome to the documentation for the **Report Review Dashboard** (Vite + React + TS). This dashboard serves as the Human-in-the-Loop (HITL) Editor for the Deep Research report generation engine (`gen_rpt`). It allows reviewers and editorial leads to review generated AI reports, inspect detailed AI evaluations, leave structured comments, request sections for regeneration, and publish reports.

## 📂 Documentation Directory

To help you understand the architecture, design patterns, and workflows of the application, we have structured the documentation into five core guides:

| File | Topic | Description |
| :--- | :--- | :--- |
| **[Architecture & Data Flow](file:///d:/BlueOcean/gen_rpt_review-frontend-main/docs/architecture.md)** | Tech Stack & State | Zustand global stores, React Query custom hooks, and mock service API layer. |
| **[Component Guide](file:///d:/BlueOcean/gen_rpt_review-frontend-main/docs/components.md)** | UI Structure | Deep dive into the 3-panel review canvas, reusable layout shells, and common elements. |
| **[Highlighting & Navigation](file:///d:/BlueOcean/gen_rpt_review-frontend-main/docs/highlighting_navigation.md)** | Location Syncing | How `review.md` findings are parsed, mapped to DOM paragraphs, and highlighted dynamically. |
| **[Editorial Workflows](file:///d:/BlueOcean/gen_rpt_review-frontend-main/docs/workflows.md)** | Report Lifecycle | The exact states and actions for Approving, Revising, Rejecting, and Publishing reports. |

---

## 🏗️ Quick Technical Overview

The review dashboard is built using standard enterprise React patterns:

*   **Vite 8 & TypeScript**: Extremely fast builds, Hot Module Replacement (HMR), and compile-time type-safety.
*   **Tailwind CSS**: A corporate style guide using custom tailwind color variables (`bg-surface-body`, `bg-surface-panel`, etc.).
*   **Zustand**: Decoupled state management. Form drafts (what the user is typing) and active highlights are stored in Zustand to prevent React page re-render lag.
*   **TanStack React Query v5**: Transparent caching and mutation tracking. Refetches are managed with query invalidations.
*   **Direct DOM Node Highlighter**: To bypass React's virtual DOM reconciliation overhead when highlights change dynamically, matches in the report body are directly wrapped in highlight spans via clean, vanilla JavaScript DOM-walking.

---

> [!NOTE]
> All files in the source folder use customized path aliases starting with `@/` to reference `/src`.
> Check [vite.config.ts](file:///d:/BlueOcean/gen_rpt_review-frontend-main/vite.config.ts) and [tsconfig.app.json](file:///d:/BlueOcean/gen_rpt_review-frontend-main/tsconfig.app.json) for details.
