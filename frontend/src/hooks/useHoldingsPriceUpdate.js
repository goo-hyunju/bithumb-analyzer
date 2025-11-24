import { useEffect } from 'react';
import { fetchCurrentPrice } from '../utils/apiUtils';
import { calculateHoldings, calculateTotalAssets } from '../utils/accountUtils';

/**
 * 보유 코인 현재가 실시간 업데이트 훅
 * - 보유 코인들의 현재가를 주기적으로 조회하여 업데이트
 * - 10초마다 자동 업데이트
 */
export const useHoldingsPriceUpdate = ({
  tradeHistory,
  accountBalance,
  serverStatus,
  coinPrices,
  setCoinPrices
}) => {
  useEffect(() => {
    if (serverStatus !== 'connected') return;
    
    const updateHoldingsPrices = async () => {
      const holdings = calculateHoldings(tradeHistory);
      const uniqueCoins = Object.keys(holdings).filter(coin => holdings[coin].amount > 0);
      
      if (uniqueCoins.length === 0) return;
      
      try {
        const results = await Promise.all(
          uniqueCoins.map(async (coin) => {
            try {
              const market = `KRW-${coin}`;
              const price = await fetchCurrentPrice(market);
              return { coin, market, price };
            } catch (err) {
              console.error(`현재가 조회 실패 (${coin}):`, err);
              return null;
            }
          })
        );
        
        const newPrices = {};
        results.forEach(result => {
          if (result) {
            newPrices[result.coin] = result.price;
            newPrices[result.market] = result.price;
          }
        });
        
        if (Object.keys(newPrices).length > 0) {
          setCoinPrices(prev => ({ ...prev, ...newPrices }));
        }
      } catch (err) {
        console.error('보유 코인 현재가 업데이트 실패:', err);
      }
    };
    
    // 즉시 한 번 실행
    updateHoldingsPrices();
    
    // 10초마다 업데이트
    const intervalId = setInterval(updateHoldingsPrices, 10000);
    
    return () => clearInterval(intervalId);
  }, [tradeHistory, serverStatus, accountBalance, coinPrices, setCoinPrices]);
};

