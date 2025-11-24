import { useState } from 'react';
import { Database, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { 
  saveAccountBalance, 
  loadAccountBalance, 
  saveTradeHistory, 
  loadTradeHistory,
  clearAllData,
  hasStoredData
} from '../utils/storageUtils';

function DataManagement({ accountBalance, tradeHistory, onBalanceChange, onTradeHistoryUpdate }) {
  const [showExport, setShowExport] = useState(false);

  // 데이터 내보내기 (JSON 파일로)
  const exportData = () => {
    const data = {
      accountBalance,
      tradeHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExport(false);
    alert('데이터가 성공적으로 내보냈습니다!');
  };

  // 데이터 가져오기 (JSON 파일에서)
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.accountBalance) {
          onBalanceChange(data.accountBalance);
          saveAccountBalance(data.accountBalance);
        }
        
        if (data.tradeHistory) {
          onTradeHistoryUpdate(data.tradeHistory);
          saveTradeHistory(data.tradeHistory);
        }
        
        alert('데이터가 성공적으로 가져왔습니다!');
      } catch (err) {
        alert('파일 형식이 올바르지 않습니다.');
        console.error('데이터 가져오기 실패:', err);
      }
    };
    reader.readAsText(file);
    
    // 파일 input 초기화
    event.target.value = '';
  };

  // 모든 데이터 삭제
  const handleClearAll = () => {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllData();
      onBalanceChange({
        initial: 1000000,
        current: 1000000
      });
      onTradeHistoryUpdate([]);
      alert('모든 데이터가 삭제되었습니다.');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-600" />
        데이터 관리
      </h2>

      <div className="space-y-4">
        {/* 저장 상태 */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-green-800 mb-1">로컬 스토리지 저장</div>
              <div className="text-sm text-green-700">
                모든 데이터는 브라우저에 자동 저장됩니다. 새로고침해도 데이터가 유지됩니다.
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${hasStoredData() ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </div>

        {/* 데이터 내보내기/가져오기 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5" />
              데이터 내보내기
            </div>
            <p className="text-sm text-blue-700 mb-3">
              계좌 정보와 거래 내역을 JSON 파일로 저장합니다.
            </p>
            <button
              onClick={exportData}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
            >
              내보내기
            </button>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              데이터 가져오기
            </div>
            <p className="text-sm text-purple-700 mb-3">
              저장한 JSON 파일을 불러옵니다.
            </p>
            <label className="block w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all text-center cursor-pointer">
              파일 선택
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 데이터 초기화 */}
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            위험: 모든 데이터 삭제
          </div>
          <p className="text-sm text-red-700 mb-3">
            계좌 정보와 거래 내역을 모두 삭제합니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <button
            onClick={handleClearAll}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
          >
            모든 데이터 삭제
          </button>
        </div>

        {/* 정보 */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-700">
            <strong>💡 참고사항:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• 데이터는 브라우저의 로컬 스토리지에 저장됩니다.</li>
              <li>• 다른 브라우저나 기기에서는 데이터가 공유되지 않습니다.</li>
              <li>• 브라우저 캐시를 삭제하면 데이터가 사라질 수 있습니다.</li>
              <li>• 중요한 데이터는 정기적으로 내보내기를 권장합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataManagement;

