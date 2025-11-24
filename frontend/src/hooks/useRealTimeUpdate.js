import { useEffect, useRef } from 'react';
import { fetchCandles, fetchCurrentPrice } from '../utils/apiUtils';

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
  setCandleData,
  setCurrentPrice
}) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    // 기존 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isRealTime && serverStatus === 'connected') {
      // 캔들 타입에 따라 업데이트 주기 결정
      const updateInterval = candleUnit === 'minutes' ? 
        (parseInt(candleMinute) * 1000 * 60) : // 분봉: 해당 분봉 시간
        candleUnit === 'days' ? 60000 : // 일봉: 1분마다
        300000; // 주봉: 5분마다

      intervalRef.current = setInterval(async () => {
        try {
          // 최신 캔들 데이터만 가져오기
          const newCandles = await fetchCandles(selectedMarket, 10, candleUnit, candleMinute);
          
          if (Array.isArray(newCandles) && newCandles.length > 0) {
            // 기존 데이터와 합치기 (중복 제거)
            setCandleData(prev => {
              const combined = [...prev];
              newCandles.forEach(newCandle => {
                const exists = combined.find(c => 
                  c.candle_date_time_kst === newCandle.candle_date_time_kst ||
                  c.candle_date_time_utc === newCandle.candle_date_time_utc
                );
                if (!exists) {
                  combined.push(newCandle);
                }
              });
              // 시간순 정렬 및 최신 데이터 유지
              return combined.sort((a, b) => {
                const timeA = new Date(a.candle_date_time_kst || a.candle_date_time_utc);
                const timeB = new Date(b.candle_date_time_kst || b.candle_date_time_utc);
                return timeA - timeB;
              }).slice(-candleCount);
            });
          }

          // 현재가 업데이트
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
  }, [isRealTime, serverStatus, candleUnit, candleMinute, selectedMarket, candleCount, setCandleData, setCurrentPrice]);
};

