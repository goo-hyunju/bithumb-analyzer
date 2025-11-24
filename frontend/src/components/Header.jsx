import { Sparkles } from 'lucide-react';
import ServerStatus from './ServerStatus';

function Header({ serverStatus, onRetryConnection }) {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center gap-3 mb-3">
        <Sparkles className="w-10 h-10 text-blue-600" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          CAPAS
        </h1>
      </div>
      <p className="text-gray-600 text-lg mb-6">
        Coin Alert Prediction & Analysis System
      </p>
      <ServerStatus status={serverStatus} onRetry={onRetryConnection} />
    </div>
  );
}

export default Header;

