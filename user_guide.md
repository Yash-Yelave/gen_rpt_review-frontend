# 📖 Report Reviewer & Editorial User Guide

Welcome to the Report Review Dashboard. This guide explains how to navigate the human-in-the-loop (HITL) review workspace, make text edits, trigger AI-assisted rewrites, and publish finalized intelligence reports.

---

## 🧭 Step 1: Choosing a Report to Audit
1. Start at the main **Dashboard** view.
2. Review the KPI cards at the top showing current tallies (e.g., *AI Reviewed*, *Needs Revision*, *Approved*).
3. Look at the **Pending Review Table** below. Find the report you want to work on.
4. **Click any row** in the table to open that report inside the 3-panel review workspace.

---

## ✍️ Step 2: Editing Text Sections Inline
The center panel renders the interactive document text.
1. **Hover & Edit**: Double-click any paragraph or hover over text block content to edit the text directly inside your browser.
2. **Unsaved Count Indicator**: As you make changes, a green badge count will appear over the **Save Edits** icon (a pencil with a save floppy disk) in the top-right header toolbar.
3. **Saving your edits**: Click the **Save Edits button** in the topbar to save your prose edits back to R2 storage and update the cached document copy.
4. ⚠️ **CRITICAL RULES**:
   * **Always save inline edits first** using the pencil topbar button before clicking the primary "Save Review" button or navigating away.
   * If you try to leave with unsaved changes, the browser will display an alert warning you that your work will be lost.

---

## 🤖 Step 3: Prompting Inline AI Revisions (Optional)
If you want the AI engine to modify or rewrite a paragraph for you:
1. Hover your cursor over the target paragraph.
2. A context-aware **AI Toolbar** will hover beside the text block.
3. Select one of the three actions:
   * 📝 **Rewrite**: Makes the text more concise and professional.
   * 📈 **Expand**: Elaborates on the topic with added detail and context.
   * 🔄 **Regenerate**: Swaps the current paragraph with a freshly compiled draft.

---

## 🚦 Step 4: Submitting your Editorial Decision
The right-hand column hosts the **Human Review Panel**. Use this to log your official review status.
1. Select one of the three decisions:
   * **Approved**: The report content is accurate, styled correctly, and ready to go.
   * **Needs Revision**: The report requires structural rewrites or additional facts. Select the target document section from the dropdown list and provide clear, detailed comments in the instructions box.
   * **Rejected**: The report is redundant or out of scope.
2. Click the primary **Save Review** button in the topbar to submit.

---

## 🚀 Step 5: Publishing (Pushing to Production)
Once a report is marked as `Approved`:
1. Open the approved report.
2. Click the primary **Publish Report** button in the top-right toolbar.
3. This registers the document status as `Published` and pushes the finalized web layout and playwrite PDF to production servers.

---

## 📌 Critical Checklist
* **Save Edits Icon vs. Save Review Button**: They are different! Use the **pencil icon** to save text edits. Use the **Save Review** text button to change the review status.
* **Keep Edits Intact**: Do not submit an approval status if you have unsaved text changes in progress (represented by the green badge). Click the save icon first!
* **Version Control**: Look at the **Version History panel** in the right-hand sidebar to see previous drafts or restore a previous version of the report text.

---

## 📥 Bulk Generation Queue & Flow Controller
For editorial admins generating reports in batches using CSV files, the Bulk Generate page provides sequential dispatch scheduling and concurrency limits:

### 1. Starting a Bulk Generation
1. Upload your CSV containing list of report topics.
2. Configure the **Concurrency Threshold** (e.g. `5`, `10`, `15`, or `20` concurrent runs) under Step 1. This determines how many workflows can run simultaneously to conserve your rate limits and API tokens.
3. Click **Start Generation**.

### 2. Managing the Pending Queue
Once submitted, the queue table under Step 2 monitors live progress:
* **`Running` (Pulsing Blue)**: The report is actively compiling in GitHub Actions.
* **`Pending` (Gray)**: The report is queued in the database backlog and will dispatch automatically as slots open up.
* **`Paused` (Amber)**: The report is queued, but processing is currently paused.

### 3. Pause & Resume Controls
* **Pause Pending Jobs**: Clicking this stops the scheduler from dispatching any new runs. Any currently `Running` workflows will finish executing, but the remaining backlog changes status to `Paused` and stays queued.
* **Resume Pending Jobs**: Resumes the queue manager, immediately dispatching paused/pending reports up to your configured concurrency limit.

### 4. Cancel All Workflows (Stop Everything)
* Click **Cancel All Workflows** next to the pause control to stop all operations instantly.
* **Database Action**: Changes the status of all pending and running bulk reports to `Failed (Manually Cancelled)` to completely clear the dashboard queue.
* **GitHub Action**: Instantly sends termination signals to GitHub Actions to abort all active runner containers, protecting and saving your LLM API tokens.


---

## 📂 Knowledge Base (RAG) Management
The **Knowledge Base** section in the sidebar allows you to upload and manage the private reference documents that the AI uses as its ground truth (also called RAG - Retrieval-Augmented Generation). It contains three main views:

### 1. 📁 Collections Tab
* **What it is**: Think of collections as folders or libraries. 
* **How it works**: You use collections to group related documents together (for example, putting all "Project SkyNet" documents in one collection, and "Consumer Survey" documents in another). When you generate a new report, you choose which collection of files the AI should read to write that report.

### 2. 📄 Documents Tab
* **What it is**: Your central document manager.
* **How it works**: This view lists all the individual files (PDFs, Markdown, text files) currently uploaded to the system. You can see their filename, which collection they belong to, and their status (e.g., whether the system is currently processing them or if they are ready for the AI to read). You can also delete outdated files here.

### 3. 📤 Upload Documents Tab
* **What it is**: The importer for new files.
* **How it works**: 
  1. Select the **Target Collection** where you want your new files to go.
  2. Drag and drop your files (or click to browse) into the upload area.
  3. Click **Upload**. The system will process the documents, automatically read their text, and prepare them for the AI to reference.


