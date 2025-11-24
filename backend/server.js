// backend/server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정 - 프론트엔드에서 접근 가능하도록
app.use(cors());
app.use(express.json());

const BITHUMB_API = 'https://api.bithumb.com/v1';

// Rate Limit 관리를 위한 지연 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// 1. 마켓 목록 조회
// ============================================
app.get('/api/markets', async (req, res) => {
  try {
    const response = await axios.get(`${BITHUMB_API}/market/all`, {
      params: { isDetails: true }
    });
    
    const krwMarkets = response.data.filter(m => m.market.startsWith('KRW-'));
    console.log(`✓ 마켓 목록 조회 성공: ${krwMarkets.length}개`);
    res.json(krwMarkets);
  } catch (error) {
    console.error('마켓 조회 실패:', error.message);
    res.status(500).json({ error: '마켓 조회 실패' });
  }
});

// ============================================
// 2. 현재가 조회
// ============================================
app.get('/api/ticker/:market', async (req, res) => {
  try {
    await delay(100); // Rate Limit 대응
    
    const response = await axios.get(`${BITHUMB_API}/ticker`, {
      params: { markets: req.params.market }
    });
    
    console.log(`✓ 현재가 조회: ${req.params.market}`);
    res.json(response.data[0]);
  } catch (error) {
    console.error('현재가 조회 실패:', error.message);
    res.status(500).json({ error: '현재가 조회 실패' });
  }
});

// ============================================
// 3. 캔들 데이터 조회
// ============================================
app.get('/api/candles/:market', async (req, res) => {
  try {
    await delay(100);
    
    const { count = 200, unit = 'days', minute = null } = req.query;
    
    // 캔들 타입별 API 엔드포인트 결정
    let endpoint;
    if (unit === 'minutes') {
      // 분봉: 1, 3, 5, 15, 30, 60분
      const validMinutes = [1, 3, 5, 15, 30, 60];
      const minuteValue = minute ? parseInt(minute) : 1;
      if (!validMinutes.includes(minuteValue)) {
        return res.status(400).json({ error: '지원하지 않는 분봉 단위입니다. (1, 3, 5, 15, 30, 60)' });
      }
      endpoint = `${BITHUMB_API}/candles/minutes/${minuteValue}`;
    } else if (unit === 'days') {
      endpoint = `${BITHUMB_API}/candles/days`;
    } else if (unit === 'weeks') {
      endpoint = `${BITHUMB_API}/candles/weeks`;
    } else {
      return res.status(400).json({ error: '지원하지 않는 캔들 타입입니다. (minutes, days, weeks)' });
    }
    
    const response = await axios.get(endpoint, {
      params: {
        market: req.params.market,
        count: parseInt(count)
      }
    });
    
    // 시간순 정렬 (오래된 것부터)
    const sorted = response.data.reverse();
    console.log(`✓ 캔들 데이터 조회: ${req.params.market} (${unit}${unit === 'minutes' ? '/' + minute : ''}, ${sorted.length}개)`);
    res.json(sorted);
  } catch (error) {
    console.error('캔들 데이터 조회 실패:', error.message);
    res.status(500).json({ error: '캔들 데이터 조회 실패: ' + error.message });
  }
});

// ============================================
// 유틸리티: 기술적 지표 계산 함수들
// ============================================
function calculateMA(prices, period) {
  const ma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    ma.push(sum / period);
  }
  return ma;
}

function calculateRSI(prices, period = 14) {
  const rsi = [];
  const changes = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  for (let i = period; i < changes.length; i++) {
    const recentChanges = changes.slice(i - period, i);
    const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0);
    const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0));
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  return rsi;
}

function calculateVolatility(prices, period = 20) {
  const recentPrices = prices.slice(-period);
  const mean = recentPrices.reduce((a, b) => a + b, 0) / period;
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
  return Math.sqrt(variance) / mean * 100;
}

// ============================================
// 4. 기술적 지표 계산
// ============================================
app.post('/api/indicators', async (req, res) => {
  try {
    const { candles } = req.body;
    
    if (!candles || !Array.isArray(candles)) {
      return res.status(400).json({ error: '캔들 데이터가 필요합니다' });
    }
    
    const prices = candles.map(c => c.trade_price);
    const volumes = candles.map(c => c.candle_acc_trade_volume);
    
    const ma5 = calculateMA(prices, 5);
    const ma20 = calculateMA(prices, 20);
    const ma60 = calculateMA(prices, 60);
    const rsi = calculateRSI(prices, 14);
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = (currentVolume / avgVolume * 100).toFixed(2);
    
    const volatility = calculateVolatility(prices, 20).toFixed(2);
    
    const indicators = {
      ma5: ma5[ma5.length - 1]?.toFixed(0),
      ma20: ma20[ma20.length - 1]?.toFixed(0),
      ma60: ma60[ma60.length - 1]?.toFixed(0),
      rsi: rsi[rsi.length - 1]?.toFixed(2),
      volumeRatio: parseFloat(volumeRatio),
      volatility: parseFloat(volatility),
      goldenCross: ma5[ma5.length - 1] > ma20[ma20.length - 1],
      currentPrice: prices[prices.length - 1]
    };
    
    console.log('✓ 지표 계산 완료');
    res.json(indicators);
    
  } catch (error) {
    console.error('지표 계산 실패:', error.message);
    res.status(500).json({ error: '지표 계산 실패' });
  }
});

// ============================================
// 5. 백테스팅 실행
// ============================================
app.post('/api/backtest', async (req, res) => {
  try {
    const { candles, targetProfit = 5 } = req.body;
    
    if (!candles || !Array.isArray(candles)) {
      return res.status(400).json({ error: '캔들 데이터가 필요합니다' });
    }
    
    const prices = candles.map(c => c.trade_price);
    const volumes = candles.map(c => c.candle_acc_trade_volume);
    
    const trades = [];
    let totalTrades = 0;
    let successfulTrades = 0;
    let totalProfit = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    
    console.log(`백테스팅 시작: ${targetProfit}% 목표`);
    
    for (let i = 60; i < candles.length - 10; i++) {
      const currentPrices = prices.slice(0, i + 1);
      const currentVolumes = volumes.slice(0, i + 1);
      
      // 지표 계산
      const ma5 = calculateMA(currentPrices, 5);
      const ma20 = calculateMA(currentPrices, 20);
      const rsi = calculateRSI(currentPrices, 14);
      
      const currentMA5 = ma5[ma5.length - 1];
      const currentMA20 = ma20[ma20.length - 1];
      const prevMA5 = ma5[ma5.length - 2];
      const prevMA20 = ma20[ma20.length - 2];
      const currentRSI = rsi[rsi.length - 1];
      
      // 거래량 분석
      const recentVolumes = currentVolumes.slice(-20);
      const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / 20;
      const volumeSpike = currentVolumes[currentVolumes.length - 1] > avgVolume * 1.5;
      
      // 매수 신호: 골든크로스 + RSI 적정 + 거래량 급증
      const buySignal = 
        prevMA5 <= prevMA20 && 
        currentMA5 > currentMA20 && 
        currentRSI > 30 && 
        currentRSI < 70 &&
        volumeSpike;
      
      if (buySignal) {
        const entryPrice = currentPrices[currentPrices.length - 1];
        const target = entryPrice * (1 + targetProfit / 100);
        
        // 향후 10일간 목표가 달성 여부 확인
        let reached = false;
        let daysToTarget = null;
        let exitPrice = entryPrice;
        let profit = -2; // 기본 손절
        
        for (let j = 1; j <= 10 && i + j < candles.length; j++) {
          const futureHigh = candles[i + j].high_price;
          const futureLow = candles[i + j].low_price;
          
          // 목표가 달성
          if (futureHigh >= target) {
            reached = true;
            daysToTarget = j;
            exitPrice = target;
            profit = targetProfit;
            break;
          }
          
          // 손절 (-2%)
          if (futureLow <= entryPrice * 0.98) {
            exitPrice = entryPrice * 0.98;
            profit = -2;
            break;
          }
        }
        
        totalTrades++;
        if (reached) successfulTrades++;
        
        totalProfit += profit;
        currentDrawdown = profit < 0 ? currentDrawdown + profit : 0;
        maxDrawdown = Math.min(maxDrawdown, currentDrawdown);
        
        trades.push({
          date: candles[i].candle_date_time_kst.split('T')[0],
          entryPrice,
          target,
          reached,
          daysToTarget,
          profit,
          exitPrice
        });
      }
    }
    
    const successRate = totalTrades > 0 ? (successfulTrades / totalTrades * 100).toFixed(2) : 0;
    const avgProfit = totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : 0;
    
    const result = {
      totalTrades,
      successfulTrades,
      successRate: parseFloat(successRate),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      avgProfit: parseFloat(avgProfit),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      trades: trades.slice(-10) // 최근 10개만
    };
    
    console.log(`✓ 백테스팅 완료: 성공률 ${result.successRate}%`);
    res.json(result);
    
  } catch (error) {
    console.error('백테스팅 실패:', error.message);
    res.status(500).json({ error: '백테스팅 실패' });
  }
});

// ============================================
// 헬스체크
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// 서버 시작
// ============================================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 CAPAS 백엔드 서버 실행 중');
  console.log('='.repeat(60));
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`🕐 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
  console.log('\n사용 가능한 API:');
  console.log('  GET  /api/markets           - 마켓 목록 조회');
  console.log('  GET  /api/ticker/:market    - 현재가 조회');
  console.log('  GET  /api/candles/:market   - 캔들 데이터 조회');
  console.log('  POST /api/indicators        - 기술적 지표 계산');
  console.log('  POST /api/backtest          - 백테스팅 실행');
  console.log('  GET  /health                - 헬스체크');
  console.log('='.repeat(60) + '\n');
});
