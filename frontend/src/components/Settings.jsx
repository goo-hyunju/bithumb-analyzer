import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Database, Shield, Palette, Key } from 'lucide-react';
import { loadLicense, clearLicense } from '../utils/licenseUtils';
import { useNavigate } from 'react-router-dom';

function Settings({ 
  accountBalance,
  onBalanceChange,
  serverStatus 
}) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [autoBacktest, setAutoBacktest] = useState(false);
  const [theme, setTheme] = useState('light');
  const [license, setLicense] = useState(null);

  useEffect(() => {
    const savedLicense = loadLicense();
    setLicense(savedLicense);
  }, []);

  const handleClearLicense = () => {
    if (confirm('라이선스를 비활성화하시겠습니까? 다시 활성화하려면 라이선스 키가 필요합니다.')) {
      clearLicense();
      setLicense(null);
      navigate('/license');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          설정
        </h2>

        {/* 라이선스 정보 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            라이선스 정보
          </h3>
          {license && license.isActive ? (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800 mb-1">활성화됨</div>
                  <div className="text-sm font-mono text-green-700">{license.key}</div>
                  {license.activatedAt && (
                    <div className="text-xs text-green-600 mt-1">
                      활성화일: {new Date(license.activatedAt).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClearLicense}
                  className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  비활성화
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-800 mb-1">라이선스 미활성화</div>
                  <div className="text-xs text-yellow-700">크몽에서 구매 후 라이선스를 활성화해주세요.</div>
                </div>
                <button
                  onClick={() => navigate('/license')}
                  className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  활성화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 계좌 설정 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            계좌 설정
          </h3>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                초기 자금
              </label>
              <div className="text-2xl font-bold text-gray-800">
                {accountBalance.initial.toLocaleString('ko-KR')}원
              </div>
            </div>
            <p className="text-xs text-gray-500">
              초기 자금 변경은 "내 계좌" 메뉴에서 가능합니다.
            </p>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            알림 설정
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium text-gray-800">알림 활성화</div>
                <div className="text-xs text-gray-500">거래 알림 및 백테스팅 결과 알림</div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium text-gray-800">자동 백테스팅</div>
                <div className="text-xs text-gray-500">분석 실행 시 자동으로 백테스팅 수행</div>
              </div>
              <input
                type="checkbox"
                checked={autoBacktest}
                onChange={(e) => setAutoBacktest(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* 서버 상태 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            서버 상태
          </h3>
          <div className={`p-4 rounded-xl border ${
            serverStatus === 'connected' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">백엔드 서버</div>
                <div className="text-xs text-gray-500">
                  {serverStatus === 'connected' ? '정상 연결됨' : '연결 실패'}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </div>

        {/* 테마 설정 */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            테마 설정
          </h3>
          <div className="space-y-2">
            <label className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={(e) => setTheme(e.target.value)}
                className="w-4 h-4 text-blue-600 mr-3"
              />
              <span className="font-medium text-gray-800">라이트 모드</span>
            </label>
            <label className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.value)}
                className="w-4 h-4 text-blue-600 mr-3"
              />
              <span className="font-medium text-gray-800">다크 모드 (준비 중)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

