// src/components/report/ReportPreview.tsx
import React, { useMemo } from 'react';
import { Bot, FileText, MapPin, ArrowRight } from 'lucide-react';
import type { Report } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { useReportNavStore } from '@/store/reportNavigationStore';
import { formatScoreKey } from '@/utils/formatters';
import { scoreColor, priorityBadgeClasses } from '@/utils/statusHelpers';
import { ReportSectionRenderer } from './ReportRenderer';
import { buildLocationIndex, resolveLocation } from '@/utils/locationIndex';
import {
  parseLocation,
  extractSeverity,
  stripSeverity,
} from '@/utils/locationParser';

interface Props {
  report: Report;
}

// Static contributors list (per spec — not part of report data model)
const CONTRIBUTORS = [
  { name: 'Yash Yelave', initials: 'YY' },
  { name: 'Jacob', initials: 'JC' },
  { name: 'YFen', initials: 'YF' },
  { name: 'Niluksha', initials: 'NL' },
];
const AVATAR_COLORS = ['bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-teal-600'];

// ─────────────────────────────────────────────────────────────────────────────
// Section TOC — auto-generated horizontal strip above document body
// ─────────────────────────────────────────────────────────────────────────────
const SectionTOC: React.FC<{ sections: { heading: string; anchorId: string }[] }> = ({
  sections,
}) => {
  const handleClick = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!sections.length) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mr-1">
        Contents
      </span>
      {sections.map((s) => (
        <button
          key={s.anchorId}
          onClick={() => handleClick(s.anchorId)}
          className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline px-1.5 py-0.5 rounded transition-colors"
        >
          {s.heading}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Severity badge
// ─────────────────────────────────────────────────────────────────────────────
const SeverityBadge: React.FC<{ severity: 'High' | 'Medium' | 'Low' | null }> = ({
  severity,
}) => {
  if (!severity) return null;
  const cls =
    severity === 'High'
      ? 'bg-red-50 border border-red-200 text-red-700'
      : severity === 'Medium'
      ? 'bg-orange-50 border border-orange-200 text-orange-700'
      : 'bg-gray-50 border border-gray-200 text-gray-600';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls}`}>
      {severity}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Location badge
// ─────────────────────────────────────────────────────────────────────────────
const LocationBadge: React.FC<{
  section: string;
  paragraph: number | null;
  resolvedId: string | null;
}> = ({ section, paragraph, resolvedId }) => {
  const navigateTo = useReportNavStore((s) => s.navigateTo);

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
      <div className="flex items-center gap-1 text-[11px] text-gray-500">
        <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
        <span className="font-medium text-gray-700">{section}</span>
        {paragraph !== null && (
          <span className="text-gray-400">— Para {paragraph}</span>
        )}
      </div>
      {resolvedId && (
        <button
          onClick={() => navigateTo(resolvedId)}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
        >
          Jump to Report
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual finding card
// ─────────────────────────────────────────────────────────────────────────────
interface FindingCardProps {
  text: string;
  sectionHeadings: string[];
  locationIndex: ReturnType<typeof buildLocationIndex>;
  categoryColor?: string;
}

const FindingCard: React.FC<FindingCardProps> = ({
  text,
  sectionHeadings,
  locationIndex,
}) => {
  const severity = extractSeverity(text);
  const displayText = stripSeverity(text);
  const parsedLoc = parseLocation(text, sectionHeadings);
  const resolvedId = parsedLoc
    ? resolveLocation(parsedLoc.section, parsedLoc.paragraph, locationIndex)
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-2.5 mb-2 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-gray-700 leading-snug flex-1">{displayText}</span>
        <SeverityBadge severity={severity} />
      </div>
      {parsedLoc && (
        <LocationBadge
          section={parsedLoc.section}
          paragraph={parsedLoc.paragraph}
          resolvedId={resolvedId}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Review pane — grouped interactive findings
// ─────────────────────────────────────────────────────────────────────────────
const AIReviewPane: React.FC<{ report: Report }> = ({ report }) => {
  const { aiReview, reportContent } = report;

  const sectionHeadings = useMemo(
    () => reportContent.sections.filter((s) => !s.isDisclaimer).map((s) => s.heading),
    [reportContent.sections]
  );

  const locationIndex = useMemo(
    () => buildLocationIndex(reportContent.sections),
    [reportContent.sections]
  );

  if (!aiReview) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bot className="w-8 h-8 text-gray-300 mb-2" />
        <div className="text-sm font-semibold text-gray-500">No AI Review</div>
        <div className="text-xs text-gray-400 mt-1">
          AI review has not been generated for this report.
        </div>
      </div>
    );
  }

  const sharedFindingProps = { sectionHeadings, locationIndex };

  return (
    <div className="py-4">
      {/* Score header */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-blue-50 border border-blue-100 rounded-md">
        <div>
          <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
            AI Score
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {aiReview.scores.overall_score.toFixed(1)}
          </div>
        </div>
        <div className="h-10 w-px bg-blue-200 mx-1" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 flex-1">
          {Object.entries(aiReview.scores.components).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600">{formatScoreKey(key)}</span>
              <span className="text-xs font-bold" style={{ color: scoreColor(val) }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths — static list, no location linking needed */}
      {aiReview.recommendations.strengths.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-2">
            Strengths
          </div>
          <ul className="flex flex-col gap-1">
            {aiReview.recommendations.strengths.map((s, i) => (
              <li key={i} className="review-list-item strength">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {aiReview.recommendations.weaknesses.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-red-700 mb-2">
            Weaknesses
          </div>
          {aiReview.recommendations.weaknesses.map((w, i) => (
            <FindingCard key={i} text={w} {...sharedFindingProps} />
          ))}
        </div>
      )}

      {/* Data Gaps */}
      {aiReview.dataGaps?.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-2">
            Data Gaps
          </div>
          {aiReview.dataGaps.map((g, i) => (
            <FindingCard key={i} text={g} {...sharedFindingProps} />
          ))}
        </div>
      )}

      {/* Writing Flaws */}
      {aiReview.writingFlaws?.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-red-700 mb-2">
            Writing Flaws
          </div>
          {aiReview.writingFlaws.map((f, i) => (
            <FindingCard key={i} text={f} {...sharedFindingProps} />
          ))}
        </div>
      )}

      {/* Strategic Gaps */}
      {aiReview.strategicGaps?.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-2">
            Strategic Gaps
          </div>
          {aiReview.strategicGaps.map((g, i) => (
            <FindingCard key={i} text={g} {...sharedFindingProps} />
          ))}
        </div>
      )}

      {/* GCC Gaps */}
      {aiReview.gccGaps?.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-2">
            GCC Gaps
          </div>
          {aiReview.gccGaps.map((g, i) => (
            <FindingCard key={i} text={g} {...sharedFindingProps} />
          ))}
        </div>
      )}

      {/* Priority Improvements */}
      {aiReview.recommendations.priority_improvements.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-2">
            Priority Improvements
          </div>
          {aiReview.recommendations.priority_improvements.map((imp, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-md p-2.5 mb-2 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-800">{imp.issue}</span>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${priorityBadgeClasses(
                    imp.priority_level
                  )}`}
                >
                  {imp.priority_level}
                </span>
              </div>
              <div className="text-xs text-gray-500 leading-snug mb-1">{imp.impact}</div>
              <div className="text-xs text-blue-700 leading-snug font-medium">
                Fix: {imp.suggested_fix}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Executive Readiness */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">
          Executive Readiness
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { label: 'Board Members', key: 'board_members' as const },
              { label: 'Ministers', key: 'ministers' as const },
              { label: 'CEOs', key: 'ceos' as const },
              { label: 'SWF', key: 'sovereign_wealth_funds' as const },
              { label: 'Senior Exec', key: 'senior_executives' as const },
            ] as const
          ).map((item) => {
            const ready = aiReview.recommendations.executive_readiness[item.key];
            return (
              <span
                key={item.key}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                  ready
                    ? 'bg-green-50 border border-green-100 text-green-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-500'
                }`}
              >
                {ready ? '✓' : '×'} {item.label}
              </span>
            );
          })}
        </div>
        {aiReview.recommendations.executive_readiness.justification && (
          <p className="text-xs text-gray-500 mt-2 leading-snug">
            {aiReview.recommendations.executive_readiness.justification}
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ReportPreview export
// ─────────────────────────────────────────────────────────────────────────────
export const ReportPreview: React.FC<Props> = ({ report }) => {
  const { zoomLevel, zoomIn, zoomOut } = useUIStore();
  const { reportContent: content, title, id, version, aiScore } = report;

  // Tab state now lives in the navigation store so the AI Review pane can switch tabs
  const activeTab = useReportNavStore((s) => s.activeTab);
  const setActiveTab = useReportNavStore((s) => s.setActiveTab);

  // Build section list for TOC (exclude disclaimers)
  const tocSections = useMemo(
    () =>
      content.sections
        .filter((s) => !s.isDisclaimer)
        .map((s) => ({
          heading: s.heading,
          anchorId: `section-${s.heading.toLowerCase().replace(/[^\w]+/g, '-')}`,
        })),
    [content.sections]
  );

  return (
    <div className="flex flex-col border-r border-gray-200 bg-gray-100 overflow-hidden h-full">
      {/* ── Tab Bar ── */}
      <div className="flex items-center bg-white border-b border-gray-200 flex-shrink-0 px-2">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'report'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Report
        </button>
        <button
          onClick={() => setActiveTab('ai-review')}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ai-review'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          AI Review
        </button>

        {/* Zoom controls — only shown on report tab */}
        {activeTab === 'report' && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={zoomOut}
              className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors font-medium"
              aria-label="Zoom out"
            >
              A−
            </button>
            <span className="text-xs text-gray-400 min-w-[36px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={zoomIn}
              className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors font-medium"
              aria-label="Zoom in"
            >
              A+
            </button>
          </div>
        )}
      </div>

      {/* ── Section TOC (only on report tab) ── */}
      {activeTab === 'report' && <SectionTOC sections={tocSections} />}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'report' ? (
          <div
            className="report-document"
            style={{ fontSize: `${zoomLevel / 100}rem` }}
          >
            {/* Document Header */}
            <div className="border-b-2 border-blue-700 pb-5 mb-6">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                {content.brand} · {content.label}
              </div>
              <div className="text-[22px] font-bold text-gray-900 tracking-tight leading-snug mb-2">
                {title}
              </div>
              <div className="flex items-center gap-4 flex-wrap mb-3">
                <span className="text-xs text-gray-400">ID: {id}</span>
                <span className="text-xs text-gray-400">{version}</span>
                <span className="text-xs text-gray-400">{content.date}</span>
              </div>

              {/* AI Score badge */}
              {aiScore > 0 && (
                <div className="flex gap-3 mb-4">
                  <span className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">
                    AI Score: {aiScore.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Contributors */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Worked On By:</span>
                <div className="flex items-center gap-1.5">
                  {CONTRIBUTORS.map((c, i) => (
                    <div key={c.name} className="relative group">
                      <div
                        className={`w-7 h-7 rounded-full ${
                          AVATAR_COLORS[i % AVATAR_COLORS.length]
                        } text-white text-[11px] font-bold flex items-center justify-center border-2 border-white -ml-1 first:ml-0 cursor-default`}
                        title={c.name}
                      >
                        {c.initials}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {c.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections — rendered with stable paragraph IDs */}
            {content.sections.map((section, i) => (
              <ReportSectionRenderer
                key={i}
                heading={section.heading}
                body={section.body}
                isDisclaimer={section.isDisclaimer}
              />
            ))}
          </div>
        ) : (
          <AIReviewPane report={report} />
        )}
      </div>
    </div>
  );
};
