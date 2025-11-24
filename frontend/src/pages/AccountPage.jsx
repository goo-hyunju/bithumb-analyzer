import AccountManager from '../components/AccountManager';

/**
 * 계좌 관리 페이지
 * - 초기 자금 설정
 * - 계좌 통계
 * - 거래 내역
 */
function AccountPage({
  accountBalance,
  onBalanceChange,
  tradeHistory,
  onTradeHistoryUpdate
}) {
  return (
    <AccountManager
      accountBalance={accountBalance}
      onBalanceChange={onBalanceChange}
      tradeHistory={tradeHistory}
      onTradeUpdate={onTradeHistoryUpdate}
    />
  );
}

export default AccountPage;

