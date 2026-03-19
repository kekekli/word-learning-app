import React from 'react';
import { useApp } from '../../context/AppContext';

// SVG图标
const BookIcon = () => (
  <svg className="w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const EditIcon = () => (
  <svg className="w-12 h-12 text-blue-400 opacity-20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const FireIcon = () => (
  <svg className="w-12 h-12 text-orange-400 opacity-20 absolute -right-4 -bottom-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.5 12.5l-5.5-2.5 7-5 7 5-5.5 2.5z"></path>
    <path d="M3 12.5l7 4 7-4"></path>
    <path d="M3 17l7 4 7-4"></path>
  </svg>
);

export const HomeView = () => {
  const { stats, calendarData, grades, wordLibrary, navigateTo } = useApp();

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Hi, 七七 <span className="inline-block animate-bounce-slow">👋</span>
          </h2>
          <p className="text-slate-500 text-lg mt-2 font-medium">今天也是进步的一天，加油哦！🚀</p>
        </div>
      </header>

      {/* 统计数据面板 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="今日已学" 
          value={stats.todayWords} 
          subLabel="单词" 
          footer={`正确率 ${stats.todayCorrectRate}%`}
          progress={stats.todayCorrectRate}
          icon={<EditIcon />}
          color="blue"
        />
        <StatCard 
          label="错词待攻克" 
          value={stats.wrongWordsCount} 
          subLabel="个" 
          footer="去复习 →"
          onClick={() => navigateTo('wrongbook')}
          icon={<div className="w-12 h-12 text-red-400 opacity-20 absolute -right-4 -bottom-4">✗</div>}
          color="red"
        />
        <StatCard 
          label="连续坚持" 
          value={stats.continuousDays} 
          subLabel="天" 
          footer={`累计学习 ${stats.totalDays} 天`}
          icon={<FireIcon />}
          color="purple"
        />
      </section>

      {/* 选择学习内容 */}
      <section className="bg-white/50 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center">
            <span className="mr-3">📖</span> 选择学习内容
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.length > 0 ? (
            grades.map((grade) => (
              <GradeCard 
                key={grade} 
                grade={grade} 
                unitCount={Object.keys(wordLibrary[grade] || {}).length}
                onClick={() => navigateTo('unitSelect', { grade })}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">还没有添加任何单词库哦，去系统设置里看看吧</p>
              <button 
                onClick={() => navigateTo('library')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                前往设置
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 学习日历热力图 */}
      <section className="bg-white/50 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="mr-3">📅</span> 学习日历（最近4周）
        </h3>
        <div className="flex items-start space-x-3 overflow-x-auto pb-4 scrollbar-hide">
          <div className="text-[10px] text-slate-400 space-y-2 mt-6 font-bold uppercase tracking-wider">
            <div>一</div>
            <div>三</div>
            <div>五</div>
            <div>日</div>
          </div>
          <div className="flex-1 min-w-[300px]">
            <div className="grid grid-rows-7 grid-flow-col gap-1.5">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-[3px] transition-colors duration-500 level-${day.level}`}
                  title={`${day.date}: ${day.count}个单词`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <span>少</span>
          <div className="w-3 h-3 rounded-[2px] level-0"></div>
          <div className="w-3 h-3 rounded-[2px] level-1"></div>
          <div className="w-3 h-3 rounded-[2px] level-2"></div>
          <div className="w-3 h-3 rounded-[2px] level-3"></div>
          <span>多</span>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, subLabel, footer, progress, icon, color, onClick }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-600',
    red: 'from-rose-500 to-red-600',
    purple: 'from-violet-500 to-purple-600'
  };

  return (
    <div 
      className={`group relative overflow-hidden bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      <header className="flex justify-between items-start mb-2">
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
      </header>
      
      <div className="flex items-baseline mb-4">
        <span className="text-4xl font-black text-slate-800 mr-1">{value}</span>
        <span className="text-slate-400 font-bold text-sm">{subLabel}</span>
      </div>

      <footer className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className={`text-xs font-black tracking-wide ${color === 'red' ? 'text-rose-500' : 'text-emerald-500'}`}>{footer}</span>
      </footer>
      
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      
      {icon}
    </div>
  );
};

const GradeCard = ({ grade, unitCount, onClick }) => (
  <div 
    className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
    onClick={onClick}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -mr-12 -mt-12 transition-all group-hover:scale-110"></div>
    <div className="relative flex flex-col h-full">
      <header className="flex items-center justify-between mb-6">
        <div className="p-3 bg-indigo-50 rounded-2xl">
          <BookIcon />
        </div>
        <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {unitCount} Units
        </span>
      </header>
      <h4 className="text-2xl font-black text-slate-800 mb-2">{grade}</h4>
      <div className="mt-auto flex items-center text-indigo-600 font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">
        进入学习 <span className="ml-2">→</span>
      </div>
    </div>
  </div>
);
