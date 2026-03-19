import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function WrongBookPage({ onReviewWords }) {
  const { wrongWords, storage, refreshStats, speak } = useApp();
  const [groupedWords, setGroupedWords] = useState({});

  useEffect(() => {
    // 按年级和单元分组
    const grouped = {};
    wrongWords.forEach(word => {
      word.sources.forEach(source => {
        const key = `${source.grade} - ${source.unit}`;
        if (!grouped[key]) {
          grouped[key] = {
            grade: source.grade,
            unit: source.unit,
            words: []
          };
        }
        if (!grouped[key].words.find(w => w.word === word.word)) {
          grouped[key].words.push(word);
        }
      });
    });
    setGroupedWords(grouped);
  }, [wrongWords]);

  const handleRemove = (wordText) => {
    if (confirm(`确定该单词已掌握，要从错词本移除吗？`)) {
      storage.removeFromWrongBook(wordText);
      refreshStats();
    }
  };

  const handleReviewGroup = (grade, unit, words) => {
    const reviewWords = words.map(w => ({
      word: w.word,
      meaning: w.meaning,
      pronunciation: w.pronunciation || ''
    }));
    onReviewWords(grade, unit, reviewWords);
  };

  if (wrongWords.length === 0) {
    return (
      <div className="animate-fade-in text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-50">
        <div className="text-8xl mb-8">🌈</div>
        <h3 className="text-3xl font-black text-slate-800 mb-2">全对啦！</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">目前一个错词都没有哦</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">错词库</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
          共 {wrongWords.length} 个顽固单词待攻克
        </p>
      </header>

      <div className="space-y-6">
        {Object.keys(groupedWords).map(key => {
          const group = groupedWords[key];
          return (
            <div key={key} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110"></div>
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{group.unit}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{group.grade}</p>
                </div>
                <button
                  onClick={() => handleReviewGroup(group.grade, group.unit, group.words)}
                  className="bg-rose-500 text-white font-black py-3 px-8 rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95"
                >
                  复习该组错词 ({group.words.length})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {group.words.map(word => (
                  <div key={word.word} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between group/item hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl font-black text-slate-800 tracking-tight cursor-pointer hover:text-indigo-600" onClick={() => speak(word.word)}>{word.word}</span>
                        <span className="text-slate-400 font-bold text-sm tracking-tight">{word.meaning}</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-3">
                        <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">错误 {word.errorCount} 次</span>
                        <span className="text-slate-300 text-[10px] font-bold">最后错误: {word.lastErrorDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(word.word)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                      title="掌握了"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
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
