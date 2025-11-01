import { useState, useEffect } from 'react';
import {
  getWordLibrary,
  exportData,
  importData,
  addGrade,
  deleteGrade,
  addUnit,
  deleteUnit,
  renameUnit,
  addWord,
  updateWord,
  deleteWord,
  importWords
} from '../utils/storage';

export default function LibraryPage({ onRefresh }) {
  const [library, setLibrary] = useState({});
  const [activeTab, setActiveTab] = useState('library'); // library | backup
  const [editMode, setEditMode] = useState(false); // 编辑模式
  const [expandedUnits, setExpandedUnits] = useState(new Set()); // 展开的单元

  // 对话框状态
  const [dialog, setDialog] = useState({
    type: null, // addGrade | addUnit | addWord | editWord | renameUnit | importWords
    data: null  // 对话框上下文数据
  });

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
          onRefresh();
          alert('数据导入成功！');
        }
      } catch (error) {
        alert('数据格式错误，导入失败！');
        console.error(error);
      }
    };
    reader.readAsText(file);
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

  // 计算统计
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

  // 切换单元展开/折叠
  const toggleUnit = (grade, unit) => {
    const key = `${grade}-${unit}`;
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedUnits(newExpanded);
  };

  const isUnitExpanded = (grade, unit) => {
    return expandedUnits.has(`${grade}-${unit}`);
  };

  // 对话框操作
  const openDialog = (type, data = null) => {
    setDialog({ type, data });
  };

  const closeDialog = () => {
    setDialog({ type: null, data: null });
  };

  const handleAddGrade = (gradeName) => {
    const success = addGrade(gradeName);
    if (success) {
      loadLibrary();
      onRefresh();
      closeDialog();
      alert('年级添加成功！');
    } else {
      alert('年级已存在！');
    }
  };

  const handleDeleteGrade = (gradeName) => {
    const confirmed = confirm(`确定要删除"${gradeName}"吗？该年级下所有单元和单词都将被删除！`);
    if (confirmed) {
      const success = deleteGrade(gradeName);
      if (success) {
        loadLibrary();
        onRefresh();
        alert('年级删除成功！');
      }
    }
  };

  const handleAddUnit = (grade, unitName) => {
    const success = addUnit(grade, unitName);
    if (success) {
      loadLibrary();
      onRefresh();
      closeDialog();
      alert('单元添加成功！');
    } else {
      alert('单元已存在！');
    }
  };

  const handleDeleteUnit = (grade, unitName) => {
    const confirmed = confirm(`确定要删除"${unitName}"吗？该单元下所有单词都将被删除！`);
    if (confirmed) {
      const success = deleteUnit(grade, unitName);
      if (success) {
        loadLibrary();
        onRefresh();
        alert('单元删除成功！');
      }
    }
  };

  const handleRenameUnit = (grade, oldName, newName) => {
    const success = renameUnit(grade, oldName, newName);
    if (success) {
      loadLibrary();
      onRefresh();
      closeDialog();
      alert('单元重命名成功！');
    } else {
      alert('新名称已存在或操作失败！');
    }
  };

  const handleAddWord = (grade, unit, wordData) => {
    const success = addWord(grade, unit, wordData);
    if (success) {
      loadLibrary();
      onRefresh();
      closeDialog();
      alert('单词添加成功！');
    } else {
      alert('单词已存在或操作失败！');
    }
  };

  const handleUpdateWord = (grade, unit, oldWord, newWordData) => {
    const success = updateWord(grade, unit, oldWord, newWordData);
    if (success) {
      loadLibrary();
      onRefresh();
      closeDialog();
      alert('单词更新成功！');
    } else {
      alert('单词不存在或操作失败！');
    }
  };

  const handleDeleteWord = (grade, unit, wordText) => {
    const confirmed = confirm(`确定要删除单词"${wordText}"吗？`);
    if (confirmed) {
      const success = deleteWord(grade, unit, wordText);
      if (success) {
        loadLibrary();
        onRefresh();
        alert('单词删除成功！');
      }
    }
  };

  const handleImportWords = (grade, unit, text) => {
    const result = importWords(grade, unit, text);
    if (result.success > 0 || result.failed > 0) {
      loadLibrary();
      onRefresh();
      closeDialog();

      let message = `导入完成！\n成功: ${result.success}个\n失败: ${result.failed}个`;
      if (result.errors.length > 0) {
        message += '\n\n错误详情:\n' + result.errors.slice(0, 5).join('\n');
        if (result.errors.length > 5) {
          message += `\n...还有${result.errors.length - 5}个错误`;
        }
      }
      alert(message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">系统管理</h2>
          <p className="text-gray-500 mt-1">单词库管理和数据备份</p>
        </div>
        {activeTab === 'library' && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              editMode
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } shadow-lg`}
          >
            {editMode ? '退出编辑' : '进入编辑'}
          </button>
        )}
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

          {/* 添加年级按钮（编辑模式） */}
          {editMode && (
            <div>
              <button
                onClick={() => openDialog('addGrade')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                + 添加年级
              </button>
            </div>
          )}

          {/* 年级列表 */}
          {Object.keys(library).map(grade => {
            const units = library[grade];
            const gradeWordCount = Object.keys(units).reduce((sum, unit) => sum + units[unit].length, 0);

            return (
              <div key={grade} className="card">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{grade}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {Object.keys(units).length}个单元，共{gradeWordCount}个单词
                    </p>
                  </div>
                  {editMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDialog('addUnit', { grade })}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        + 添加单元
                      </button>
                      <button
                        onClick={() => handleDeleteGrade(grade)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        删除年级
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(units).map(unit => {
                    const words = units[unit];
                    const expanded = isUnitExpanded(grade, unit);

                    return (
                      <div key={unit}>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => editMode && toggleUnit(grade, unit)}
                            >
                              <div className="font-bold text-gray-800">{unit}</div>
                              <div className="text-sm text-gray-500 mt-1">{words.length}个单词</div>
                            </div>
                            {editMode && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => toggleUnit(grade, unit)}
                                  className="text-purple-600 hover:text-purple-800 text-sm"
                                  title={expanded ? "折叠" : "展开"}
                                >
                                  {expanded ? '▲' : '▼'}
                                </button>
                                <button
                                  onClick={() => openDialog('renameUnit', { grade, unit })}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  title="重命名"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteUnit(grade, unit)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                  title="删除单元"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 展开的单词列表 */}
                        {editMode && expanded && (
                          <div className="ml-4 mt-2 space-y-2">
                            <div className="flex space-x-2 mb-2">
                              <button
                                onClick={() => openDialog('addWord', { grade, unit })}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded transition-all"
                              >
                                + 添加单词
                              </button>
                              <button
                                onClick={() => openDialog('importWords', { grade, unit })}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded transition-all"
                              >
                                批量导入
                              </button>
                            </div>

                            {words.map((word, idx) => (
                              <div key={idx} className="bg-white rounded p-2 border border-gray-300 flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-bold text-gray-800">{word.word}</span>
                                  <span className="text-gray-600 ml-2">{word.meaning}</span>
                                  {word.pronunciation && (
                                    <span className="text-gray-500 ml-2 text-xs">{word.pronunciation}</span>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openDialog('editWord', { grade, unit, word })}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="编辑"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWord(grade, unit, word.word)}
                                    className="text-red-600 hover:text-red-800"
                                    title="删除"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

      {/* 对话框渲染 */}
      {dialog.type && (
        <Dialog
          type={dialog.type}
          data={dialog.data}
          onClose={closeDialog}
          onAddGrade={handleAddGrade}
          onAddUnit={handleAddUnit}
          onRenameUnit={handleRenameUnit}
          onAddWord={handleAddWord}
          onUpdateWord={handleUpdateWord}
          onImportWords={handleImportWords}
        />
      )}
    </div>
  );
}

// 通用对话框组件
function Dialog({ type, data, onClose, onAddGrade, onAddUnit, onRenameUnit, onAddWord, onUpdateWord, onImportWords }) {
  const [formData, setFormData] = useState({
    gradeName: '',
    unitName: '',
    word: '',
    meaning: '',
    pronunciation: '',
    importText: ''
  });

  useEffect(() => {
    // 编辑单词时预填充数据
    if (type === 'editWord' && data?.word) {
      setFormData({
        word: data.word.word,
        meaning: data.word.meaning,
        pronunciation: data.word.pronunciation || ''
      });
    }
    // 重命名单元时预填充
    if (type === 'renameUnit' && data?.unit) {
      setFormData({ unitName: data.unit });
    }
  }, [type, data]);

  const handleSubmit = (e) => {
    e.preventDefault();

    switch (type) {
      case 'addGrade':
        if (!formData.gradeName.trim()) {
          alert('请输入年级名称');
          return;
        }
        onAddGrade(formData.gradeName.trim());
        break;

      case 'addUnit':
        if (!formData.unitName.trim()) {
          alert('请输入单元名称');
          return;
        }
        onAddUnit(data.grade, formData.unitName.trim());
        break;

      case 'renameUnit':
        if (!formData.unitName.trim()) {
          alert('请输入新单元名称');
          return;
        }
        onRenameUnit(data.grade, data.unit, formData.unitName.trim());
        break;

      case 'addWord':
        if (!formData.word.trim() || !formData.meaning.trim()) {
          alert('请输入单词和意思');
          return;
        }
        onAddWord(data.grade, data.unit, {
          word: formData.word.trim(),
          meaning: formData.meaning.trim(),
          pronunciation: formData.pronunciation.trim()
        });
        break;

      case 'editWord':
        if (!formData.word.trim() || !formData.meaning.trim()) {
          alert('请输入单词和意思');
          return;
        }
        onUpdateWord(data.grade, data.unit, data.word.word, {
          word: formData.word.trim(),
          meaning: formData.meaning.trim(),
          pronunciation: formData.pronunciation.trim()
        });
        break;

      case 'importWords':
        if (!formData.importText.trim()) {
          alert('请输入要导入的单词');
          return;
        }
        onImportWords(data.grade, data.unit, formData.importText);
        break;
    }
  };

  const dialogTitles = {
    addGrade: '添加年级',
    addUnit: `添加单元 - ${data?.grade || ''}`,
    renameUnit: `重命名单元 - ${data?.grade || ''} - ${data?.unit || ''}`,
    addWord: `添加单词 - ${data?.grade || ''} - ${data?.unit || ''}`,
    editWord: `编辑单词 - ${data?.grade || ''} - ${data?.unit || ''}`,
    importWords: `批量导入 - ${data?.grade || ''} - ${data?.unit || ''}`
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{dialogTitles[type]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'addGrade' && (
            <input
              type="text"
              placeholder="例如：三年级下册"
              value={formData.gradeName}
              onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          )}

          {(type === 'addUnit' || type === 'renameUnit') && (
            <input
              type="text"
              placeholder="例如：Unit 7"
              value={formData.unitName}
              onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          )}

          {(type === 'addWord' || type === 'editWord') && (
            <>
              <input
                type="text"
                placeholder="单词（英文）"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <input
                type="text"
                placeholder="意思（中文）"
                value={formData.meaning}
                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="音标（可选）"
                value={formData.pronunciation}
                onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </>
          )}

          {type === 'importWords' && (
            <>
              <textarea
                placeholder={'每行一个单词，支持多种格式：\n\n横杠格式：\napple-苹果-/ˈæpl/\n\n空格格式：\nfather /ˈfɑːðə(r)/ 父亲；爸爸\nme /miː/ 我\n\n音标可选'}
                value={formData.importText}
                onChange={(e) => setFormData({ ...formData, importText: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                支持格式1: word-meaning-pronunciation 或 格式2: word /pronunciation/ meaning（音标可选）
              </p>
            </>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              确定
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-xl transition-all"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
