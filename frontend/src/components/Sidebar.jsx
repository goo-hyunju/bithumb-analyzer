import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Coins
} from 'lucide-react';

function Sidebar({ 
  accountBalance, 
  totalProfit, 
  totalLoss, 
  activeTrades
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const currentSection = location.pathname.replace('/', '') || 'dashboard';

  const sections = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3, path: '/dashboard' },
    { id: 'trading', label: '모의투자', icon: TrendingUp, path: '/trading' },
    { id: 'backtest', label: '백테스팅', icon: TrendingDown, path: '/backtest' },
    { id: 'account', label: '내 계좌', icon: Wallet, path: '/account' },
    { id: 'settings', label: '설정', icon: Settings, path: '/settings' }
  ];

  const profitRate = accountBalance.initial > 0 
    ? ((accountBalance.current - accountBalance.initial) / accountBalance.initial * 100).toFixed(2)
    : 0;

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside 
        className={`
          fixed md:static top-0 left-0 h-full z-50
          bg-white/90 backdrop-blur-xl border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-80 flex flex-col shadow-xl
        `}
      >
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">CAPAS</h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 계좌 정보 */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            내 계좌
          </h2>
          
          <div className="space-y-3">
            {/* 총 자산 */}
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-gray-500 mb-1">총 자산</div>
              <div className="text-2xl font-bold text-gray-800">
                {accountBalance.current.toLocaleString('ko-KR')}원
              </div>
              <div className={`text-xs mt-1 ${
                parseFloat(profitRate) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {profitRate >= 0 ? '+' : ''}{profitRate}% ({profitRate >= 0 ? '수익' : '손실'})
              </div>
            </div>

            {/* 초기 자금 */}
            <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-gray-500 mb-1">초기 자금</div>
              <div className="text-lg font-semibold text-gray-700">
                {accountBalance.initial.toLocaleString('ko-KR')}원
              </div>
            </div>

            {/* 수익/손실 요약 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-green-600 mb-1">총 수익</div>
                <div className="text-sm font-bold text-green-700">
                  +{totalProfit.toLocaleString('ko-KR')}원
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="text-xs text-red-600 mb-1">총 손실</div>
                <div className="text-sm font-bold text-red-700">
                  -{totalLoss.toLocaleString('ko-KR')}원
                </div>
              </div>
            </div>

            {/* 활성 거래 */}
            {activeTrades > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="text-xs text-yellow-600 mb-1">진행 중 거래</div>
                <div className="text-sm font-bold text-yellow-700">{activeTrades}건</div>
              </div>
            )}
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id || (currentSection === '' && section.id === 'dashboard');
              return (
                <Link
                  key={section.id}
                  to={section.path}
                  onClick={() => {
                    if (isMobile) setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 푸터 */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 CAPAS
          </div>
        </div>
      </aside>

      {/* 모바일 메뉴 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden p-3 bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </>
  );
}

export default Sidebar;

