import { AlertCircle } from 'lucide-react';

function ServerWarning({ onRetry }) {
  return (
    <div className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-red-200 shadow-xl">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" />
        백엔드 서버가 실행되지 않았습니다
      </h3>
      <div className="text-sm text-gray-600 space-y-2">
        <p>터미널에서 다음 명령어로 서버를 실행해주세요:</p>
        <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto font-mono text-xs border border-gray-200">
cd backend{'\n'}npm install{'\n'}npm start
        </pre>
        <button
          onClick={onRetry}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          다시 연결 시도
        </button>
      </div>
    </div>
  );
}

export default ServerWarning;

