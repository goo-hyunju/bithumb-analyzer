import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Download, Server, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
  const [candleData, setCandleData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [backtestResult, setBacktestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  // 서버 연결 확인
  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const response = await fetch(`${API_URL}/markets`);
      if (response.ok) {
        setServerStatus('connected');
        fetchMarkets();
      } else {
        setServerStatus('error');
      }
    } catch (err) {
      setServerStatus('disconnected');
    }
  };

  // 마켓 목록 조회
  const fetchMarkets = async () => {
    try {
      const response = await fetch(`${API_URL}/markets`);
      const data = await response.json();
      setMarkets(data);
    } catch (err) {
      console.error('마켓 조회 실패:', err);
      setError('마켓 조회 실패: 백엔드 서버를 확인해주세요');
    }
  };

  // 현재가 조회
  const fetchCurrentPrice = async () => {
    try {
      const response = await fetch(`${API_URL}/ticker/${selectedMarket}`);
      const data = await response.json();
      setCurrentPrice(data);
    } catch (err) {
      console.error('현재가 조회 실패:', err);
    }
  };

  // 전체 분석 실행
  const runFullAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. 캔들 데이터 조회
      const candleResponse = await fetch(`${API_URL}/candles/${selectedMarket}?count=200`);
      const candles = await candleResponse.json();
      
      if (!Array.isArray(candles)) {
        throw new Error('캔들 데이터 형식 오류');
      }
      
      setCandleData(candles);
      
      // 2. 현재가 조회
      await fetchCurrentPrice();
      
      // 3. 지표 계산
      const indicatorResponse = await fetch(`${API_URL}/indicators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candles })
      });
      const indicatorData = await indicatorResponse.json();
      setIndicators(indicatorData);
      
      // 4. 백테스팅 (5%)
      const backtest5Response = await fetch(`${API_URL}/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candles, targetProfit: 5 })
      });
      const backtest5 = await backtest5Response.json();
      
      // 5. 백테스팅 (10%)
      const backtest10Response = await fetch(`${API_URL}/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candles, targetProfit: 10 })
      });
      const backtest10 = await backtest10Response.json();
      
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

  // 차트 데이터 준비
  const chartData = candleData.slice(-60).map((candle) => ({
    date: candle.candle_date_time_kst.split('T')[0].slice(5),
    price: candle.trade_price,
    volume: candle.candle_acc_trade_volume
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            CAPAS
          </h1>
          <p className="text-center text-slate-400 text-sm mb-4">
            Coin Alert Prediction & Analysis System
          </p>
          
          {/* 서버 상태 */}
          <div className="flex justify-center items-center gap-2 text-sm">
            {serverStatus === 'connected' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">백엔드 서버 연결됨</span>
              </>
            ) : serverStatus === 'disconnected' ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400">백엔드 서버 미연결</span>
              </>
            ) : (
              <>
                <Server className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400">서버 확인 중...</span>
              </>
            )}
          </div>
        </div>

        {/* 서버 미연결 경고 */}
        {serverStatus === 'disconnected' && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              백엔드 서버가 실행되지 않았습니다
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p>터미널에서 다음 명령어로 서버를 실행해주세요:</p>
              <pre className="bg-slate-800 p-3 rounded overflow-x-auto font-mono text-xs">
cd backend{'\n'}npm install{'\n'}npm start
              </pre>
              <button
                onClick={checkServer}
                className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                다시 연결 시도
              </button>
            </div>
          </div>
        )}

        {/* 코인 선택 */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <label className="block text-sm font-medium mb-2">분석할 코인 선택</label>
          <div className="flex gap-4">
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              disabled={serverStatus !== 'connected'}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <button
              onClick={runFullAnalysis}
              disabled={loading || serverStatus !== 'connected'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? '분석 중...' : '분석 시작'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 현재가 정보 */}
        {currentPrice && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">현재가</div>
              <div className="text-2xl font-bold">
                {currentPrice.trade_price.toLocaleString()}원
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">전일 대비</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${
                currentPrice.change === 'RISE' ? 'text-red-500' : 
                currentPrice.change === 'FALL' ? 'text-blue-500' : 'text-slate-400'
              }`}>
                {currentPrice.change === 'RISE' ? <TrendingUp className="w-6 h-6" /> : 
                 currentPrice.change === 'FALL' ? <TrendingDown className="w-6 h-6" /> : null}
                {currentPrice.signed_change_rate.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">24h 거래량</div>
              <div className="text-xl font-bold">
                {currentPrice.acc_trade_volume_24h.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">52주 최고가</div>
              <div className="text-xl font-bold">
                {currentPrice.highest_52_week_price.toLocaleString()}원
              </div>
            </div>
          </div>
        )}

        {/* 기술적 지표 */}
        {indicators && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4">기술적 지표</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <div className="text-sm text-slate-400">MA5</div>
                <div className="text-lg font-bold">{indicators.ma5}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">MA20</div>
                <div className="text-lg font-bold">{indicators.ma20}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">MA60</div>
                <div className="text-lg font-bold">{indicators.ma60}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">RSI(14)</div>
                <div className={`text-lg font-bold ${
                  indicators.rsi < 30 ? 'text-blue-400' : 
                  indicators.rsi > 70 ? 'text-red-400' : 'text-white'
                }`}>
                  {indicators.rsi}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">거래량 비율</div>
                <div className="text-lg font-bold">{indicators.volumeRatio}%</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">변동성</div>
                <div className="text-lg font-bold">{indicators.volatility}%</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                {indicators.goldenCross ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-400">골든크로스 (상승 신호)</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-400">데드크로스 또는 중립</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 가격 차트 */}
        {chartData.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4">최근 60일 가격 추이</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="종가"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 백테스팅 결과 */}
        {backtestResult && (
          <div className="space-y-6">
            {/* 5% 목표 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Download className="w-6 h-6 text-green-400" />
                5% 목표 수익률 백테스팅
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">총 거래</div>
                  <div className="text-2xl font-bold">{backtestResult.result5.totalTrades}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">성공</div>
                  <div className="text-2xl font-bold text-green-400">
                    {backtestResult.result5.successfulTrades}
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">성공률</div>
                  <div className={`text-2xl font-bold ${
                    backtestResult.result5.successRate >= 60 ? 'text-green-400' : 
                    backtestResult.result5.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {backtestResult.result5.successRate}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">평균 수익</div>
                  <div className={`text-2xl font-bold ${
                    backtestResult.result5.avgProfit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {backtestResult.result5.avgProfit}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">총 수익률</div>
                  <div className={`text-2xl font-bold ${
                    backtestResult.result5.totalProfit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {backtestResult.result5.totalProfit}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">최대 낙폭</div>
                  <div className="text-2xl font-bold text-red-400">
                    {backtestResult.result5.maxDrawdown}%
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-700 rounded-lg mb-4">
                <h3 className="font-bold mb-2">전략 평가</h3>
                <p className="text-slate-300 text-sm">
                  {backtestResult.result5.successRate >= 60 ? 
                    '✅ 높은 성공률! 이 전략은 수익 가능성이 높습니다.' :
                    backtestResult.result5.successRate >= 50 ?
                    '⚠️ 보통 성공률. 리스크 관리를 철저히 하면 수익 가능합니다.' :
                    '❌ 낮은 성공률. 전략을 재검토해야 합니다.'}
                </p>
                <p className="text-slate-300 text-sm mt-2">
                  기댓값: {backtestResult.result5.avgProfit}% 
                  {backtestResult.result5.avgProfit > 0 ? ' (양수 - 장기적으로 수익 가능)' : ' (음수 - 손실 위험)'}
                </p>
              </div>
              {/* 매수 신호 조건 */}
              <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <h3 className="font-bold mb-2 text-blue-300">사용된 매수 신호 조건</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• 골든크로스: MA5가 MA20을 상향 돌파</li>
                  <li>• RSI: 30~70 구간 (과매도/과매수 제외)</li>
                  <li>• 거래량: 20일 평균 대비 150% 이상 급증</li>
                  <li>• 손절: 신호 발생 후 10일 내 목표 미달성 시 -2%</li>
                </ul>
              </div>
            </div>

            {/* 10% 목표 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Download className="w-6 h-6 text-purple-400" />
                10% 목표 수익률 백테스팅
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">총 거래</div>
                  <div className="text-2xl font-bold">{backtestResult.result10.totalTrades}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">성공</div>
                  <div className="text-2xl font-bold text-green-400">
                    {backtestResult.result10.successfulTrades}
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">성공률</div>
                  <div className={`text-2xl font-bold ${
                    backtestResult.result10.successRate >= 50 ? 'text-green-400' : 
                    backtestResult.result10.successRate >= 30 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {backtestResult.result10.successRate}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">평균 수익</div>
                  <div className={`text-2xl font-bold ${
                    backtestResult.result10.avgProfit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {backtestResult.result10.avgProfit}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">총 수익률</div>
                  <div className={`text-2xl font-bold ${
                    backtestResult.result10.totalProfit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {backtestResult.result10.totalProfit}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">최대 낙폭</div>
                  <div className="text-2xl font-bold text-red-400">
                    {backtestResult.result10.maxDrawdown}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
