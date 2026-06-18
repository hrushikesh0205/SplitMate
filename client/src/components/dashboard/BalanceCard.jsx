import '../../styles/dashboard.css';

const BalanceCard = ({ title, amount, type, icon, isCount }) => {
  return (
    <div className={`balance-card balance-card-${type}`}>
      <div className='balance-card-icon'>{icon}</div>
      <div className='balance-card-info'>
        <p className='balance-card-title'>{title}</p>
        <p className='balance-card-amount'>
          {isCount ? amount : `₹${Number(amount).toLocaleString()}`}
        </p>
      </div>
    </div>
  );
};

export default BalanceCard;