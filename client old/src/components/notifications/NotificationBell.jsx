import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications.js';
import { markAsReadApi, deleteNotificationApi } from '../../api/notificationApi.js';
import '../../styles/notifications.css';

const TYPE_ICONS = {
  expense_added:  '🧾',
  expense_deleted: '🗑️',
  settled_up:     '✅',
  group_joined:   '👥',
  member_added:   '👤',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markOneRead, removeNotification } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsReadApi(id);
      markOneRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotificationApi(id);
      removeNotification(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) await handleMarkRead(notif._id);
    if (notif.group?._id) navigate(`/groups/${notif.group._id}`);
    setOpen(false);
  };

  return (
    <div className='notif-bell-wrap' ref={dropdownRef}>
      <button
        className='nav-icon-btn'
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className='notif-badge'>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className='notif-dropdown'>
          <div className='notif-dropdown-header'>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className='notif-mark-all' onClick={markAllRead}>
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className='notif-list'>
            {notifications.length === 0 ? (
              <div className='notif-empty'>
                <span>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notif-item ${!notif.isRead ? 'notif-unread' : ''}`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <div className='notif-item-icon'>
                    {TYPE_ICONS[notif.type] || '🔔'}
                  </div>
                  <div className='notif-item-content'>
                    <p className='notif-item-message'>{notif.message}</p>
                    {notif.group && (
                      <p className='notif-item-group'>
                        {notif.group.icon} {notif.group.name}
                      </p>
                    )}
                    <p className='notif-item-time'>
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <button
                    className='notif-delete-btn'
                    onClick={(e) => handleDelete(e, notif._id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className='notif-footer'>
            <button onClick={() => { navigate('/notifications'); setOpen(false); }}>
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;