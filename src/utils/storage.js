// LocalStorage 封装工具
// 提供完整的数据存储和操作API

const STORAGE_KEYS = {
  WORD_LIBRARY: 'wordLibrary',    // 单词库
  RECORDS: 'records',              // 背诵记录
  WRONG_WORDS: 'wrongWords',       // 错词本
};

// ========== 单词库操作 ==========

/**
 * 获取单词库
 * @returns {Object} 单词库数据结构
 * {
 *   "三年级上册": {
 *     "Unit 1": [{ word: "apple", meaning: "苹果" }, ...]
 *   }
 * }
 */
export const getWordLibrary = () => {
  const data = localStorage.getItem(STORAGE_KEYS.WORD_LIBRARY);
  return data ? JSON.parse(data) : {};
};

/**
 * 保存单词库
 * @param {Object} library - 单词库数据
 */
export const saveWordLibrary = (library) => {
  localStorage.setItem(STORAGE_KEYS.WORD_LIBRARY, JSON.stringify(library));
};

/**
 * 获取指定年级段的所有Unit
 * @param {string} grade - 年级段名称
 * @returns {Object} Unit数据
 */
export const getGradeUnits = (grade) => {
  const library = getWordLibrary();
  return library[grade] || {};
};

/**
 * 获取指定Unit的所有单词
 * @param {string} grade - 年级段名称
 * @param {string} unit - Unit名称
 * @returns {Array} 单词数组
 */
export const getUnitWords = (grade, unit) => {
  const library = getWordLibrary();
  return library[grade]?.[unit] || [];
};

/**
 * 添加新年级段
 * @param {string} grade - 年级段名称
 * @param {Object} units - Unit数据
 */
export const addGrade = (grade, units) => {
  const library = getWordLibrary();
  library[grade] = units;
  saveWordLibrary(library);
};

/**
 * 添加单词到指定Unit
 * @param {string} grade - 年级段名称
 * @param {string} unit - Unit名称
 * @param {Object} word - 单词对象 {word, meaning}
 */
export const addWord = (grade, unit, word) => {
  const library = getWordLibrary();
  if (!library[grade]) library[grade] = {};
  if (!library[grade][unit]) library[grade][unit] = [];
  library[grade][unit].push(word);
  saveWordLibrary(library);
};

/**
 * 删除单词（保留历史记录）
 * @param {string} grade - 年级段名称
 * @param {string} unit - Unit名称
 * @param {string} wordText - 单词文本
 */
export const deleteWord = (grade, unit, wordText) => {
  const library = getWordLibrary();
  if (library[grade]?.[unit]) {
    library[grade][unit] = library[grade][unit].filter(
      w => w.word !== wordText
    );
    saveWordLibrary(library);
  }
};

// ========== 背诵记录操作 ==========

/**
 * 获取所有背诵记录
 * @returns {Array} 记录数组
 * [{
 *   id: "uuid",
 *   date: "2024-10-25",
 *   time: "14:30:00",
 *   grade: "三年级上册",
 *   unit: "Unit 1",
 *   results: [{ word: "apple", correct: true }, ...]
 * }]
 */
export const getRecords = () => {
  const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return data ? JSON.parse(data) : [];
};

/**
 * 保存背诵记录
 * @param {Array} records - 记录数组
 */
export const saveRecords = (records) => {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

/**
 * 添加一条背诵记录
 * @param {string} grade - 年级段
 * @param {string} unit - Unit名称
 * @param {Array} results - 背诵结果 [{ word, meaning, correct }, ...]
 * @returns {Object} 新增的记录对象
 */
export const addRecord = (grade, unit, results) => {
  const records = getRecords();
  const now = new Date();
  const record = {
    id: generateId(),
    date: formatDate(now),
    time: formatTime(now),
    timestamp: now.getTime(),
    grade,
    unit,
    results,
  };
  records.push(record);
  saveRecords(records);

  // 同时更新错词本
  updateWrongWordsFromRecord(grade, unit, results);

  return record;
};

/**
 * 获取指定日期的记录
 * @param {string} date - 日期 YYYY-MM-DD
 * @returns {Array} 该日期的所有记录
 */
export const getRecordsByDate = (date) => {
  const records = getRecords();
  return records.filter(r => r.date === date);
};

/**
 * 获取指定单词的历史记录
 * @param {string} wordText - 单词文本
 * @returns {Array} 包含该单词的所有记录
 */
export const getWordHistory = (wordText) => {
  const records = getRecords();
  return records
    .map(record => {
      const wordResult = record.results.find(r => r.word === wordText);
      if (wordResult) {
        return {
          date: record.date,
          time: record.time,
          grade: record.grade,
          unit: record.unit,
          correct: wordResult.correct,
        };
      }
      return null;
    })
    .filter(r => r !== null)
    .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
};

// ========== 错词本操作 ==========

/**
 * 获取错词本
 * @returns {Array} 错词数组
 * [{
 *   word: "apple",
 *   meaning: "苹果",
 *   sources: [{ grade: "三年级上册", unit: "Unit 1" }],
 *   errorCount: 5,
 *   lastErrorDate: "2024-10-25"
 * }]
 */
export const getWrongWords = () => {
  const data = localStorage.getItem(STORAGE_KEYS.WRONG_WORDS);
  return data ? JSON.parse(data) : [];
};

/**
 * 保存错词本
 * @param {Array} wrongWords - 错词数组
 */
export const saveWrongWords = (wrongWords) => {
  localStorage.setItem(STORAGE_KEYS.WRONG_WORDS, JSON.stringify(wrongWords));
};

/**
 * 从背诵记录更新错词本
 * @param {string} grade - 年级段
 * @param {string} unit - Unit名称
 * @param {Array} results - 背诵结果
 */
const updateWrongWordsFromRecord = (grade, unit, results) => {
  const wrongWords = getWrongWords();
  const today = formatDate(new Date());

  results.forEach(result => {
    if (!result.correct) {
      // 错误的单词
      const existingIndex = wrongWords.findIndex(w => w.word === result.word);

      if (existingIndex >= 0) {
        // 已存在，更新计数和日期
        wrongWords[existingIndex].errorCount++;
        wrongWords[existingIndex].lastErrorDate = today;

        // 添加来源（如果不存在）
        const sourceExists = wrongWords[existingIndex].sources.some(
          s => s.grade === grade && s.unit === unit
        );
        if (!sourceExists) {
          wrongWords[existingIndex].sources.push({ grade, unit });
        }
      } else {
        // 新增
        wrongWords.push({
          word: result.word,
          meaning: result.meaning,
          sources: [{ grade, unit }],
          errorCount: 1,
          lastErrorDate: today,
        });
      }
    }
  });

  saveWrongWords(wrongWords);
};

/**
 * 标记单词为"通过"（移出错词本）
 * @param {string} wordText - 单词文本
 */
export const removeFromWrongBook = (wordText) => {
  let wrongWords = getWrongWords();
  wrongWords = wrongWords.filter(w => w.word !== wordText);
  saveWrongWords(wrongWords);
};

/**
 * 获取错词本单词数量
 * @returns {number}
 */
export const getWrongWordsCount = () => {
  return getWrongWords().length;
};

// ========== 统计功能 ==========

/**
 * 获取今日学习统计
 * @returns {Object} { totalWords, correctWords, correctRate }
 */
export const getTodayStats = () => {
  const today = formatDate(new Date());
  const todayRecords = getRecordsByDate(today);

  let totalWords = 0;
  let correctWords = 0;

  todayRecords.forEach(record => {
    totalWords += record.results.length;
    correctWords += record.results.filter(r => r.correct).length;
  });

  return {
    totalWords,
    correctWords,
    correctRate: totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0,
  };
};

/**
 * 获取连续学习天数
 * @returns {number}
 */
export const getContinuousDays = () => {
  const records = getRecords();
  if (records.length === 0) return 0;

  // 获取所有有记录的日期（去重）
  const dates = [...new Set(records.map(r => r.date))].sort().reverse();

  let continuousDays = 0;
  const today = formatDate(new Date());
  let checkDate = today;

  for (const date of dates) {
    if (date === checkDate) {
      continuousDays++;
      // 前一天
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      checkDate = formatDate(prevDate);
    } else {
      break;
    }
  }

  return continuousDays;
};

/**
 * 获取累计学习天数
 * @returns {number}
 */
export const getTotalStudyDays = () => {
  const records = getRecords();
  const uniqueDates = new Set(records.map(r => r.date));
  return uniqueDates.size;
};

/**
 * 获取学习日历数据（最近N天）
 * @param {number} days - 天数
 * @returns {Array} [{ date, count, level }]
 */
export const getCalendarData = (days = 28) => {
  const records = getRecords();
  const today = new Date();
  const calendar = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);

    const dayRecords = records.filter(r => r.date === dateStr);
    const totalWords = dayRecords.reduce((sum, r) => sum + r.results.length, 0);

    // 计算学习强度等级 (0-3)
    let level = 0;
    if (totalWords > 0) level = 1;
    if (totalWords >= 15) level = 2;
    if (totalWords >= 30) level = 3;

    calendar.push({
      date: dateStr,
      count: totalWords,
      level,
    });
  }

  return calendar;
};

// ========== 备份与恢复 ==========

/**
 * 导出所有数据
 * @returns {Object} 包含所有数据的对象
 */
export const exportData = () => {
  return {
    wordLibrary: getWordLibrary(),
    records: getRecords(),
    wrongWords: getWrongWords(),
    exportDate: new Date().toISOString(),
  };
};

/**
 * 导入数据（会覆盖现有数据）
 * @param {Object} data - 导入的数据对象
 */
export const importData = (data) => {
  if (data.wordLibrary) saveWordLibrary(data.wordLibrary);
  if (data.records) saveRecords(data.records);
  if (data.wrongWords) saveWrongWords(data.wrongWords);
};

/**
 * 清空所有数据
 */
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.WORD_LIBRARY);
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  localStorage.removeItem(STORAGE_KEYS.WRONG_WORDS);
};

// ========== 工具函数 ==========

/**
 * 生成唯一ID
 * @returns {string}
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 格式化日期
 * @param {Date} date
 * @returns {string} YYYY-MM-DD
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 格式化时间
 * @param {Date} date
 * @returns {string} HH:MM:SS
 */
const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * 初始化默认数据（如果不存在）
 * @param {Object} defaultLibrary - 默认单词库
 */
export const initializeData = (defaultLibrary) => {
  const existingLibrary = getWordLibrary();
  if (Object.keys(existingLibrary).length === 0 && defaultLibrary) {
    saveWordLibrary(defaultLibrary);
  }
};
