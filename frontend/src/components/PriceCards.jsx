import { TrendingUp, TrendingDown } from 'lucide-react';

function PriceCards({ currentPrice }) {
  if (!currentPrice) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-xl hover:shadow-2xl transition-all">
        <div className="text-sm text-gray-500 mb-2 font-medium">현재가</div>
        <div className="text-2xl font-bold text-gray-800">
          {currentPrice.trade_price.toLocaleString()}원
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-xl hover:shadow-2xl transition-all">
        <div className="text-sm text-gray-500 mb-2 font-medium">전일 대비</div>
        <div className={`text-2xl font-bold flex items-center gap-2 ${
          currentPrice.change === 'RISE' ? 'text-red-500' : 
          currentPrice.change === 'FALL' ? 'text-blue-500' : 'text-gray-500'
        }`}>
          {currentPrice.change === 'RISE' ? <TrendingUp className="w-6 h-6" /> : 
           currentPrice.change === 'FALL' ? <TrendingDown className="w-6 h-6" /> : null}
          {currentPrice.signed_change_rate.toFixed(2)}%
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-xl hover:shadow-2xl transition-all">
        <div className="text-sm text-gray-500 mb-2 font-medium">24h 거래량</div>
        <div className="text-xl font-bold text-gray-800">
          {currentPrice.acc_trade_volume_24h.toFixed(2)}
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-xl hover:shadow-2xl transition-all">
        <div className="text-sm text-gray-500 mb-2 font-medium">52주 최고가</div>
        <div className="text-xl font-bold text-gray-800">
          {currentPrice.highest_52_week_price.toLocaleString()}원
        </div>
      </div>
    </div>
  );
}

export default PriceCards;

