import LicenseActivation from '../components/LicenseActivation';
import { useNavigate } from 'react-router-dom';

/**
 * 라이선스 활성화 페이지
 */
function LicensePage() {
  const navigate = useNavigate();

  const handleActivated = () => {
    // 활성화 완료 후 대시보드로 이동
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <LicenseActivation onActivated={handleActivated} />
      </div>
    </div>
  );
}

export default LicensePage;

