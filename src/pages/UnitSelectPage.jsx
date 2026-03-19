import { useApp } from '../context/AppContext';

export default function UnitSelectPage({ grade, onSelectUnit, onBack }) {
  const { wordLibrary } = useApp();
  const units = wordLibrary[grade] || {};
  const unitList = Object.keys(units);

  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center mb-4"
          >
            <span className="mr-2">←</span> 返回首页
          </button>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{grade}</h2>
          <p className="text-slate-500 font-bold text-lg mt-2 tracking-tight">你要挑战哪一个单元呢？🎯</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unitList.map((unitName) => {
          const words = units[unitName];
          const wordCount = words.length;

          return (
            <div
              key={unitName}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onSelectUnit(unitName)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              
              <div className="relative">
                <header className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{wordCount} Words</span>
                </header>
                
                <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{unitName}</h3>
                
                {/* 单词预览 */}
                <div className="bg-slate-50/50 p-4 rounded-2xl mb-8 border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">单词预览</p>
                  <p className="text-sm font-bold text-slate-400 line-clamp-1 italic">
                    {words.slice(0, 3).map(w => w.word).join(', ')}
                    {words.length > 3 && ' ...'}
                  </p>
                </div>

                <div className="flex items-center text-indigo-600 font-black text-sm tracking-wide group-hover:translate-x-1 transition-transform">
                  立即开始背诵 <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {unitList.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-bold uppercase tracking-widest">在这个年级下还没发现单元数据哦</p>
          <button 
            onClick={() => onBack()}
            className="mt-6 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            返回重新选择
          </button>
        </div>
      )}
    </div>
  );
}
