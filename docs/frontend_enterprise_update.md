# Frontend Enterprise Update Documentation

This document summarizes the architectural changes made to transition the application from an R2/Cloudflare Functions backend to the new FastAPI Enterprise backend.

## Architectural Changes

### 1. Centralized API Layer
- Replaced all local `fetch()` calls scattered across the `src/services/` directory with a centralized Axios-like wrapper: `src/api/client.ts`.
- The new API layer correctly prefixes all requests with `/api/v1` (configurable via `VITE_API_BASE_URL`).
- All services (`reports.service.ts`, `reviews.service.ts`, `comments.service.ts`, `publish.service.ts`) now use this client.

### 2. New Report Generation Flow
- **Dashboard Integration:** Added a `NewReportPanel` to the `Dashboard`, allowing users to queue new report generations by providing a Topic and Industry.
- **Queue System:** The UI now reflects the `generating` state and submits data to the `/api/v1/generation/jobs` endpoint.

### 3. Generation History Page
- Added a dedicated `/generation-history` route and page.
- Lists all previous and active report generation jobs, their status (pending, generating, completed, failed), and provides a link to view the generated report when completed.

### 4. Review Workspace Enhancements
- **Version History Panel:** A new UI component added to the Review workspace (right sidebar) displaying past versions and change logs. It allows viewing and restoring previous iterations.
- **AI Editing Toolbar:** A context-aware toolbar integrated directly into the `ReportRenderer`. When hovering over specific paragraphs, reviewers can now trigger inline AI edits such as:
  - Rewrite
  - Expand
  - Regenerate
- These edits are dispatched to the backend for processing without interrupting the human review flow.

## Migration Guide for Backend Developers

Ensure the FastAPI server implements the following endpoints to support the frontend changes:

### Reports
- `GET /api/v1/reports` -> Returns `Report[]`
- `GET /api/v1/reports/:id` -> Returns `Report`
- `GET /api/v1/reports/:id/review` -> Returns Markdown string
- `POST /api/v1/reports/:id/status` -> Updates fields `status`, `humanStatus`, `publishReady`

### Comments
- `GET /api/v1/reports/:id/comments` -> Returns `Comment[]`
- `POST /api/v1/reports/:id/comments` -> Creates a comment
- `POST /api/v1/reports/edit` -> Submits an inline AI edit job (Rewrite, Expand, Regenerate)

### Generation
- `GET /api/v1/generation/jobs` -> Returns `GenerationJob[]`
- `POST /api/v1/generation/jobs` -> Starts a new generation job

## Design Philosophy Preserved
All existing UI/UX elements, typography (Inter), colors (BlueOcean branding), and dashboard layouts were strictly maintained during this migration. New components use the exact same Tailwind CSS utilities and Lucide-React iconography.
