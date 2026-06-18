import { Link } from 'react-router-dom';
import { Users, Receipt } from 'lucide-react';
import '../../styles/groups.css';

const GroupCard = ({ group }) => {
  return (
    <Link to={`/groups/${group._id}`} className='group-card'>
      <div className='group-card-header'>
        <span className='group-card-icon'>{group.icon}</span>
        <span className={`group-card-type group-type-${group.type.toLowerCase()}`}>
          {group.type}
        </span>
      </div>

      <h3 className='group-card-name'>{group.name}</h3>

      <div className='group-card-meta'>
        <span className='group-card-meta-item'>
          <Users size={14} />
          {group.members.length} members
        </span>
        <span className='group-card-meta-item'>
          <Receipt size={14} />
          {group.totalExpenses} expenses
        </span>
      </div>

      <div className='group-card-members'>
        {group.members.slice(0, 4).map((m, i) => (
          <div
            key={i}
            className='group-member-avatar'
            title={m.user?.name}
            style={{ zIndex: 4 - i }}
          >
            {m.user?.avatar ? (
              <img src={m.user.avatar} alt={m.user.name} />
            ) : (
              m.user?.name?.charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {group.members.length > 4 && (
          <div className='group-member-avatar group-member-more'>
            +{group.members.length - 4}
          </div>
        )}
      </div>
    </Link>
  );
};

export default GroupCard;