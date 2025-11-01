import { useState, useEffect } from 'react';
import { getRecords } from '../utils/storage';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = getRecords();
    // 按时间倒序排列（最新的在前面）
    const sorted = allRecords.sort((a, b) => b.timestamp - a.timestamp);
    setRecords(sorted);

    // 按日期分组
    const grouped = {};
    const today = new Date();
    const todayStr = formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    sorted.forEach(record => {
      let groupKey;
      if (record.date === todayStr) {
        groupKey = '今天';
      } else if (record.date === yesterdayStr) {
        groupKey = '昨天';
      } else {
        groupKey = record.date;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(record);
    });

    setGroupedRecords(grouped);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRecordStats = (record) => {
    const total = record.results.length;
    const correct = record.results.filter(r => r.correct).length;
    const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, correctRate };
  };

  // 空状态
  if (records.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">学习记录</h2>
          <p className="text-gray-500 mt-1">查看你的学习历史</p>
        </div>

        <div className="card text-center py-16">
          <div className="text-8xl mb-6">📚</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">还没有学习记录</h3>
          <p className="text-gray-600">开始学习单词，记录会自动保存在这里！</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">学习记录</h2>
        <p className="text-gray-500 mt-1">共{records.length}条学习记录</p>
      </div>

      {/* 按日期分组显示 */}
      <div className="space-y-6">
        {Object.keys(groupedRecords).map(dateKey => {
          const dayRecords = groupedRecords[dateKey];

          return (
            <div key={dateKey}>
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {dateKey}
              </h3>

              <div className="space-y-3">
                {dayRecords.map(record => {
                  const stats = getRecordStats(record);

                  return (
                    <div
                      key={record.id}
                      className="card hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-800">
                              {record.grade} - {record.unit}
                            </h4>
                            <span className="text-sm text-gray-500">{record.time}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              学习 <span className="font-bold text-blue-600">{stats.total}</span> 个单词
                            </span>
                            <span className="text-gray-600">
                              正确 <span className="font-bold text-green-600">{stats.correct}</span> 个
                            </span>
                            <span className="text-gray-600">
                              正确率 <span className={`font-bold ${stats.correctRate >= 80 ? 'text-green-600' : stats.correctRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {stats.correctRate}%
                              </span>
                            </span>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedRecord.grade} - {selectedRecord.unit}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRecord.date} {selectedRecord.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* 答题详情 */}
            <div className="space-y-2">
              {selectedRecord.results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {result.correct ? '✓' : '✗'}
                    </span>
                    <div>
                      <div className="text-lg font-bold text-gray-800">{result.word}</div>
                      <div className="text-sm text-gray-600">{result.meaning}</div>
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
