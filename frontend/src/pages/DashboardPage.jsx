import { AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import ServerWarning from '../components/ServerWarning';
import CoinSelector from '../components/CoinSelector';
import PriceCards from '../components/PriceCards';
import TechnicalIndicators from '../components/TechnicalIndicators';
import PriceChart from '../components/PriceChart';

/**
 * 대시보드 페이지
 * - 코인 선택 및 분석
 * - 가격 차트
 * - 기술적 지표
 */
function DashboardPage({
  markets,
  selectedMarket,
  onMarketChange,
  candleUnit,
  onCandleUnitChange,
  candleMinute,
  onCandleMinuteChange,
  candleCount,
  onAnalyze,
  loading,
  serverStatus,
  onRetryConnection,
  error,
  currentPrice,
  indicators,
  candleData,
  isRealTime,
  onRealTimeToggle
}) {
  return (
    <>
      {/* 헤더 */}
      <Header serverStatus={serverStatus} onRetryConnection={onRetryConnection} />

      {/* 서버 미연결 경고 */}
      {serverStatus === 'disconnected' && (
        <ServerWarning onRetry={onRetryConnection} />
      )}

      {/* 코인 선택 */}
      <CoinSelector
        markets={markets}
        selectedMarket={selectedMarket}
        onMarketChange={onMarketChange}
        candleUnit={candleUnit}
        onCandleUnitChange={onCandleUnitChange}
        candleMinute={candleMinute}
        onCandleMinuteChange={onCandleMinuteChange}
        candleCount={candleCount}
        onAnalyze={onAnalyze}
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
        onRealTimeToggle={onRealTimeToggle}
        serverStatus={serverStatus}
      />
    </>
  );
}

export default DashboardPage;

