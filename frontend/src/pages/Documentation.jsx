import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentationLayout from '@/components/documentation/DocumentationLayout';
import DocumentationHeader from '@/components/documentation/DocumentationHeader';
import DocumentationTabs from '@/components/documentation/DocumentationTabs';
import DocumentationGenerator from '@/components/documentation/DocumentationGenerator';
import GenerationProgress from '@/components/documentation/GenerationProgress';
import DocumentationPreview from '@/components/documentation/DocumentationPreview';
import DocumentationEditor from '@/components/documentation/DocumentationEditor';
import DocumentationHistory from '@/components/documentation/DocumentationHistory';
import DocumentationLoading from '@/components/documentation/DocumentationLoading';
import DocumentationError from '@/components/documentation/DocumentationError';
import DocumentationEmptyState from '@/components/documentation/DocumentationEmptyState';
import { repositoryService } from '@/services/repositoryService';
import { documentationService } from '@/services/documentationService';
import { useMeta } from '@/hooks/useMeta';

export default function Documentation() {
  const { id, owner, repo: repoSlug } = useParams();
  const navigate = useNavigate();
  const targetRepoId = owner && repoSlug ? `${owner}/${repoSlug}` : (id || 'ecommerce-platform');

  useMeta({
    title: `Documentation Generator - ${targetRepoId} | GitHub Knowledge Assistant`,
    description: 'Generate clear technical documentation and REST API references using AI.',
    robots: 'noindex, nofollow',
  });

  const [repo, setRepo] = useState(null);
  const [docs, setDocs] = useState(null);
  const [docTypes, setDocTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('readme');
  
  // Options state
  const [scope, setScope] = useState('Entire Repository');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional');
  const [detailLevel, setDetailLevel] = useState('Detailed');

  // View state
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'preview' | 'editor' | 'history'
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');
      try {
        const repoData = await repositoryService.getRepository(targetRepoId);
        setRepo(repoData);

        const types = await documentationService.getDocumentationTypes();
        setDocTypes(types);

        const docData = await documentationService.getDocumentation(targetRepoId, selectedType);
        setDocs(docData);
      } catch (err) {
        setError('Failed to load repository documentation.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [targetRepoId, selectedType]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError('');

    try {
      const generated = await documentationService.generateDocumentation(
        targetRepoId,
        {
          type: selectedType,
          scope,
          language,
          tone,
          detailLevel,
        },
        (prog, msg) => {
          setProgress(prog);
          setProgressMsg(msg);
        }
      );

      setDocs(generated);
      setActiveTab('preview');
    } catch (err) {
      setError('Documentation generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (sectionId) => {
    try {
      const res = await documentationService.regenerateSection(docs?.id, sectionId);
      if (res.success && docs?.sections) {
        const updatedSections = docs.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, content: res.updatedContent } : sec
        );
        setDocs({ ...docs, sections: updatedSections });
      }
    } catch (err) {
      console.error('Section regeneration failed:', err);
    }
  };

  const handleSaveContent = async (newContent) => {
    if (!docs) return;
    const updated = await documentationService.updateDocumentation(docs.id, newContent);
    setDocs(updated);
  };

  const handleCopy = () => {
    if (!docs?.content) return;
    navigator.clipboard.writeText(docs.content);
  };

  const handleDownload = (format) => {
    if (!docs?.content) return;
    const filename = `${docs.type || 'README'}.${format === 'txt' ? 'txt' : 'md'}`;
    const blob = new Blob([docs.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DocumentationLayout repo={repo}>
      
      {/* Workspace Header */}
      <DocumentationHeader
        repo={repo}
        lastGenerated={docs?.lastGenerated}
        isGenerating={isGenerating}
        onGenerateClick={handleGenerate}
      />

      {/* Error Alert */}
      {error && <DocumentationError message={error} onRetry={handleGenerate} />}

      {/* Progress Animation Bar */}
      {isGenerating && (
        <GenerationProgress progress={progress} message={progressMsg} />
      )}

      {/* Mode Navigation Tabs */}
      <DocumentationTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Tab Render Switch */}
      {isLoading ? (
        <DocumentationLoading />
      ) : (
        <>
          {/* TAB 1: GENERATOR & OPTIONS */}
          {activeTab === 'generator' && (
            <DocumentationGenerator
              types={docTypes}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              scope={scope}
              onScopeChange={setScope}
              language={language}
              onLanguageChange={setLanguage}
              tone={tone}
              onToneChange={setTone}
              detailLevel={detailLevel}
              onDetailLevelChange={setDetailLevel}
              isGenerating={isGenerating}
              onGenerateClick={handleGenerate}
            />
          )}

          {/* TAB 2: MARKDOWN PREVIEW */}
          {activeTab === 'preview' && (
            docs ? (
              <DocumentationPreview
                documentation={docs}
                onModeChange={(m) => setActiveTab(m)}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onRegenerate={handleGenerate}
                onRegenerateSection={handleRegenerateSection}
              />
            ) : (
              <DocumentationEmptyState onGenerateClick={handleGenerate} repoName={repo?.name} />
            )
          )}

          {/* TAB 3: RAW EDITOR */}
          {activeTab === 'editor' && (
            <DocumentationEditor
              content={docs?.content || ''}
              onSave={handleSaveContent}
              onModeChange={(m) => setActiveTab(m)}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onRegenerate={handleGenerate}
            />
          )}

          {/* TAB 4: VERSION HISTORY */}
          {activeTab === 'history' && (
            <DocumentationHistory history={docs?.history || []} />
          )}
        </>
      )}

    </DocumentationLayout>
  );
}
