# 🏛️ Application Architecture & Data Flow

This document details the software architecture, state management patterns, and data-fetching techniques employed in the BlueOcean Report Review Dashboard.

---

## 🧭 System Overview & Routes

The application uses **React Router v7 (React Router DOM)** to handle page routing. The root structure is wrapped inside `AppLayout`, which provides a global sidebar container, global alerts/toasts, and routing slots.

The routes are declared in **[routes/index.tsx](file:///d:/BlueOcean/gen_rpt_review-frontend-main/src/routes/index.tsx)**:

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `Navigate` | Redirects to `/dashboard`. |
| `/dashboard` | `Dashboard` | The central landing page displaying KPI cards and the aggregate report overview table. |
| `/ai-reviewed` | `AIReviewedList` | A grid of generated reports that have undergone automatic AI evaluation and are awaiting human audit. |
| `/review/:reportId` | `ReportReview` | The interactive 3-panel workspace for auditing, leaving comments, and writing revisions. |
| `/approved` | `ApprovedReportsList` | Grid of reports approved by editorial leads, ready to be sent to production. |
| `/revisions` | `RevisionsList` | Archive of reports returned to the AI generation pipeline for rewrite/regeneration. |
| `/rejected` | `RejectedList` | Archive of rejected/discarded reports. |
| `/published` | `PublishedList` | Archive of successfully published reports. |
| `/settings` | `Settings` | User configuration panel for reviewer names, roles, and AI score auto-approve thresholds. |

---

## ⚡ State Management (Zustand)

Global UI states, persisted profile configs, and active review forms are managed using **Zustand** stores in `src/store/`. This decouples side-effects and form state from React's render tree, protecting the editor canvas from re-render lag when the user types comments.

### 1. Auth & Settings Store (`src/store/authStore.ts`)
*   **Purpose**: Stores the active reviewer’s profile information (`reviewerName`, `reviewerRole`) and the `aiThreshold` value (which marks whether a report automatically gets classified as high quality).
*   **Feature**: Employs the `persist` middleware to save these settings to `localStorage` under the key `blueocean-auth`.
*   **Methods**:
    *   `setReviewerName(name)` / `setReviewerRole(role)` / `setAiThreshold(threshold)`
    *   `getAvatarInitials()`: Returns a two-character uppercase string based on the current name.

### 2. UI Store (`src/store/uiStore.ts`)
*   **Purpose**: Manages global layout states:
    *   `sidebarCollapsed`: Collapses the left sidebar.
    *   `zoomLevel`: Controls the document text size percentage (bounded between 70% and 150%).
    *   `toasts`: Holds a list of active Toast notifications.
    *   `searchQuery` / `statusFilter`: Input states for filtering tables and grids.
*   **Methods**:
    *   `zoomIn()` / `zoomOut()`: Increases/decreases the zoom by 10%.
    *   `showToast(message, type)`: Generates a toast notification with a unique ID and auto-clears it after 3 seconds.

### 3. Review Store (`src/store/reviewStore.ts`)
*   **Purpose**: Houses the transient form data for the Human Editorial Panel:
    *   `decision`: Selected radio action (`Approved`, `Needs Revision`, `Rejected`).
    *   `commentText`: The feedback/instructions draft textarea.
    *   `commentSection`: The dropdown section targeting the feedback (e.g. `Executive Summary`).
    *   `commentPriority`: The severity priority of the revision request (`Low`, `Medium`, `High`).
*   **Note**: Using Zustand here avoids triggering heavy document rendering passes as the user types their revision instructions.

### 4. Annotation Store (`src/store/annotationStore.ts`)
*   **Purpose**: Manages the interactive hover-and-click sidebar detail panel:
    *   `annotations`: Contains all parsed annotations extracted from the loaded `review.md`.
    *   `activeAnnotation`: The specific flaw/finding detail currently opened in the right annotation sidebar (or null if closed).
*   **Methods**: `openAnnotation(ann)` and `closeAnnotation()`.

### 5. Report Navigation Store (`src/store/reportNavigationStore.ts`)
*   **Purpose**: Handles navigation tab triggers and scroll highlighting inside the 3-panel editorial view:
    *   `activeTab`: Controls the current tab page of the report canvas (`report` or `ai-review`).
    *   `highlightedId`: Holds the DOM ID of a paragraph that should be scrolled into view and flashed with a blue indicator.
*   **Methods**: `navigateTo(paragraphId)` automatically switches the active tab to `report` and updates the target ID.

---

## 🔄 Async Data Fetching (TanStack Query)

To manage data cache consistency and background synchronization, the application wraps all service calls in React Query hooks in `src/hooks/`:

### 1. `useReports` Hook (`src/hooks/useReports.ts`)
Handles the reading of reports and computes stats for dashboard counters:
*   `useReports()`: Fetches the list of all reports (cached with a `staleTime` of 30 seconds).
*   `useReport(id)`: Fetches a single report object.
*   `useDashboardMetrics()`: Computes counts of reports grouped by status (`Approved`, `Needs Revision`, `AI Reviewed`, etc.) to feed dashboard counts.

### 2. `useReviewActions` Hook (`src/hooks/useReviewActions.ts`)
Handles mutation operations that change reports or add comments, ensuring that the caches are immediately invalidated on success so the UI stays up-to-date:
*   `submitComment`: Submits a section comment thread and invalidates `['comments']` and `['reports']`.
*   `resolveComment`: Marks an existing comment as resolved.
*   `saveReview`: Saves the active editorial decision state.
*   `markDone`: Approves a report.
*   `sendToPublish`: Approves a report and pushes it to the publishing queue.
*   `requestRegeneration`: Posts feedback, changes status to `Needs Revision`, and logs regeneration intent.
*   `rejectReport`: Rejects a report.

---

## 🌐 Enterprise Backend & Storage Layer

The application operates in an integrated enterprise mode, routing requests to the **FastAPI Backend** (configured via `VITE_API_BASE_URL` to `/api/v1` or Render API). It uses **Cloudflare R2** as the persistent storage engine.

```mermaid
graph TD
    subgraph Client Browser
        UI[React Pages / Canvas]
        RQ[TanStack Query Cache]
        API[API Client src/api/client.ts]
    end
    subgraph Enterprise Backend Layer
        FA[FastAPI Server on Render]
        CACHE[MOCK_REPORTS memory cache]
        PDF[Playwright PDF Release Service]
    end
    subgraph Storage Buckets
        R2_MD[(R2: report.md)]
        R2_JSON[(R2: web_report_payload.json)]
    end

    UI -->|Triggers edits| API
    API -->|PUT /content| FA
    FA -->|1. Patch memory cache| CACHE
    FA -->|2. Write updated payload| R2_JSON
    FA -->|3. Write reconstructed markdown| R2_MD
    FA -->|4. Trigger generation| PDF
    PDF -->|Fetch updated Markdown/Sections| R2_MD
    RQ -->|Invalidated on PUT success| UI
```

### 💾 Persistence & Live Synchronization Flow
When a reviewer saves inline text edits inside the human review workspace, the following unified synchronization occurs:
1. **Frontend Dispatches PUT request**: The frontend calls `PUT /api/v1/reports/{id}/content` containing the paragraph key-value edits mapping.
2. **Backend Cache Update**: The FastAPI backend patches the active report dictionary in its `MOCK_REPORTS` memory cache.
3. **Double R2 Persist**:
   * The backend patches and uploads `web_report_payload.json` back to R2.
   * The backend dynamically reconstructs the clean Markdown format from the section bodies and overwrites `report.md` in R2.
4. **PDF Regeneration**: The backend triggers the PDF release engine. The release service resolves the report HTML and reconstructs the markdown text from the sections, invoking Python's `markdown` parser to inject the revised text directly into the `<article class="article-main">` layout of the PDF compilation context.
5. **TanStack Query Invalidation**: Upon receiving a successful PUT status, the frontend immediately invalidates the React Query cache for the report, forcing an instantaneous network refetch so the refreshed UI stays synchronized without any stale delay.

---

## 🔒 Strict System Constraints & Logics

The following are **critical architectural components** that must not be altered, as they form the foundational logic of the application:

### 1. Highlighting & Annotation Engine
* **Logic**: AI review annotations mapping to the document are based on character coordinates and substring match sequences mapped by `reviewHighlighter.ts`.
* **Constraint**: Any modifications to report parsing or DOM rendering must preserve paragraph tags and their stable coordinates-derived identifiers.

### 2. Standard Slugification Rules
* **Logic**: Frontend paragraph IDs and backend heading identifiers must use the exact same slugification pattern:
  `heading.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')`
* **Constraint**: Do not change this regex. If the slugification pattern deviates, paragraph IDs will mismatch, causing edit updates to be silently skipped by the backend.

### 3. Editorial State Machine
* **Logic**: The status transition flows (`AI Reviewed` -> `Needs Revision` -> `Approved` -> `Published`) represent core operational flows hook-linked with external automation pipelines.
* **Constraint**: Status values and transition paths must not be changed.

### 4. 3-Panel Workspace Layout
* **Logic**: The reviewer's screen is split into three side-by-side components: Section Navigation, Interactive Report Canvas, and AI Review / Version History panel.
* **Constraint**: Maintain this premium three-column workspace layout structure to keep the UI clean and scannable.
