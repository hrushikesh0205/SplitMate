import useAuth from '../../hooks/useAuth.js';
import '../../styles/settlements.css';

const BalanceSummary = ({ balances, onSettleUp }) => {
  const { user } = useAuth();

  if (!balances || balances.length === 0) {
    return (
      <div className='balances-empty'>
        <span>✅</span>
        <p>All settled up!</p>
        <p>No pending balances in this group</p>
      </div>
    );
  }

  return (
    <div className='balances-list'>
      {balances.map((balance, index) => {
        const isMyDebt = balance.from._id === user?._id;
        const isOwedToMe = balance.to._id === user?._id;

        return (
          <div key={index} className='balance-item'>
            <div className='balance-item-info'>
              <div className='balance-avatars'>
                <div className='balance-avatar'>
                  {balance.from?.name?.charAt(0).toUpperCase()}
                </div>
                <div className='balance-arrow'>→</div>
                <div className='balance-avatar balance-avatar-to'>
                  {balance.to?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className='balance-item-text'>
                <p className='balance-item-title'>
                  <strong>
                    {isMyDebt ? 'You' : balance.from?.name}
                  </strong>
                  {' '}owe{isMyDebt ? '' : 's'}{' '}
                  <strong>
                    {isOwedToMe ? 'you' : balance.to?.name}
                  </strong>
                </p>
                <p className={`balance-item-amount ${isMyDebt ? 'amount-owe' : isOwedToMe ? 'amount-owed' : ''}`}>
                  ₹{balance.amount.toLocaleString()}
                </p>
              </div>
            </div>

            {isMyDebt && (
              <button
                className='btn btn-primary settle-btn'
                onClick={() => onSettleUp(balance)}
              >
                Settle Up
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BalanceSummary;