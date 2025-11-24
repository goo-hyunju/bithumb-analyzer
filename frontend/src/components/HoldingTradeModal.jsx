import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { fetchCurrentPrice } from '../utils/apiUtils';
import { useToast } from './Toast';

/**
 * 보유 코인 거래 모달
 * - 추가 매수
 * - 매도 (부분 매도 가능)
 */
function HoldingTradeModal({
  isOpen,
  onClose,
  holding,
  accountBalance,
  onBalanceChange,
  onTradeUpdate,
  serverStatus
}) {
  const { showToast } = useToast();
  const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderPrice, setOrderPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const market = `KRW-${holding.coin}`;
  const availableBalance = accountBalance.current;
  const currentMarketPrice = currentPrice?.trade_price || 0;

  // 현재가 조회
  useEffect(() => {
    if (isOpen && serverStatus === 'connected') {
      const loadCurrentPrice = async () => {
        try {
          const price = await fetchCurrentPrice(market);
          setCurrentPrice(price);
          setOrderPrice(price?.trade_price || 0);
        } catch (err) {
          console.error('현재가 조회 실패:', err);
        }
      };
      loadCurrentPrice();
    }
  }, [isOpen, market, serverStatus]);

  // 매수용: 주문 사용 금액 자동 설정 (10%, 25%, 50%, 100%)
  const setBuyOrderPercentage = (percentage) => {
    const amount = (availableBalance * percentage / 100);
    const coinAmount = amount / currentMarketPrice;
    setOrderAmount(Math.floor(coinAmount * 100) / 100);
    setOrderPrice(currentMarketPrice);
  };

  // 매도용: 보유 코인 수량 기준 빠른 설정
  const setSellOrderPercentage = (percentage) => {
    const sellAmount = (holding.amount * percentage / 100);
    setOrderAmount(Math.floor(sellAmount * 100) / 100);
    setOrderPrice(currentMarketPrice);
  };

  // 매수 주문
  const handleBuyOrder = () => {
    if (orderAmount <= 0 || orderPrice <= 0) {
      showToast('주문 수량과 가격을 입력해주세요.', 'error');
      return;
    }

    const totalCost = orderAmount * orderPrice;
    if (totalCost > availableBalance) {
      showToast('잔액이 부족합니다.', 'error');
      return;
    }

    setLoading(true);

    const newOrder = {
      id: Date.now(),
      type: 'buy',
      market: market,
      marketName: holding.coin,
      amount: orderAmount,
      price: orderPrice,
      total: totalCost,
      timestamp: new Date().toISOString(),
      status: 'filled',
      filledPrice: currentMarketPrice,
      filledAt: new Date().toISOString(),
      entryPrice: currentMarketPrice,
      exitPrice: 0,
      profit: 0,
      profitPercent: 0
    };

    // 잔액 차감
    onBalanceChange({
      ...accountBalance,
      current: accountBalance.current - totalCost
    });

    // 거래 내역 업데이트
    if (onTradeUpdate) {
      onTradeUpdate(newOrder);
    }

    showToast(`${holding.coin} ${orderAmount.toFixed(4)}개 매수 완료`, 'success');
    setLoading(false);
    setOrderAmount(0);
  };

  // 매도 주문
  const handleSellOrder = () => {
    if (orderAmount <= 0 || orderPrice <= 0) {
      showToast('주문 수량과 가격을 입력해주세요.', 'error');
      return;
    }

    if (orderAmount > holding.amount) {
      showToast('보유 수량을 초과했습니다.', 'error');
      return;
    }

    setLoading(true);

    const sellAmount = orderAmount * currentMarketPrice;
    // 평균 매수가 기준으로 수익 계산
    const profit = orderAmount * (currentMarketPrice - holding.avgPrice);
    const profitPercent = holding.avgPrice > 0 
      ? ((currentMarketPrice - holding.avgPrice) / holding.avgPrice * 100).toFixed(2)
      : '0';

    const newOrder = {
      id: Date.now(),
      type: 'sell',
      market: market,
      marketName: holding.coin,
      amount: orderAmount,
      price: orderPrice,
      total: sellAmount,
      timestamp: new Date().toISOString(),
      status: 'filled',
      filledPrice: currentMarketPrice,
      filledAt: new Date().toISOString(),
      entryPrice: holding.avgPrice, // 평균 매수가
      exitPrice: currentMarketPrice,
      profit: profit,
      profitPercent: parseFloat(profitPercent)
    };

    // 현금 증가
    onBalanceChange({
      ...accountBalance,
      current: accountBalance.current + sellAmount
    });

    // 거래 내역 업데이트 (실현 수익/손실 반영)
    if (onTradeUpdate) {
      onTradeUpdate(newOrder);
    }

    showToast(`${holding.coin} ${orderAmount.toFixed(4)}개 매도 완료 (${profit >= 0 ? '+' : ''}${profit.toLocaleString('ko-KR')}원)`, 'success');
    setLoading(false);
    setOrderAmount(0);
  };

  if (!isOpen) return null;

  const totalCost = orderAmount * orderPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            {holding.coin} 거래
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 보유 정보 */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">보유 수량</span>
              <span className="font-semibold text-gray-800">{holding.amount.toFixed(4)}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">평균 매수가</span>
              <span className="font-semibold text-gray-800">{holding.avgPrice.toLocaleString('ko-KR')}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">현재가</span>
              <span className="font-semibold text-gray-800">
                {currentMarketPrice > 0 ? currentMarketPrice.toLocaleString('ko-KR') : '조회 중...'}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">평가 손익</span>
              <span className={`font-semibold ${holding.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.unrealizedPnl >= 0 ? '+' : ''}{holding.unrealizedPnl.toLocaleString('ko-KR')}원
                ({holding.unrealizedPnlPercent >= 0 ? '+' : ''}{holding.unrealizedPnlPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* 주문 타입 선택 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setOrderType('buy')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              orderType === 'buy'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-5 h-5" />
            추가 매수
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              orderType === 'sell'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Minus className="w-5 h-5" />
            매도
          </button>
        </div>

        {/* 주문 입력 */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {orderType === 'buy' ? '매수 수량' : '매도 수량'} (개)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              max={orderType === 'sell' ? holding.amount : undefined}
              value={orderAmount || ''}
              onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0000"
            />
            {orderType === 'sell' && (
              <div className="text-xs text-gray-500 mt-1">
                최대 매도 가능: {holding.amount.toFixed(4)}개
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주문 가격 (원)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={orderPrice || ''}
              onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <div className="text-xs text-gray-500 mt-1">
              현재가: {currentMarketPrice > 0 ? currentMarketPrice.toLocaleString('ko-KR') : '조회 중...'}원
            </div>
          </div>

          {/* 빠른 설정 버튼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              빠른 설정
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => orderType === 'buy' ? setBuyOrderPercentage(percent) : setSellOrderPercentage(percent)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    orderType === 'buy'
                      ? 'bg-green-100 hover:bg-green-200 text-green-700'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {orderType === 'buy' ? '잔액 기준' : '보유 수량 기준'}
            </div>
          </div>

          {/* 총 주문 금액 */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">총 주문 금액</span>
              <span className="text-xl font-bold text-blue-700">
                {totalCost.toLocaleString('ko-KR')}원
              </span>
            </div>
            {orderType === 'buy' && (
              <div className="text-xs text-gray-500 mt-1">
                남은 잔액: {(availableBalance - totalCost).toLocaleString('ko-KR')}원
              </div>
            )}
            {orderType === 'sell' && orderAmount > 0 && (
              <div className={`text-xs font-semibold mt-1 ${
                (orderAmount * (currentMarketPrice - holding.avgPrice)) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                예상 수익: {
                  (() => {
                    const expectedProfit = orderAmount * (currentMarketPrice - holding.avgPrice);
                    return (expectedProfit >= 0 ? '+' : '') + expectedProfit.toLocaleString('ko-KR') + '원';
                  })()
                }
              </div>
            )}
          </div>
        </div>

        {/* 주문 버튼 */}
        <button
          onClick={orderType === 'buy' ? handleBuyOrder : handleSellOrder}
          disabled={loading || orderAmount <= 0 || orderPrice <= 0 || (orderType === 'sell' && orderAmount > holding.amount)}
          className={`w-full px-6 py-3 rounded-xl font-bold text-white transition-all ${
            orderType === 'buy'
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-300'
              : 'bg-red-500 hover:bg-red-600 disabled:bg-gray-300'
          } disabled:cursor-not-allowed`}
        >
          {loading ? '처리 중...' : orderType === 'buy' ? '추가 매수' : '매도'}
        </button>
      </div>
    </div>
  );
}

export default HoldingTradeModal;

