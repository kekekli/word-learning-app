import { useState, useEffect } from 'react';
import { getWordLibrary, exportData, importData } from '../utils/storage';

export default function LibraryPage({ onRefresh }) {
  const [library, setLibrary] = useState({});
  const [activeTab, setActiveTab] = useState('library'); // library | backup

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = () => {
    const lib = getWordLibrary();
    setLibrary(lib);
  };

  const handleExport = () => {
    const data = exportData();
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
        const confirmed = confirm('导入数据将覆盖现有数据，是否继续？');
        if (confirmed) {
          importData(data);
          loadLibrary();
          onRefresh(); // 刷新首页统计
          alert('数据导入成功！');
        }
      } catch (error) {
        alert('数据格式错误，导入失败！');
        console.error(error);
      }
    };
    reader.readAsText(file);

    // 重置input，允许重复选择同一文件
    event.target.value = '';
  };

  const handleClearData = () => {
    const confirmed = confirm('确定要清除所有数据吗？此操作不可恢复！');
    if (confirmed) {
      const doubleConfirmed = confirm('再次确认：所有学习记录、错词本、单词库都将被清除！');
      if (doubleConfirmed) {
        localStorage.clear();
        loadLibrary();
        onRefresh();
        alert('所有数据已清除！');
      }
    }
  };

  // 计算单词库统计
  const getTotalStats = () => {
    let totalGrades = 0;
    let totalUnits = 0;
    let totalWords = 0;

    Object.keys(library).forEach(grade => {
      totalGrades++;
      const units = library[grade];
      Object.keys(units).forEach(unit => {
        totalUnits++;
        totalWords += units[unit].length;
      });
    });

    return { totalGrades, totalUnits, totalWords };
  };

  const stats = getTotalStats();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">系统管理</h2>
        <p className="text-gray-500 mt-1">单词库管理和数据备份</p>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'library'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          单词库
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'backup'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          备份恢复
        </button>
      </div>

      {/* 单词库标签页 */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{stats.totalGrades}</div>
                <div className="text-gray-600 mt-1">年级段</div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{stats.totalUnits}</div>
                <div className="text-gray-600 mt-1">单元</div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{stats.totalWords}</div>
                <div className="text-gray-600 mt-1">单词</div>
              </div>
            </div>
          </div>

          {/* 年级列表 */}
          {Object.keys(library).map(grade => {
            const units = library[grade];
            const gradeWordCount = Object.keys(units).reduce((sum, unit) => sum + units[unit].length, 0);

            return (
              <div key={grade} className="card">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">{grade}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {Object.keys(units).length}个单元，共{gradeWordCount}个单词
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(units).map(unit => (
                    <div key={unit} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-800">{unit}</div>
                          <div className="text-sm text-gray-500 mt-1">{units[unit].length}个单词</div>
                        </div>
                        <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 备份恢复标签页 */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📦 导出备份</h3>
            <p className="text-gray-600 mb-4">
              导出所有数据到JSON文件，包括单词库、学习记录和错词本。
            </p>
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
            >
              导出所有数据
            </button>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📥 导入恢复</h3>
            <p className="text-gray-600 mb-4">
              从JSON文件导入数据，将覆盖现有所有数据。
            </p>
            <label className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all cursor-pointer inline-block">
              选择文件导入
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="card border-2 border-red-200 bg-red-50">
            <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ 危险操作</h3>
            <p className="text-red-600 mb-4">
              清除所有数据，包括单词库、学习记录和错词本。此操作不可恢复！
            </p>
            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
            >
              清除所有数据
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
