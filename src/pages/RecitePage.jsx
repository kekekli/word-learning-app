import { useState, useEffect } from 'react';
import { shuffleArray } from '../utils/helpers';
import { addRecord } from '../utils/storage';

// 圆形进度图组件
const CircleProgress = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const circumference = 314; // 2 * π * 50
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circle-progress">
      <svg width="120" height="120">
        <circle className="circle-bg" cx="60" cy="60" r="50"></circle>
        <circle
          className="circle-bar"
          cx="60" cy="60"
          r="50"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        ></circle>
      </svg>
      <div className="circle-text">{current}/{total}</div>
    </div>
  );
};

export default function RecitePage({ grade, unit, words, onComplete, onBack }) {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [showEnglish, setShowEnglish] = useState(false);
  const [answers, setAnswers] = useState({}); // {index: true/false}
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // 打乱单词顺序
    const shuffled = shuffleArray(words);
    setShuffledWords(shuffled);
    setAnswers({});
    setCompletedCount(0);
  }, [words]);

  const handleAnswer = (index, correct) => {
    if (answers[index] !== undefined) return; // 已经回答过

    setAnswers(prev => ({
      ...prev,
      [index]: correct
    }));
    setCompletedCount(prev => prev + 1);
  };

  const handleComplete = () => {
    // 整理结果
    const results = shuffledWords.map((word, index) => ({
      word: word.word,
      meaning: word.meaning,
      correct: answers[index] || false,
    }));

    // 保存记录到LocalStorage
    const record = addRecord(grade, unit, results);

    // 计算统计
    const correctCount = results.filter(r => r.correct).length;
    const totalCount = results.length;
    const correctRate = Math.round((correctCount / totalCount) * 100);

    // 回调完成
    onComplete({
      totalWords: totalCount,
      correctWords: correctCount,
      wrongWords: totalCount - correctCount,
      correctRate,
      record,
    });
  };

  const allAnswered = completedCount === shuffledWords.length;

  return (
    <div>
      {/* 顶部进度卡片 */}
      <div className="card mb-6 sticky top-6 z-40">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            {/* 圆形进度 */}
            <CircleProgress current={completedCount} total={shuffledWords.length} />

            <div>
              <h2 className="text-xl font-bold text-gray-800">{grade} - {unit}</h2>
              <p className="text-sm text-gray-500 mt-1">
                已完成 {Math.round((completedCount / shuffledWords.length) * 100)}%
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 hidden md:block">显示英文</span>
            <label className="relative inline-block w-14 h-8">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showEnglish}
                onChange={(e) => setShowEnglish(e.target.checked)}
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 单词列表 */}
      <div className="space-y-4">
        {shuffledWords.map((word, index) => {
          const answered = answers[index] !== undefined;
          const isCorrect = answers[index];

          return (
            <div
              key={index}
              className={`word-card ${
                answered
                  ? isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {word.meaning}
                  </div>
                  {showEnglish && (
                    <div>
                      <div className="text-2xl text-blue-600">{word.word}</div>
                      {word.pronunciation && (
                        <div className="text-sm text-gray-500 mt-1">{word.pronunciation}</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button
                    className="btn-success"
                    onClick={() => handleAnswer(index, true)}
                    disabled={answered}
                    style={{ opacity: answered ? 0.5 : 1, cursor: answered ? 'not-allowed' : 'pointer' }}
                  >
                    ✓
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleAnswer(index, false)}
                    disabled={answered}
                    style={{ opacity: answered ? 0.5 : 1, cursor: answered ? 'not-allowed' : 'pointer' }}
                  >
                    ✗
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 完成按钮 */}
      <div className="mt-8 text-center">
        {allAnswered ? (
          <button
            onClick={handleComplete}
            className="btn-primary text-xl py-4 px-12"
          >
            完成背诵 🎉
          </button>
        ) : (
          <div className="text-gray-500 text-sm">
            请完成所有单词的背诵（{completedCount}/{shuffledWords.length}）
          </div>
        )}
      </div>

      {/* 返回按钮 */}
      <div className="mt-4 text-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          ← 返回单元选择
        </button>
      </div>
    </div>
  );
}
