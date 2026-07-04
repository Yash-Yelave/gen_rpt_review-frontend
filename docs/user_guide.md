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
