/**
 * 로컬 스토리지 유틸리티
 * 브라우저에 데이터를 저장하여 새로고침 후에도 유지
 */

const STORAGE_KEYS = {
  ACCOUNT_BALANCE: 'capas_account_balance',
  TRADE_HISTORY: 'capas_trade_history',
  SELECTED_MARKET: 'capas_selected_market',
  SETTINGS: 'capas_settings'
};

/**
 * 계좌 잔액 저장
 */
export const saveAccountBalance = (balance) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_BALANCE, JSON.stringify(balance));
  } catch (err) {
    console.error('계좌 잔액 저장 실패:', err);
  }
};

/**
 * 계좌 잔액 불러오기
 */
export const loadAccountBalance = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNT_BALANCE);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('계좌 잔액 불러오기 실패:', err);
  }
  return null;
};

/**
 * 거래 내역 저장
 */
export const saveTradeHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRADE_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('거래 내역 저장 실패:', err);
  }
};

/**
 * 거래 내역 불러오기
 */
export const loadTradeHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRADE_HISTORY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('거래 내역 불러오기 실패:', err);
  }
  return [];
};

/**
 * 선택된 코인 저장
 */
export const saveSelectedMarket = (market) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MARKET, market);
  } catch (err) {
    console.error('선택된 코인 저장 실패:', err);
  }
};

/**
 * 선택된 코인 불러오기
 */
export const loadSelectedMarket = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MARKET) || 'KRW-BTC';
  } catch (err) {
    console.error('선택된 코인 불러오기 실패:', err);
    return 'KRW-BTC';
  }
};

/**
 * 설정 저장
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('설정 저장 실패:', err);
  }
};

/**
 * 설정 불러오기
 */
export const loadSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('설정 불러오기 실패:', err);
  }
  return null;
};

/**
 * 모든 데이터 초기화
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (err) {
    console.error('데이터 초기화 실패:', err);
  }
};

/**
 * 저장된 데이터 확인
 */
export const hasStoredData = () => {
  return !!(
    localStorage.getItem(STORAGE_KEYS.ACCOUNT_BALANCE) ||
    localStorage.getItem(STORAGE_KEYS.TRADE_HISTORY)
  );
};

