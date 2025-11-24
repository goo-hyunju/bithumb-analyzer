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
 * 거래 내역 생성
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

