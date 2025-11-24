import { useState } from 'react';
import { Wallet, Plus, Minus, TrendingUp, TrendingDown, DollarSign, Trash2, CheckSquare, Square } from 'lucide-react';

function AccountManager({ accountBalance, onBalanceChange, onTradeUpdate, tradeHistory = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(accountBalance.initial);
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

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
        initial: accountBalance.initial,
        current: accountBalance.initial
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
    if (selectedTrades.size === tradeHistory.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(tradeHistory.map((_, index) => index)));
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
      const remainingTrades = tradeHistory.filter((_, index) => !selectedTrades.has(index));
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
      const remainingTrades = tradeHistory.filter((_, i) => i !== index);
      if (onTradeUpdate) {
        onTradeUpdate(remainingTrades);
      }
    }
  };

  const totalProfit = tradeHistory
    .filter(t => t.profit > 0)
    .reduce((sum, t) => sum + t.profit, 0);
  
  const totalLoss = Math.abs(tradeHistory
    .filter(t => t.profit < 0)
    .reduce((sum, t) => sum + t.profit, 0));

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
                {accountBalance.initial.toLocaleString('ko-KR')}원
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
                  총 수익
                </div>
                <div className="text-xl font-bold text-green-700">
                  +{totalProfit.toLocaleString('ko-KR')}원
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="text-xs text-red-600 mb-1 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  총 손실
                </div>
                <div className="text-xl font-bold text-red-700">
                  -{totalLoss.toLocaleString('ko-KR')}원
                </div>
              </div>
            </div>

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
                  setNewBalance(accountBalance.initial);
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
      {tradeHistory.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              거래 기록 ({tradeHistory.length}건)
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
                    {selectedTrades.size === tradeHistory.length ? (
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
            {tradeHistory.map((trade, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isSelectMode && selectedTrades.has(idx)
                    ? 'ring-2 ring-blue-500 border-blue-300'
                    : ''
                } ${
                  trade.profit > 0 
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
                      <div className="font-semibold text-gray-800">{trade.coin}</div>
                      <div className="text-xs text-gray-500">{trade.date}</div>
                      <div className="mt-2 text-xs text-gray-600">
                        매수가: {trade.entryPrice.toLocaleString('ko-KR')}원 → 
                        매도가: {trade.exitPrice.toLocaleString('ko-KR')}원
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profit > 0 ? '+' : ''}{trade.profit.toLocaleString('ko-KR')}원
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
            ))}
          </div>

          {tradeHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              거래 기록이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountManager;

