import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as storage from '../utils/storage';
import { defaultWordLibrary } from '../data/initWords';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [wordLibrary, setWordLibrary] = useState({});
  const [records, setRecords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);
  const [stats, setStats] = useState({
    todayWords: 0,
    todayCorrectRate: 0,
    wrongWordsCount: 0,
    continuousDays: 0,
    totalDays: 0,
  });
  const [calendarData, setCalendarData] = useState([]);
  const [grades, setGrades] = useState([]);

  // 背诵流程相关
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [reciteResult, setReciteResult] = useState(null);
  const [customWords, setCustomWords] = useState(null);

  // 初始化数据
  const loadAllData = useCallback(() => {
    storage.initializeData(defaultWordLibrary);
    
    const lib = storage.getWordLibrary();
    const recs = storage.getRecords();
    const wrongs = storage.getWrongWords();
    const todayStats = storage.getTodayStats();
    
    setWordLibrary(lib);
    setRecords(recs);
    setWrongWords(wrongs);
    setGrades(Object.keys(lib));
    
    setStats({
      todayWords: todayStats.totalWords,
      todayCorrectRate: todayStats.correctRate,
      wrongWordsCount: wrongs.length,
      continuousDays: storage.getContinuousDays(),
      totalDays: storage.getTotalStudyDays(),
    });
    
    setCalendarData(storage.getCalendarData(28));
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 语音功能
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // 停止当前正则播放的
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 稍微慢点，适合小学生
    window.speechSynthesis.speak(utterance);
  };

  const navigateTo = (page, params = {}) => {
    if (params.grade) setSelectedGrade(params.grade);
    if (params.unit) setSelectedUnit(params.unit);
    if (params.customWords) setCustomWords(params.customWords);
    if (params.result) setReciteResult(params.result);
    
    setCurrentPage(page);
    // 每次切换页面时滚动到顶部
    window.scrollTo(0, 0);
  };

  const refreshStats = () => {
    loadAllData();
  };

  const value = {
    currentPage,
    wordLibrary,
    records,
    wrongWords,
    stats,
    calendarData,
    grades,
    selectedGrade,
    selectedUnit,
    reciteResult,
    customWords,
    navigateTo,
    refreshStats,
    speak,
    storage, // 暴露出原始存储工具，以防某些页面需要直接操作
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
