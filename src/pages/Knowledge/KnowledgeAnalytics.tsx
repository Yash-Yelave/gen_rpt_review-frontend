// src/pages/Knowledge/KnowledgeAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { knowledgeApiService } from '@/services/knowledgeApi';
import { 
  BarChart3, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Award, 
  CheckCircle,
  FileText,
  Clock
} from 'lucide-react';

export const KnowledgeAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'retrieval'>('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);
  const [retrieval, setRetrieval] = useState<any>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [analyticsData, qualityData, retrievalData] = await Promise.all([
        knowledgeApiService.getIntelligenceAnalytics(),
        knowledgeApiService.getKnowledgeQuality(),
        knowledgeApiService.getRetrievalPerformance()
      ]);
      setAnalytics(analyticsData);
      setQuality(qualityData);
      setRetrieval(retrievalData);
    } catch (err) {
      console.error('Failed to fetch analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getMetricPercentage = (val: number) => {
    return Math.round(val * 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Knowledge Analytics</h1>
            <p className="text-sm text-gray-500">Global metrics, collection quality indexes, and retrieval accuracy reports</p>
          </div>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'quality', label: 'Knowledge Quality', icon: Award },
              { id: 'retrieval', label: 'Retrieval Performance', icon: Zap }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6 animate-fadeIn">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: 'Total Documents', val: analytics.growth_metrics?.total_documents || 0, sub: 'Ingested repositories', icon: FileText, color: 'text-blue-600 bg-blue-50' },
                  { title: 'Total Chunks', val: analytics.growth_metrics?.total_chunks || 0, sub: 'Fragmented vector nodes', icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
                  { title: 'Validation Compliance', val: `${getMetricPercentage(analytics.quality_metrics?.validation_score || 0)}%`, sub: 'Adherence to policy thresholds', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
                  { title: 'Total Citation Reuse', val: analytics.reuse_metrics?.shared_citations_count || 0, sub: 'Cross-report cited evidence', icon: Award, color: 'text-purple-600 bg-purple-50' }
                ].map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{c.title}</div>
                          <div className="text-2xl font-bold text-gray-900 mt-2">{c.val}</div>
                        </div>
                        <div className={`p-2.5 rounded-lg ${c.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-3">{c.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Value Metrics & Search Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Ingestion Growth & Ingestion Value</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monthly Document Growth</span>
                      <span className="font-semibold text-gray-900">+{analytics.growth_metrics?.monthly_growth_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estimated Embedding Coverage</span>
                      <span className="font-semibold text-gray-900">{getMetricPercentage(analytics.coverage_metrics?.embedding_coverage || 0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cross-Collection Citation Reuse Rate</span>
                      <span className="font-semibold text-gray-900">{analytics.reuse_metrics?.citation_reuse_ratio || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Storage Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Database Collections</span>
                      <span className="font-semibold text-gray-900">{analytics.growth_metrics?.active_collections_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Validation Compliance Grade</span>
                      <span className="font-semibold text-gray-900 capitalize">{analytics.quality_metrics?.overall_quality_grade || 'A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Database Search Success Rate</span>
                      <span className="font-semibold text-gray-900">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quality Tab Content */}
          {activeTab === 'quality' && quality && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Overall Quality Score', value: `${getMetricPercentage(quality.overall_quality_score || 0)}%`, desc: 'Weighted score of trust, authority, and freshness.' },
                  { label: 'Authority Score', value: `${getMetricPercentage(quality.authority_score || 0)}%`, desc: 'Reputation index of uploaded citation sources.' },
                  { label: 'Freshness Index', value: `${getMetricPercentage(quality.freshness_score || 0)}%`, desc: 'Evaluation of document ages and decay ratios.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-2">{item.value}</div>
                    <div className="text-xs text-gray-500 mt-3">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Global Knowledge Integrity Indexes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Source Trust Score</span>
                        <span className="text-gray-900">{getMetricPercentage(quality.authority_score || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getMetricPercentage(quality.authority_score || 0)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Evidence Completeness Score</span>
                        <span className="text-gray-900">{getMetricPercentage(quality.completeness_score || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${getMetricPercentage(quality.completeness_score || 0)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Retrieval Confidence Score</span>
                        <span className="text-gray-900">{getMetricPercentage(quality.confidence_score || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${getMetricPercentage(quality.confidence_score || 0)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">Validation Engine Success Rate</span>
                        <span className="text-gray-900">{getMetricPercentage(quality.validation_score || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${getMetricPercentage(quality.validation_score || 0)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retrieval Tab Content */}
          {activeTab === 'retrieval' && retrieval && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Average Retrieval Latency', value: `${Math.round(retrieval.average_latency_ms || 0)}ms`, desc: 'Average query response duration in milliseconds.', icon: Clock, color: 'text-blue-600' },
                  { label: 'Cache Hit Rate', value: `${getMetricPercentage(retrieval.cache_hit_rate || 0)}%`, desc: 'Percentage of requests served from caching layer.', icon: Zap, color: 'text-yellow-500' },
                  { label: 'Similarity Threshold', value: `${getMetricPercentage(retrieval.average_similarity || 0)}%`, desc: 'Mean vector cosine similarity score.', icon: Award, color: 'text-indigo-600' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                        <div className="text-3xl font-extrabold text-gray-900 mt-2">{item.value}</div>
                        <div className="text-xs text-gray-500 mt-2">{item.desc}</div>
                      </div>
                      <div className={`p-3 rounded-xl bg-gray-50 ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions */}
              {retrieval.optimization_recommendations && retrieval.optimization_recommendations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                    Retrieval Performance Recommendations
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {retrieval.optimization_recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
