import { getGradeUnits } from '../utils/storage';

export default function UnitSelectPage({ grade, onSelectUnit, onBack }) {
  const units = getGradeUnits(grade);
  const unitList = Object.keys(units);

  return (
    <div>
      <div className="mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mb-2 flex items-center font-medium">
          ← 返回
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{grade}</h2>
        <p className="text-gray-500 mt-1">选择一个单元开始背诵</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unitList.map((unitName) => {
          const words = units[unitName];
          const wordCount = words.length;

          return (
            <div
              key={unitName}
              className="card hover:shadow-lg cursor-pointer border-2 border-transparent hover:border-blue-300 transition-all"
              onClick={() => onSelectUnit(unitName)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{unitName}</h3>
                  <p className="text-gray-500 text-sm mt-1">{wordCount}个单词</p>
                </div>
                <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>

              {/* 单词预览 */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-600 mb-1">单词示例：</p>
                <p className="text-sm text-gray-700">
                  {words.slice(0, 3).map(w => w.word).join(', ')}
                  {words.length > 3 && '...'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">点击开始背诵</span>
                <span className="text-blue-600 font-bold">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
