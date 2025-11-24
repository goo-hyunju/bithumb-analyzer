import { CheckCircle, AlertCircle, Server } from 'lucide-react';

function ServerStatus({ status, onRetry }) {
  return (
    <div className="flex justify-center items-center gap-2 text-sm">
      {status === 'connected' ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full shadow-sm">
          <CheckCircle className="w-4 h-4" />
          <span>백엔드 서버 연결됨</span>
        </div>
      ) : status === 'disconnected' ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full shadow-sm">
          <AlertCircle className="w-4 h-4" />
          <span>백엔드 서버 미연결</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full shadow-sm animate-pulse">
          <Server className="w-4 h-4" />
          <span>서버 확인 중...</span>
        </div>
      )}
    </div>
  );
}

export default ServerStatus;

