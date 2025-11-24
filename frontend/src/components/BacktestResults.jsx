import { Download, Info, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

function BacktestResults({ backtestResult }) {
  const [showGuide, setShowGuide] = useState(false);
  
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

      {/* 상세 분석 결과 */}
      <div className="mt-6 space-y-4">
        <div className={`p-5 rounded-xl border-2 ${
          result.successRate >= 60 ? 'bg-green-50 border-green-300' :
          result.successRate >= 50 ? 'bg-yellow-50 border-yellow-300' :
          'bg-red-50 border-red-300'
        }`}>
          <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
            {result.successRate >= 60 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : result.successRate >= 50 ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            전략 평가 및 투자 권장사항
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/80 rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">성공률 평가</div>
              <div className={`text-lg font-bold ${
                result.successRate >= 60 ? 'text-green-600' :
                result.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {result.successRate >= 60 ? '✅ 우수' :
                 result.successRate >= 50 ? '⚠️ 보통' : '❌ 위험'}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {result.successRate >= 60 ? 
                  '이 전략은 과거 데이터 기준으로 높은 성공률을 보였습니다. 투자 고려 대상입니다.' :
                  result.successRate >= 50 ?
                  '보통 성공률입니다. 리스크 관리와 분할 투자를 통해 접근하세요.' :
                  '낮은 성공률입니다. 이 전략으로 투자하기 전에 신중히 검토하세요.'}
              </p>
            </div>

            <div className="bg-white/80 rounded-lg p-4 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">기댓값 (Expected Value)</div>
              <div className={`text-lg font-bold ${
                result.avgProfit > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.avgProfit > 0 ? '✅ 수익 가능' : '❌ 손실 위험'}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                평균 {result.avgProfit}%의 수익률을 기대할 수 있습니다.
                {result.avgProfit > 0 
                  ? ' 양수이므로 장기적으로 수익 가능성이 있습니다.'
                  : ' 음수이므로 전략을 재검토하거나 투자 금액을 줄이는 것이 좋습니다.'}
              </p>
            </div>
          </div>

          {/* 투자 전략 제안 */}
          {result.successRate >= 50 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
              <h4 className="font-semibold mb-2 text-blue-800">💡 투자 전략 제안</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 총 자산의 <strong>{Math.min(30, Math.max(10, result.successRate / 2))}%</strong> 이하로 투자</li>
                <li>• {title.includes('5%') ? '보수적' : '공격적'} 전략: 목표 수익률 {title.includes('5%') ? '5%' : '10%'}</li>
                <li>• 손절선 -2% 반드시 준수</li>
                <li>• 최대 낙폭 {Math.abs(result.maxDrawdown)}% 감수 가능한 금액만 투자</li>
                {result.totalTrades > 0 && (
                  <li>• 예상 거래 빈도: 약 {Math.round(200 / result.totalTrades)}일당 1회</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {title.includes('5%') && (
          <div className="p-4 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 rounded-xl border border-blue-300/50">
            <h3 className="font-bold mb-3 text-blue-800">🔍 사용된 매수 신호 조건 (3단 필터링)</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-sm text-blue-700 mb-1">1차 필터: 골든크로스</div>
                <div className="text-xs text-gray-700">MA5가 MA20을 상향 돌파하는 순간</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-sm text-blue-700 mb-1">2차 필터: RSI</div>
                <div className="text-xs text-gray-700">30~70 구간 (과매도/과매수 구간 제외)</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-blue-200 md:col-span-2">
                <div className="font-semibold text-sm text-blue-700 mb-1">3차 필터: 거래량 급증</div>
                <div className="text-xs text-gray-700">20일 평균 거래량 대비 150% 이상 증가</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="text-xs text-gray-600">
                <strong>손절 규칙:</strong> 신호 발생 후 10일 내 목표 수익률 미달성 시 -2% 손절
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 백테스팅 가이드 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            백테스팅 가이드
          </h2>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all"
          >
            {showGuide ? '가이드 숨기기' : '상세 가이드 보기'}
          </button>
        </div>

        {showGuide && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="font-bold mb-3 text-gray-800">📚 백테스팅이란?</h3>
              <p className="text-sm text-gray-700 mb-2">
                과거 데이터를 사용하여 거래 전략의 성과를 시뮬레이션하는 방법입니다. 
                실제 돈을 투자하지 않고도 전략의 유효성을 검증할 수 있습니다.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/80 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  성공률 해석
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <strong className="text-green-600">60% 이상</strong>: 우수! 투자 고려</li>
                  <li>• <strong className="text-yellow-600">50-60%</strong>: 보통. 리스크 관리 필수</li>
                  <li>• <strong className="text-red-600">50% 미만</strong>: 위험. 전략 재검토</li>
                </ul>
              </div>

              <div className="p-4 bg-white/80 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  평균 수익률 해석
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <strong className="text-green-600">+2% 이상</strong>: 장기 수익 가능</li>
                  <li>• <strong className="text-gray-600">0-2%</strong>: 손익분기 근처</li>
                  <li>• <strong className="text-red-600">음수</strong>: 손실 위험 높음</li>
                </ul>
              </div>

              <div className="p-4 bg-white/80 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  최대 낙폭 해석
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <strong>-10% 이내</strong>: 관리 가능한 수준</li>
                  <li>• <strong>-10~20%</strong>: 주의 필요</li>
                  <li>• <strong>-20% 이상</strong>: 매우 위험</li>
                </ul>
              </div>

              <div className="p-4 bg-white/80 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  투자 전략 예시
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 총 자산의 20-30%만 투자</li>
                  <li>• 성공률 60% 이상 코인 선택</li>
                  <li>• 손절선 준수 필수</li>
                  <li>• 분할 매수로 리스크 분산</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <h4 className="font-semibold mb-2 text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ⚠️ 투자 경고
              </h4>
              <ul className="text-xs text-yellow-900 space-y-1">
                <li>• 백테스팅 결과는 과거 데이터 기반으로 미래를 보장하지 않습니다</li>
                <li>• 암호화폐 투자는 고위험 자산입니다</li>
                <li>• 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다</li>
                <li>• 손실 가능성을 고려하여 투자 자금을 관리하세요</li>
              </ul>
            </div>
          </div>
        )}
      </div>

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

