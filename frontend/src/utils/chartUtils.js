// 차트 데이터 유틸리티 함수들

/**
 * 캔들 데이터를 차트용 데이터로 변환
 */
export const convertCandlesToChartData = (candles, candleUnit) => {
  return candles.map((candle) => {
    const dateStr = candle.candle_date_time_kst || candle.candle_date_time_utc || '';
    let dateLabel = '';
    
    if (candleUnit === 'minutes') {
      // 분봉: 시간:분 형식
      dateLabel = dateStr.split('T')[1]?.slice(0, 5) || dateStr.slice(11, 16);
    } else if (candleUnit === 'days') {
      // 일봉: 월-일 형식
      dateLabel = dateStr.split('T')[0]?.slice(5) || dateStr.slice(5, 10);
    } else {
      // 주봉: 월-일 형식
      dateLabel = dateStr.split('T')[0]?.slice(5) || dateStr.slice(5, 10);
    }
    
    return {
      date: dateLabel,
      price: candle.trade_price,
      volume: candle.candle_acc_trade_volume,
      fullDate: dateStr
    };
  });
};

/**
 * 차트 범위를 적용하여 데이터 슬라이싱
 */
export const applyChartRange = (allData, range) => {
  const startIdx = Math.max(0, Math.min(range.start, allData.length - 1));
  const endIdx = Math.max(startIdx, Math.min(range.end, allData.length));
  return allData.slice(startIdx, endIdx);
};

/**
 * 캔들 타입 레이블 가져오기
 */
export const getCandleTypeLabel = (candleUnit, candleMinute) => {
  if (candleUnit === 'minutes') {
    return `${candleMinute}분봉`;
  } else if (candleUnit === 'days') {
    return '일봉';
  } else if (candleUnit === 'weeks') {
    return '주봉';
  }
  return '일봉';
};

/**
 * 기본 차트 범위 계산
 */
export const getDefaultChartRange = (dataLength, candleUnit) => {
  const defaultEnd = candleUnit === 'minutes' ? 200 : 
                     candleUnit === 'days' ? 60 : 30;
  return { start: 0, end: Math.min(dataLength, defaultEnd) };
};

