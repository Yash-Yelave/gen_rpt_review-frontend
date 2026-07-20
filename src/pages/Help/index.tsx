import React from 'react';
import { BookOpen, Edit3, Sparkles, CheckCircle, UploadCloud, FolderTree, FileText } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';

export const Help: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          System Help & User Guide
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Learn how to navigate the human-in-the-loop review workspace, manage bulk generations, and upload RAG documents.
        </p>
      </div>

      <div className="space-y-6">
        <SectionCard title="1. Editorial Review Workspace" icon={<Edit3 />} defaultOpen className="shadow-sm border border-gray-200 rounded-lg">
          <div className="p-5 text-sm text-gray-700 space-y-4">
            <h4 className="font-semibold text-gray-900">Editing Text Inline</h4>
            <p>
              Double-click any paragraph or hover over text block content to edit the text directly inside your browser. 
              As you make changes, a green badge count will appear over the <strong>Save Edits</strong> icon (pencil) in the top-right toolbar.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-800">
              <strong className="block mb-1">CRITICAL RULE:</strong>
              Always save inline edits first using the pencil topbar button before clicking the primary "Save Review" button or navigating away.
            </div>

            <h4 className="font-semibold text-gray-900 mt-6">Prompting Inline AI Revisions</h4>
            <p>Hover your cursor over a target paragraph to reveal the AI Toolbar with three actions:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Rewrite:</strong> Makes the text more concise and professional.</li>
              <li><strong>Expand:</strong> Elaborates on the topic with added detail and context.</li>
              <li><strong>Regenerate:</strong> Swaps the current paragraph with a freshly compiled draft.</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mt-6">Submitting Editorial Decisions</h4>
            <p>Use the right-hand Human Review Panel to log your official status (Approved, Needs Revision, or Rejected). Once approved, you can click "Publish Report" to push the web layout and PDF to production.</p>
          </div>
        </SectionCard>

        <SectionCard title="2. Bulk Generation Queue" icon={<Sparkles />} defaultOpen className="shadow-sm border border-gray-200 rounded-lg">
          <div className="p-5 text-sm text-gray-700 space-y-4">
            <p>
              The Bulk Generate page provides sequential dispatch scheduling and concurrency limits to conserve your rate limits and API tokens.
            </p>
            <h4 className="font-semibold text-gray-900">Queue Statuses</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><span className="text-blue-600 font-semibold">Running:</span> Actively compiling in GitHub Actions.</li>
              <li><span className="text-gray-500 font-semibold">Pending:</span> Queued in the database backlog and will dispatch automatically.</li>
              <li><span className="text-amber-600 font-semibold">Paused:</span> Queued, but processing is currently paused.</li>
            </ul>
            <p className="mt-4">
              <strong>Cancel All Workflows:</strong> Instantly sends termination signals to GitHub Actions to abort all active runner containers, protecting your LLM tokens.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="3. Knowledge Base (RAG) Management" icon={<FolderTree />} defaultOpen className="shadow-sm border border-gray-200 rounded-lg border-blue-100 bg-blue-50/30">
          <div className="p-5 text-sm text-gray-700 space-y-6">
            <p>
              The <strong>Knowledge Base</strong> section in the sidebar allows you to upload and manage private reference documents that the AI uses as its ground truth (Retrieval-Augmented Generation).
            </p>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex gap-4 items-start">
              <FolderTree className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Collections Tab</h4>
                <p className="mt-1 text-gray-600">
                  Think of collections as virtual folders or libraries. You use collections to group related documents together 
                  (e.g., all "Project SkyNet" files in one collection). When generating a new report, you tell the AI which collection to read from.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex gap-4 items-start">
              <FileText className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Documents Tab</h4>
                <p className="mt-1 text-gray-600">
                  Your central document manager. This view lists all individual files (PDFs, Markdown, etc.) currently in the system. 
                  You can see their filename, their assigned collection, and their background processing status. You can also delete outdated files here.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex gap-4 items-start">
              <UploadCloud className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Upload Documents Tab</h4>
                <p className="mt-1 text-gray-600">
                  The importer for new files. Select the <strong>Target Collection</strong>, drag and drop your files, and click Upload. 
                  The system will automatically extract the text, chunk it, and prepare the embeddings for the AI to reference.
                </p>
              </div>
            </div>

          </div>
        </SectionCard>
      </div>
    </div>
  );
};
