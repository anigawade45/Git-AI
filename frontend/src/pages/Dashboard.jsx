import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import RepositorySection from '@/components/dashboard/RepositorySection';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import RepositoryImport from '@/components/dashboard/RepositoryImport';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboardService';
import { useMeta } from '@/hooks/useMeta';

export default function Dashboard() {
  useMeta({
    title: 'Dashboard | GitHub Knowledge Assistant',
    description: 'Manage your GitHub repositories and run AI analysis.',
    robots: 'noindex, nofollow',
  });

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await dashboardService.getDashboardData();
      setStats(data.stats || []);
      setRepositories(data.repositories || []);
      setActivities(data.activities || []);
    } catch (err) {
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Poll dashboard data while any repository is actively being indexed in the background
  useEffect(() => {
    const hasIndexingRepo = repositories.some(
      (r) => r.status === 'INDEXING' || r.status === 'Processing' || r.status === 'IMPORTED' || r.status === 'SYNCING'
    );
    let timer = null;
    if (hasIndexingRepo) {
      timer = setInterval(async () => {
        try {
          const data = await dashboardService.getDashboardData();
          setStats(data.stats || []);
          setRepositories(data.repositories || []);
          setActivities(data.activities || []);
        } catch (err) {
          // Ignore silent background refresh errors
        }
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [repositories]);

  const getDefaultRepoId = () => {
    if (repositories.length > 0) {
      return repositories[0].id || repositories[0].repoId || null;
    }
    return null;
  };

  const handleImportRepository = async (url) => {
    try {
      await dashboardService.importRepository(url);
      await fetchDashboardData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to import repository.'
      );
    }
  };

  const handleDeleteRepository = async (repoId) => {
    try {
      await dashboardService.removeRepository(repoId);
      await fetchDashboardData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to remove repository.'
      );
    }
  };

  const handleRepoAction = (actionType, repo = {}) => {
    const targetRepoId =
      repo.id ||
      repo.repoId ||
      getDefaultRepoId();

    if (!targetRepoId) {
      setImportModalOpen(true);
      return;
    }

    const encodedId = encodeURIComponent(targetRepoId);

    switch (actionType) {
      case 'open':
        navigate(`/repository/${encodedId}`);
        break;

      case 'analyze':
        navigate(`/repository/${encodedId}/analysis`);
        break;

      case 'chat':
      case 'assistant':
        navigate(`/repository/${encodedId}/chat`);
        break;

      case 'docs':
        navigate(`/repository/${encodedId}/docs`);
        break;

      default:
        console.log(`Action trigger: ${actionType}`, repo);
    }
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const defaultRepoId = getDefaultRepoId();

    if (tabId === 'ai-assistant') {
      if (defaultRepoId) {
        navigate(`/repository/${encodeURIComponent(defaultRepoId)}/chat`);
      }
    } else if (tabId === 'analyses') {
      if (defaultRepoId) {
        navigate(`/repository/${encodeURIComponent(defaultRepoId)}/analysis`);
      }
    } else if (tabId === 'settings') {
      navigate('/settings');
    } else if (tabId === 'help') {
      if (defaultRepoId) {
        navigate(`/repository/${encodeURIComponent(defaultRepoId)}/docs`);
      }
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      repoCount={repositories.length}
      pageTitle={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
    >
      {/* Error Retry Banner */}
      {error && (
        <Alert variant="destructive" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <div>
              <AlertTitle>Dashboard Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={fetchDashboardData} className="gap-1 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </Alert>
      )}

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'overview' && (
        <>
          {/* Welcome Banner */}
          <WelcomeHeader onImportClick={() => setImportModalOpen(true)} />

          {/* Metrics Statistics Grid */}
          <StatsCards stats={stats} isLoading={isLoading} />

          <RepositorySection
            repositories={repositories.slice(0, 3)}
            isLoading={isLoading}
            title="Recent Repositories"
            description="Your 3 most recently updated and indexed codebases."
            onDelete={handleDeleteRepository}
            onAction={handleRepoAction}
            onImportClick={() => setImportModalOpen(true)}
            onViewAllClick={() => setActiveTab('repositories')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <RecentActivity activities={activities} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-5">
              <QuickActions
                onImportClick={() => setImportModalOpen(true)}
                onActionClick={(action) => handleRepoAction(action)}
              />
            </div>
          </div>
        </>
      )}

      {/* REPOSITORIES TAB CONTENT */}
      {activeTab === 'repositories' && (
        <RepositorySection
          repositories={repositories}
          isLoading={isLoading}
          title="All Repositories"
          description="Explore, filter, and manage all your connected repositories."
          onDelete={handleDeleteRepository}
          onAction={handleRepoAction}
          onImportClick={() => setImportModalOpen(true)}
        />
      )}

      {/* ACTIVITY TAB CONTENT */}
      {activeTab === 'activity' && (
        <RecentActivity activities={activities} isLoading={isLoading} />
      )}

      {/* Import Repository Modal Dialog */}
      <RepositoryImport
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportSuccess={handleImportRepository}
      />
    </DashboardLayout>
  );
}
