import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, BarChart3, Lock, Zap, Layers, History, AlertCircle } from 'lucide-react';
import AnalysisLayout from '@/components/analysis/AnalysisLayout';
import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import AnalysisProgress from '@/components/analysis/AnalysisProgress';
import HealthScore from '@/components/analysis/HealthScore';
import ScoreCard from '@/components/analysis/ScoreCard';
import AnalysisStats from '@/components/analysis/AnalysisStats';
import IssueSummary from '@/components/analysis/IssueSummary';
import IssueFilters from '@/components/analysis/IssueFilters';
import IssueList from '@/components/analysis/IssueList';
import IssueDetails from '@/components/analysis/IssueDetails';
import CodeQuality from '@/components/analysis/CodeQuality';
import SecurityAnalysis from '@/components/analysis/SecurityAnalysis';
import PerformanceAnalysis from '@/components/analysis/PerformanceAnalysis';
import ArchitectureAnalysis from '@/components/analysis/ArchitectureAnalysis';
import FileAnalysis from '@/components/analysis/FileAnalysis';
import FunctionAnalysis from '@/components/analysis/FunctionAnalysis';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';
import AnalysisEmptyState from '@/components/analysis/AnalysisEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { repositoryService } from '@/services/repositoryService';
import { analysisService } from '@/services/analysisService';
import { useMeta } from '@/hooks/useMeta';

export default function CodeAnalysis() {
  const { id, owner, repo: repoSlug } = useParams();
  const navigate = useNavigate();

  const targetRepoId = id
    ? decodeURIComponent(id)
    : owner && repoSlug
    ? `${owner}/${repoSlug}`
    : 'ecommerce-platform';

  useMeta({
    title: `Code Analysis - ${targetRepoId} | GitHub Knowledge Assistant`,
    description: 'Proactively audit codebase health, security risks, and performance bottlenecks.',
    robots: 'noindex, nofollow',
  });

  const [repo, setRepo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'issues' | 'quality' | 'security' | 'performance' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const repoData = await repositoryService.getRepository(targetRepoId);
        setRepo(repoData);

        const auditData = await analysisService.getAnalysis(targetRepoId);
        setAnalysis(auditData);
      } catch (err) {
        console.error('Failed to load analysis:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [targetRepoId]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const updatedData = await analysisService.runAnalysis(targetRepoId, (prog, msg) => {
      setAnalysisProgress(prog);
      setProgressMessage(msg);
    });

    setAnalysis({ ...updatedData, lastAnalyzed: 'Just now' });
    setIsAnalyzing(false);
  };

  const handleViewCode = (issue) => {
    navigate(`/repository/${encodeURIComponent(targetRepoId)}`);
  };

  const handleExplainAi = (issue) => {
    navigate(`/repository/${encodeURIComponent(targetRepoId)}/chat`, {
      state: {
        contextFile: {
          name: issue?.file ? issue.file.split('/').pop() : 'main.js',
          path: issue?.file || 'src/main.js',
          language: 'javascript',
        },
      },
    });
  };

  const filteredIssues = (analysis?.issues || []).filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = !severityFilter || issue.severity === severityFilter;
    const matchesCategory = !categoryFilter || issue.category === categoryFilter;
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'issues', label: `Issues (${analysis?.issues?.length || 0})`, icon: ShieldCheck },
    { id: 'quality', label: 'Code Quality', icon: BarChart3 },
    { id: 'security', label: 'Security Audit', icon: Lock },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'history', label: 'Audit History', icon: History },
  ];

  return (
    <AnalysisLayout repo={repo}>
      
      {/* Analysis Header */}
      <AnalysisHeader
        repo={repo}
        lastAnalyzed={analysis?.lastAnalyzed}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={handleRunAnalysis}
      />

      {/* Simulated Analysis Progress */}
      {isAnalyzing && (
        <AnalysisProgress progress={analysisProgress} message={progressMessage} />
      )}

      {/* Main Workspace Navigation Tabs */}
      <div className="border-b border-border/60 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-2 sm:space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Rendering */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !analysis ? (
        <AnalysisEmptyState onRunAnalysis={handleRunAnalysis} repoName={repo?.name} isIndexing={repo?.status !== 'INDEXED'} />
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Radial Score Gauge & Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-4">
                  <HealthScore score={analysis.healthScore} status={analysis.healthStatus} />
                </div>
                <div className="md:col-span-8 grid grid-cols-2 gap-4">
                  <ScoreCard title="Code Quality" score={analysis.scores.quality} icon={BarChart3} color="text-blue-500" />
                  <ScoreCard title="Security" score={analysis.scores.security} icon={Lock} color="text-emerald-500" />
                  <ScoreCard title="Performance" score={analysis.scores.performance} icon={Zap} color="text-amber-500" />
                  <ScoreCard title="Architecture" score={analysis.scores.architecture} icon={Layers} color="text-purple-500" />
                </div>
              </div>

              {/* Analysis Stats Bar */}
              <AnalysisStats stats={analysis.stats} />

              {/* Issue Severity Summary */}
              <IssueSummary issues={analysis.issues} />

              {/* Problematic Files & Complex Functions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileAnalysis
                  files={analysis.problematicFiles}
                  onViewFile={() => navigate(`/repository/${id || 'ecommerce-platform'}`)}
                />
                <FunctionAnalysis functions={analysis.complexFunctions} />
              </div>
            </div>
          )}

          {/* TAB 2: ISSUES */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              <IssueFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                severityFilter={severityFilter}
                onSeverityChange={setSeverityFilter}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
              />

              <IssueList
                issues={filteredIssues}
                onViewCode={handleViewCode}
                onExplainAi={handleExplainAi}
                onViewDetails={(issue) => {
                  setSelectedIssue(issue);
                  setIsModalOpen(true);
                }}
              />
            </div>
          )}

          {/* TAB 3: CODE QUALITY */}
          {activeTab === 'quality' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <CodeQuality metrics={analysis.qualityMetrics} />
              </div>
              <div className="lg:col-span-5">
                <FunctionAnalysis functions={analysis.complexFunctions} />
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <SecurityAnalysis />
              </div>
              <div className="lg:col-span-5 space-y-4">
                <IssueSummary issues={analysis.issues.filter((i) => i.category === 'security')} />
              </div>
            </div>
          )}

          {/* TAB 5: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <PerformanceAnalysis />
              </div>
              <div className="lg:col-span-5">
                <FileAnalysis
                  files={analysis.problematicFiles}
                  onViewFile={() => navigate(`/repository/${id || 'ecommerce-platform'}`)}
                />
              </div>
            </div>
          )}

          {/* TAB 6: HISTORY */}
          {activeTab === 'history' && (
            <AnalysisHistory history={analysis.history} />
          )}
        </>
      )}

      {/* Issue Details Modal */}
      <IssueDetails
        issue={selectedIssue}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onViewCode={handleViewCode}
        onExplainAi={handleExplainAi}
      />

    </AnalysisLayout>
  );
}
