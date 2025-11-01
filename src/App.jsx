import { useState, useEffect } from 'react';
import './App.css';
import {
  initializeData,
  getTodayStats,
  getWrongWordsCount,
  getContinuousDays,
  getTotalStudyDays,
  getCalendarData,
  getWordLibrary,
  getUnitWords
} from './utils/storage';
import { defaultWordLibrary } from './data/initWords';
import UnitSelectPage from './pages/UnitSelectPage';
import RecitePage from './pages/RecitePage';
import ReciteResultPage from './pages/ReciteResultPage';
import WrongBookPage from './pages/WrongBookPage';
import HistoryPage from './pages/HistoryPage';
import LibraryPage from './pages/LibraryPage';

// SVG图标组件
const HomeIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const WrongBookIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const HistoryIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

const LibraryIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const BookIcon = () => (
  <svg className="w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const EditIcon = () => (
  <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CrossIcon = () => (
  <svg className="w-12 h-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const FireIcon = () => (
  <svg className="w-12 h-12 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.5 12.5l-5.5-2.5 7-5 7 5-5.5 2.5z"></path>
    <path d="M3 12.5l7 4 7-4"></path>
    <path d="M3 17l7 4 7-4"></path>
  </svg>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [stats, setStats] = useState({
    todayWords: 0,
    todayCorrectRate: 0,
    wrongWordsCount: 0,
    continuousDays: 0,
    totalDays: 0,
  });
  const [calendarData, setCalendarData] = useState([]);
  const [grades, setGrades] = useState([]);

  // 背诵流程相关状态
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [reciteResult, setReciteResult] = useState(null);
  const [customWords, setCustomWords] = useState(null); // 用于错词本复习等自定义单词列表

  useEffect(() => {
    // 初始化数据
    initializeData(defaultWordLibrary);

    // 加载统计数据
    loadStats();

    // 加载年级段列表
    loadGrades();
  }, []);

  const loadStats = () => {
    const todayStats = getTodayStats();
    const wrongCount = getWrongWordsCount();
    const continuous = getContinuousDays();
    const total = getTotalStudyDays();
    const calendar = getCalendarData(28);

    setStats({
      todayWords: todayStats.totalWords,
      todayCorrectRate: todayStats.correctRate,
      wrongWordsCount: wrongCount,
      continuousDays: continuous,
      totalDays: total,
    });

    setCalendarData(calendar);
  };

  const loadGrades = () => {
    const library = getWordLibrary();
    const gradeList = Object.keys(library);
    setGrades(gradeList);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)' }}>
      {/* 左侧导航栏 - 桌面端 */}
      <aside className="sidebar fixed left-0 top-0 h-screen w-64 p-6 hidden md:flex flex-col">
        <div className="mb-10">
          <div className="flex items-center mb-2">
            <LibraryIcon />
            <h1 className="text-2xl font-bold text-white ml-1">单词背诵</h1>
          </div>
          <p className="text-white/70 text-sm ml-11">Word Learning Tool</p>
        </div>

        <nav className="flex-1">
          <div
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <HomeIcon />
            <span>开始学习</span>
          </div>
          <div
            className={`nav-item ${currentPage === 'wrongbook' ? 'active' : ''}`}
            onClick={() => navigateTo('wrongbook')}
          >
            <WrongBookIcon />
            <span>错词本</span>
          </div>
          <div
            className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => navigateTo('history')}
          >
            <HistoryIcon />
            <span>学习记录</span>
          </div>
          <div
            className={`nav-item ${currentPage === 'library' ? 'active' : ''}`}
            onClick={() => navigateTo('library')}
          >
            <LibraryIcon />
            <span>单词库</span>
          </div>
        </nav>
      </aside>

      {/* 底部导航栏 - 手机端 */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden flex">
        <div className="flex justify-around items-center w-full">
          <div className="flex flex-col items-center py-2 px-4 cursor-pointer" onClick={() => navigateTo('home')}>
            <HomeIcon />
            <span className="text-xs text-gray-700">学习</span>
          </div>
          <div className="flex flex-col items-center py-2 px-4 cursor-pointer" onClick={() => navigateTo('wrongbook')}>
            <WrongBookIcon />
            <span className="text-xs text-gray-700">错词本</span>
          </div>
          <div className="flex flex-col items-center py-2 px-4 cursor-pointer" onClick={() => navigateTo('history')}>
            <HistoryIcon />
            <span className="text-xs text-gray-700">记录</span>
          </div>
          <div className="flex flex-col items-center py-2 px-4 cursor-pointer" onClick={() => navigateTo('library')}>
            <LibraryIcon />
            <span className="text-xs text-gray-700">单词库</span>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="md:ml-64 p-6 pb-24 md:pb-6">
        {/* 首页 */}
        {currentPage === 'home' && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">开始学习</h2>
              <p className="text-gray-500 mt-1">今天也要加油哦！💪</p>
            </div>

            {/* 统计数据面板 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 今日学习 */}
              <div className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">今日已学</p>
                    <p className="text-4xl font-bold text-blue-600 mt-1">{stats.todayWords}</p>
                  </div>
                  <EditIcon />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">正确率</span>
                  <span className="text-green-600 font-bold">{stats.todayCorrectRate}%</span>
                </div>
                <div className="mt-2 bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.todayCorrectRate}%` }}></div>
                </div>
              </div>

              {/* 错词统计 */}
              <div className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">错词本</p>
                    <p className="text-4xl font-bold text-red-600 mt-1">{stats.wrongWordsCount}</p>
                  </div>
                  <CrossIcon />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">待复习</span>
                  <button onClick={() => navigateTo('wrongbook')} className="text-red-600 font-bold hover:text-red-700">
                    去复习 →
                  </button>
                </div>
              </div>

              {/* 学习天数 */}
              <div className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">连续学习</p>
                    <p className="text-4xl font-bold text-purple-600 mt-1">
                      {stats.continuousDays}<span className="text-xl">天</span>
                    </p>
                  </div>
                  <FireIcon />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">累计学习</span>
                  <span className="text-purple-600 font-bold">{stats.totalDays}天</span>
                </div>
              </div>
            </div>

            {/* 学习日历热力图 */}
            <div className="card mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📅 学习日历（最近4周）</h3>
              <div className="flex items-start space-x-2 overflow-x-auto">
                <div className="text-xs text-gray-500 space-y-2 mt-6">
                  <div>一</div>
                  <div>三</div>
                  <div>五</div>
                  <div>日</div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {calendarData.map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-day level-${day.level}`}
                        title={`${day.date}: ${day.count}个单词`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4 text-xs text-gray-500">
                <span>少</span>
                <div className="calendar-day level-0"></div>
                <div className="calendar-day level-1"></div>
                <div className="calendar-day level-2"></div>
                <div className="calendar-day level-3"></div>
                <span>多</span>
              </div>
            </div>

            {/* 选择学习内容 */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📖 选择学习内容</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grades.map((grade) => (
                  <div key={grade} className="grade-card" onClick={() => {
                    setSelectedGrade(grade);
                    setCurrentPage('unitSelect');
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-bold text-gray-800">{grade}</h4>
                      <BookIcon />
                    </div>
                    <p className="text-gray-700 text-sm mb-3 font-medium">
                      {Object.keys(getWordLibrary()[grade] || {}).length}个单元
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">点击开始学习</span>
                      <span className="text-purple-700 font-bold">进入 →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Unit选择页面 */}
        {currentPage === 'unitSelect' && selectedGrade && (
          <UnitSelectPage
            grade={selectedGrade}
            onSelectUnit={(unitName) => {
              setSelectedUnit(unitName);
              setCurrentPage('recite');
            }}
            onBack={() => {
              setSelectedGrade(null);
              setCurrentPage('home');
            }}
          />
        )}

        {/* 背诵页面 */}
        {currentPage === 'recite' && selectedGrade && selectedUnit && (
          <RecitePage
            grade={selectedGrade}
            unit={selectedUnit}
            words={customWords || getUnitWords(selectedGrade, selectedUnit)}
            onComplete={(result) => {
              setReciteResult(result);
              setCustomWords(null); // 清除自定义单词列表
              setCurrentPage('result');
              // 刷新统计数据
              loadStats();
            }}
            onBack={() => {
              setSelectedUnit(null);
              const wasFromWrongBook = customWords !== null;
              setCustomWords(null); // 清除自定义单词列表
              setCurrentPage(wasFromWrongBook ? 'wrongbook' : 'unitSelect');
            }}
          />
        )}

        {/* 背诵完成页面 */}
        {currentPage === 'result' && reciteResult && (
          <ReciteResultPage
            result={reciteResult}
            onBackHome={() => {
              setSelectedGrade(null);
              setSelectedUnit(null);
              setReciteResult(null);
              setCurrentPage('home');
            }}
            onViewHistory={() => {
              setCurrentPage('history');
            }}
          />
        )}

        {/* 错词本页面 */}
        {currentPage === 'wrongbook' && (
          <WrongBookPage
            onReviewWords={(grade, unit, words) => {
              setSelectedGrade(grade);
              setSelectedUnit(unit);
              setCustomWords(words); // 使用自定义单词列表
              setCurrentPage('recite');
            }}
          />
        )}

        {/* 学习记录页面 */}
        {currentPage === 'history' && <HistoryPage />}

        {/* 单词库管理和备份恢复页面 */}
        {currentPage === 'library' && (
          <LibraryPage
            onRefresh={() => {
              loadStats();
              loadGrades();
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
