import { TrendingUp, TrendingDown } from 'lucide-react';

function TechnicalIndicators({ indicators }) {
  if (!indicators) return null;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/50 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">기술적 지표</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">MA5</div>
          <div className="text-lg font-bold text-gray-800">{indicators.ma5}</div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">MA20</div>
          <div className="text-lg font-bold text-gray-800">{indicators.ma20}</div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">MA60</div>
          <div className="text-lg font-bold text-gray-800">{indicators.ma60}</div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">RSI(14)</div>
          <div className={`text-lg font-bold ${
            indicators.rsi < 30 ? 'text-blue-600' : 
            indicators.rsi > 70 ? 'text-red-600' : 'text-gray-800'
          }`}>
            {indicators.rsi}
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">거래량 비율</div>
          <div className="text-lg font-bold text-gray-800">{indicators.volumeRatio}%</div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">변동성</div>
          <div className="text-lg font-bold text-gray-800">{indicators.volatility}%</div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <div className="flex items-center gap-2">
          {indicators.goldenCross ? (
            <>
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">골든크로스 (상승 신호)</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-500">데드크로스 또는 중립</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TechnicalIndicators;

