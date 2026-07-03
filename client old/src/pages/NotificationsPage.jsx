import { Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import useNotifications from '../hooks/useNotifications.js';
import '../styles/notifications-modern.css';
import { markAsReadApi, deleteNotificationApi } from '../api/notificationApi.js';
import '../styles/notifications.css';

const TYPE_ICONS = {
  expense_added:   '🧾',
  expense_deleted: '🗑️',
  settled_up:      '✅',
  group_joined:    '👥',
  member_added:    '👤',
};

const TYPE_LABELS = {
  expense_added:   'Expense Added',
  expense_deleted: 'Expense Deleted',
  settled_up:      'Settled Up',
  group_joined:    'Group Joined',
  member_added:    'Member Added',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
    removeNotification,
  } = useNotifications();

  const handleMarkRead = async (id) => {
    try {
      await markAsReadApi(id);
      markOneRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotificationApi(id);
      removeNotification(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await handleMarkRead(notif._id);
    if (notif.group?._id) navigate(`/groups/${notif.group._id}`);
  };

  return (
    <DashboardLayout>
      <div className='notifications-page'>

        {/* Header */}
        <div className='page-header'>
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && (
            <button className='btn btn-outline' onClick={markAllRead}>
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className='notifications-list card'>
          {notifications.length === 0 ? (
            <div className='notif-page-empty'>
              <span>🔔</span>
              <h3>No notifications yet</h3>
              <p>When someone adds an expense or settles up, you'll see it here</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notif-page-item ${!notif.isRead ? 'notif-page-unread' : ''}`}
                onClick={() => handleClick(notif)}
              >
                <div className='notif-page-icon'>
                  {TYPE_ICONS[notif.type] || '🔔'}
                </div>

                <div className='notif-page-content'>
                  <div className='notif-page-top'>
                    <span className='notif-type-label'>
                      {TYPE_LABELS[notif.type]}
                    </span>
                    {!notif.isRead && (
                      <span className='notif-unread-dot' />
                    )}
                  </div>
                  <p className='notif-page-message'>{notif.message}</p>
                  {notif.group && (
                    <p className='notif-page-group'>
                      {notif.group.icon} {notif.group.name}
                    </p>
                  )}
                  <p className='notif-page-time'>
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className='notif-page-actions'>
                  {!notif.isRead && (
                    <button
                      className='notif-read-btn'
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(notif._id); }}
                      title='Mark as read'
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    className='notif-del-btn'
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                    title='Delete'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;