import { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils/helpers';
import { addRecord } from '../utils/storage';
import { useApp } from '../context/AppContext';
import PhoneticPlayer, { IPA_TO_SPELLING } from '../components/PhoneticPlayer';

// 智能字母高亮组件
const HighlightableWord = ({ word, activePhoneme }) => {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!activePhoneme) {
      setMatch(null);
      return;
    }

    const lowerWord = word.toLowerCase();
    const spellings = IPA_TO_SPELLING[activePhoneme] || [];
    
    // 优先尝试贪婪匹配最长的拼写组合 (例如 'ee' 优先于 'e')
    const sortedSpellings = [...spellings].sort((a, b) => b.length - a.length);
    
    for (const s of sortedSpellings) {
      const idx = lowerWord.indexOf(s);
      if (idx !== -1) {
        setMatch({ start: idx, end: idx + s.length });
        return;
      }
    }
    setMatch(null);
  }, [word, activePhoneme]);

  return (
    <div className="text-4xl font-black tracking-tight text-indigo-600 flex justify-center">
      {word.split('').map((char, i) => (
        <span 
          key={i} 
          className={`transition-all duration-300 ${
            match && i >= match.start && i < match.end
              ? 'text-rose-500 scale-125 mx-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
              : ''
          }`}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

// 圆形进度图组件
const CircleProgress = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const circumference = 283; // 2 * π * 45
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle className="stroke-slate-100 fill-none" cx="40" cy="40" r="36" strokeWidth="8"></circle>
        <circle
          className="stroke-indigo-500 fill-none transition-all duration-500 ease-out"
          cx="40" cy="40" r="36" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        ></circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xs font-black text-slate-800 tracking-tighter leading-none">{current}</span>
        <div className="w-6 h-[1px] bg-slate-200 my-1"></div>
        <span className="text-[10px] font-bold text-slate-400 leading-none">{total}</span>
      </div>
    </div>
  );
};

export default function RecitePage({ grade, unit, words, onComplete, onBack }) {
  const { speak } = useApp();
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);
  const [answers, setAnswers] = useState({}); // {index: true/false}
  
  // V2.0 新增状态：手动确认
  const [currentChoice, setCurrentChoice] = useState(null); // 'correct' | 'wrong' | null
  const [isRevealed, setIsRevealed] = useState(false);
  
  // V2.2 新增状态：当前点读的音素
  const [activePhoneme, setActivePhoneme] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const shuffled = shuffleArray(words);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setCurrentChoice(null);
    setIsRevealed(false);
  }, [words]);

  useEffect(() => {
    // 自动朗诵逻辑
    if (isRevealed && shuffledWords[currentIndex]) {
      speak(shuffledWords[currentIndex].word);
    }
  }, [isRevealed, currentIndex, shuffledWords, speak]);

  const handleChoice = (choice) => {
    setCurrentChoice(choice);
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (currentChoice === null) return;

    const newAnswers = {
      ...answers,
      [currentIndex]: currentChoice === 'correct'
    };
    setAnswers(newAnswers);

    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentChoice(null);
      setIsRevealed(false);
      window.scrollTo(0, 0);
    } else {
      finalizeResults(newAnswers);
    }
  };

  const finalizeResults = (finalAnswers) => {
    const results = shuffledWords.map((word, index) => ({
      word: word.word,
      meaning: word.meaning,
      pronunciation: word.pronunciation,
      correct: finalAnswers[index] || false,
    }));

    const record = addRecord(grade, unit, results);
    const correctCount = results.filter(r => r.correct).length;
    
    onComplete({
      totalWords: results.length,
      correctWords: correctCount,
      wrongWords: results.length - correctCount,
      correctRate: Math.round((correctCount / results.length) * 100),
      record,
    });
  };

  const currentWord = shuffledWords[currentIndex];

  if (!currentWord) return null;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-20" ref={containerRef}>
      {/* 顶部进度 */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl shadow-indigo-100/30 mb-8 sticky top-4 z-40 border border-white flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <CircleProgress current={currentIndex} total={shuffledWords.length} />
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1">{unit}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70">
              {grade} 
            </p>
          </div>
        </div>
        
        <button 
          onClick={onBack}
          className="p-4 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* 主单词卡片 */}
      <div className="perspective-1000">
        <div className={`bg-white rounded-[4rem] p-12 shadow-2xl shadow-indigo-100/50 border border-slate-50 relative overflow-hidden transition-all duration-500 ${isRevealed ? 'min-h-[480px]' : ''}`}>
          
          {/* 装饰元素 */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 transition-all duration-700 ${isRevealed ? (currentChoice === 'correct' ? 'bg-emerald-50' : 'bg-rose-50') : 'bg-indigo-50/50'} opacity-60`}></div>

          <div className={`relative z-10 text-center space-y-8 transition-all duration-500 ${isRevealed ? '-translate-y-8' : ''}`}>
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                {isRevealed ? '检查答案' : '努力回想中文意思'}
              </span>
              <h3 className="text-5xl font-black text-slate-800 tracking-tight leading-tight">
                {currentWord.meaning}
              </h3>
            </div>

            {/* 英文展示区 */}
            <div className={`transition-all duration-500 transform ${isRevealed || showEnglish ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
              <div className="flex flex-col items-center">
                <div 
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => speak(currentWord.word)}
                >
                  <HighlightableWord word={currentWord.word} activePhoneme={activePhoneme} />
                </div>
                
                {/* 方案 A：交互式音标 */}
                <PhoneticPlayer 
                  ipa={currentWord.pronunciation} 
                  word={currentWord.word}
                  onActivePhonemeChange={setActivePhoneme}
                />
              </div>
            </div>

            {/* 控制区 - 揭晓后缩小，为下方按钮腾空间 */}
            <div className={`pt-4 flex justify-center gap-6 transition-all duration-500 ${isRevealed ? 'opacity-40 scale-75 translate-y-4' : ''}`}>
              <button
                disabled={currentIndex >= shuffledWords.length && isRevealed}
                onClick={() => handleChoice('correct')}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all active:scale-90 border-4 ${
                  currentChoice === 'correct' 
                    ? 'bg-emerald-500 border-emerald-100 text-white shadow-xl shadow-emerald-200' 
                    : 'bg-white border-slate-50 text-emerald-500 hover:border-emerald-200 shadow-lg'
                }`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>

              <button
                disabled={currentIndex >= shuffledWords.length && isRevealed}
                onClick={() => handleChoice('wrong')}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all active:scale-90 border-4 ${
                  currentChoice === 'wrong' 
                    ? 'bg-rose-500 border-rose-100 text-white shadow-xl shadow-rose-200' 
                    : 'bg-white border-slate-50 text-rose-500 hover:border-rose-200 shadow-lg'
                }`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* 方案 B：手动确认下一步 */}
          {isRevealed && (
            <div className="absolute bottom-0 left-0 w-full p-8 pb-10 animate-slide-up z-50">
              <button
                onClick={handleNext}
                className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-[0.98] ${
                  currentChoice === 'correct' 
                    ? 'bg-emerald-500 text-white shadow-emerald-200 hover:shadow-emerald-300' 
                    : 'bg-rose-500 text-white shadow-rose-200 hover:shadow-rose-300'
                }`}
              >
                {currentIndex === shuffledWords.length - 1 ? '完成背诵' : '下一个单词'} →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 底部小贴士 */}
      <p className="text-center mt-12 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
        加油！七七，你是最棒的单词王 👑
      </p>
    </div>
  );
}
