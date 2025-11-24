import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { RefreshCw, ZoomOut } from 'lucide-react';
import { convertCandlesToChartData, applyChartRange, getCandleTypeLabel, getDefaultChartRange } from '../utils/chartUtils';

function PriceChart({
  candleData,
  candleUnit,
  candleMinute,
  isRealTime,
  onRealTimeToggle,
  serverStatus
}) {
  const allChartData = convertCandlesToChartData(candleData, candleUnit);
  const [chartRange, setChartRange] = useState(() => 
    getDefaultChartRange(allChartData.length, candleUnit)
  );

  // candleData가 변경되면 차트 범위 초기화
  useEffect(() => {
    if (allChartData.length > 0) {
      setChartRange(getDefaultChartRange(allChartData.length, candleUnit));
    }
  }, [candleData.length, candleUnit]);
  
  const chartData = applyChartRange(allChartData, chartRange);

  const handleFullView = () => {
    setChartRange({ start: 0, end: allChartData.length });
  };

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {getCandleTypeLabel(candleUnit, candleMinute)} 가격 추이 ({chartData.length}개 / 전체 {allChartData.length}개)
        </h2>
        <div className="flex items-center gap-3">
          {/* 실시간 업데이트 토글 */}
          <button
            onClick={onRealTimeToggle}
            disabled={serverStatus !== 'connected'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${
              isRealTime 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-4 h-4 ${isRealTime ? 'animate-spin' : ''}`} />
            {isRealTime ? '실시간 ON' : '실시간 OFF'}
          </button>
          {/* 전체 보기 버튼 */}
          <button
            onClick={handleFullView}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            <ZoomOut className="w-4 h-4" />
            전체 보기
          </button>
        </div>
      </div>

      {/* 시간 범위 슬라이더 */}
      <div className="mb-4 p-4 bg-white/60 backdrop-blur-lg rounded-xl border border-white/50">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">시간 범위 조절</label>
          <span className="text-xs text-gray-500">
            {chartRange.start} ~ {chartRange.end} ({chartRange.end - chartRange.start}개 표시)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">시작 인덱스</label>
            <input
              type="range"
              min="0"
              max={allChartData.length - 1}
              value={chartRange.start}
              onChange={(e) => {
                const start = parseInt(e.target.value);
                setChartRange(prev => ({ ...prev, start: Math.min(start, prev.end - 1) }));
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료 인덱스</label>
            <input
              type="range"
              min={chartRange.start + 1}
              max={allChartData.length}
              value={chartRange.end}
              onChange={(e) => {
                const end = parseInt(e.target.value);
                setChartRange(prev => ({ ...prev, end: Math.max(end, prev.start + 1) }));
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '11px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="종가"
            dot={false}
            activeDot={{ r: 6 }}
          />
          {/* Brush 컴포넌트로 줌 기능 제공 */}
          {allChartData.length > 0 && (
            <Brush
              dataKey="date"
              height={30}
              stroke="#8884d8"
              data={allChartData}
              startIndex={Math.max(0, chartRange.start)}
              endIndex={Math.min(allChartData.length - 1, chartRange.end - 1)}
              tickFormatter={(value, index) => {
                if (allChartData[index]) return allChartData[index].date;
                return value;
              }}
              onChange={(e) => {
                if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
                  setChartRange({ start: e.startIndex, end: e.endIndex + 1 });
                }
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;

