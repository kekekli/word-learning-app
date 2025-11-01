import { useState, useEffect } from 'react';
import { getWrongWords, removeFromWrongBook } from '../utils/storage';

export default function WrongBookPage({ onReviewWords }) {
  const [wrongWords, setWrongWords] = useState([]);
  const [groupedWords, setGroupedWords] = useState({});

  useEffect(() => {
    loadWrongWords();
  }, []);

  const loadWrongWords = () => {
    const words = getWrongWords();
    setWrongWords(words);

    // 按年级和单元分组
    const grouped = {};
    words.forEach(word => {
      word.sources.forEach(source => {
        const key = `${source.grade} - ${source.unit}`;
        if (!grouped[key]) {
          grouped[key] = {
            grade: source.grade,
            unit: source.unit,
            words: []
          };
        }
        // 避免重复添加
        if (!grouped[key].words.find(w => w.word === word.word)) {
          grouped[key].words.push(word);
        }
      });
    });

    setGroupedWords(grouped);
  };

  const handleRemove = (wordText) => {
    if (confirm(`确定要从错词本移除"${wordText}"吗？`)) {
      removeFromWrongBook(wordText);
      loadWrongWords(); // 重新加载
    }
  };

  const handleReviewGroup = (grade, unit, words) => {
    // 将错词转换为背诵页面需要的格式
    const reviewWords = words.map(w => ({
      word: w.word,
      meaning: w.meaning,
      pronunciation: '' // 错词本中没有存储音标
    }));

    onReviewWords(grade, unit, reviewWords);
  };

  // 空状态
  if (wrongWords.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">错词本</h2>
          <p className="text-gray-500 mt-1">这里记录了你需要复习的单词</p>
        </div>

        <div className="card text-center py-16">
          <div className="text-8xl mb-6">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">太棒了！</h3>
          <p className="text-gray-600">目前还没有错词，继续加油！</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">错词本</h2>
        <p className="text-gray-500 mt-1">共{wrongWords.length}个单词需要复习</p>
      </div>

      {/* 按年级单元分组显示 */}
      <div className="space-y-6">
        {Object.keys(groupedWords).map(key => {
          const group = groupedWords[key];

          return (
            <div key={key} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{group.grade} - {group.unit}</h3>
                  <p className="text-sm text-gray-500 mt-1">{group.words.length}个错词</p>
                </div>
                <button
                  onClick={() => handleReviewGroup(group.grade, group.unit, group.words)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl transition-all"
                >
                  复习这些单词
                </button>
              </div>

              {/* 错词列表 */}
              <div className="space-y-3">
                {group.words.map(word => (
                  <div
                    key={word.word}
                    className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-2xl font-bold text-gray-800">{word.word}</span>
                        <span className="text-lg text-gray-600">{word.meaning}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>错误 {word.errorCount} 次</span>
                        <span>最后错误：{word.lastErrorDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(word.word)}
                      className="text-gray-400 hover:text-red-600 transition-colors px-3"
                      title="移除（已掌握）"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
