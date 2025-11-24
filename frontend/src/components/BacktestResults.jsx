import { Download } from 'lucide-react';

function BacktestResults({ backtestResult }) {
  if (!backtestResult) return null;

  const ResultCard = ({ title, result, color, iconColor }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Download className={`w-6 h-6 ${iconColor}`} />
        </div>
        {title}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-md">
          <div className="text-xs text-gray-500 mb-1 font-medium">총 거래</div>
          <div className="text-2xl font-bold text-gray-800">{result.totalTrades}</div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-md">
          <div className="text-xs text-gray-500 mb-1 font-medium">성공</div>
          <div className="text-2xl font-bold text-green-600">
            {result.successfulTrades}
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-md">
          <div className="text-xs text-gray-500 mb-1 font-medium">성공률</div>
          <div className={`text-2xl font-bold ${
            result.successRate >= 60 ? 'text-green-600' : 
            result.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {result.successRate}%
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-md">
          <div className="text-xs text-gray-500 mb-1 font-medium">평균 수익</div>
          <div className={`text-2xl font-bold ${
            result.avgProfit > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.avgProfit}%
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-md">
          <div className="text-xs text-gray-500 mb-1 font-medium">총 수익률</div>
          <div className={`text-2xl font-bold ${
            result.totalProfit > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {result.totalProfit}%
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-md">
          <div className="text-xs text-gray-500 mb-1 font-medium">최대 낙폭</div>
          <div className="text-2xl font-bold text-red-600">
            {result.maxDrawdown}%
          </div>
        </div>
      </div>

      {title.includes('5%') && (
        <>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-4 border border-blue-200/50">
            <h3 className="font-bold mb-2 text-gray-800">전략 평가</h3>
            <p className="text-gray-700 text-sm">
              {result.successRate >= 60 ? 
                '✅ 높은 성공률! 이 전략은 수익 가능성이 높습니다.' :
                result.successRate >= 50 ?
                '⚠️ 보통 성공률. 리스크 관리를 철저히 하면 수익 가능합니다.' :
                '❌ 낮은 성공률. 전략을 재검토해야 합니다.'}
            </p>
            <p className="text-gray-700 text-sm mt-2">
              기댓값: {result.avgProfit}% 
              {result.avgProfit > 0 ? ' (양수 - 장기적으로 수익 가능)' : ' (음수 - 손실 위험)'}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 rounded-xl border border-blue-300/50">
            <h3 className="font-bold mb-2 text-blue-800">사용된 매수 신호 조건</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 골든크로스: MA5가 MA20을 상향 돌파</li>
              <li>• RSI: 30~70 구간 (과매도/과매수 제외)</li>
              <li>• 거래량: 20일 평균 대비 150% 이상 급증</li>
              <li>• 손절: 신호 발생 후 10일 내 목표 미달성 시 -2%</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <ResultCard
        title="5% 목표 수익률 백테스팅"
        result={backtestResult.result5}
        color="bg-green-100"
        iconColor="text-green-600"
      />
      <ResultCard
        title="10% 목표 수익률 백테스팅"
        result={backtestResult.result10}
        color="bg-purple-100"
        iconColor="text-purple-600"
      />
    </div>
  );
}

export default BacktestResults;

