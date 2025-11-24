import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import Sidebar from './components/Sidebar';

// Pages
import DashboardPage from './pages/DashboardPage';
import TradingPage from './pages/TradingPage';
import BacktestPage from './pages/BacktestPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import LicensePage from './pages/LicensePage';

// Utils & Hooks
import { checkServerStatus, fetchMarkets, fetchCandles, fetchCurrentPrice, fetchIndicators, fetchBacktest } from './utils/apiUtils';
import { getDefaultChartRange, getCandleTypeLabel } from './utils/chartUtils';
import { useRealTimeUpdate } from './hooks/useRealTimeUpdate';
import { useHoldingsPriceUpdate } from './hooks/useHoldingsPriceUpdate';
import { enhanceBacktestResult, createTradeHistory, normalizeTradeRecord, calculateTotalAssets, calculateHoldings } from './utils/accountUtils';
import { 
  saveAccountBalance, 
  loadAccountBalance, 
  saveTradeHistory, 
  loadTradeHistory,
  saveSelectedMarket,
  loadSelectedMarket
} from './utils/storageUtils';
import { isLicenseActive } from './utils/licenseUtils';

function App() {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(() => loadSelectedMarket());
  const [candleUnit, setCandleUnit] = useState('days');
  const [candleMinute, setCandleMinute] = useState('1');
  const [candleCount, setCandleCount] = useState(200);
  const [candleData, setCandleData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [backtestResult, setBacktestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [isRealTime, setIsRealTime] = useState(false);
  
  // 가상 계좌 상태 (로컬 스토리지에서 불러오기)
  const [accountBalance, setAccountBalance] = useState(() => {
    const saved = loadAccountBalance();
    return saved || {
      initial: 1000000, // 기본 100만원
      current: 1000000
    };
  });
  
  const [tradeHistory, setTradeHistory] = useState(() => loadTradeHistory());
  const [activeTrades, setActiveTrades] = useState(0);
  const [coinPrices, setCoinPrices] = useState({}); // 코인별 현재가 저장
  
  // 수익/손실 계산 (실제 체결된 거래만)
  const totalProfit = tradeHistory
    .filter(t => t && typeof t.profit === 'number' && t.profit > 0)
    .reduce((sum, t) => sum + t.profit, 0);
  
  const totalLoss = Math.abs(tradeHistory
    .filter(t => t && typeof t.profit === 'number' && t.profit < 0)
    .reduce((sum, t) => sum + t.profit, 0));
  
  // 총 자산 계산 (현재 잔액 + 보유 코인 가치)
  const totalAssets = calculateTotalAssets(accountBalance, tradeHistory, coinPrices);

  // 서버 연결 확인
  useEffect(() => {
    const checkServer = async () => {
      const status = await checkServerStatus();
      setServerStatus(status);
      if (status === 'connected') {
        loadMarkets();
      }
    };
    checkServer();
  }, []);

  // 계좌 잔액 변경 시 저장 (값이 실제로 변경된 경우에만)
  useEffect(() => {
    if (accountBalance && typeof accountBalance.initial === 'number' && typeof accountBalance.current === 'number') {
      saveAccountBalance(accountBalance);
    }
  }, [accountBalance?.initial, accountBalance?.current]);

  // 거래 내역 변경 시 저장
  useEffect(() => {
    if (Array.isArray(tradeHistory)) {
      saveTradeHistory(tradeHistory);
    }
  }, [tradeHistory]);
  
  // 보유 코인 현재가 실시간 업데이트 (30초마다)
  useHoldingsPriceUpdate({
    tradeHistory,
    accountBalance,
    serverStatus,
    coinPrices,
    setCoinPrices
  });

  // 선택된 코인 변경 시 저장
  useEffect(() => {
    saveSelectedMarket(selectedMarket);
  }, [selectedMarket]);

  // 실시간 업데이트 훅
  useRealTimeUpdate({
    isRealTime,
    serverStatus,
    candleUnit,
    candleMinute,
    selectedMarket,
    candleCount,
    candleData,
    setCandleData,
    setCurrentPrice
  });

  // 마켓 목록 로드
  const loadMarkets = async () => {
    try {
      const data = await fetchMarkets();
      setMarkets(data);
    } catch (err) {
      console.error('마켓 조회 실패:', err);
      setError('마켓 조회 실패: 백엔드 서버를 확인해주세요');
    }
  };

  // 전체 분석 실행 (대시보드용 - 백테스팅 포함)
  const runFullAnalysis = async (includeBacktest = true) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. 캔들 데이터 조회
      const candles = await fetchCandles(selectedMarket, candleCount, candleUnit, candleMinute);
      
      if (!Array.isArray(candles)) {
        throw new Error('캔들 데이터 형식 오류');
      }
      
      setCandleData(candles);
      
      // 2. 현재가 조회
      const price = await fetchCurrentPrice(selectedMarket);
      setCurrentPrice(price);
      
      // 코인별 현재가 저장 (총 자산 계산용)
      const coinName = selectedMarket.replace('KRW-', '');
      setCoinPrices(prev => ({
        ...prev,
        [coinName]: price,
        [selectedMarket]: price
      }));
      
      // 3. 지표 계산
      const indicatorData = await fetchIndicators(candles);
      setIndicators(indicatorData);
      
      // 4. 백테스팅 (대시보드에서만 자동 실행)
      if (includeBacktest) {
        const [backtest5, backtest10] = await Promise.all([
          fetchBacktest(candles, 5),
          fetchBacktest(candles, 10)
        ]);
        
        // 금액 정보 추가
        const enhancedResult5 = enhanceBacktestResult(backtest5, accountBalance);
        const enhancedResult10 = enhanceBacktestResult(backtest10, accountBalance);
        
        setBacktestResult({
          result5: enhancedResult5,
          result10: enhancedResult10
        });
      }

      // 백테스팅 결과는 거래 내역에 자동 추가하지 않음
      // 거래 내역은 모의투자 페이지에서만 사용자가 직접 매수/매도할 때 추가됨
      
    } catch (err) {
      setError('분석 실패: ' + err.message);
      console.error('분석 실패:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 백테스팅 페이지용 분석 실행 (백테스팅 제외)
  const runAnalysisWithoutBacktest = async () => {
    return runFullAnalysis(false);
  };

  // 캔들 타입 변경 핸들러
  const handleCandleUnitChange = (unit) => {
    setCandleUnit(unit);
    if (unit === 'minutes') {
      setCandleCount(200);
    } else if (unit === 'days') {
      setCandleCount(200);
    } else {
      setCandleCount(52);
    }
  };

  // 서버 재연결 시도
  const handleRetryConnection = async () => {
    const status = await checkServerStatus();
    setServerStatus(status);
    if (status === 'connected') {
      loadMarkets();
    }
  };

  // 거래 내역 업데이트 핸들러
  const handleTradeHistoryUpdate = (trade) => {
    const normalizedTrade = normalizeTradeRecord(trade);
    
    if (normalizedTrade) {
      setTradeHistory(prev => {
        // 중복 체크: 같은 ID가 이미 있으면 업데이트, 없으면 추가
        const existingIndex = prev.findIndex(t => t.id === normalizedTrade.id);
        if (existingIndex >= 0) {
          // 기존 거래 업데이트
          const updated = [...prev];
          updated[existingIndex] = normalizedTrade;
          return updated;
        } else {
          // 새 거래 추가
          return [...prev, normalizedTrade];
        }
      });
    }
    // 계좌 잔액은 OrderSystem에서 직접 업데이트됨
  };

  // 공통 props 객체
  const commonProps = {
    markets,
    selectedMarket,
    onMarketChange: setSelectedMarket,
    candleUnit,
    onCandleUnitChange: handleCandleUnitChange,
    candleMinute,
    onCandleMinuteChange: setCandleMinute,
    candleCount,
    onAnalyze: runFullAnalysis, // 대시보드용 (백테스팅 포함)
    loading,
    serverStatus,
    onRetryConnection: handleRetryConnection,
    error,
    currentPrice,
    indicators,
    candleData,
    isRealTime,
    onRealTimeToggle: () => setIsRealTime(!isRealTime)
  };
  
  // 백테스팅 페이지용 props (백테스팅 제외)
  const backtestPageProps = {
    ...commonProps,
    onAnalyze: runAnalysisWithoutBacktest // 백테스팅 페이지용 (백테스팅 제외)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* 사이드바 */}
      <Sidebar
        accountBalance={accountBalance}
        totalProfit={totalProfit}
        totalLoss={totalLoss}
        activeTrades={activeTrades}
        totalAssets={totalAssets}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto">
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/license" element={<LicensePage />} />
            <Route 
              path="/dashboard" 
              element={<DashboardPage {...commonProps} />} 
            />
            <Route 
              path="/trading" 
              element={
                <TradingPage
                  {...commonProps}
                  onCurrentPriceChange={(price) => {
                    setCurrentPrice(price);
                    // 코인별 현재가 저장 (총 자산 계산용)
                    const coinName = selectedMarket.replace('KRW-', '');
                    setCoinPrices(prev => ({
                      ...prev,
                      [coinName]: price,
                      [selectedMarket]: price
                    }));
                  }}
                  accountBalance={accountBalance}
                  onBalanceChange={setAccountBalance}
                  onTradeHistoryUpdate={handleTradeHistoryUpdate}
                  tradeHistory={tradeHistory}
                />
              } 
            />
            <Route 
              path="/backtest"
              element={
                <BacktestPage
                  {...backtestPageProps}
                  accountBalance={accountBalance}
                  backtestResult={backtestResult}
                  onBacktestComplete={(result) => {
                    const enhanced = enhanceBacktestResult(result, accountBalance);
                    setBacktestResult({ custom: enhanced });
                    // 백테스팅 결과는 거래 내역에 자동 추가하지 않음
                    // 거래 내역은 모의투자 페이지에서만 사용자가 직접 매수/매도할 때 추가됨
                  }}
                />
              } 
            />
            <Route 
              path="/account" 
              element={
                <AccountPage
                  accountBalance={accountBalance}
                  onBalanceChange={setAccountBalance}
                  tradeHistory={tradeHistory}
                  onTradeHistoryUpdate={handleTradeHistoryUpdate}
                  coinPrices={coinPrices}
                  serverStatus={serverStatus}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={
                <SettingsPage
                  accountBalance={accountBalance}
                  onBalanceChange={setAccountBalance}
                  serverStatus={serverStatus}
                  tradeHistory={tradeHistory}
                  onTradeHistoryUpdate={setTradeHistory}
                />
              } 
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
