import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { AIReviewedList } from '@/pages/AIReviewed';
import { ReportReview } from '@/pages/Review/ReportReview';
import { ApprovedReportsList } from '@/pages/ApprovedReports';
import { PublishedList } from '@/pages/Published';
import { RevisionsList } from '@/pages/Revisions';
import { RejectedList } from '@/pages/Rejected';
import { Settings } from '@/pages/Settings';
import { GenerationHistory } from '@/pages/GenerationHistory';
import { BulkGenerate } from '@/pages/BulkGenerate';
import { Login } from '@/pages/Login';
import { Help } from '@/pages/Help';
import { useAuthStore } from '@/store/authStore';

// Knowledge components
import { CollectionsList } from '@/pages/Knowledge/CollectionsList';
import { DocumentsList } from '@/pages/Knowledge/DocumentsList';
import { UploadDocuments } from '@/pages/Knowledge/UploadDocuments';
import { ProcessingQueue } from '@/pages/Knowledge/ProcessingQueue';
import { KnowledgeAnalytics } from '@/pages/Knowledge/KnowledgeAnalytics';

// Simple Auth Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'generation-history', element: <GenerationHistory /> },
      { path: 'bulk-generate', element: <BulkGenerate /> },
      { path: 'ai-reviewed', element: <AIReviewedList /> },
      { path: 'review/:reportId', element: <ReportReview /> },
      { path: 'approved', element: <ApprovedReportsList /> },
      { path: 'revisions', element: <RevisionsList /> },
      { path: 'rejected', element: <RejectedList /> },
      { path: 'published', element: <PublishedList /> },
      { path: 'settings', element: <Settings /> },
      { path: 'system/help', element: <Help /> },
      
      // Knowledge Section
      { path: 'knowledge/collections', element: <CollectionsList /> },
      { path: 'knowledge/documents', element: <DocumentsList /> },
      { path: 'knowledge/upload', element: <UploadDocuments /> },
      { path: 'knowledge/processing', element: <ProcessingQueue /> },
      { path: 'knowledge/analytics', element: <KnowledgeAnalytics /> },

      // Legacy redirects
      { path: 'review', element: <Navigate to="/ai-reviewed" replace /> },
      { path: 'reviewed', element: <Navigate to="/approved" replace /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
