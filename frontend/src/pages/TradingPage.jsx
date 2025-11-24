import { useState, useEffect } from 'react';
import OrderSystem from '../components/OrderSystem';
import CoinSelector from '../components/CoinSelector';
import PriceChart from '../components/PriceChart';
import PriceCards from '../components/PriceCards';
import ToastContainer, { useToast } from '../components/Toast';
import { TrendingUp, Info } from 'lucide-react';
import { fetchCurrentPrice } from '../utils/apiUtils';

/**
 * 모의투자 페이지
 * - 실제 현재가 기준으로 주문/체결
 * - 실시간 수익/손실 계산
 * - 주문 내역 관리
 */
function TradingPage({
  markets,
  selectedMarket,
  onMarketChange,
  currentPrice,
  onCurrentPriceChange,
  accountBalance,
  onBalanceChange,
  onTradeHistoryUpdate,
  candleData,
  candleUnit,
  onCandleUnitChange,
  candleMinute,
  onCandleMinuteChange,
  candleCount,
  onAnalyze,
  loading,
  serverStatus,
  onRetryConnection,
  isRealTime,
  onRealTimeToggle,
  error
}) {
  const [filledOrders, setFilledOrders] = useState([]);
  const { toasts, showToast, removeToast } = useToast();

  // 모의투자 페이지 진입 시 또는 코인 선택 시 현재가 조회
  useEffect(() => {
    const loadCurrentPrice = async () => {
      if (selectedMarket && serverStatus === 'connected') {
        try {
          const price = await fetchCurrentPrice(selectedMarket);
          if (onCurrentPriceChange) {
            onCurrentPriceChange(price);
          }
        } catch (err) {
          console.error('현재가 조회 실패:', err);
        }
      }
    };

    loadCurrentPrice();
  }, [selectedMarket, serverStatus, onCurrentPriceChange]);

  const handleOrderFilled = (filledOrder) => {
    setFilledOrders(prev => [...prev, filledOrder]);
    
    // 거래 내역 업데이트
    if (onTradeHistoryUpdate) {
      onTradeHistoryUpdate(filledOrder);
    }

    // 토스트 알림 표시
    if (filledOrder.type === 'buy') {
      showToast(
        `매수 체결: ${filledOrder.marketName} ${filledOrder.amount}개 @ ${filledOrder.filledPrice?.toLocaleString('ko-KR')}원`,
        'success'
      );
    } else {
      const profitText = filledOrder.profit > 0 
        ? `+${filledOrder.profit.toLocaleString('ko-KR')}원`
        : `${filledOrder.profit.toLocaleString('ko-KR')}원`;
      showToast(
        `매도 체결: ${filledOrder.marketName} ${filledOrder.amount}개 (${profitText})`,
        filledOrder.profit > 0 ? 'success' : 'error'
      );
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="space-y-6">
      {/* 안내 */}
      <div className="bg-blue-50/80 backdrop-blur-lg border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">모의투자 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 모의투자는 <strong>실제 현재가</strong>를 기준으로 주문을 체결합니다.</li>
              <li>• 백테스팅과 달리 <strong>실시간으로 주문/체결</strong>이 이루어집니다.</li>
              <li>• 실제 돈이 아닌 가상 계좌 자금으로 거래합니다.</li>
              <li>• 주문 체결 시 즉시 수익/손실이 반영됩니다.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 코인 선택 */}
      <CoinSelector
        markets={markets}
        selectedMarket={selectedMarket}
        onMarketChange={onMarketChange}
        candleUnit={candleUnit}
        onCandleUnitChange={onCandleUnitChange}
        candleMinute={candleMinute}
        onCandleMinuteChange={onCandleMinuteChange}
        candleCount={candleCount}
        onAnalyze={onAnalyze}
        loading={loading}
        serverStatus={serverStatus}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <Info className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* 현재가 정보 */}
      {currentPrice && <PriceCards currentPrice={currentPrice} />}

      {/* 현재가가 없을 때 안내 */}
      {!currentPrice && serverStatus === 'connected' && (
        <div className="bg-yellow-50/80 backdrop-blur-lg border border-yellow-200 rounded-xl p-4">
          <div className="text-sm text-yellow-800">
            💡 현재가 정보를 가져오려면 "분석 시작" 버튼을 클릭하거나 코인을 선택해주세요.
          </div>
        </div>
      )}

      {/* 가격 차트 */}
      <PriceChart
        candleData={candleData}
        candleUnit={candleUnit}
        candleMinute={candleMinute}
        isRealTime={isRealTime}
        onRealTimeToggle={onRealTimeToggle}
        serverStatus={serverStatus}
      />

      {/* 주문 시스템 */}
      <OrderSystem
        selectedMarket={selectedMarket}
        currentPrice={currentPrice}
        accountBalance={accountBalance}
        onBalanceChange={onBalanceChange}
        onOrderFilled={handleOrderFilled}
      />

      {/* 수익 요약 */}
      {filledOrders.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            거래 요약
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-xs text-green-600 mb-1">총 거래</div>
              <div className="text-2xl font-bold text-green-700">{filledOrders.length}건</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-600 mb-1">총 수익</div>
              <div className="text-2xl font-bold text-blue-700">
                +{filledOrders
                  .filter(o => o.profit > 0)
                  .reduce((sum, o) => sum + o.profit, 0)
                  .toLocaleString('ko-KR')}원
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="text-xs text-red-600 mb-1">총 손실</div>
              <div className="text-2xl font-bold text-red-700">
                -{Math.abs(filledOrders
                  .filter(o => o.profit < 0)
                  .reduce((sum, o) => sum + o.profit, 0))
                  .toLocaleString('ko-KR')}원
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default TradingPage;

