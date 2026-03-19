import { AppProvider, useApp } from './context/AppContext';
import './App.css';
import { Sidebar, MobileNav } from './components/layout/Navigation';
import UnitSelectPage from './pages/UnitSelectPage';
import RecitePage from './pages/RecitePage';
import ReciteResultPage from './pages/ReciteResultPage';
import WrongBookPage from './pages/WrongBookPage';
import HistoryPage from './pages/HistoryPage';
import LibraryPage from './pages/LibraryPage';
import { HomeView } from './components/views/HomeView';

function AppContent() {
  const { 
    currentPage, 
    selectedGrade, 
    selectedUnit, 
    reciteResult, 
    customWords, 
    navigateTo, 
    refreshStats,
    wordLibrary
  } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomeView />;
      
      case 'unitSelect':
        return (
          <UnitSelectPage
            grade={selectedGrade}
            onSelectUnit={(unitName) => navigateTo('recite', { grade: selectedGrade, unit: unitName })}
            onBack={() => navigateTo('home')}
          />
        );
      
      case 'recite':
        return (
          <RecitePage
            grade={selectedGrade}
            unit={selectedUnit}
            words={customWords || (wordLibrary[selectedGrade]?.[selectedUnit] || [])}
            onComplete={(result) => {
              navigateTo('result', { result });
              refreshStats();
            }}
            onBack={() => {
              const wasFromWrongBook = customWords !== null;
              navigateTo(wasFromWrongBook ? 'wrongbook' : 'unitSelect', { grade: selectedGrade });
            }}
          />
        );
      
      case 'result':
        return (
          <ReciteResultPage
            result={reciteResult}
            onBackHome={() => navigateTo('home')}
            onViewHistory={() => navigateTo('history')}
          />
        );
      
      case 'wrongbook':
        return (
          <WrongBookPage
            onReviewWords={(grade, unit, words) => {
              navigateTo('recite', { grade, unit, customWords: words });
            }}
          />
        );
      
      case 'history':
        return <HistoryPage />;
      
      case 'library':
        return (
          <LibraryPage
            onRefresh={refreshStats}
          />
        );
      
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen app-layout">
      {/* 桌面端侧边栏 */}
      <Sidebar />
      
      {/* 手机端底部导航 */}
      <MobileNav />

      {/* 主内容区 */}
      <main className="main-content md:ml-64 p-4 pb-24 md:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
