export default function ReciteResultPage({ result, onBackHome, onViewHistory }) {
  const { totalWords, correctWords, wrongWords, correctRate } = result;

  // 圆形进度图
  const circumference = 408; // 2 * π * 65
  const offset = circumference - (correctRate / 100) * circumference;

  return (
    <div className="text-center py-8">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-4xl font-bold text-gray-800 mb-2">背诵完成！</h2>
      <p className="text-gray-500 mb-8">今天的表现很棒哦！</p>

      <div className="card max-w-2xl mx-auto mb-8">
        <h3 className="text-2xl font-bold text-gray-700 mb-6">本次成绩</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">{totalWords}</div>
            <div className="text-gray-600">总计单词</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6">
            <div className="text-5xl font-bold text-green-600 mb-2">{correctWords}</div>
            <div className="text-gray-600">✓ 正确</div>
          </div>
          <div className="bg-red-50 rounded-xl p-6">
            <div className="text-5xl font-bold text-red-600 mb-2">{wrongWords}</div>
            <div className="text-gray-600">✗ 错误</div>
          </div>
        </div>

        {/* 圆形进度图 - 正确率 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="circle-progress" style={{ width: '150px', height: '150px' }}>
              <svg width="150" height="150">
                <circle
                  className="circle-bg"
                  cx="75"
                  cy="75"
                  r="65"
                  style={{ stroke: '#e5e7eb', fill: 'none', strokeWidth: 10 }}
                ></circle>
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  style={{
                    stroke: '#10b981',
                    fill: 'none',
                    strokeWidth: 10,
                    strokeLinecap: 'round',
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                    transition: 'stroke-dashoffset 0.5s ease'
                  }}
                ></circle>
              </svg>
              <div
                className="circle-text"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}
              >
                {correctRate}%
              </div>
            </div>
            <p className="text-center text-gray-600 font-semibold mt-4">正确率</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button onClick={onBackHome} className="btn-primary">
          返回首页
        </button>
        <button
          onClick={onViewHistory}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
        >
          查看详情
        </button>
      </div>
    </div>
  );
}
