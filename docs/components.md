# 🧱 UI Component Reference

This document serves as a catalog of the core layouts, pages, and interactive components that build the BlueOcean Report Review Dashboard.

---

## 🩻 Layout & Shell Components

The dashboard layout keeps navigation and notifications consistent across all views.

### 1. App Layout Shell (`src/components/layout/AppLayout.tsx`)
*   **Purpose**: Renders the container grid (`app-shell`).
*   **Features**:
    *   Integrates the left sidebar.
    *   Hosts the `<Toast />` manager in the bottom-right corner to show global operation successes or warnings.
    *   Includes the `<Outlet />` element to display the current router-matched page.

### 2. Sidebar Navigation (`src/components/layout/Sidebar.tsx`)
*   **Purpose**: Left-hand navigation panel.
*   **Features**:
    *   Supports collapsing (stored in Zustand) to free up horizontal space during active report audits.
    *   Fetches real-time status counts from `useReports()` to display numerical notification badges next to menu routes (e.g., displaying the count of reports awaiting review or marked for revision).
    *   Includes a user avatar block with initials derived from the stored reviewer profile.

---

## 📊 Dashboard Page Components

The main dashboard page provides aggregates, KPIs, and a report overview table.

### 1. Stats KPI Card (`src/components/dashboard/StatCard.tsx`)
*   **Purpose**: Renders metrics at the top of the dashboard.
*   **Features**:
    *   Displays titles, numeric tallies, and color-coded status indicator dots.
    *   Renders a secondary trend/metric string (e.g., "Needs action").

### 2. Reports Table (`src/components/dashboard/ReportTable.tsx`)
*   **Purpose**: Renders the table list of all documents.
*   **Features**:
    *   Columns: Title, AI Score, Grade (Gold/Silver/Bronze), Status, and Last Updated.
    *   Actions: "Review" link, which navigates directly to the 3-panel review canvas for that document.

---

## ✍️ The 3-Panel Editorial Workspace

When a user clicks "Review" on any report, they enter the editorial workspace.

```text
┌───────────────────────────┬──────────────────────────────────────────┬─────────────────────────┐
│                           │               MIDDLE PANEL               │       RIGHT PANEL       │
│  LEFT PANEL (Sidebar)     │         (Interactive Document)           │  (Editorial Control)    │
│                           ├──────────────────────────────────────────┤                         │
│  • Dashboard              │  Tabs: [ Report ]  [ AI Review ]         │  • Human Review Card    │
│  • AI Reviewed [3]        ├──────────────────────────────────────────┤    - Decision Selector  │
│  • Approved [5]           │  TOC: Executive | Highlights | Risks     │    - Revision Comments  │
│  • Revisions [2]          ├──────────────────────────────────────────┤                         │
│  • Settings               │  Report Text (Interactive Highlight)     │  • Comment Thread       │
│                           │  [Hover Flaws] → [AnnotationSidebar]     │    - Section Specific   │
│                           │                                          │    - Resolve Actions    │
└───────────────────────────┴──────────────────────────────────────────┴─────────────────────────┘
```

### 1. Review Topbar (`src/components/review/ReviewTopbar.tsx`)
*   **Purpose**: Controls top header actions on the active review page.
*   **Features**:
    *   Displays current document status badges and metadata.
    *   Provides quick page navigation buttons (e.g., back arrow).
    *   Shows a "Previous Report" / "Next Report" navigation control to browse the queue without returning to the main list.

### 2. Report Canvas Preview (`src/components/report/ReportPreview.tsx`)
*   **Purpose**: The central middle panel that contains the interactive document viewport.
*   **Features**:
    *   **Tab switching**:
        *   **Report**: Renders the formatted document with custom zoom adjustment buttons (`A-` / `A+`), a Horizontal Section Table of Contents for quick anchor jumps, and author/collaborator initials avatars.
        *   **AI Review**: Renders detailed AI evaluation scores, strengths & weaknesses lists, data/strategic/writing gaps, and checklists showing readiness for executive audiences (CEOs, Ministers, Board, SWF).
    *   Integrates the **`AnnotationSidebar`**: A drawer panel that slides out from the right when an inline highlight in the report is clicked, rendering the exact issue text.

### 3. Report Section Renderer (`src/components/report/ReportRenderer.tsx`)
*   **Purpose**: Renders the section headings and parses text block strings.
*   **Features**:
    *   Maps paragraphs into structural React elements.
    *   Assigns unique HTML IDs to prose paragraphs (e.g., `key-highlights-p2`) while skipping unordered lists or numeric tables, enabling target navigation anchor jumps.

### 4. Human Review Panel (`src/components/review/HumanReviewCard.tsx`)
*   **Purpose**: The active editorial decision form located in the right sidebar.
*   **Features**:
    *   **Decision Radio Buttons**: Selection between `Approved`, `Needs Revision`, or `Rejected`.
    *   **Approved Flow**: Displays approval alerts and unlocks the "Publish Report" primary button.
    *   **Needs Revision Flow**: Renders target section selection drop-downs, priority mapping (Low/Medium/High), instruction feedback entry, and primary "Save Review" triggers.
    *   **Rejection Modal**: Displays a modal popup requesting confirmation before finalizing a report rejection.

### 5. Comment Cards & Thread (`src/components/comments/`)
*   **Components**: `CommentThread.tsx`, `CommentCard.tsx`.
*   **Purpose**: Manages and displays review comments on the right side of the editorial workspace.
*   **Features**:
    *   Groups and lists comments left during the current audit cycle.
    *   Displays metadata for each comment: Author name, target report section, priority rating, and creation timestamp.
    *   Provides a **Mark Resolved** button to transition active comments to resolved.
