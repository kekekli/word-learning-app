import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function HistoryPage() {
  const { records, speak } = useApp();
  const [groupedRecords, setGroupedRecords] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    // 按时间倒序排列
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

    // 按日期分组
    const grouped = {};
    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayStr = formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    sorted.forEach(record => {
      let groupKey;
      if (record.date === todayStr) groupKey = '今天';
      else if (record.date === yesterdayStr) groupKey = '昨天';
      else groupKey = record.date;

      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(record);
    });

    setGroupedRecords(grouped);
  }, [records]);

  const getRecordStats = (record) => {
    const total = record.results.length;
    const correct = record.results.filter(r => r.correct).length;
    const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, correctRate };
  };

  if (records.length === 0) {
    return (
      <div className="animate-fade-in text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-50">
        <div className="text-8xl mb-8">📜</div>
        <h3 className="text-3xl font-black text-slate-800 mb-2">空空如也</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">还没有任何学习记录呢</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">学习足迹</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">共 {records.length} 次努力的见证</p>
      </header>

      <div className="space-y-12">
        {Object.keys(groupedRecords).map(dateKey => (
          <div key={dateKey} className="relative">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center">
              <span className="bg-slate-100 h-[1px] flex-1 mr-4"></span>
              {dateKey}
              <span className="bg-slate-100 h-[1px] flex-1 ml-4"></span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedRecords[dateKey].map(record => {
                const stats = getRecordStats(record);
                return (
                  <div
                    key={record.id}
                    className="group bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden relative"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${stats.correctRate >= 80 ? 'bg-emerald-400' : stats.correctRate >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{record.unit}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{record.grade}</p>
                      </div>
                      <span className="text-xs font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-full">{record.time}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${stats.correctRate >= 80 ? 'bg-emerald-500' : stats.correctRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${stats.correctRate}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-black text-slate-700 tracking-tighter">{stats.correctRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{selectedRecord.unit}</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{selectedRecord.grade} · {selectedRecord.date} {selectedRecord.time}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
              {selectedRecord.results.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all ${result.correct ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-rose-50/30 border-rose-100/50'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${result.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {result.correct ? '✓' : '✗'}
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-800 tracking-tight cursor-pointer hover:text-indigo-600" onClick={() => speak(result.word)}>{result.word}</div>
                      <div className="text-sm font-bold text-slate-400 tracking-tight">{result.meaning}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
