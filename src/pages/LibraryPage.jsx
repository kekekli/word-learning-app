import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { pepLibrary } from '../data/pepLibrary';

export default function LibraryPage({ onRefresh }) {
  const { wordLibrary, storage, refreshStats } = useApp();
  const [library, setLibrary] = useState({});
  const [activeTab, setActiveTab] = useState('library'); // library | backup | pep
  const [editMode, setEditMode] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState(new Set());

  // 对话框状态
  const [dialog, setDialog] = useState({
    type: null,
    data: null
  });

  useEffect(() => {
    setLibrary(wordLibrary);
  }, [wordLibrary]);

  const handleExport = () => {
    const data = storage.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `单词学习备份-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('数据导出成功！');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (true) {
          storage.importData(data);
          refreshStats();
          alert('数据导入成功！');
        }
      } catch (error) {
        alert('数据格式错误，导入失败！');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleSyncPep = (gradeName) => {
    const pepGradeData = pepLibrary[gradeName];
    if (!pepGradeData) return;

    if (true) {
      const currentLib = storage.getWordLibrary();
      // 如果年级已存在，合并单元
      currentLib[gradeName] = { 
        ...(currentLib[gradeName] || {}), 
        ...pepGradeData 
      };
      storage.saveWordLibrary(currentLib);
      refreshStats();
      setActiveTab('library');
      alert('同步成功！');
    }
  };

  // 统计
  const stats = {
    totalGrades: Object.keys(library).length,
    totalUnits: Object.values(library).reduce((acc, units) => acc + Object.keys(units).length, 0),
    totalWords: Object.values(library).reduce((acc, units) => 
      acc + Object.values(units).reduce((uAcc, w) => uAcc + w.length, 0), 0
    )
  };

  const toggleUnit = (grade, unit) => {
    const key = `${grade}-${unit}`;
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(key)) newExpanded.delete(key);
    else newExpanded.add(key);
    setExpandedUnits(newExpanded);
  };

  const openDialog = (type, data = null) => setDialog({ type, data });
  const closeDialog = () => setDialog({ type: null, data: null });

  // 操作代理
  const executeAction = (action, ...args) => {
    const success = storage[action](...args);
    if (success || typeof success === 'object') {
      refreshStats();
      if (dialog.type !== 'editWord' && dialog.type !== 'importWords') closeDialog();
      return true;
    }
    alert('操作失败，可能已存在相同名称/单词');
    return false;
  };

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">库与设置</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Management & Data</p>
        </div>
        
        {activeTab === 'library' && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-8 py-3 rounded-2xl font-black transition-all shadow-lg ${
              editMode ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {editMode ? '退出编辑模式' : '进入编辑模式'}
          </button>
        )}
      </header>

      {/* 标签栏 */}
      <nav className="flex space-x-2 mb-8 bg-slate-100 p-1.5 rounded-2xl md:w-fit">
        {['library', 'pep', 'backup'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            {tab === 'library' ? '我的单词库' : tab === 'pep' ? '人教标准库' : '备份恢复'}
          </button>
        ))}
      </nav>

      {/* 词库 Tab */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <StatSmall label="年级" value={stats.totalGrades} color="blue" />
            <StatSmall label="单元" value={stats.totalUnits} color="purple" />
            <StatSmall label="总单词" value={stats.totalWords} color="emerald" />
          </div>

          {editMode && (
            <button
              onClick={() => openDialog('addGrade')}
              className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-500 font-black hover:bg-indigo-50 transition-colors"
            >
              + 新增年级段
            </button>
          )}

          {Object.keys(library).length === 0 && !editMode && (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold">还没有单词，去“人教标准库”里同步一个吧！</p>
              <button 
                onClick={() => setActiveTab('pep')}
                className="mt-4 text-indigo-600 font-black"
              >
                前往标准库 →
              </button>
            </div>
          )}

          {Object.keys(library).map(grade => (
            <div key={grade} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-800">{grade}</h3>
                {editMode && (
                  <div className="flex space-x-2">
                    <button onClick={() => openDialog('addUnit', { grade })} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black">添加单元</button>
                    <button onClick={() => executeAction('deleteGrade', grade)} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black">删除年级</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(library[grade]).map(unit => {
                  const words = library[grade][unit];
                  const expanded = expandedUnits.has(`${grade}-${unit}`);
                  return (
                    <div key={unit} className="group">
                      <div className={`p-4 rounded-3xl border-2 transition-all ${expanded ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="cursor-pointer flex-1" onClick={() => editMode && toggleUnit(grade, unit)}>
                            <div className="font-black text-slate-700">{unit}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{words.length} Words</div>
                          </div>
                          {editMode && (
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openDialog('renameUnit', { grade, unit })} className="text-blue-500 p-2">✏️</button>
                              <button onClick={() => executeAction('deleteUnit', grade, unit)} className="text-rose-500 p-2">🗑️</button>
                              <button onClick={() => toggleUnit(grade, unit)} className="text-slate-400 p-2">{expanded ? '▲' : '▼'}</button>
                            </div>
                          )}
                        </div>
                        
                        {editMode && expanded && (
                          <div className="mt-4 pt-4 border-t border-indigo-100/50 space-y-2 animate-fade-in">
                            <div className="flex gap-2 mb-3">
                              <button onClick={() => openDialog('addWord', { grade, unit })} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black">添加单词</button>
                              <button onClick={() => openDialog('importWords', { grade, unit })} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black">批量导入</button>
                            </div>
                            {words.map((word, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-xl text-xs flex justify-between items-center shadow-sm border border-slate-100">
                                <div><b className="text-slate-700">{word.word}</b> <span className="text-slate-400">{word.meaning}</span></div>
                                <div className="flex space-x-2">
                                  <button onClick={() => openDialog('editWord', { grade, unit, word })} className="text-blue-400">✏️</button>
                                  <button onClick={() => executeAction('deleteWord', grade, unit, word.word)} className="text-rose-400">✕</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 标准库 Tab */}
      {activeTab === 'pep' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {Object.keys(pepLibrary).map(grade => (
            <div key={grade} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <h3 className="text-2xl font-black text-slate-800 mb-4">{grade}</h3>
              <div className="space-y-2 mb-8 max-h-48 overflow-y-auto scrollbar-hide">
                {Object.keys(pepLibrary[grade]).map(u => (
                  <div key={u} className="text-slate-400 font-bold text-sm tracking-tight flex items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full mr-2"></span> {u}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSyncPep(grade)}
                className="w-full py-4 bg-indigo-50 text-indigo-600 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all transform group-hover:translate-y-[-2px]"
              >
                同步此教材词库
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 备份恢复 Tab */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-2">导出数据</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">将所有学习足迹和单词库导出为 JSON 文件备份。</p>
            <button onClick={handleExport} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              开始导出备份
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-2">恢复数据</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">从之前备份的 JSON 文件中恢复数据（覆盖当前）。</p>
            <label className="block w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 text-center cursor-pointer hover:bg-emerald-600 transition-all">
              选择文件导入
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 md:col-span-2">
            <h3 className="text-xl font-black text-rose-800 mb-2 font-mono">⚠️ 危险区域</h3>
            <p className="text-rose-600/70 text-sm font-medium mb-6">此操作将永久抹除所有本地数据，包括学习记录和错词本。</p>
            <button 
              onClick={() => {
                if (true) {
                  storage.clearAllData();
                  refreshStats();
                  alert('数据已清空');
                }
              }} 
              className="bg-rose-500 text-white px-8 py-3 rounded-xl font-black"
            >
              彻底清除所有数据
            </button>
          </div>
        </div>
      )}

      {dialog.type && (
        <Dialog 
          type={dialog.type} 
          data={dialog.data} 
          onClose={closeDialog} 
          onSubmit={(type, formData) => {
            switch(type) {
              case 'addGrade': executeAction('addGrade', formData.gradeName); break;
              case 'addUnit': executeAction('addUnit', dialog.data.grade, formData.unitName); break;
              case 'renameUnit': executeAction('renameUnit', dialog.data.grade, dialog.data.unit, formData.unitName); break;
              case 'addWord': executeAction('addWord', dialog.data.grade, dialog.data.unit, formData); break;
              case 'editWord': executeAction('updateWord', dialog.data.grade, dialog.data.unit, dialog.data.word.word, formData); break;
              case 'importWords': executeAction('importWords', dialog.data.grade, dialog.data.unit, formData.importText); break;
            }
          }}
        />
      )}
    </div>
  );
}

const StatSmall = ({ label, value, color }) => {
  const colors = { blue: 'text-blue-600 bg-blue-50', purple: 'text-purple-600 bg-purple-50', emerald: 'text-emerald-600 bg-emerald-50' };
  return (
    <div className={`p-4 rounded-3xl ${colors[color]} flex items-center justify-between`}>
      <span className="font-black text-xs uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-xl font-black tracking-tighter">{value}</span>
    </div>
  );
};

// 提取精简版对话框
function Dialog({ type, data, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ gradeName: '', unitName: '', word: '', meaning: '', pronunciation: '', importText: '' });

  useEffect(() => {
    if (type === 'editWord' && data?.word) setFormData({ word: data.word.word, meaning: data.word.meaning, pronunciation: data.word.pronunciation || '' });
    if (type === 'renameUnit' && data?.unit) setFormData({ unitName: data.unit });
  }, [type, data]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">
          {type === 'addGrade' ? '新增年级段' : type === 'addUnit' ? '新增单元' : type === 'importWords' ? '批量导入模式' : '填写详细信息'}
        </h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit(type, formData); }} className="space-y-4">
          {type === 'addGrade' && <Input placeholder="例：三年级上册" value={formData.gradeName} onChange={v => setFormData({...formData, gradeName: v})} />}
          {(type === 'addUnit' || type === 'renameUnit') && <Input placeholder="例：Unit 7" value={formData.unitName} onChange={v => setFormData({...formData, unitName: v})} />}
          {(type === 'addWord' || type === 'editWord') && (
            <>
              <Input placeholder="单词 (English)" value={formData.word} onChange={v => setFormData({...formData, word: v})} />
              <Input placeholder="意思 (中文)" value={formData.meaning} onChange={v => setFormData({...formData, meaning: v})} />
              <Input placeholder="音标 (选填)" value={formData.pronunciation} onChange={v => setFormData({...formData, pronunciation: v})} />
            </>
          )}
          {type === 'importWords' && (
            <textarea 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none h-48 text-sm font-medium"
              placeholder="apple-苹果\ndad-爸爸\n..." 
              value={formData.importText} 
              onChange={e => setFormData({...formData, importText: e.target.value})}
            />
          )}

          <div className="flex gap-4 mt-8">
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all">确定</button>
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Input = ({ placeholder, value, onChange }) => (
  <input 
    type="text" 
    placeholder={placeholder} 
    value={value} 
    onChange={e => onChange(e.target.value)}
    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-slate-700 font-bold placeholder:text-slate-300"
  />
);
