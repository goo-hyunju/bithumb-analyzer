import { useEffect, useRef } from 'react';
import { fetchLatestCandles, fetchCurrentPrice } from '../utils/apiUtils';

/**
 * 실시간 업데이트 훅
 */
export const useRealTimeUpdate = ({
  isRealTime,
  serverStatus,
  candleUnit,
  candleMinute,
  selectedMarket,
  candleCount,
  candleData,
  setCandleData,
  setCurrentPrice
}) => {
  const intervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);

  useEffect(() => {
    // 기존 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 실시간 업데이트가 활성화되고 서버가 연결되어 있고 캔들 데이터가 있을 때만 작동
    if (isRealTime && serverStatus === 'connected' && candleData.length > 0) {
      // 마지막 캔들의 시간 저장
      const lastCandle = candleData[candleData.length - 1];
      lastUpdateTimeRef.current = lastCandle?.candle_date_time_kst || lastCandle?.candle_date_time_utc;

      // 캔들 타입에 따라 업데이트 주기 결정
      const updateInterval = candleUnit === 'minutes' ? 
        Math.max(10000, parseInt(candleMinute) * 1000 * 60) : // 분봉: 최소 10초, 최대 해당 분봉 시간
        candleUnit === 'days' ? 30000 : // 일봉: 30초마다
        60000; // 주봉: 1분마다

      intervalRef.current = setInterval(async () => {
        try {
          // 최신 캔들 데이터만 가져오기 (마지막 시간 이후)
          const newCandles = await fetchLatestCandles(
            selectedMarket, 
            candleUnit, 
            candleMinute, 
            lastUpdateTimeRef.current
          );
          
          if (Array.isArray(newCandles) && newCandles.length > 0) {
            // 기존 데이터와 합치기 (중복 제거)
            setCandleData(prev => {
              const combined = [...prev];
              newCandles.forEach(newCandle => {
                const candleTime = newCandle.candle_date_time_kst || newCandle.candle_date_time_utc;
                const exists = combined.find(c => 
                  (c.candle_date_time_kst || c.candle_date_time_utc) === candleTime
                );
                if (!exists) {
                  combined.push(newCandle);
                  // 마지막 시간 업데이트
                  lastUpdateTimeRef.current = candleTime;
                }
              });
              // 시간순 정렬 및 최신 데이터 유지
              const sorted = combined.sort((a, b) => {
                const timeA = new Date(a.candle_date_time_kst || a.candle_date_time_utc);
                const timeB = new Date(b.candle_date_time_kst || b.candle_date_time_utc);
                return timeA - timeB;
              });
              return sorted.slice(-candleCount);
            });
          }

          // 현재가 업데이트 (항상)
          const price = await fetchCurrentPrice(selectedMarket);
          setCurrentPrice(price);
        } catch (err) {
          console.error('실시간 업데이트 실패:', err);
        }
      }, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTime, serverStatus, candleUnit, candleMinute, selectedMarket, candleCount, candleData.length, setCandleData, setCurrentPrice]);
};

