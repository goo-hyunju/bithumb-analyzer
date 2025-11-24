// API 관련 유틸리티 함수들

const API_URL = 'http://localhost:5000/api';

/**
 * 캔들 데이터 API URL 생성
 */
export const buildCandleUrl = (market, count, unit, minute = null) => {
  let url = `${API_URL}/candles/${market}?count=${count}&unit=${unit}`;
  if (unit === 'minutes' && minute) {
    url += `&minute=${minute}`;
  }
  return url;
};

/**
 * 마켓 목록 조회
 */
export const fetchMarkets = async () => {
  const response = await fetch(`${API_URL}/markets`);
  if (!response.ok) throw new Error('마켓 조회 실패');
  return response.json();
};

/**
 * 현재가 조회
 */
export const fetchCurrentPrice = async (market) => {
  const response = await fetch(`${API_URL}/ticker/${market}`);
  if (!response.ok) throw new Error('현재가 조회 실패');
  return response.json();
};

/**
 * 캔들 데이터 조회
 */
export const fetchCandles = async (market, count, unit, minute = null) => {
  const url = buildCandleUrl(market, count, unit, minute);
  const response = await fetch(url);
  if (!response.ok) throw new Error('캔들 데이터 조회 실패');
  return response.json();
};

/**
 * 기술적 지표 계산
 */
export const fetchIndicators = async (candles) => {
  const response = await fetch(`${API_URL}/indicators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candles })
  });
  if (!response.ok) throw new Error('지표 계산 실패');
  return response.json();
};

/**
 * 백테스팅 실행
 */
export const fetchBacktest = async (candles, targetProfit) => {
  const response = await fetch(`${API_URL}/backtest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candles, targetProfit })
  });
  if (!response.ok) throw new Error('백테스팅 실패');
  return response.json();
};

/**
 * 서버 상태 확인
 */
export const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/markets`);
    return response.ok ? 'connected' : 'error';
  } catch {
    return 'disconnected';
  }
};

