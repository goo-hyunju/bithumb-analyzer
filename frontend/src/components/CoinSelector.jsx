import { getCandleTypeLabel } from '../utils/chartUtils';

function CoinSelector({
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
  serverStatus
}) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/50 shadow-xl">
      <label className="block text-sm font-semibold mb-3 text-gray-700">분석 설정</label>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* 코인 선택 */}
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-500 mb-2 font-medium">코인 선택</label>
          <select
            value={selectedMarket}
            onChange={(e) => onMarketChange(e.target.value)}
            disabled={serverStatus !== 'connected'}
            className="w-full bg-white/90 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-gray-700 font-medium"
          >
            {markets.length === 0 ? (
              <option>서버 연결 대기 중...</option>
            ) : (
              markets.map(m => (
                <option key={m.market} value={m.market}>
                  {m.korean_name} ({m.market})
                </option>
              ))
            )}
          </select>
        </div>

        {/* 캔들 타입 */}
        <div>
          <label className="block text-xs text-gray-500 mb-2 font-medium">캔들 타입</label>
          <select
            value={candleUnit}
            onChange={(e) => onCandleUnitChange(e.target.value)}
            disabled={loading}
            className="w-full bg-white/90 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-gray-700 font-medium"
          >
            <option value="minutes">분봉</option>
            <option value="days">일봉</option>
            <option value="weeks">주봉</option>
          </select>
        </div>

        {/* 분봉 단위 (분봉 선택 시에만 표시) */}
        {candleUnit === 'minutes' && (
          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium">분봉 단위</label>
            <select
              value={candleMinute}
              onChange={(e) => onCandleMinuteChange(e.target.value)}
              disabled={loading}
              className="w-full bg-white/90 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-gray-700 font-medium"
            >
              <option value="1">1분</option>
              <option value="3">3분</option>
              <option value="5">5분</option>
              <option value="15">15분</option>
              <option value="30">30분</option>
              <option value="60">60분</option>
            </select>
          </div>
        )}
      </div>

      {/* 분석 시작 버튼 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          현재 설정: <span className="font-semibold text-gray-700">
            {getCandleTypeLabel(candleUnit, candleMinute)}
          </span> ({candleCount}개)
        </div>
        <button
          onClick={onAnalyze}
          disabled={loading || serverStatus !== 'connected'}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105 disabled:transform-none"
        >
          {loading && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? '분석 중...' : '분석 시작'}
        </button>
      </div>
    </div>
  );
}

export default CoinSelector;

