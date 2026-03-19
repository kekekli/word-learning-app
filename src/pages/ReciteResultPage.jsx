import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ReciteResultPage({ result, onBackHome, onViewHistory }) {
  const { totalWords, correctWords, wrongWords, correctRate } = result;

  // 圆形进度图
  const circumference = 314; // 2 * π * 50
  const offset = circumference - (correctRate / 100) * circumference;

  return (
    <div className="animate-fade-in text-center max-w-2xl mx-auto py-12">
      <div className="text-8xl mb-8 animate-bounce-slow">
        {correctRate >= 80 ? '🏆' : correctRate >= 60 ? '👍' : '💪'}
      </div>
      <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
        {correctRate >= 80 ? '成就达成！' : correctRate >= 60 ? '再接再厉' : '永不言弃'}
      </h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-12">Session Completed Successfully</p>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 mb-12 relative overflow-hidden">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] mb-10">Performance Statistics</h3>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <StatBox label="Total" value={totalWords} color="blue" />
          <StatBox label="Correct" value={correctWords} color="emerald" />
          <StatBox label="Wrong" value={wrongWords} color="rose" />
        </div>

        {/* 正确率环形 */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              <circle
                className="stroke-slate-100 fill-none"
                cx="80" cy="80" r="70"
                strokeWidth="12"
              ></circle>
              <circle
                className={`fill-none transition-all duration-1000 ${correctRate >= 80 ? 'stroke-emerald-500' : correctRate >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'}`}
                cx="80" cy="80" r="70"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="440"
                style={{ strokeDashoffset: 440 - (440 * correctRate) / 100 }}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black tracking-tighter ${correctRate >= 80 ? 'text-emerald-600' : correctRate >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                {correctRate}%
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onBackHome} 
          className="btn-primary py-5 rounded-[2rem] shadow-2xl shadow-indigo-100/50"
        >
          返回仪表盘
        </button>
        <button
          onClick={onViewHistory}
          className="bg-slate-800 text-white font-black py-5 px-8 rounded-[2rem] shadow-2xl shadow-slate-100 hover:bg-slate-900 transition-all active:scale-95"
        >
          查看详细足迹
        </button>
      </div>

      <p className="mt-12 text-slate-300 text-xs font-bold uppercase tracking-widest">
        坚持学习 365 天的小目标，又近了一步 🌟
      </p>
    </div>
  );
}

const StatBox = ({ label, value, color }) => {
  const colors = {
    blue: 'text-indigo-600 bg-indigo-50/50',
    emerald: 'text-emerald-600 bg-emerald-50/50',
    rose: 'text-rose-600 bg-rose-50/50'
  };
  return (
    <div className={`p-4 rounded-3xl ${colors[color]}`}>
      <div className="text-2xl font-black tracking-tighter mb-1">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">{label}</div>
    </div>
  );
};
