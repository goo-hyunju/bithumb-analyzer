import { Info } from 'lucide-react';
import BacktestRunner from '../components/BacktestRunner';
import BacktestResults from '../components/BacktestResults';

/**
 * 백테스팅 페이지
 * - 과거 데이터 기반 전략 테스트
 * - 파라미터 조정 및 결과 분석
 * - 실제 투자 전 전략 검증
 */
function BacktestPage({
  candleData,
  accountBalance,
  selectedMarket,
  backtestResult,
  onBacktestComplete
}) {
  return (
    <div className="space-y-6">
      {/* 안내 */}
      <div className="bg-purple-50/80 backdrop-blur-lg border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-purple-900 mb-3">백테스팅(Backtesting)이란?</h3>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-800">정의</h4>
                <p className="text-sm text-purple-700">
                  백테스팅은 <strong>과거의 실제 시장 데이터</strong>를 사용하여 거래 전략을 시뮬레이션하고 
                  그 전략이 과거에 어떻게 작동했을지를 검증하는 방법입니다.
                </p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-800">작동 방식</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• <strong>과거 데이터 사용</strong>: 예를 들어, 200일 전부터 오늘까지의 가격 데이터</li>
                  <li>• <strong>전략 적용</strong>: 각 시점에 전략의 매수/매도 신호 확인</li>
                  <li>• <strong>결과 계산</strong>: 과거에 이 전략을 따랐다면 얼마를 벌거나 잃었을지 계산</li>
                  <li>• <strong>통계 분석</strong>: 성공률, 평균 수익률, 최대 낙폭 등 계산</li>
                </ul>
              </div>

              <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold mb-2 text-purple-800">모의투자와의 차이</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong className="text-purple-800">백테스팅</strong>
                    <ul className="text-purple-700 space-y-1 mt-1">
                      <li>• 과거 데이터 기반</li>
                      <li>• 전략 검증 목적</li>
                      <li>• 결과를 즉시 확인</li>
                      <li>• 시간을 되돌려 테스트</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-purple-800">모의투자</strong>
                    <ul className="text-purple-700 space-y-1 mt-1">
                      <li>• 현재가 기준</li>
                      <li>• 실전 연습 목적</li>
                      <li>• 주문/체결 필요</li>
                      <li>• 실시간으로 진행</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-300">
                <h4 className="font-semibold mb-2 text-blue-800">💡 활용 방법</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>전략 검증</strong>: "골든크로스 전략이 과거에 효과적이었는가?"</li>
                  <li>• <strong>파라미터 최적화</strong>: "목표 수익률 5%와 10% 중 어느 것이 더 좋은가?"</li>
                  <li>• <strong>리스크 평가</strong>: "이 전략의 최대 손실은 얼마일까?"</li>
                  <li>• <strong>투자 결정</strong>: "과거 데이터 기준으로 이 전략을 실제로 사용해도 될까?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 백테스팅 실행 */}
      <BacktestRunner
        candleData={candleData}
        accountBalance={accountBalance}
        onBacktestComplete={onBacktestComplete}
      />

      {/* 백테스팅 결과 */}
      {backtestResult && (
        <BacktestResults backtestResult={backtestResult} />
      )}
    </div>
  );
}

export default BacktestPage;

