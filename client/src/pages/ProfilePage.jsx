import { useState, useEffect } from 'react';
import { User, Lock, Mail, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import useAuth from '../hooks/useAuth.js';
import {
  getUserProfileApi,
  updateUserProfileApi,
  changePasswordApi,
} from '../api/userApi.js';
import { getDashboardStatsApi } from '../api/statsApi.js';
import '../styles/profile.css';

const ProfilePage = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        getUserProfileApi(),
        getDashboardStatsApi(),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setNewName(profileData.name);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      const updated = await updateUserProfileApi({ name: newName });
      setProfile({ ...profile, name: updated.name });
      login({ ...user, name: updated.name });
      setEditingName(false);
      toast.success('Name updated!');
    } catch (err) {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setSavingPassword(true);
    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className='loading-screen'><div className='spinner' /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className='profile-page'>

        <div className='profile-header'>
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className='profile-body'>

          <div className='profile-left'>

            <div className='card profile-avatar-card'>
              <div className='profile-avatar'>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt='avatar' />
                ) : (
                  <span>{profile?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h2 className='profile-name'>{profile?.name}</h2>
              <p className='profile-email'>{profile?.email}</p>
              <p className='profile-joined'>
                Joined {new Date(profile?.createdAt).toLocaleDateString('en-IN', {
                  month: 'long', year: 'numeric'
                })}
              </p>
            </div>

            <div className='card profile-stats-card'>
              <h3>Your Stats</h3>
              <div className='profile-stats'>
                <div className='profile-stat'>
                  <span className='profile-stat-icon'>👥</span>
                  <div>
                    <p className='profile-stat-value'>{stats?.totalGroups || 0}</p>
                    <p className='profile-stat-label'>Groups</p>
                  </div>
                </div>
                <div className='profile-stat'>
                  <span className='profile-stat-icon'>🧾</span>
                  <div>
                    <p className='profile-stat-value'>{stats?.totalExpenses || 0}</p>
                    <p className='profile-stat-label'>Expenses</p>
                  </div>
                </div>
                <div className='profile-stat'>
                  <span className='profile-stat-icon'>💰</span>
                  <div>
                    <p className='profile-stat-value'>₹{stats?.totalOwed || 0}</p>
                    <p className='profile-stat-label'>Owed to you</p>
                  </div>
                </div>
                <div className='profile-stat'>
                  <span className='profile-stat-icon'>💸</span>
                  <div>
                    <p className='profile-stat-value'>₹{stats?.totalOwe || 0}</p>
                    <p className='profile-stat-label'>You owe</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className='profile-right'>

           
            <div className='card profile-section'>
              <div className='profile-section-header'>
                <div className='profile-section-icon'>
                  <User size={20} />
                </div>
                <div>
                  <h3>Full Name</h3>
                  <p>Update your display name</p>
                </div>
              </div>

              {editingName ? (
                <div className='profile-edit-row'>
                  <input
                    type='text'
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className='profile-input'
                    autoFocus
                  />
                  <button
                    className='profile-action-btn profile-save-btn'
                    onClick={handleUpdateName}
                    disabled={savingName}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className='profile-action-btn profile-cancel-btn'
                    onClick={() => {
                      setEditingName(false);
                      setNewName(profile?.name);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className='profile-display-row'>
                  <span className='profile-display-value'>{profile?.name}</span>
                  <button
                    className='profile-edit-btn'
                    onClick={() => setEditingName(true)}
                  >
                    <Edit2 size={15} /> Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email (read only) */}
            <div className='card profile-section'>
              <div className='profile-section-header'>
                <div className='profile-section-icon'>
                  <Mail size={20} />
                </div>
                <div>
                  <h3>Email Address</h3>
                  <p>Your login email</p>
                </div>
              </div>
              <div className='profile-display-row'>
                <span className='profile-display-value'>{profile?.email}</span>
                <span className='profile-readonly-badge'>Read only</span>
              </div>
            </div>

            {/* Change Password */}
            <div className='card profile-section'>
              <div className='profile-section-header'>
                <div className='profile-section-icon'>
                  <Lock size={20} />
                </div>
                <div>
                  <h3>Password</h3>
                  <p>Change your account password</p>
                </div>
              </div>

              {!showPasswordForm ? (
                <div className='profile-display-row'>
                  <span className='profile-display-value'>••••••••</span>
                  <button
                    className='profile-edit-btn'
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <Edit2 size={15} /> Change
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className='password-form'>
                  <div className='form-group'>
                    <label>Current Password</label>
                    <input
                      type='password'
                      placeholder='Enter current password'
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({
                        ...passwordForm, currentPassword: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label>New Password</label>
                    <input
                      type='password'
                      placeholder='Min 6 characters'
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({
                        ...passwordForm, newPassword: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className='form-group'>
                    <label>Confirm New Password</label>
                    <input
                      type='password'
                      placeholder='Repeat new password'
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({
                        ...passwordForm, confirmPassword: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className='password-form-actions'>
                    <button
                      type='button'
                      className='btn btn-outline'
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary'
                      disabled={savingPassword}
                    >
                      {savingPassword ? 'Saving...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;