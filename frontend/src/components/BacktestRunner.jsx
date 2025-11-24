import { useState } from 'react';
import { Play, Settings, Info, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { fetchBacktest } from '../utils/apiUtils';
import { enhanceBacktestResult } from '../utils/accountUtils';

function BacktestRunner({ candleData, accountBalance, onBacktestComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customResult, setCustomResult] = useState(null);
  const [error, setError] = useState(null);

  // 백테스팅 파라미터
  const [params, setParams] = useState({
    targetProfit: 5,
    stopLoss: -2,
    holdingPeriod: 10,
    rsiMin: 30,
    rsiMax: 70,
    volumeThreshold: 150
  });

  const handleRunBacktest = async () => {
    if (!candleData || candleData.length < 100) {
      setError('백테스팅을 위해서는 최소 100개의 캔들 데이터가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setCustomResult(null);

    try {
      const result = await fetchBacktest(candleData, params.targetProfit, {
        stopLoss: params.stopLoss,
        holdingPeriod: params.holdingPeriod,
        rsiMin: params.rsiMin,
        rsiMax: params.rsiMax,
        volumeThreshold: params.volumeThreshold
      });

      // 금액 정보 추가
      const enhanced = enhanceBacktestResult(result, accountBalance || { initial: 1000000, current: 1000000 });
      setCustomResult(enhanced);
      
      if (onBacktestComplete) {
        onBacktestComplete(enhanced);
      }
    } catch (err) {
      setError('백테스팅 실행 실패: ' + err.message);
      console.error('백테스팅 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!candleData || candleData.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/50 shadow-xl">
        <div className="text-center text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>백테스팅을 실행하려면 먼저 코인을 선택하고 분석을 실행해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          커스텀 백테스팅
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-all"
        >
          {isOpen ? '설정 숨기기' : '설정 보기'}
        </button>
      </div>

      {/* 설정 패널 */}
      {isOpen && (
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            백테스팅 파라미터 설정
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 목표 수익률 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                목표 수익률: {params.targetProfit}%
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={params.targetProfit}
                onChange={(e) => setParams({ ...params, targetProfit: parseInt(e.target.value) })}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* 손절선 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                손절선: {params.stopLoss}%
              </label>
              <input
                type="range"
                min="-10"
                max="-1"
                value={params.stopLoss}
                onChange={(e) => setParams({ ...params, stopLoss: parseInt(e.target.value) })}
                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-10%</span>
                <span>-5%</span>
                <span>-1%</span>
              </div>
            </div>

            {/* 보유 기간 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                보유 기간: {params.holdingPeriod}일
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={params.holdingPeriod}
                onChange={(e) => setParams({ ...params, holdingPeriod: parseInt(e.target.value) })}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1일</span>
                <span>15일</span>
                <span>30일</span>
              </div>
            </div>

            {/* RSI 최소값 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                RSI 최소값: {params.rsiMin}
              </label>
              <input
                type="range"
                min="20"
                max="50"
                value={params.rsiMin}
                onChange={(e) => setParams({ ...params, rsiMin: parseInt(e.target.value) })}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>20</span>
                <span>35</span>
                <span>50</span>
              </div>
            </div>

            {/* RSI 최대값 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                RSI 최대값: {params.rsiMax}
              </label>
              <input
                type="range"
                min="50"
                max="80"
                value={params.rsiMax}
                onChange={(e) => setParams({ ...params, rsiMax: parseInt(e.target.value) })}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50</span>
                <span>65</span>
                <span>80</span>
              </div>
            </div>

            {/* 거래량 임계값 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                거래량 임계값: {params.volumeThreshold}%
              </label>
              <input
                type="range"
                min="100"
                max="300"
                step="10"
                value={params.volumeThreshold}
                onChange={(e) => setParams({ ...params, volumeThreshold: parseInt(e.target.value) })}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>100%</span>
                <span>200%</span>
                <span>300%</span>
              </div>
            </div>
          </div>

          {/* 파라미터 요약 */}
          <div className="mt-4 p-4 bg-white/80 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 text-gray-700">📋 설정 요약</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
              <div>• 목표 수익: <strong>{params.targetProfit}%</strong></div>
              <div>• 손절선: <strong>{params.stopLoss}%</strong></div>
              <div>• 보유 기간: <strong>{params.holdingPeriod}일</strong></div>
              <div>• RSI 범위: <strong>{params.rsiMin}~{params.rsiMax}</strong></div>
              <div>• 거래량 조건: <strong>{params.volumeThreshold}% 이상</strong></div>
              <div>• 데이터: <strong>{candleData.length}개 캔들</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* 실행 버튼 및 에러 */}
      <div className="mb-4">
        <button
          onClick={handleRunBacktest}
          disabled={loading || !candleData || candleData.length < 100}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '백테스팅 실행 중...' : '백테스팅 실행'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* 커스텀 결과 표시 */}
      {customResult && (
        <div className="mt-6 space-y-4">
          <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              커스텀 백테스팅 결과
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">총 거래</div>
                <div className="text-xl font-bold text-gray-800">{customResult.totalTrades}</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">성공</div>
                <div className="text-xl font-bold text-green-600">{customResult.successfulTrades}</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">성공률</div>
                <div className={`text-xl font-bold ${
                  customResult.successRate >= 60 ? 'text-green-600' :
                  customResult.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {customResult.successRate}%
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">평균 수익</div>
                <div className={`text-xl font-bold ${
                  customResult.avgProfit > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {customResult.avgProfit}%
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">총 수익률</div>
                <div className={`text-xl font-bold ${
                  customResult.totalProfit > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {customResult.totalProfit}%
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-500 mb-1">최대 낙폭</div>
                <div className="text-xl font-bold text-red-600">{customResult.maxDrawdown}%</div>
              </div>
            </div>

            {/* 실제 금액 정보 */}
            {customResult.realAmount && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  실제 금액 시뮬레이션
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">투자 금액</div>
                    <div className="text-lg font-bold text-gray-800">
                      {customResult.realAmount.investmentAmount.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">총 수익</div>
                    <div className="text-lg font-bold text-green-600">
                      +{customResult.realAmount.totalProfitAmount.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">총 손실</div>
                    <div className="text-lg font-bold text-red-600">
                      -{customResult.realAmount.totalLossAmount.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">순 수익</div>
                    <div className={`text-lg font-bold ${
                      customResult.realAmount.netProfit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {customResult.realAmount.netProfit > 0 ? '+' : ''}
                      {customResult.realAmount.netProfit.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">최종 수익률</span>
                    <span className={`text-lg font-bold ${
                      customResult.realAmount.totalReturn > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {customResult.realAmount.totalReturn > 0 ? '+' : ''}
                      {customResult.realAmount.totalReturn}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 평가 */}
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              customResult.successRate >= 60 ? 'bg-green-100 border-green-300' :
              customResult.successRate >= 50 ? 'bg-yellow-100 border-yellow-300' :
              'bg-red-100 border-red-300'
            }`}>
              <p className="text-sm font-semibold text-gray-800">
                {customResult.successRate >= 60 
                  ? '✅ 우수한 성공률! 이 설정으로 투자 고려 가능'
                  : customResult.successRate >= 50
                  ? '⚠️ 보통 성공률. 리스크 관리 필요'
                  : '❌ 낮은 성공률. 파라미터 조정 권장'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BacktestRunner;

