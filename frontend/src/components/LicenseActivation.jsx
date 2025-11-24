import { useState, useEffect } from 'react';
import { Key, CheckCircle2, XCircle, AlertCircle, Loader } from 'lucide-react';
import { saveLicense, loadLicense, validateLicenseFormat } from '../utils/licenseUtils';

function LicenseActivation({ onActivated }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'checking', 'valid', 'invalid', 'error'
  const [message, setMessage] = useState('');
  const [isActivated, setIsActivated] = useState(false);

  // 로컬 스토리지에서 활성화 상태 확인
  useEffect(() => {
    const savedLicense = loadLicense();
    if (savedLicense && savedLicense.isActive) {
      setIsActivated(true);
      if (onActivated) {
        onActivated(savedLicense);
      }
    }
  }, [onActivated]);

  // 라이선스 키 활성화
  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setStatus('invalid');
      setMessage('라이선스 키를 입력해주세요.');
      return;
    }

    // 형식 검증
    if (!validateLicenseFormat(licenseKey)) {
      setStatus('invalid');
      setMessage('올바른 라이선스 키 형식이 아닙니다. (예: CAPAS-XXXX-XXXX-XXXX)');
      return;
    }

    setIsLoading(true);
    setStatus('checking');
    setMessage('라이선스 키를 확인하는 중...');

    try {
      // 백엔드에서 라이선스 검증
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/license/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // 유효한 라이선스
        const licenseData = {
          key: licenseKey.trim().toUpperCase(),
          isActive: true,
          activatedAt: new Date().toISOString(),
          expiresAt: data.expiresAt || null,
        };

        saveLicense(licenseData);
        setIsActivated(true);
        setStatus('valid');
        setMessage('라이선스가 성공적으로 활성화되었습니다!');
        
        if (onActivated) {
          onActivated(licenseData);
        }
      } else {
        // 유효하지 않은 라이선스
        setStatus('invalid');
        setMessage(data.message || '유효하지 않은 라이선스 키입니다. 크몽에서 구매하신 정확한 키를 입력해주세요.');
      }
    } catch (error) {
      console.error('라이선스 검증 실패:', error);
      setStatus('error');
      setMessage('라이선스 검증 중 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 활성화
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleActivate();
    }
  };

  // 이미 활성화된 경우
  if (isActivated) {
    const savedLicense = loadLicense();
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">라이선스 활성화 완료</h2>
        </div>
        
        <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
          <div className="text-sm text-green-800">
            <div className="font-semibold mb-1">활성화된 라이선스:</div>
            <div className="font-mono text-lg">{savedLicense.key}</div>
            {savedLicense.activatedAt && (
              <div className="text-xs mt-2 text-green-700">
                활성화일: {new Date(savedLicense.activatedAt).toLocaleDateString('ko-KR')}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          CAPAS를 정상적으로 사용할 수 있습니다. 모든 기능이 활성화되었습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">라이선스 활성화</h2>
      </div>

      <div className="space-y-4">
        {/* 안내 메시지 */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">크몽에서 구매하셨나요?</div>
              <div>구매 후 받으신 라이선스 키를 입력하여 CAPAS를 활성화하세요.</div>
            </div>
          </div>
        </div>

        {/* 라이선스 키 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            라이선스 키
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value);
                setStatus(null); // 입력 시 상태 초기화
                setMessage('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="CAPAS-XXXX-XXXX-XXXX"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            />
            <button
              onClick={handleActivate}
              disabled={isLoading || !licenseKey.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  확인 중...
                </>
              ) : (
                '활성화'
              )}
            </button>
          </div>
        </div>

        {/* 상태 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-xl border ${
              status === 'valid'
                ? 'bg-green-50 border-green-200 text-green-800'
                : status === 'invalid'
                ? 'bg-red-50 border-red-200 text-red-800'
                : status === 'error'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {status === 'valid' && <CheckCircle2 className="w-5 h-5" />}
              {status === 'invalid' && <XCircle className="w-5 h-5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5" />}
              {status === 'checking' && <Loader className="w-5 h-5 animate-spin" />}
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div>💡 <strong>라이선스 키가 없으신가요?</strong></div>
            <div>크몽에서 CAPAS를 구매하시면 라이선스 키를 받으실 수 있습니다.</div>
            <div className="mt-2">
              📧 문제가 있으시면 크몽을 통해 문의해주세요.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseActivation;

