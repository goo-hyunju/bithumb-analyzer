import { TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';

function TechnicalIndicators({ indicators }) {
  const [showGuide, setShowGuide] = useState(false);
  
  if (!indicators) return null;

  // 지표 해석
  const getRSIInterpretation = (rsi) => {
    if (rsi < 30) return { text: '과매도 (매수 기회)', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (rsi > 70) return { text: '과매수 (매도 신호)', color: 'text-red-600', bg: 'bg-red-50' };
    return { text: '적정 구간', color: 'text-gray-700', bg: 'bg-gray-50' };
  };

  const getVolumeInterpretation = (volumeRatio) => {
    if (volumeRatio >= 200) return { text: '매우 높은 거래량 (급등/급락 신호)', color: 'text-orange-600' };
    if (volumeRatio >= 150) return { text: '높은 거래량 (관심 증가)', color: 'text-yellow-600' };
    if (volumeRatio >= 100) return { text: '평균 수준', color: 'text-gray-600' };
    return { text: '낮은 거래량 (관심 부족)', color: 'text-gray-400' };
  };

  const rsiInfo = getRSIInterpretation(parseFloat(indicators.rsi));
  const volumeInfo = getVolumeInterpretation(indicators.volumeRatio);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">기술적 지표</h2>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all"
        >
          <Info className="w-4 h-4" />
          {showGuide ? '가이드 숨기기' : '활용 가이드 보기'}
        </button>
      </div>

      {/* 활용 가이드 */}
      {showGuide && (
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            기술적 지표 활용 가이드
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">📊 이동평균선 (MA)</h4>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>• <strong>MA5 &gt; MA20</strong>: 단기 상승 추세</li>
                <li>• <strong>골든크로스</strong>: 매수 신호 (MA5가 MA20을 상향 돌파)</li>
                <li>• <strong>데드크로스</strong>: 매도 신호 (MA5가 MA20을 하향 돌파)</li>
                <li>• <strong>MA60</strong>: 장기 추세 판단 기준</li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">📈 RSI (상대강도지수)</h4>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>• <strong>RSI &lt; 30</strong>: 과매도 구간 (매수 기회)</li>
                <li>• <strong>30-70</strong>: 적정 구간 (안정적)</li>
                <li>• <strong>RSI &gt; 70</strong>: 과매수 구간 (매도 고려)</li>
                <li>• 현재: <span className={rsiInfo.color + ' font-bold'}>{indicators.rsi} - {rsiInfo.text}</span></li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">📊 거래량 비율</h4>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>• <strong>&gt; 200%</strong>: 매우 높음 (급등/급락 주의)</li>
                <li>• <strong>150-200%</strong>: 높음 (관심 증가)</li>
                <li>• <strong>100-150%</strong>: 평균 수준</li>
                <li>• 현재: <span className={volumeInfo.color + ' font-bold'}>{indicators.volumeRatio}% - {volumeInfo.text}</span></li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">📉 변동성</h4>
              <ul className="space-y-1 text-gray-700 text-xs">
                <li>• <strong>높은 변동성</strong>: 큰 가격 변동 (리스크 높음)</li>
                <li>• <strong>낮은 변동성</strong>: 안정적 (리스크 낮음)</li>
                <li>• 현재 변동성: <strong>{indicators.volatility}%</strong></li>
                <li>• 투자 자금의 <strong>{Math.min(100, indicators.volatility * 2)}%</strong> 이하로 제한 권장</li>
              </ul>
            </div>
          </div>
        </div>
      )}
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
          <div className={`text-xs mt-1 ${rsiInfo.color} font-medium`}>
            {rsiInfo.text}
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">거래량 비율</div>
          <div className="text-lg font-bold text-gray-800">{indicators.volumeRatio}%</div>
          <div className={`text-xs mt-1 ${volumeInfo.color} font-medium`}>
            {volumeInfo.text}
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
          <div className="text-xs text-gray-500 mb-1 font-medium">변동성</div>
          <div className="text-lg font-bold text-gray-800">{indicators.volatility}%</div>
          <div className="text-xs mt-1 text-gray-500">
            {parseFloat(indicators.volatility) > 5 ? '높음 (리스크 높음)' : '낮음 (안정적)'}
          </div>
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

