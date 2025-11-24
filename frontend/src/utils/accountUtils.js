/**
 * 가상 계좌 관련 유틸리티 함수들
 */

/**
 * 백테스팅 결과를 실제 금액으로 계산
 */
export const calculateRealAmountResults = (backtestResult, accountBalance, investmentRatio = 1.0) => {
  if (!backtestResult || !accountBalance || accountBalance.initial <= 0) {
    return null;
  }

  const investmentAmount = accountBalance.initial * investmentRatio;
  const trades = backtestResult.trades || [];

  let totalProfitAmount = 0;
  let totalLossAmount = 0;
  let tradeDetails = [];

  trades.forEach(trade => {
    // 각 거래당 투자 금액 (균등 분배)
    const tradeAmount = investmentAmount / (trades.length || 1);
    const profitPercent = trade.profit || 0;
    const profitAmount = tradeAmount * (profitPercent / 100);

    if (profitAmount > 0) {
      totalProfitAmount += profitAmount;
    } else {
      totalLossAmount += Math.abs(profitAmount);
    }

    tradeDetails.push({
      ...trade,
      investmentAmount: tradeAmount,
      profitAmount: profitAmount,
      profitPercent: profitPercent
    });
  });

  const netProfit = totalProfitAmount - totalLossAmount;
  const finalBalance = accountBalance.current + netProfit;
  const totalReturn = (netProfit / investmentAmount * 100).toFixed(2);

  return {
    investmentAmount,
    totalProfitAmount,
    totalLossAmount,
    netProfit,
    finalBalance,
    totalReturn: parseFloat(totalReturn),
    tradeDetails,
    totalTrades: trades.length,
    successfulTrades: trades.filter(t => (t.profit || 0) > 0).length
  };
};

/**
 * 백테스팅 결과에 금액 정보 추가
 */
export const enhanceBacktestResult = (backtestResult, accountBalance, investmentRatio = 1.0) => {
  if (!backtestResult) return backtestResult;

  const realAmountResults = calculateRealAmountResults(backtestResult, accountBalance, investmentRatio);
  
  return {
    ...backtestResult,
    realAmount: realAmountResults
  };
};

/**
 * 거래 내역 생성 (백테스팅용)
 */
export const createTradeHistory = (backtestResult, selectedMarket, investmentRatio = 1.0) => {
  if (!backtestResult || !backtestResult.trades) return [];

  return backtestResult.trades.map(trade => ({
    coin: selectedMarket.replace('KRW-', ''),
    date: trade.date || new Date().toISOString().split('T')[0],
    entryPrice: trade.entryPrice || 0,
    exitPrice: trade.exitPrice || 0,
    profit: (trade.profitAmount || 0),
    profitPercent: trade.profit || 0
  }));
};

/**
 * 거래 내역에서 보유 코인 계산
 * @param {Array} tradeHistory - 거래 내역 배열
 * @returns {Object} 코인별 보유량 { 'BTC': { amount: 0.5, avgPrice: 50000 }, ... }
 */
export const calculateHoldings = (tradeHistory) => {
  if (!Array.isArray(tradeHistory)) return {};
  
  const holdings = {};
  
  tradeHistory.forEach(trade => {
    if (!trade || typeof trade !== 'object') return;
    
    const coin = trade.coin || trade.marketName || (trade.market ? trade.market.replace('KRW-', '') : '');
    if (!coin) return;
    
    if (!holdings[coin]) {
      holdings[coin] = { amount: 0, totalCost: 0, avgPrice: 0 };
    }
    
    if (trade.type === 'buy') {
      const amount = typeof trade.amount === 'number' ? trade.amount : 0;
      const price = typeof trade.entryPrice === 'number' 
        ? trade.entryPrice 
        : (typeof trade.filledPrice === 'number' ? trade.filledPrice : (typeof trade.price === 'number' ? trade.price : 0));
      
      if (amount > 0 && price > 0) {
        const cost = amount * price;
        holdings[coin].amount += amount;
        holdings[coin].totalCost += cost;
        holdings[coin].avgPrice = holdings[coin].totalCost / holdings[coin].amount;
      }
    } else if (trade.type === 'sell') {
      const amount = typeof trade.amount === 'number' ? trade.amount : 0;
      // FIFO 방식으로 보유량 감소
      if (holdings[coin].amount >= amount) {
        holdings[coin].amount -= amount;
        holdings[coin].totalCost -= (holdings[coin].avgPrice * amount);
        if (holdings[coin].amount > 0) {
          holdings[coin].avgPrice = holdings[coin].totalCost / holdings[coin].amount;
        } else {
          holdings[coin].avgPrice = 0;
          holdings[coin].totalCost = 0;
        }
      }
    }
  });
  
  // 보유량이 0인 코인 제거
  Object.keys(holdings).forEach(coin => {
    if (holdings[coin].amount <= 0) {
      delete holdings[coin];
    }
  });
  
  return holdings;
};

/**
 * 총 자산 계산 (현재 잔액 + 보유 코인 가치)
 * @param {Object} accountBalance - 계좌 잔액
 * @param {Array} tradeHistory - 거래 내역
 * @param {Object} currentPrices - 코인별 현재가 { 'BTC': { trade_price: 50000 }, ... }
 * @returns {Object} { totalAssets, holdingsValue, cashBalance }
 */
export const calculateTotalAssets = (accountBalance, tradeHistory, currentPrices = {}) => {
  const holdings = calculateHoldings(tradeHistory);
  let holdingsValue = 0;
  
  // 보유 코인 가치 계산
  Object.keys(holdings).forEach(coin => {
    const holding = holdings[coin];
    const priceInfo = currentPrices[coin] || currentPrices[`KRW-${coin}`];
    // priceInfo가 객체인 경우 trade_price 추출, 아니면 직접 숫자로 사용
    const currentPrice = typeof priceInfo === 'object' 
      ? (priceInfo?.trade_price || 0)
      : (typeof priceInfo === 'number' ? priceInfo : 0);
    
    if (currentPrice > 0 && holding.amount > 0) {
      holdingsValue += holding.amount * currentPrice;
    }
  });
  
  const cashBalance = accountBalance?.current || 0;
  const totalAssets = cashBalance + holdingsValue;
  
  return {
    totalAssets,
    holdingsValue,
    cashBalance,
    holdings
  };
};

/**
 * 주문 내역을 표준 거래 내역 형식으로 변환
 * @param {Object} order - OrderSystem에서 생성된 주문 객체
 * @returns {Object} 표준화된 거래 내역 객체
 */
export const normalizeTradeRecord = (order) => {
  if (!order || typeof order !== 'object') {
    return null;
  }

  // Date 객체를 문자열로 변환
  const formatDate = (dateValue) => {
    if (!dateValue) return new Date().toLocaleDateString('ko-KR');
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('ko-KR');
    }
    if (typeof dateValue === 'string') {
      try {
        return new Date(dateValue).toLocaleDateString('ko-KR');
      } catch {
        return dateValue;
      }
    }
    return new Date(dateValue).toLocaleDateString('ko-KR');
  };

  // 코인 이름 추출
  const coin = order.coin || 
               order.marketName || 
               (order.market ? order.market.replace('KRW-', '') : '알 수 없음');

  // 가격 추출 (매수/매도 구분)
  let entryPrice = 0;
  let exitPrice = 0;
  
  if (order.type === 'buy') {
    // 매수: entryPrice는 체결가, exitPrice는 0
    entryPrice = typeof order.entryPrice === 'number' 
      ? order.entryPrice 
      : (typeof order.filledPrice === 'number' ? order.filledPrice : (typeof order.price === 'number' ? order.price : 0));
    exitPrice = 0;
  } else if (order.type === 'sell') {
    // 매도: entryPrice는 매수가, exitPrice는 매도가
    entryPrice = typeof order.entryPrice === 'number' 
      ? order.entryPrice 
      : (typeof order.price === 'number' ? order.price : 0);
    exitPrice = typeof order.exitPrice === 'number' 
      ? order.exitPrice 
      : (typeof order.filledPrice === 'number' ? order.filledPrice : (typeof order.price === 'number' ? order.price : 0));
  }

  // 수익 계산 (매수는 0, 매도는 실제 수익)
  let profit = 0;
  if (order.type === 'sell' && typeof order.profit === 'number') {
    profit = order.profit;
  } else if (order.type === 'buy') {
    profit = 0; // 매수는 아직 수익 없음
  }

  return {
    id: order.id || Date.now(),
    coin,
    date: formatDate(order.date || order.timestamp || order.filledAt),
    entryPrice,
    exitPrice,
    profit,
    profitPercent: typeof order.profitPercent === 'number' 
      ? order.profitPercent 
      : (typeof order.profitPercent === 'string' ? parseFloat(order.profitPercent) : 0),
    type: order.type || 'buy',
    amount: typeof order.amount === 'number' ? order.amount : 0,
    market: order.market || ''
  };
};

