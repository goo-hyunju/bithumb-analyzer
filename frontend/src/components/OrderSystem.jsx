import { useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  X, 
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

function OrderSystem({ 
  selectedMarket, 
  currentPrice, 
  accountBalance, 
  onBalanceChange,
  onOrderFilled 
}) {
  const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderPrice, setOrderPrice] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [filledOrders, setFilledOrders] = useState([]);

  const availableBalance = accountBalance.current;
  const currentMarketPrice = currentPrice?.trade_price || 0;
  const marketName = selectedMarket?.replace('KRW-', '') || '';

  // 주문 가능 금액 계산
  const maxOrderAmount = orderType === 'buy' && currentMarketPrice > 0
    ? Math.floor(availableBalance / currentMarketPrice * 100) / 100 // 소수점 2자리
    : 0; // 매도는 보유량에 따라 달라짐

  // 현재가가 0일 때 안내
  const hasNoPrice = currentMarketPrice === 0;

  const totalCost = orderAmount * orderPrice;

  // 매수 주문 생성
  const handleBuyOrder = () => {
    if (orderAmount <= 0 || orderPrice <= 0) {
      alert('주문 수량과 가격을 입력해주세요.');
      return;
    }

    if (totalCost > availableBalance) {
      alert('잔액이 부족합니다.');
      return;
    }

    const newOrder = {
      id: Date.now(),
      type: 'buy',
      market: selectedMarket,
      marketName: marketName,
      amount: orderAmount,
      price: orderPrice,
      total: totalCost,
      timestamp: new Date(),
      status: 'pending'
    };

    // 예약 잔액 차감
    const updatedBalance = {
      ...accountBalance,
      current: accountBalance.current - totalCost
    };
    onBalanceChange(updatedBalance);

    // 즉시 체결 (현재가 기준)
    const filledOrder = {
      ...newOrder,
      status: 'filled',
      filledPrice: currentMarketPrice, // 현재가로 체결
      filledAt: new Date()
    };

    // 매수 체결: 코인 구매 완료 (잔액은 이미 차감됨)
    // 실제로는 코인 보유량을 별도로 관리해야 하지만, 여기서는 체결만 표시
    
    // 잔액 복구 및 최종 계산
    onBalanceChange({
      ...updatedBalance,
      current: updatedBalance.current // 이미 차감된 상태 유지
    });

    // 체결 내역에 추가
    setFilledOrders(prev => [...prev, filledOrder]);
    
    // 거래 내역 콜백 (토스트는 TradingPage에서 처리)
    if (onOrderFilled) {
      const profit = orderAmount * (currentMarketPrice - orderPrice);
      onOrderFilled({
        ...filledOrder,
        profit: profit,
        profitPercent: orderPrice > 0 ? ((currentMarketPrice - orderPrice) / orderPrice * 100).toFixed(2) : '0'
      });
    }
  };

  // 매도 주문 생성
  const handleSellOrder = () => {
    if (orderAmount <= 0 || orderPrice <= 0) {
      alert('주문 수량과 가격을 입력해주세요.');
      return;
    }

    // 보유량 확인 (실제로는 보유 코인 정보가 필요)
    const newOrder = {
      id: Date.now(),
      type: 'sell',
      market: selectedMarket,
      marketName: marketName,
      amount: orderAmount,
      price: orderPrice,
      total: orderAmount * orderPrice,
      timestamp: new Date(),
      status: 'pending'
    };

    // 매도는 즉시 체결 (보유 코인 확인 필요하지만 시뮬레이션)
    const sellAmount = orderAmount * currentMarketPrice;
    const profit = orderAmount * (currentMarketPrice - orderPrice);

    const filledOrder = {
      ...newOrder,
      status: 'filled',
      filledPrice: currentMarketPrice,
      filledAt: new Date(),
      profit: profit,
      profitPercent: orderPrice > 0 ? ((currentMarketPrice - orderPrice) / orderPrice * 100).toFixed(2) : '0'
    };

    // 현금 증가
    onBalanceChange({
      ...accountBalance,
      current: accountBalance.current + sellAmount
    });

    // 체결 내역에 추가
    setFilledOrders(prev => [...prev, filledOrder]);

    // 거래 내역 콜백
    if (onOrderFilled) {
      onOrderFilled(filledOrder);
    }
  };

  // 주문 체결 (사용하지 않음 - 즉시 체결로 변경)
  // const fillOrder = ... (제거됨)

  // 주문 취소
  const cancelOrder = (orderId) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (order && order.type === 'buy') {
      // 매수 주문 취소 시 예약 잔액 복구
      onBalanceChange({
        ...accountBalance,
        current: accountBalance.current + order.total
      });
    }
    setPendingOrders(pendingOrders.filter(o => o.id !== orderId));
  };

  // 주문 사용 금액 자동 설정 (10%, 25%, 50%, 100%)
  const setOrderPercentage = (percentage) => {
    const amount = (availableBalance * percentage / 100);
    const coinAmount = amount / currentMarketPrice;
    setOrderAmount(Math.floor(coinAmount * 100) / 100);
    setOrderPrice(currentMarketPrice);
  };

  return (
    <div className="space-y-6">
      {/* 주문 폼 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          주문하기
        </h2>

        {/* 주문 타입 선택 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setOrderType('buy')}
            className={`p-4 rounded-xl border-2 transition-all ${
              orderType === 'buy'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="font-bold">매수</div>
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`p-4 rounded-xl border-2 transition-all ${
              orderType === 'sell'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <TrendingDown className="w-6 h-6 mx-auto mb-2" />
            <div className="font-bold">매도</div>
          </button>
        </div>

        {/* 주문 정보 */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코인 수량
            </label>
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {!hasNoPrice ? (
              <div className="text-xs text-gray-500 mt-1">
                최대 주문 가능: {maxOrderAmount.toFixed(2)} {marketName}
              </div>
            ) : (
              <div className="text-xs text-yellow-600 mt-1">
                ⚠️ 현재가 정보가 없습니다. 분석을 시작하거나 코인을 선택해주세요.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주문 가격 (원)
            </label>
            <input
              type="number"
              value={orderPrice}
              onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder={hasNoPrice ? "현재가 정보 필요" : "0"}
              min="0"
              disabled={hasNoPrice}
            />
            <div className={`text-xs mt-1 ${hasNoPrice ? 'text-yellow-600' : 'text-gray-500'}`}>
              {hasNoPrice 
                ? '현재가: 정보 없음' 
                : `현재가: ${currentMarketPrice.toLocaleString('ko-KR')}원`}
            </div>
          </div>

          {/* 빠른 설정 버튼 (매수만) */}
          {orderType === 'buy' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                빠른 설정
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map(percent => (
                  <button
                    key={percent}
                    onClick={() => setOrderPercentage(percent / 100)}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          )}

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
          </div>
        </div>

        {/* 현재가 없을 때 안내 */}
        {hasNoPrice && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="text-sm text-yellow-800 font-medium">
              ⚠️ 현재가 정보가 없어 주문할 수 없습니다.
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              코인을 선택하고 "분석 시작" 버튼을 클릭하여 현재가를 가져오세요.
            </div>
          </div>
        )}

        {/* 주문 실행 버튼 */}
        <button
          onClick={orderType === 'buy' ? handleBuyOrder : handleSellOrder}
          disabled={hasNoPrice || orderAmount <= 0 || orderPrice <= 0 || (orderType === 'buy' && totalCost > availableBalance)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
            orderType === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {hasNoPrice 
            ? '현재가 정보 필요' 
            : orderType === 'buy' ? '매수 주문' : '매도 주문'}
        </button>
      </div>

      {/* 대기 중인 주문 */}
      {pendingOrders.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            대기 중인 주문 ({pendingOrders.length})
          </h3>
          <div className="space-y-2">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                className={`p-4 rounded-xl border ${
                  order.type === 'buy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {order.type === 'buy' ? '매수' : '매도'} - {order.marketName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.amount}개 × {order.price.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-gray-800">
                        {order.total.toLocaleString('ko-KR')}원
                      </div>
                      <div className="text-xs text-gray-500">
                        체결 대기중...
                      </div>
                    </div>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 체결된 주문 */}
      {filledOrders.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            체결 내역 ({filledOrders.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filledOrders.slice().reverse().map(order => (
              <div
                key={order.id}
                className={`p-4 rounded-xl border ${
                  order.type === 'buy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {order.type === 'buy' ? '매수' : '매도'} 체결 - {order.marketName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.amount}개 × {order.filledPrice?.toLocaleString('ko-KR')}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.filledAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {(order.amount * order.filledPrice).toLocaleString('ko-KR')}원
                    </div>
                    {order.profit !== undefined && (
                      <div className={`text-sm font-semibold ${
                        order.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {order.profit > 0 ? '+' : ''}{order.profit.toLocaleString('ko-KR')}원
                        ({order.profitPercent}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSystem;

