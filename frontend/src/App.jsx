import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

// Components
import Header from './components/Header';
import ServerWarning from './components/ServerWarning';
import CoinSelector from './components/CoinSelector';
import PriceCards from './components/PriceCards';
import TechnicalIndicators from './components/TechnicalIndicators';
import PriceChart from './components/PriceChart';
import BacktestResults from './components/BacktestResults';

// Utils & Hooks
import { checkServerStatus, fetchMarkets, fetchCandles, fetchCurrentPrice, fetchIndicators, fetchBacktest } from './utils/apiUtils';
import { getDefaultChartRange, getCandleTypeLabel } from './utils/chartUtils';
import { useRealTimeUpdate } from './hooks/useRealTimeUpdate';

function App() {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
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

  // 실시간 업데이트 훅
  useRealTimeUpdate({
    isRealTime,
    serverStatus,
    candleUnit,
    candleMinute,
    selectedMarket,
    candleCount,
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

  // 전체 분석 실행
  const runFullAnalysis = async () => {
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
      
      // 3. 지표 계산
      const indicatorData = await fetchIndicators(candles);
      setIndicators(indicatorData);
      
      // 4. 백테스팅 (5% & 10%)
      const [backtest5, backtest10] = await Promise.all([
        fetchBacktest(candles, 5),
        fetchBacktest(candles, 10)
      ]);
      
      setBacktestResult({
        result5: backtest5,
        result10: backtest10
      });
      
    } catch (err) {
      setError('분석 실패: ' + err.message);
      console.error('분석 실패:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <Header serverStatus={serverStatus} onRetryConnection={handleRetryConnection} />

        {/* 서버 미연결 경고 */}
        {serverStatus === 'disconnected' && (
          <ServerWarning onRetry={handleRetryConnection} />
        )}

        {/* 코인 선택 */}
        <CoinSelector
          markets={markets}
          selectedMarket={selectedMarket}
          onMarketChange={setSelectedMarket}
          candleUnit={candleUnit}
          onCandleUnitChange={handleCandleUnitChange}
          candleMinute={candleMinute}
          onCandleMinuteChange={setCandleMinute}
          candleCount={candleCount}
          onAnalyze={runFullAnalysis}
          loading={loading}
          serverStatus={serverStatus}
        />

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* 현재가 정보 */}
        <PriceCards currentPrice={currentPrice} />

        {/* 기술적 지표 */}
        <TechnicalIndicators indicators={indicators} />

        {/* 가격 차트 */}
        <PriceChart
          candleData={candleData}
          candleUnit={candleUnit}
          candleMinute={candleMinute}
          isRealTime={isRealTime}
          onRealTimeToggle={() => setIsRealTime(!isRealTime)}
          serverStatus={serverStatus}
        />

        {/* 백테스팅 결과 */}
        <BacktestResults backtestResult={backtestResult} />
      </div>
    </div>
  );
}

export default App;
