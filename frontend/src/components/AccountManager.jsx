import { useState, useEffect } from 'react';
import { Wallet, Plus, Minus, TrendingUp, TrendingDown, DollarSign, Trash2, CheckSquare, Square, Coins, ShoppingCart } from 'lucide-react';
import { calculateHoldings, calculateTotalAssets } from '../utils/accountUtils';
import HoldingTradeModal from './HoldingTradeModal';

function AccountManager({ accountBalance, onBalanceChange, onTradeUpdate, tradeHistory = [], coinPrices = {}, serverStatus = 'disconnected' }) {
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 안전한 기본값 설정 - 데이터 형식 검증
  const getSafeAccountBalance = () => {
    if (!accountBalance || typeof accountBalance !== 'object') {
      return { initial: 1000000, current: 1000000 };
    }
    const initial = typeof accountBalance.initial === 'number' ? accountBalance.initial : 1000000;
    const current = typeof accountBalance.current === 'number' ? accountBalance.current : initial;
    return { initial, current };
  };

  const safeAccountBalance = getSafeAccountBalance();
  const safeTradeHistory = Array.isArray(tradeHistory) ? tradeHistory : [];

  const [isEditing, setIsEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(safeAccountBalance.initial);
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // accountBalance가 변경되면 newBalance도 업데이트 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!isEditing && safeAccountBalance.initial !== undefined) {
      setNewBalance(prev => {
        // 값이 실제로 변경된 경우에만 업데이트
        return prev !== safeAccountBalance.initial ? safeAccountBalance.initial : prev;
      });
    }
  }, [safeAccountBalance.initial, isEditing]);

  const handleSetInitialBalance = () => {
    if (newBalance > 0) {
      onBalanceChange({
        initial: newBalance,
        current: newBalance
      });
      setIsEditing(false);
    }
  };

  const resetAccount = () => {
    if (confirm('정말로 계좌를 초기화하시겠습니까? 모든 거래 기록이 삭제됩니다.')) {
      onBalanceChange({
        initial: safeAccountBalance.initial,
        current: safeAccountBalance.initial
      });
      if (onTradeUpdate) {
        onTradeUpdate([]);
      }
    }
  };

  // 거래 기록 선택/해제
  const toggleTradeSelection = (index) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTrades(newSelected);
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedTrades.size === safeTradeHistory.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(safeTradeHistory.map((_, index) => index)));
    }
  };

  // 선택된 거래 기록 삭제
  const deleteSelectedTrades = () => {
    if (selectedTrades.size === 0) {
      alert('삭제할 거래 기록을 선택해주세요.');
      return;
    }

    const confirmMessage = selectedTrades.size === 1 
      ? '선택한 거래 기록을 삭제하시겠습니까?'
      : `선택한 ${selectedTrades.size}개의 거래 기록을 삭제하시겠습니까?`;

    if (confirm(confirmMessage)) {
      const remainingTrades = safeTradeHistory.filter((_, index) => !selectedTrades.has(index));
      if (onTradeUpdate) {
        onTradeUpdate(remainingTrades);
      }
      setSelectedTrades(new Set());
      setIsSelectMode(false);
    }
  };

  // 개별 거래 기록 삭제
  const deleteSingleTrade = (index) => {
    if (confirm('이 거래 기록을 삭제하시겠습니까?')) {
      // 유효한 거래만 필터링한 후 인덱스로 삭제
      const validTrades = safeTradeHistory.filter(trade => trade && typeof trade === 'object');
      const tradeToDelete = validTrades[index];
      if (tradeToDelete) {
        // 원본 배열에서 해당 거래 제거 (ID나 참조로 찾기)
        const remainingTrades = safeTradeHistory.filter((trade, i) => {
          if (!trade || typeof trade !== 'object') return false;
          // ID가 있으면 ID로 비교, 없으면 인덱스로 비교
          if (tradeToDelete.id && trade.id) {
            return trade.id !== tradeToDelete.id;
          }
          return i !== safeTradeHistory.indexOf(tradeToDelete);
        });
        if (onTradeUpdate) {
          onTradeUpdate(remainingTrades);
        }
      }
    }
  };

  // 실제 체결된 거래의 수익/손실 (매도 완료된 거래만)
  const totalProfit = safeTradeHistory
    .filter(t => t && typeof t.profit === 'number' && t.profit > 0 && t.type === 'sell')
    .reduce((sum, t) => sum + t.profit, 0);
  
  const totalLoss = Math.abs(safeTradeHistory
    .filter(t => t && typeof t.profit === 'number' && t.profit < 0 && t.type === 'sell')
    .reduce((sum, t) => sum + t.profit, 0));
  
  // 보유 코인 정보 및 평가 손익 계산
  const holdings = calculateHoldings(safeTradeHistory);
  const totalAssetsInfo = calculateTotalAssets(safeAccountBalance, safeTradeHistory, coinPrices);
  
  // 보유 코인별 평가 손익 계산
  const holdingsWithUnrealizedPnl = Object.keys(holdings).map(coin => {
    const holding = holdings[coin];
    const priceInfo = coinPrices[coin] || coinPrices[`KRW-${coin}`];
    const currentPrice = typeof priceInfo === 'object' 
      ? (priceInfo?.trade_price || 0)
      : (typeof priceInfo === 'number' ? priceInfo : 0);
    const currentValue = holding.amount * currentPrice;
    const costBasis = holding.totalCost;
    const unrealizedPnl = currentValue - costBasis;
    const unrealizedPnlPercent = costBasis > 0 ? ((unrealizedPnl / costBasis) * 100).toFixed(2) : 0;
    
    return {
      coin,
      amount: holding.amount,
      avgPrice: holding.avgPrice,
      currentPrice,
      currentValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPercent
    };
  });

  return (
    <div className="space-y-6">
      {/* 계좌 설정 카드 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-600" />
          계좌 설정
        </h2>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="text-sm text-gray-500 mb-2">초기 자금</div>
              <div className="text-3xl font-bold text-gray-800 mb-4">
                {safeAccountBalance.initial.toLocaleString('ko-KR')}원
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              >
                초기 자금 변경
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  실현 수익
                </div>
                <div className="text-xl font-bold text-green-700">
                  +{totalProfit.toLocaleString('ko-KR')}원
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="text-xs text-red-600 mb-1 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  실현 손실
                </div>
                <div className="text-xl font-bold text-red-700">
                  -{totalLoss.toLocaleString('ko-KR')}원
                </div>
              </div>
            </div>
            
            {/* 보유 코인 정보 */}
            {holdingsWithUnrealizedPnl.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  보유 코인 평가 손익
                </div>
                <div className="space-y-2">
                  {holdingsWithUnrealizedPnl.map((holding) => (
                    <div 
                      key={holding.coin} 
                      className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedHolding(holding);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{holding.coin}</span>
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {holding.amount.toFixed(4)}개 × {holding.currentPrice > 0 ? holding.currentPrice.toLocaleString('ko-KR') : '가격 정보 없음'}원
                        </div>
                        <div className={`font-semibold ${
                          holding.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {holding.unrealizedPnl >= 0 ? '+' : ''}{holding.unrealizedPnl.toLocaleString('ko-KR')}원
                          ({holding.unrealizedPnlPercent >= 0 ? '+' : ''}{holding.unrealizedPnlPercent}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-300 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">총 평가 손익</span>
                  <div className={`text-sm font-bold ${
                    totalAssetsInfo.holdingsValue - Object.values(holdings).reduce((sum, h) => sum + h.totalCost, 0) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(() => {
                      const totalUnrealizedPnl = totalAssetsInfo.holdingsValue - Object.values(holdings).reduce((sum, h) => sum + h.totalCost, 0);
                      return (totalUnrealizedPnl >= 0 ? '+' : '') + totalUnrealizedPnl.toLocaleString('ko-KR') + '원';
                    })()}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={resetAccount}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
            >
              계좌 초기화
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                초기 자금 설정
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                    placeholder="예: 1000000"
                    min="0"
                  />
                </div>
                <span className="text-gray-600 font-medium">원</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                백테스팅에 사용할 가상 자금을 입력하세요
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSetInitialBalance}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewBalance(safeAccountBalance.initial);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 거래 기록 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              거래 기록 ({safeTradeHistory.length}건)
            </h3>
            <div className="flex items-center gap-2">
              {!isSelectMode ? (
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  선택 모드
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleSelectAll}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  >
                    {selectedTrades.size === safeTradeHistory.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    전체 선택
                  </button>
                  <button
                    onClick={deleteSelectedTrades}
                    disabled={selectedTrades.size === 0}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제 ({selectedTrades.size})
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedTrades(new Set());
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          </div>

          {isSelectMode && selectedTrades.size > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="text-sm text-yellow-800">
                <strong>{selectedTrades.size}개</strong>의 거래 기록이 선택되었습니다.
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {safeTradeHistory
              .filter(trade => trade && typeof trade === 'object') // 유효한 거래만 필터링
              .map((trade, idx) => {
                // 안전한 값 추출
                const coin = trade.coin || trade.marketName || '알 수 없음';
                
                // Date 객체를 문자열로 변환
                let date = '';
                if (trade.date) {
                  if (trade.date instanceof Date) {
                    date = trade.date.toLocaleDateString('ko-KR');
                  } else if (typeof trade.date === 'string') {
                    date = trade.date;
                  } else {
                    date = new Date(trade.date).toLocaleDateString('ko-KR');
                  }
                } else if (trade.timestamp) {
                  if (trade.timestamp instanceof Date) {
                    date = trade.timestamp.toLocaleDateString('ko-KR');
                  } else if (typeof trade.timestamp === 'string') {
                    date = new Date(trade.timestamp).toLocaleDateString('ko-KR');
                  } else {
                    date = new Date(trade.timestamp).toLocaleDateString('ko-KR');
                  }
                } else {
                  date = new Date().toLocaleDateString('ko-KR');
                }
                
                // 매수가/매도가 추출 (OrderSystem 형식 지원)
                const entryPrice = typeof trade.entryPrice === 'number' 
                  ? trade.entryPrice 
                  : (typeof trade.price === 'number' ? trade.price : (typeof trade.filledPrice === 'number' ? trade.filledPrice : 0));
                const exitPrice = typeof trade.exitPrice === 'number' 
                  ? trade.exitPrice 
                  : (typeof trade.filledPrice === 'number' ? trade.filledPrice : (typeof trade.price === 'number' ? trade.price : 0));
                const profit = typeof trade.profit === 'number' ? trade.profit : 0;
                
                // 거래 타입 및 상태 표시
                const tradeType = trade.type || 'buy';
                const isOpenPosition = tradeType === 'buy' && exitPrice === 0;
                
                // 보유 중인 경우 현재가 기준 평가 손익 계산
                let unrealizedPnl = 0;
                let unrealizedPnlPercent = 0;
                if (isOpenPosition && entryPrice > 0) {
                  const priceInfo = coinPrices[coin] || coinPrices[`KRW-${coin}`];
                  const currentPrice = priceInfo?.trade_price || 0;
                  if (currentPrice > 0 && trade.amount) {
                    unrealizedPnl = (currentPrice - entryPrice) * trade.amount;
                    unrealizedPnlPercent = ((currentPrice - entryPrice) / entryPrice * 100).toFixed(2);
                  }
                }
                
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelectMode && selectedTrades.has(idx)
                        ? 'ring-2 ring-blue-500 border-blue-300'
                        : ''
                    } ${
                      profit > 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelectMode && (
                        <button
                          onClick={() => toggleTradeSelection(idx)}
                          className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          {selectedTrades.has(idx) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      )}
                      
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{coin}</div>
                          <div className="text-xs text-gray-500">{date}</div>
                          <div className="mt-2 text-xs text-gray-600">
                            {entryPrice > 0 ? (
                              <>
                                <span className="font-medium">{tradeType === 'buy' ? '매수' : '매도'}</span>
                                {' '}매수가: {entryPrice.toLocaleString('ko-KR')}원
                                {exitPrice > 0 && (
                                  <> → 매도가: {exitPrice.toLocaleString('ko-KR')}원</>
                                )}
                                {isOpenPosition && (
                                  <span className="ml-2 text-blue-600">
                                    (보유 중)
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">가격 정보 없음</span>
                            )}
                          </div>
                          {isOpenPosition && unrealizedPnl !== 0 && (
                            <div className={`mt-1 text-xs ${
                              unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              평가 손익: {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toLocaleString('ko-KR')}원
                              ({unrealizedPnlPercent >= 0 ? '+' : ''}{unrealizedPnlPercent}%)
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {profit !== 0 ? (
                              <div className={`text-lg font-bold ${
                                profit > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {profit > 0 ? '+' : ''}{profit.toLocaleString('ko-KR')}원
                              </div>
                            ) : isOpenPosition ? (
                              <div className="text-xs text-gray-500">보유 중</div>
                            ) : (
                              <div className="text-xs text-gray-400">-</div>
                            )}
                          </div>
                          {!isSelectMode && (
                            <button
                              onClick={() => deleteSingleTrade(idx)}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors text-red-500 hover:text-red-700"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

        {safeTradeHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            거래 기록이 없습니다.
          </div>
        )}
      </div>

      {/* 보유 코인 거래 모달 */}
      {selectedHolding && (
        <HoldingTradeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedHolding(null);
          }}
          holding={selectedHolding}
          accountBalance={safeAccountBalance}
          onBalanceChange={onBalanceChange}
          onTradeUpdate={onTradeUpdate}
          serverStatus={serverStatus}
        />
      )}
    </div>
  );
}

export default AccountManager;

