import { formatDistanceToNow } from 'date-fns';
import '../../styles/dashboard.css';

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className='activity-empty'>
        <span>📭</span>
        <p>No recent activity yet</p>
        <p>Create a group and add expenses to see activity here!</p>
      </div>
    );
  }

  return (
    <div className='activity-list'>
      {activities.map((activity, index) => (
        <div key={index} className='activity-item'>
          <div className='activity-dot' />
          <div className='activity-content'>
            <p className='activity-text'>{activity.action}</p>
            <p className='activity-time'>
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;