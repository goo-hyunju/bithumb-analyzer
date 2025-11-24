import Settings from '../components/Settings';
import DataManagement from '../components/DataManagement';

/**
 * 설정 페이지
 * - 계좌 설정
 * - 알림 설정
 * - 서버 상태
 * - 테마 설정
 * - 데이터 관리
 */
function SettingsPage({
  accountBalance,
  onBalanceChange,
  serverStatus,
  tradeHistory,
  onTradeHistoryUpdate
}) {
  return (
    <div className="space-y-6">
      <Settings
        accountBalance={accountBalance}
        onBalanceChange={onBalanceChange}
        serverStatus={serverStatus}
      />
      
      <DataManagement
        accountBalance={accountBalance}
        tradeHistory={tradeHistory}
        onBalanceChange={onBalanceChange}
        onTradeHistoryUpdate={onTradeHistoryUpdate}
      />
    </div>
  );
}

export default SettingsPage;

