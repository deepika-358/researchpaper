import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { UploadSection } from './components/UploadSection';
import { ResearchLibrary } from './components/ResearchLibrary';
import { PodcastLibrary } from './components/PodcastLibrary';
import { DashboardView } from './components/DashboardView';
import { ProcessingScreen } from './components/ProcessingScreen';
import { PodcastResultModal } from './components/PodcastResultModal';
import { PaperDetailModal } from './components/PaperDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HistoryModal } from './components/HistoryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Footer } from './components/Footer';
import { api } from './services/api';
import {
  DashboardData,
  Evaluation,
  PaperSection,
  Podcast,
  Rating,
  ResearchPaper,
} from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Modals & Active items
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [processingPodcast, setProcessingPodcast] = useState<Podcast | null>(null);
  const [processingPaperTitle, setProcessingPaperTitle] = useState('');

  const [selectedPodcastData, setSelectedPodcastData] = useState<{
    podcast: Podcast;
    paper?: ResearchPaper;
    sections?: PaperSection[];
    evaluation?: Evaluation;
    ratings: Rating[];
  } | null>(null);

  const [selectedPaperData, setSelectedPaperData] = useState<{
    paper: ResearchPaper;
    sections: PaperSection[];
    podcasts: Podcast[];
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'podcast' | 'paper';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'podcast',
    id: '',
    title: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Initial data loading
  const refreshAllData = async () => {
    try {
      const [allPapers, allPodcasts, dash] = await Promise.all([
        api.getPapers(),
        api.getPodcasts(),
        api.getDashboard(),
      ]);
      setPapers(allPapers);
      setPodcasts(allPodcasts);
      setDashboardData(dash);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Polling for processing podcast
  useEffect(() => {
    let timer: any;
    if (processingPodcast && processingPodcast.status !== 'completed' && processingPodcast.status !== 'failed') {
      timer = setInterval(async () => {
        try {
          const detail = await api.getPodcastById(processingPodcast.id);
          setProcessingPodcast(detail.podcast);
          if (detail.podcast.status === 'completed') {
            refreshAllData();
          }
        } catch (e) {
          console.warn('Polling error:', e);
        }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [processingPodcast]);

  // Handle PDF Upload & Start Generation
  const handleStartUpload = async (file: File) => {
    try {
      setProcessingPaperTitle(file.name);
      setProcessingPodcast({
        id: 'temp-' + Date.now(),
        paperId: '',
        title: `Episode: ${file.name}`,
        script: '',
        audioUrl: '',
        audioFormat: 'audio/wav',
        duration: 0,
        status: 'queued',
        createdAt: new Date().toISOString(),
      });

      // 1. Upload & analyze PDF
      const uploadRes = await api.uploadPaper(file);
      setPapers((prev) => [uploadRes.paper, ...prev]);

      // 2. Start podcast generation pipeline
      const queuedPodcast = await api.generatePodcast(uploadRes.paper.id);
      setProcessingPodcast(queuedPodcast);
      setProcessingPaperTitle(uploadRes.paper.title);
      refreshAllData();
    } catch (err: any) {
      console.error('Upload / processing error:', err);
      if (processingPodcast) {
        setProcessingPodcast({
          ...processingPodcast,
          status: 'failed',
          errorMessage: err.message || 'Podcast generation failed. Please try again.',
        });
      }
    }
  };

  // Quick select sample benchmark paper
  const handleSelectSamplePaper = async (sampleTitle: string, sampleData: any) => {
    try {
      setProcessingPaperTitle(sampleTitle);
      setProcessingPodcast({
        id: 'sample-' + Date.now(),
        paperId: '',
        title: `Episode: ${sampleTitle}`,
        script: '',
        audioUrl: '',
        audioFormat: 'audio/wav',
        duration: 0,
        status: 'queued',
        createdAt: new Date().toISOString(),
      });

      // Construct a lightweight PDF Blob representing the sample paper
      const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 450 >> stream
BT
/F1 14 Tf
72 712 Td
(${sampleTitle}) Tj
ET
BT
/F1 10 Tf
72 680 Td
(Abstract: ${sampleData.description}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
720
%%EOF`;

      const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
      const sampleFile = new File([blob], `${sampleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`, {
        type: 'application/pdf',
      });

      await handleStartUpload(sampleFile);
    } catch (e: any) {
      console.error('Sample paper creation error:', e);
    }
  };

  // Open Podcast Details Modal
  const handleOpenPodcastDetail = async (podcastId: string) => {
    try {
      const data = await api.getPodcastById(podcastId);
      const paperSections = data.paper ? (await api.getPaperById(data.paper.id)).sections : [];
      setSelectedPodcastData({
        podcast: data.podcast,
        paper: data.paper,
        sections: paperSections,
        evaluation: data.evaluation,
        ratings: data.ratings,
      });
    } catch (err) {
      console.error('Error opening podcast detail:', err);
    }
  };

  // Open Paper Details Modal
  const handleOpenPaperDetail = async (paperId: string) => {
    try {
      const data = await api.getPaperById(paperId);
      setSelectedPaperData(data);
    } catch (err) {
      console.error('Error opening paper detail:', err);
    }
  };

  // Direct download podcast
  const handleDownloadPodcast = (podcastId: string, title: string) => {
    const downloadUrl = api.getPodcastDownloadUrl(podcastId);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `PaperCast_AI_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download started for podcast audio.');
  };

  // Trigger Delete confirmation
  const handlePromptDeletePodcast = (podcastId: string) => {
    const pod = podcasts.find((p) => p.id === podcastId);
    setDeleteModal({
      isOpen: true,
      type: 'podcast',
      id: podcastId,
      title: pod?.title || 'Podcast Episode',
    });
  };

  const handlePromptDeletePaper = (paperId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    setDeleteModal({
      isOpen: true,
      type: 'paper',
      id: paperId,
      title: paper?.title || 'Research Paper',
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === 'podcast') {
        await api.deletePodcast(deleteModal.id);
        if (selectedPodcastData?.podcast.id === deleteModal.id) {
          setSelectedPodcastData(null);
        }
        showToast('Podcast deleted successfully.');
      } else {
        await api.deletePaper(deleteModal.id);
        if (selectedPaperData?.paper.id === deleteModal.id) {
          setSelectedPaperData(null);
        }
        showToast('Research paper and associated data deleted successfully.');
      }
      setDeleteModal({ isOpen: false, type: 'podcast', id: '', title: '' });
      refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Unable to delete the selected item.');
    }
  };

  const scrollToUpload = () => {
    const el = document.getElementById('upload');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-2xl border border-indigo-200 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Navigation (No Login / Register Anywhere) */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenUpload={scrollToUpload}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenHistory={() => setHistoryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main>
        {/* Hero Section with AI-themed Transformation Animation */}
        <Hero
          onOpenUpload={scrollToUpload}
          onExploreHowItWorks={scrollToHowItWorks}
          onQuickPlaySeed={() => {
            if (podcasts.length > 0) {
              handleOpenPodcastDetail(podcasts[0].id);
            }
          }}
        />

        {/* PDF Upload Section */}
        <UploadSection
          onStartUpload={handleStartUpload}
          isProcessing={
            Boolean(processingPodcast && processingPodcast.status !== 'completed' && processingPodcast.status !== 'failed')
          }
          onSelectSamplePaper={handleSelectSamplePaper}
        />

        {/* Quick View Bar */}
        <div className="sticky top-[61px] z-30 border-y border-slate-200/90 bg-white/95 px-4 py-2.5 backdrop-blur-md shadow-2xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex space-x-1.5 overflow-x-auto text-xs font-semibold py-0.5">
              <button
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`rounded-xl px-3 py-1.5 transition-colors whitespace-nowrap ${
                  activeView === 'home'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🏠 Home
              </button>

              <button
                onClick={() => {
                  setActiveView('library');
                  document.getElementById('library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`rounded-xl px-3 py-1.5 transition-colors whitespace-nowrap ${
                  activeView === 'library'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                📚 Research Library ({papers.length})
              </button>

              <button
                onClick={() => {
                  setActiveView('podcasts');
                  document.getElementById('podcasts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`rounded-xl px-3 py-1.5 transition-colors whitespace-nowrap ${
                  activeView === 'podcasts'
                    ? 'bg-violet-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🎙️ Podcasts ({podcasts.length})
              </button>

              <button
                onClick={() => {
                  setActiveView('dashboard');
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`rounded-xl px-3 py-1.5 transition-colors whitespace-nowrap ${
                  activeView === 'dashboard'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                📊 Dashboard
              </button>
            </div>

            <button
              onClick={scrollToUpload}
              className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              <span>+ Upload PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Animated Steps: How It Works */}
        <HowItWorks />

        {/* 12 Feature Cards */}
        <Features />

        {/* Research Library */}
        <ResearchLibrary
          papers={papers}
          podcasts={podcasts}
          onViewPaper={handleOpenPaperDetail}
          onCreatePodcast={async (paperId) => {
            try {
              const queued = await api.generatePodcast(paperId);
              const p = papers.find((x) => x.id === paperId);
              setProcessingPaperTitle(p?.title || 'Research Paper');
              setProcessingPodcast(queued);
            } catch (err: any) {
              showToast(err.message || 'Failed to start podcast generation');
            }
          }}
          onListenPodcast={handleOpenPodcastDetail}
          onDeletePaper={handlePromptDeletePaper}
          onOpenUpload={scrollToUpload}
        />

        {/* Podcast Collection Library */}
        <PodcastLibrary
          podcasts={podcasts}
          papers={papers}
          onPlay={(pod) => handleOpenPodcastDetail(pod.id)}
          onView={(podId) => handleOpenPodcastDetail(podId)}
          onDownload={handleDownloadPodcast}
          onDelete={handlePromptDeletePodcast}
          onOpenUpload={scrollToUpload}
        />

        {/* Analytics Dashboard */}
        <DashboardView
          data={dashboardData}
          onSelectPaper={handleOpenPaperDetail}
          onSelectPodcast={handleOpenPodcastDetail}
          onOpenUpload={scrollToUpload}
        />
      </main>

      {/* Footer (No Auth) */}
      <Footer
        onNavigate={(viewId) => {
          setActiveView(viewId);
          const el = document.getElementById(viewId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenUpload={scrollToUpload}
      />

      {/* Async Generation Processing Screen Modal */}
      {processingPodcast && (
        <ProcessingScreen
          currentStage={processingPodcast.status}
          paperTitle={processingPaperTitle}
          errorMessage={processingPodcast.errorMessage}
          onCancel={() => setProcessingPodcast(null)}
          onViewCompleted={() => {
            const id = processingPodcast.id;
            setProcessingPodcast(null);
            handleOpenPodcastDetail(id);
          }}
        />
      )}

      {/* Podcast Result & Player Modal */}
      {selectedPodcastData && (
        <PodcastResultModal
          podcast={selectedPodcastData.podcast}
          paper={selectedPodcastData.paper}
          sections={selectedPodcastData.sections}
          evaluation={selectedPodcastData.evaluation}
          ratings={selectedPodcastData.ratings}
          onClose={() => setSelectedPodcastData(null)}
          onDownload={handleDownloadPodcast}
          onDelete={handlePromptDeletePodcast}
          onViewPaper={handleOpenPaperDetail}
          onGenerateAgain={async (paperId) => {
            setSelectedPodcastData(null);
            try {
              const p = papers.find((x) => x.id === paperId);
              setProcessingPaperTitle(p?.title || 'Paper');
              const queued = await api.generatePodcast(paperId);
              setProcessingPodcast(queued);
            } catch (err: any) {
              showToast(err.message || 'Generation failed');
            }
          }}
        />
      )}

      {/* Paper Details Modal */}
      {selectedPaperData && (
        <PaperDetailModal
          paper={selectedPaperData.paper}
          sections={selectedPaperData.sections}
          podcasts={selectedPaperData.podcasts}
          onClose={() => setSelectedPaperData(null)}
          onCreatePodcast={async (paperId) => {
            setSelectedPaperData(null);
            try {
              const queued = await api.generatePodcast(paperId);
              setProcessingPaperTitle(selectedPaperData.paper.title);
              setProcessingPodcast(queued);
            } catch (err: any) {
              showToast(err.message || 'Generation failed');
            }
          }}
          onListenPodcast={(podId) => {
            setSelectedPaperData(null);
            handleOpenPodcastDetail(podId);
          }}
          onDeletePaper={handlePromptDeletePaper}
        />
      )}

      {/* Global Search Modal */}
      {searchModalOpen && (
        <GlobalSearchModal
          onClose={() => setSearchModalOpen(false)}
          onSelectPaper={handleOpenPaperDetail}
          onSelectPodcast={handleOpenPodcastDetail}
        />
      )}

      {/* Activity History Modal */}
      {historyModalOpen && (
        <HistoryModal
          onClose={() => setHistoryModalOpen(false)}
          onSelectPaper={handleOpenPaperDetail}
          onSelectPodcast={handleOpenPodcastDetail}
        />
      )}

      {/* Safe Delete Confirmation Modal */}
      <DeleteConfirmModal
        type={deleteModal.type}
        title={deleteModal.title}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'podcast', id: '', title: '' })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
